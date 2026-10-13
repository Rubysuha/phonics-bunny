import type { SupabaseClient } from "@supabase/supabase-js";
import { bookLevels } from "@/app/(main)/book/data";
import { conversationCategories } from "@/app/(main)/conversation/data";
import {
  GREETING_WORD_RANGE,
  LEVELS,
  type LearningLevel,
} from "@/lib/learningRules";
import { toDayKey, wordInfo } from "./aggregate";
import { callClaude } from "./generate";

/*
  AI Learning Coach 의 "오늘의 코칭"

  주간 · 월간 분석이 "어디가 약했나"를 본다면, 오늘의 코칭은 "내일 무엇을 하면 되나"를 알려 줌.
  - 내일 할 일: Phonics 단어 · Book 이야기 · Conversation 대화에서 하나씩, 코드가 학습 기록으로 고름
  - AI Bunny 대화: 아이가 실제로 한 문장을 보여 주고, 다음에 써 볼 문장을 추천
  AI 는 평가 · 이유 · 추천 문장만 쓰고, 쓸 수 없으면 코드가 만든 기본 문구로 대신함
*/

/* 이 점수 이상이면 잘한 것으로 봄 (다시 볼 필요 없음) */
const GOOD_SCORE = 85;

/* 오늘과 비교하는 기간 · "한 번도 안 한 것"을 찾을 때 보는 기간 */
const RECENT_DAYS = 7;
const HISTORY_DAYS = 90;

/* AI Bunny 대화에서 보여 줄 아이의 문장 수 · 추천할 문장 수 */
const TALK_SENTENCE_COUNT = 8;
const NEXT_SENTENCE_COUNT = 3;

const DAY_MS = 24 * 60 * 60 * 1000;

/* ─────────────────────────────
   학습 항목 목록 (기록의 content_id 와 같은 형태, 학습 순서대로)
───────────────────────────── */

export type DailyArea = "phonics" | "book" | "conversation";

const AREAS: DailyArea[] = ["phonics", "book", "conversation"];

type Item = {
  area: DailyArea;

  /* 단어 · 이야기 제목 · 대화 제목 */
  label: string;

  /* 속한 단원 (예: "Long E", "Book Level 1", "Family World") */
  unit: string;

  /* 연습 화면 주소 */
  href: string;

  /* Conversation 대화의 문장들 (추천 문장의 기본값으로 사용) */
  sentences?: string[];
};

const items = new Map<string, Item>();

wordInfo.forEach((info, contentId) => {
  items.set(contentId, {
    area: "phonics",
    label: info.word,
    unit: info.pattern,
    href: info.href,
  });
});

for (const level of bookLevels) {
  for (const story of level.stories) {
    items.set(`book-${level.level}-${story.slug}`, {
      area: "book",
      label: story.title,
      unit: `Book ${level.title}`,
      href: `/book/${level.level}/${story.slug}`,
    });
  }
}

for (const category of conversationCategories) {
  for (const dialogue of category.dialogues) {
    items.set(`conversation-${dialogue.id}`, {
      area: "conversation",
      label: dialogue.title,
      unit: `${category.title} World`,
      href: `/conversation/${category.slug}/${dialogue.id}`,
      sentences: dialogue.lines.map((line) => line.text),
    });
  }
}

/* ─────────────────────────────
   Types
───────────────────────────── */

export type DailyTaskType =
  /* 오늘 점수가 낮았던 것을 다시 */
  | "retry"
  /* 최근에 약했는데 오늘 안 한 것을 복습 */
  | "review"
  /* 지금 하는 단원에서 아직 안 해 본 것 */
  | "new"
  /* 오늘 잘한 것을 한 번 더 */
  | "keep";

export type DailyTask = {
  type: DailyTaskType;
  area: DailyArea;

  /* 단어 · 이야기 제목 · 대화 제목 */
  word: string;

  /* 속한 단원 · 연습 화면 주소 */
  pattern: string;
  href: string;

  /* 고른 근거: 평균 점수와 발음 확인 횟수 (새로 하는 것은 없음) */
  score: number | null;
  count: number | null;

  /* 왜 이것인지 한 문장 */
  reason: string;
};

export type DailyStats = {
  /* 한국 시간 기준 오늘 날짜 (예: "2026-10-13") */
  date: string;

  /* 오늘 발음 확인을 한 단어 · 이야기 · 대화 수, 발음 확인 횟수 */
  words_today: number;
  stories_today: number;
  dialogues_today: number;
  records_today: number;

  /* 오늘 평균 · 그 전 7일 평균 · 둘의 차이 (없으면 null) */
  avg_today: number | null;
  avg_recent: number | null;
  change: number | null;
};

/* AI Bunny 와 나눈 대화 */
export type DailyTalk = {
  /* 대화 기록을 읽을 수 있는지 (저장 테이블이 없으면 false) */
  available: boolean;

  /* 오늘 아이가 말한 횟수 */
  count_today: number;

  /* 아이가 실제로 한 문장 (오늘 것, 오늘 없으면 최근 7일 것) */
  sentences: string[];

  /* sentences 가 오늘 것인지 */
  from_today: boolean;

  /* 대화에 대한 한 문장 평가 (AI 가 쓴 것, 없으면 "") */
  comment: string;

  /* 다음에 써 볼 문장과 그 설명 */
  next: { sentence: string; tip: string }[];
};

export type DailyPlan = {
  stats: DailyStats;

  /* 오늘 학습에 대한 한두 문장 */
  comment: string;

  /* 내일 할 일 (이 순서대로) */
  tasks: DailyTask[];

  talk: DailyTalk;

  /* 평가 · 이유 · 추천 문장을 AI 가 썼는지 (false 면 코드가 만든 기본 문구) */
  usedAi: boolean;
};

type Row = {
  content_id: string | null;
  score: number | null;
  created_at: string;
};

type Scored = {
  contentId: string;
  score: number;
  count: number;
};

function average(values: number[]): number | null {
  if (values.length === 0) return null;

  return Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length
  );
}

/* 항목별 평균 점수 · 횟수 */
function scoreByItem(rows: Row[]): Scored[] {
  const scores = new Map<string, number[]>();

  for (const row of rows) {
    if (!row.content_id || typeof row.score !== "number") continue;

    scores.set(row.content_id, [
      ...(scores.get(row.content_id) ?? []),
      row.score,
    ]);
  }

  return Array.from(scores.entries()).map(([contentId, values]) => ({
    contentId,
    score: average(values) ?? 0,
    count: values.length,
  }));
}

/* 점수가 낮은 순. 같으면 많이 한 것, 그래도 같으면 이름 순 (항상 같은 결과) */
const byLowest = (a: Scored, b: Scored) =>
  a.score - b.score ||
  b.count - a.count ||
  a.contentId.localeCompare(b.contentId);

const AREA_NOUN: Record<DailyArea, string> = {
  phonics: "단어",
  book: "이야기",
  conversation: "대화",
};

/* 코드가 만드는 기본 이유 */
function defaultReason(task: Omit<DailyTask, "reason">): string {
  const noun = AREA_NOUN[task.area];

  switch (task.type) {
    case "retry":
      return `오늘 평균 ${task.score}점으로 가장 낮았던 ${noun}입니다. 내일 한 번 더 연습하면 소리가 자리 잡습니다.`;
    case "review":
      return `최근 ${RECENT_DAYS}일 평균 ${task.score}점인 ${noun}인데 오늘은 연습하지 않았습니다. 잊기 전에 복습합니다.`;
    case "new":
      return `${task.pattern}에서 아직 발음 확인을 하지 않은 ${noun}입니다.`;
    case "keep":
      return `오늘 ${task.score}점으로 잘한 ${noun}입니다. 한 번 더 말해 보며 자신감을 이어 갑니다.`;
  }
}

/* 할 일을 보여 주는 순서: 급한 것부터 */
const TYPE_ORDER: DailyTaskType[] = ["retry", "review", "new", "keep"];

/* ─────────────────────────────
   1. 할 일 고르기 · 대화 모으기 (코드)
───────────────────────────── */

export async function buildDailyPlan(
  client: SupabaseClient,
  userId: string,
  now: Date = new Date()
): Promise<Omit<DailyPlan, "comment" | "usedAi"> & { level: LearningLevel }> {
  const { data, error } = await client
    .from("pronunciation_logs")
    .select("content_id, score, created_at")
    .eq("user_id", userId)
    .gte(
      "created_at",
      new Date(now.getTime() - HISTORY_DAYS * DAY_MS).toISOString()
    )
    .order("created_at", { ascending: true })
    .limit(5000);

  if (error) throw error;

  /* 학습 데이터에 있는 항목의 기록만 */
  const rows = ((data ?? []) as Row[]).filter(
    (row) => row.content_id && items.has(row.content_id)
  );

  const today = toDayKey(now.toISOString());
  const recentStart = new Date(now.getTime() - RECENT_DAYS * DAY_MS);

  const todayRows = rows.filter((row) => toDayKey(row.created_at) === today);

  /* 오늘을 뺀 최근 7일 */
  const recentRows = rows.filter(
    (row) =>
      toDayKey(row.created_at) !== today &&
      new Date(row.created_at) >= recentStart
  );

  const practiced = new Set(rows.map((row) => row.content_id as string));
  const catalog = Array.from(items.entries());

  const areaOf = (contentId: string) => items.get(contentId)!.area;

  /*
    영역(Phonics · Book · Conversation)마다 하나씩 고름
    ① 오늘 점수가 가장 낮았던 것 → ② 최근 7일에 약했는데 오늘 안 한 것
    → ③ 지금 하는 단원에서 아직 안 해 본 것 → ④ 오늘 가장 잘한 것
  */
  const pick = (area: DailyArea): Omit<DailyTask, "reason"> | null => {
    const todayScores = scoreByItem(
      todayRows.filter((row) => areaOf(row.content_id as string) === area)
    );

    const recentScores = scoreByItem(
      recentRows.filter((row) => areaOf(row.content_id as string) === area)
    );

    const make = (
      type: DailyTaskType,
      contentId: string,
      scored?: Scored
    ): Omit<DailyTask, "reason"> => {
      const item = items.get(contentId)!;

      return {
        type,
        area,
        word: item.label,
        pattern: item.unit,
        href: item.href,
        score: scored?.score ?? null,
        count: scored?.count ?? null,
      };
    };

    const retry = todayScores
      .filter((item) => item.score < GOOD_SCORE)
      .sort(byLowest)[0];

    if (retry) return make("retry", retry.contentId, retry);

    const todayIds = new Set(todayScores.map((item) => item.contentId));

    const review = recentScores
      .filter(
        (item) => item.score < GOOD_SCORE && !todayIds.has(item.contentId)
      )
      .sort(byLowest)[0];

    if (review) return make("review", review.contentId, review);

    /*
      새로 할 것: 이 영역에서 가장 최근에 한 항목의 단원부터 학습 순서대로 찾음.
      이 영역의 기록이 없으면 첫 항목부터
    */
    const areaCatalog = catalog.filter(([, item]) => item.area === area);

    const lastId = [...rows]
      .reverse()
      .find((row) => areaOf(row.content_id as string) === area)?.content_id;

    const lastUnit = lastId ? items.get(lastId)?.unit : undefined;

    const startIndex = lastUnit
      ? Math.max(
          0,
          areaCatalog.findIndex(([, item]) => item.unit === lastUnit)
        )
      : 0;

    const next = [
      ...areaCatalog.slice(startIndex),
      ...areaCatalog.slice(0, startIndex),
    ].find(([contentId]) => !practiced.has(contentId));

    if (next) return make("new", next[0]);

    const best = todayScores.sort(
      (a, b) => b.score - a.score || a.contentId.localeCompare(b.contentId)
    )[0];

    return best ? make("keep", best.contentId, best) : null;
  };

  const tasks = AREAS.map(pick)
    .filter((task): task is Omit<DailyTask, "reason"> => task !== null)
    .sort(
      (a, b) =>
        TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type) ||
        AREAS.indexOf(a.area) - AREAS.indexOf(b.area)
    );

  /* 오늘의 숫자 */
  const scoresOf = (list: Row[]) =>
    list
      .map((row) => row.score)
      .filter((score): score is number => typeof score === "number");

  const countToday = (area: DailyArea) =>
    new Set(
      todayRows
        .filter((row) => areaOf(row.content_id as string) === area)
        .map((row) => row.content_id)
    ).size;

  const avgToday = average(scoresOf(todayRows));
  const avgRecent = average(scoresOf(recentRows));

  /* ── AI Bunny 대화 ── */

  const talkRes = await client
    .from("ai_conversation_logs")
    .select("role, text, created_at")
    .eq("user_id", userId)
    .eq("role", "child")
    .gte("created_at", recentStart.toISOString())
    .order("created_at", { ascending: true })
    .limit(500);

  if (talkRes.error) {
    console.error("AI 대화 기록 조회 실패:", talkRes.error.message);
  }

  const talkRows = (talkRes.data ?? []) as { text: string; created_at: string }[];

  const todayTalk = talkRows.filter(
    (row) => toDayKey(row.created_at) === today
  );

  /* 오늘 한 말이 없으면 최근 7일에 한 말을 대신 보여 줌 */
  const shownTalk = todayTalk.length > 0 ? todayTalk : talkRows;

  /* 다음에 써 볼 문장의 기본값: 내일 할 Conversation 대화의 문장 */
  const conversationTask = tasks.find((task) => task.area === "conversation");

  const conversationItem = conversationTask
    ? catalog.find(([, item]) => item.href === conversationTask.href)?.[1]
    : catalog.find(([, item]) => item.area === "conversation")?.[1];

  const defaultNext = (conversationItem?.sentences ?? [])
    .slice(0, NEXT_SENTENCE_COUNT)
    .map((sentence) => ({
      sentence,
      tip: `Conversation의 ${conversationItem?.label} 대화에 나오는 문장입니다. 대화에서 그대로 써 볼 수 있습니다.`,
    }));

  /* 아이의 단계 (추천 문장의 길이를 맞추는 데 사용) */
  const { data: profile } = await client
    .from("profiles")
    .select("ai_level")
    .eq("id", userId)
    .maybeSingle();

  const savedLevel = profile?.ai_level as LearningLevel | undefined;

  const level: LearningLevel =
    savedLevel && LEVELS.includes(savedLevel) ? savedLevel : "beginner";

  return {
    level,
    stats: {
      date: today,
      words_today: countToday("phonics"),
      stories_today: countToday("book"),
      dialogues_today: countToday("conversation"),
      records_today: todayRows.length,
      avg_today: avgToday,
      avg_recent: avgRecent,
      change:
        avgToday !== null && avgRecent !== null ? avgToday - avgRecent : null,
    },
    tasks: tasks.map((task) => ({ ...task, reason: defaultReason(task) })),
    talk: {
      available: !talkRes.error,
      count_today: todayTalk.length,
      sentences: shownTalk
        .slice(-TALK_SENTENCE_COUNT)
        .map((row) => row.text),
      from_today: todayTalk.length > 0,
      comment: "",
      next: defaultNext,
    },
  };
}

/* 코드가 만드는 기본 한 줄 평가 */
function defaultComment(stats: DailyStats): string {
  if (stats.records_today === 0) {
    return "오늘은 아직 발음 연습 기록이 없습니다. 아래 순서대로 시작해 보세요.";
  }

  const parts = [
    stats.words_today > 0 ? `단어 ${stats.words_today}개` : "",
    stats.stories_today > 0 ? `이야기 ${stats.stories_today}개` : "",
    stats.dialogues_today > 0 ? `대화 ${stats.dialogues_today}개` : "",
  ].filter(Boolean);

  return `오늘 ${parts.join(", ")}를 연습했고 평균 ${stats.avg_today}점입니다. 내일은 아래 순서대로 이어 가면 좋습니다.`;
}

/* ─────────────────────────────
   2. 평가 · 이유 · 추천 문장 쓰기 (AI)
───────────────────────────── */

const SYSTEM_PROMPT = `너는 어린이 영어 학습 플랫폼 Phonics Bunny의 AI Learning Coach야. 아동 영어 파닉스 · 회화 지도 전문가의 관점에서, 오늘 학습을 짧게 평가하고 내일 할 일의 이유를 설명하고, AI Bunny와의 대화에서 다음에 써 볼 문장을 추천해.

다음 규칙을 반드시 지켜.

1. 전달된 JSON에 있는 숫자 · 단어 · 문장만 근거로 사용해. 없는 수치나 학습 사실을 만들지 마. 계산도 하지 마.
2. null인 항목은 언급하지 마.
3. 내일 할 일(tasks)의 항목과 순서는 코드가 이미 정했어. 바꾸거나 더하거나 빼지 마.
4. reasons에는 tasks와 같은 순서로, task 하나에 한 문장씩 이유를 써. 개수가 반드시 같아야 해.
5. 이유에는 근거가 된 숫자(평균 점수, 연습 횟수)나 단원 이름을 넣어. 새로 하는 것(type이 new)은 점수가 없으니 단원을 근거로 써.
6. 다른 아이와 비교하지 말고, 아이를 비난하거나 부족하다고 단정하지 마.
7. 점수가 오른 근거(stats.change가 0보다 큼)가 있을 때만 올랐다고 말해.
8. 학부모가 읽기 쉬운 정중하고 차분한 한국어(~습니다)로 쓰고, 느낌표와 과장된 칭찬은 쓰지 마.
   - 어떤 문장도 "~겠습니다"로 끝내지 마(예: "복습하겠습니다", "배워보겠습니다" 금지). 대신 "복습이 필요합니다", "이어서 하기 좋습니다"처럼 왜 해야 하는지 설명해.
   - 아이가 한 일은 높임말 없이 "연습했습니다", "말했습니다"처럼 써("말씀해 주셨습니다", "진행하셨습니다" 금지).
9. 반드시 지정된 JSON 형식으로만 응답하고, Markdown 코드 블록이나 다른 설명을 붙이지 마.

[AI Bunny 대화 (talk)]
- talk.child_sentences는 아이가 AI Bunny와 대화하면서 실제로 한 말이야(음성 인식 결과라 조금 어색할 수 있어). talk.from_today가 false면 오늘이 아니라 최근 7일에 한 말이야.
- talk_comment에는 아이가 어떤 문장을 썼는지에 대한 평가를 한 문장으로 써. 아이가 실제로 한 말에 있는 표현만 근거로 삼아. child_sentences가 비어 있으면 빈 문자열("")로 둬.
- next_sentences에는 아이가 다음 대화에서 써 볼 영어 문장을 정확히 ${NEXT_SENTENCE_COUNT}개 추천해.
  - 아이가 실제로 한 말을 바탕으로 한 걸음만 더 나아간 문장으로 해. 예: "I like pizza."를 말했다면 "I like pizza and milk."처럼 조금 늘리거나, 같은 틀로 다른 말을 해 보는 문장.
  - 아이가 한국어로 말한 문장이 있으면, 그 뜻을 영어로 말하는 문장을 먼저 추천해.
  - child_sentences가 비어 있으면 처음 대화를 시작할 때 쓰기 좋은 쉬운 문장을 추천해.
  - sentence는 영어로만 쓰고, talk.max_words 단어 이하로 써. 영어 글자와 기본 문장부호(. , ! ? ')만 쓰고 숫자는 영어 단어로 써.
  - tip에는 그 문장을 언제 쓰면 좋은지, 아이의 어떤 말에서 이어지는지를 한국어 한 문장으로 써.

[JSON 항목 설명]
- stats.date: 오늘 날짜
- stats.words_today / stories_today / dialogues_today: 오늘 발음 확인을 한 Phonics 단어 / Book 이야기 / Conversation 대화 수. records_today는 발음 확인 횟수
- stats.avg_today: 오늘 발음 평균(100점 만점), stats.avg_recent: 그 전 7일 평균, stats.change: 둘의 차이
- tasks: 내일 할 일. area는 phonics(단어) · book(이야기) · conversation(대화). type은 retry(오늘 점수가 가장 낮았던 것을 다시), review(최근 7일에 약했는데 오늘 안 한 것 복습), new(지금 하는 단원에서 아직 안 해 본 것), keep(오늘 잘한 것을 한 번 더). word는 단어 또는 제목, score는 평균 점수, count는 발음 확인 횟수, pattern은 단원

[출력 JSON]
{
  "comment": "오늘 학습에 대한 평가 1~2문장 (오늘 기록이 없으면 내일 시작할 방향을 안내)",
  "reasons": ["tasks와 같은 순서로 한 문장씩"],
  "talk_comment": "AI Bunny 대화에 대한 평가 한 문장 (대화가 없으면 빈 문자열)",
  "next_sentences": [{ "sentence": "영어 문장", "tip": "한국어 설명 한 문장" }]
}`;

/* 글 안의 숫자가 모두 전달한 JSON 에 있는 숫자인지 */
function usesOnlyKnownNumbers(text: string, input: unknown): boolean {
  const allowed = new Set<string>(["7", "85", "100"]);

  for (const part of JSON.stringify(input).match(/\d+/g) ?? []) {
    allowed.add(part);
    allowed.add(String(Number(part)));
  }

  return (text.match(/\d+/g) ?? []).every((value) => allowed.has(value));
}

/* 추천 문장이 영어로만 되어 있고 단계에 맞는 길이인지 */
function isValidSentence(sentence: string, maxWords: number): boolean {
  if (!/^[A-Za-z ,.!?'’]+$/.test(sentence)) return false;

  const longest = Math.max(
    0,
    ...sentence
      .split(/[.!?]+/)
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => part.split(/\s+/).length)
  );

  return longest >= 2 && longest <= maxWords;
}

/*
  AI 가 쓴 평가 · 이유 · 추천 문장을 붙임.
  AI 를 쓸 수 없거나 응답이 검사를 통과하지 못하면 코드가 만든 기본 문구를 그대로 씀
*/
export async function writeDailyPlan(
  built: Omit<DailyPlan, "comment" | "usedAi"> & { level: LearningLevel },
  apiKey: string | undefined
): Promise<DailyPlan> {
  const { level, ...plan } = built;

  const fallback: DailyPlan = {
    ...plan,
    comment: defaultComment(plan.stats),
    usedAi: false,
  };

  if (!apiKey) {
    return fallback;
  }

  const maxWords = GREETING_WORD_RANGE[level][1];

  /* AI 에는 근거만 보냄 (주소 · 기본 문구는 빼고) */
  const input = {
    stats: plan.stats,
    tasks: plan.tasks.map(({ type, area, word, pattern, score, count }) => ({
      type,
      area,
      word,
      pattern,
      score,
      count,
    })),
    talk: {
      child_sentences: plan.talk.sentences,
      from_today: plan.talk.from_today,
      max_words: maxWords,
    },
  };

  try {
    const text = await callClaude({
      system: SYSTEM_PROMPT,
      content: JSON.stringify(input, null, 2),
      apiKey,
      maxTokens: 900,
    });

    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end <= start) return fallback;

    const data = JSON.parse(text.slice(start, end + 1)) as {
      comment?: unknown;
      reasons?: unknown;
      talk_comment?: unknown;
      next_sentences?: unknown;
    };

    const reasons = data.reasons;

    if (
      typeof data.comment !== "string" ||
      !data.comment.trim() ||
      !Array.isArray(reasons) ||
      reasons.length !== plan.tasks.length ||
      reasons.some((reason) => typeof reason !== "string" || !reason.trim()) ||
      !usesOnlyKnownNumbers(`${data.comment} ${reasons.join(" ")}`, input)
    ) {
      console.error("오늘의 코칭 응답이 검사를 통과하지 못해 기본 문구를 사용함");

      return fallback;
    }

    /* 추천 문장: 형식 · 영어 · 길이를 통과한 것만 쓰고, 모자라면 기본 문장을 그대로 둠 */
    const next = (Array.isArray(data.next_sentences) ? data.next_sentences : [])
      .filter(
        (item): item is { sentence: string; tip: string } =>
          typeof item?.sentence === "string" &&
          typeof item?.tip === "string" &&
          item.tip.trim().length > 0 &&
          isValidSentence(item.sentence.trim(), maxWords)
      )
      .slice(0, NEXT_SENTENCE_COUNT)
      .map((item) => ({ sentence: item.sentence.trim(), tip: item.tip.trim() }));

    return {
      ...plan,
      comment: data.comment.trim(),
      tasks: plan.tasks.map((task, index) => ({
        ...task,
        reason: (reasons[index] as string).trim(),
      })),
      talk: {
        ...plan.talk,
        comment:
          typeof data.talk_comment === "string" && plan.talk.sentences.length > 0
            ? data.talk_comment.trim()
            : "",
        next: next.length === NEXT_SENTENCE_COUNT ? next : plan.talk.next,
      },
      usedAi: true,
    };
  } catch (error) {
    console.error(
      "오늘의 코칭 AI 요청 실패:",
      error instanceof Error ? error.message : "알 수 없는 오류"
    );

    return fallback;
  }
}
