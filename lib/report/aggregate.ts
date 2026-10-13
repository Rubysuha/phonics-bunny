import type { SupabaseClient } from "@supabase/supabase-js";
import { shortVowelItems } from "@/app/(main)/english/short-vowels/data";
import { longVowelItems } from "@/app/(main)/english/long-vowels/data";
import { blendItems } from "@/app/(main)/english/blend-sounds/data";
import { sightWordLevels } from "@/app/(main)/english/sight-words/data";
import { bookLevels } from "@/app/(main)/book/data";
import { conversationCategories } from "@/app/(main)/conversation/data";

/*
  AI Learning Coach 의 학습 데이터 분석 엔진

  최근 7일과 그 이전 7일의 학습 기록을 코드로 집계함.
  숫자 계산 · 취약 단어 선정 · 복습 대상 결정은 모두 여기서 하고,
  AI 는 이 결과를 학부모가 읽을 글로 풀어 쓰기만 함
*/

/* 평가 종류: 주간(최근 7일) · 월간(최근 30일) */
export type ReportPeriod = "week" | "month";

export const PERIOD_DAYS: Record<ReportPeriod, number> = {
  week: 7,
  month: 30,
};

/* 약한 단어를 몇 개까지 볼지 */
const WEAK_WORD_COUNT = 3;

const DAY_MS = 24 * 60 * 60 * 1000;

/* 발음 기록에서 "단어"로 보는 영역 (Book · Conversation 은 문장이라 제외) */
export const WORD_TYPES = [
  "short-vowels",
  "long-vowels",
  "blend-sounds",
  "sight-words",
];

/* 영역 이름 (발음 기록의 content_type → 화면에 보여 줄 이름) */
const AREA_LABEL: Record<string, string> = {
  "short-vowels": "Short Vowels",
  "long-vowels": "Long Vowels",
  "blend-sounds": "Blend Sounds",
  "sight-words": "Sight Words",
  book: "Book",
  conversation: "Conversation",
};

/* 단어 평균 점수 구간: 이 점수 이상이면 안정, 그 아래 PRACTICE_SCORE 이상이면 연습 중 */
const STABLE_SCORE = 85;
const PRACTICE_SCORE = 70;

/* 같은 단어를 다시 연습해서 이만큼 이상 올랐으면 "연습 효과"로 봄 */
const IMPROVED_BY = 5;

const TEST_LABEL: Record<string, "phonics" | "conversation" | "reading"> = {
  phonics: "phonics",
  conversation: "conversation",
  reading: "reading",
};

/* ─────────────────────────────
   단어 → 파닉스 단원 · 학습 화면 주소
   (기록의 content_id 와 같은 형태: "short-vowels-cat")
───────────────────────────── */

export type WordInfo = {
  /* 단어 (예: "Cat") */
  word: string;

  /* 단원 이름 (예: "Short A", "Blend bl", "Sight Words Level 1") */
  pattern: string;

  /* 그 단어를 연습하는 화면 */
  href: string;
};

/* 학습 데이터에 적힌 순서(단원 순서 · 단원 안의 단어 순서)대로 들어 있음 */
export const wordInfo = new Map<string, WordInfo>();

for (const item of shortVowelItems) {
  for (const word of item.words) {
    wordInfo.set(`short-vowels-${word.slug}`, {
      word: word.word,
      pattern: `Short ${item.upper}`,
      href: `/english/short-vowels/${item.vowel}/${word.slug}`,
    });
  }
}

for (const item of longVowelItems) {
  for (const word of item.words) {
    wordInfo.set(`long-vowels-${word.slug}`, {
      word: word.word,
      pattern: `Long ${item.upper}`,
      href: `/english/long-vowels/${item.vowel}/${word.slug}`,
    });
  }
}

for (const item of blendItems) {
  for (const word of item.words) {
    wordInfo.set(`blend-sounds-${word.slug}`, {
      word: word.word,
      pattern: word.section ? `Blend ${word.section}` : item.title,
      href: `/english/blend-sounds/${item.group}/${word.slug}`,
    });
  }
}

for (const level of sightWordLevels) {
  for (const word of level.words) {
    wordInfo.set(`sight-words-${word.slug}`, {
      word: word.word,
      pattern: `Sight Words ${level.title}`,
      href: `/english/sight-words/${level.level}`,
    });
  }
}

/* Book 이야기 · Conversation 대화 → 제목 · 단원 · 연습 화면 주소 */
type ContentInfo = {
  title: string;

  /* 예: "Book Level 1", "Family World" */
  unit: string;
  href: string;

  /* 이야기 · 대화의 문장들 (문장별 녹음 기록의 번호와 같은 순서) */
  sentences: string[];
};

const contentInfo = new Map<string, ContentInfo>();

for (const level of bookLevels) {
  for (const story of level.stories) {
    contentInfo.set(`book-${level.level}-${story.slug}`, {
      title: story.title,
      unit: `Book ${level.title}`,
      href: `/book/${level.level}/${story.slug}`,
      sentences: story.sentences,
    });
  }
}

for (const category of conversationCategories) {
  for (const dialogue of category.dialogues) {
    contentInfo.set(`conversation-${dialogue.id}`, {
      title: dialogue.title,
      unit: `${category.title} World`,
      href: `/conversation/${category.slug}/${dialogue.id}`,
      sentences: dialogue.lines.map((line) => line.text),
    });
  }
}

/* ─────────────────────────────
   Types
───────────────────────────── */

/* Book · Conversation 한 영역의 분석 (이야기 · 대화 단위) */
export type ContentAnalysis = {
  /* 이번 기간에 발음 확인을 한 서로 다른 이야기 · 대화 수, 평균 점수 */
  practiced: number;
  avg: number;

  /* 평균 점수가 높은 것 (85점 이상, 높은 순) */
  strong: { title: string; unit: string; score: number; count: number }[];

  /* 더 연습하면 좋은 것 (85점 미만, 낮은 순) */
  weak: { title: string; unit: string; score: number; count: number }[];

  /* 다시 연습해서 점수가 오른 것: 처음 점수 → 마지막 점수 */
  improved: { title: string; from: number; to: number; gain: number }[];

  /* 다음에 다시 할 것 (weak 의 첫 번째, 없으면 null) */
  next: string | null;

  /*
    문장별 녹음 기록이 있을 때: 더 연습하면 좋은 문장(85점 미만, 낮은 순) · 잘한 문장(85점 이상)
    title 은 그 문장이 들어 있는 이야기 · 대화 제목. 예전 리포트에는 없을 수 있음
  */
  weak_sentences?: {
    title: string;
    sentence: string;
    score: number;
    count: number;
  }[];
  strong_sentences?: { title: string; sentence: string; score: number }[];
};

export type WeakWord = {
  word: string;

  /* 최근 7일 평균 발음 점수 (100점 만점) */
  score: number;

  /* 최근 7일 동안 발음 확인을 한 횟수 */
  count: number;

  /* 단어가 속한 파닉스 단원 (알 수 없으면 null) */
  pattern: string | null;
};

export type ReportStats = {
  /* 평가 종류와 분석 기간(일). 예전에 저장된 리포트에는 없을 수 있음(주간으로 봄) */
  period?: ReportPeriod;
  period_days?: number;

  /* 분석 기간에 기록이 전혀 없으면 true (이때는 리포트를 만들지 않음) */
  insufficient: boolean;

  /* 최근 7일 중 학습한 날 수 */
  practice_days: number | null;

  /* 최근 7일 동안 연습한 단어 수 */
  words_practiced: number | null;

  /* 발음 평균 점수: 최근 7일 · 그 이전 7일 · 둘의 차이(둘 다 있을 때만) */
  avg_pronunciation: {
    this_week: number | null;
    last_week: number | null;
    change: number | null;
  } | null;

  /* 점수가 낮은 단어 (낮은 순) */
  weak_words: WeakWord[] | null;

  /* 최근 7일 Test 정답률(%) — 기록이 있는 것만 */
  test: {
    phonics: number | null;
    conversation: number | null;
    reading: number | null;
  } | null;

  /* 다음 주에 복습할 대상 */
  next_focus: {
    pattern: string | null;
    words: string[];
  } | null;

  /* ── 심화 분석 ── */

  /* 최근 7일의 날짜별 학습 기록 수 (오래된 날부터 오늘까지 7개) */
  daily: { date: string; count: number }[] | null;

  /* 영역별 발음 평균: 최근 7일 · 그 이전 7일 · 최근 7일 발음 확인 횟수 */
  areas:
    | {
        area: string;
        this_week: number;
        last_week: number | null;
        count: number;
      }[]
    | null;

  /* 평균이 가장 높은 영역 · 가장 낮은 영역 (영역이 둘 이상일 때만) */
  strongest_area: string | null;
  weakest_area: string | null;

  /* 발음 점수의 구성 요소별 평균 (최근 7일) */
  components: {
    accuracy: number | null;
    completeness: number | null;
    volume: number | null;
  } | null;

  /* 단어 평균 점수 구간별 단어 수: 안정(85점 이상) · 연습 중(70~84점) · 집중 필요(70점 미만) */
  score_bands: { stable: number; practicing: number; needs_focus: number } | null;

  /* 평균 점수가 높은 단어 (안정 구간에서 높은 순) */
  strong_words: { word: string; score: number }[] | null;

  /* 같은 단어를 다시 연습해서 점수가 오른 단어: 첫 점수 → 마지막 점수 */
  improved_words:
    | { word: string; from: number; to: number; gain: number }[]
    | null;

  /* Book 이야기 · Conversation 대화 분석 (예전에 저장된 리포트에는 없을 수 있음) */
  content?: {
    book: ContentAnalysis | null;
    conversation: ContentAnalysis | null;
  } | null;
};

export type ReportAggregate = {
  stats: ReportStats;

  /* 단어 → 연습 화면 주소 (화면의 칩 연결용, AI 에는 보내지 않음) */
  wordLinks: Record<string, string>;
};

const EMPTY_STATS: ReportStats = {
  insufficient: true,
  practice_days: null,
  words_practiced: null,
  avg_pronunciation: null,
  weak_words: null,
  test: null,
  next_focus: null,
  daily: null,
  areas: null,
  strongest_area: null,
  weakest_area: null,
  components: null,
  score_bands: null,
  strong_words: null,
  improved_words: null,
  content: null,
};

/* ─────────────────────────────
   계산
───────────────────────────── */

type PronunciationRow = {
  content_type: string | null;
  content_id: string | null;
  word: string | null;
  score: number | null;
  accuracy: number | null;
  completeness: number | null;
  volume_score: number | null;
  created_at: string;
};

type LearningRow = {
  category: string | null;
  title: string | null;
  created_at: string;
};

type TestRow = {
  test_type: string | null;
  score: number | null;
  total_questions: number | null;
  created_at: string;
};

function average(values: number[]): number | null {
  if (values.length === 0) return null;

  return Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length
  );
}

/* 한국 시간(UTC+9) 기준 날짜. 서버 시간대와 상관없이 같은 결과가 나오게 직접 계산 */
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

export function toDayKey(iso: string): string {
  return new Date(new Date(iso).getTime() + KST_OFFSET_MS)
    .toISOString()
    .slice(0, 10);
}

/* 리포트를 구분하는 주차: 한국 시간 기준 그 주 월요일 날짜 (예: "2026-10-12") */
export function getWeekStart(now: Date = new Date()): string {
  const kst = new Date(now.getTime() + KST_OFFSET_MS);
  const daysFromMonday = (kst.getUTCDay() + 6) % 7;

  kst.setUTCDate(kst.getUTCDate() - daysFromMonday);

  return kst.toISOString().slice(0, 10);
}

/*
  리포트를 구분하는 기간의 시작일 (한국 시간 기준)
  주간은 그 주 월요일, 월간은 그 달 1일 (예: "2026-10-01")
*/
export function getPeriodStart(
  period: ReportPeriod | "day",
  now: Date = new Date()
): string {
  if (period === "week") {
    return getWeekStart(now);
  }

  /* 오늘의 코칭은 그날 날짜 */
  if (period === "day") {
    return toDayKey(now.toISOString());
  }

  const kst = new Date(now.getTime() + KST_OFFSET_MS);

  return `${kst.toISOString().slice(0, 7)}-01`;
}

/*
  period 에 따라 최근 7일(주간) 또는 최근 30일(월간)을 그 이전 같은 길이의 기간과 비교함.
  결과의 this_week / last_week 는 "이번 기간 / 이전 기간"을 뜻함 (월간이면 최근 30일 / 그 이전 30일)

  now 는 테스트할 때 기준 시각을 바꾸려고 받음 (평소에는 지금 시각)
*/
export async function aggregateReport(
  client: SupabaseClient,
  userId: string,
  now: Date = new Date(),
  period: ReportPeriod = "week"
): Promise<ReportAggregate> {
  const days = PERIOD_DAYS[period];

  const thisWeekStart = new Date(now.getTime() - days * DAY_MS);
  const lastWeekStart = new Date(now.getTime() - days * 2 * DAY_MS);
  const since = lastWeekStart.toISOString();

  const [pronunciationRes, learningRes, testRes] = await Promise.all([
    client
      .from("pronunciation_logs")
      .select(
        "content_type, content_id, word, score, accuracy, completeness, volume_score, created_at"
      )
      .order("created_at", { ascending: true })
      .eq("user_id", userId)
      .gte("created_at", since),
    client
      .from("learning_logs")
      .select("category, title, created_at")
      .eq("user_id", userId)
      .gte("created_at", since),
    client
      .from("test_results")
      .select("test_type, score, total_questions, created_at")
      .eq("user_id", userId)
      .gte("created_at", thisWeekStart.toISOString()),
  ]);

  if (pronunciationRes.error) throw pronunciationRes.error;
  if (learningRes.error) throw learningRes.error;
  if (testRes.error) throw testRes.error;

  const pronunciations = (pronunciationRes.data ?? []) as PronunciationRow[];
  const learnings = (learningRes.data ?? []) as LearningRow[];
  const tests = (testRes.data ?? []) as TestRow[];

  const isThisWeek = (iso: string) => new Date(iso) >= thisWeekStart;

  const weekPronunciations = pronunciations.filter((row) =>
    isThisWeek(row.created_at)
  );
  const weekLearnings = learnings.filter((row) => isThisWeek(row.created_at));

  /* 최근 7일 기록이 전혀 없으면 리포트를 만들지 않음 */
  if (
    weekPronunciations.length === 0 &&
    weekLearnings.length === 0 &&
    tests.length === 0
  ) {
    return {
      stats: { ...EMPTY_STATS, period, period_days: days },
      wordLinks: {},
    };
  }

  /* 학습한 날 수 */
  const practiceDays = new Set(
    [...weekPronunciations, ...weekLearnings, ...tests].map((row) =>
      toDayKey(row.created_at)
    )
  ).size;

  /* 연습한 단어 수: 최근 7일에 발음 연습 기록이 있는 서로 다른 단어 */
  const practicedWords = new Set<string>();

  for (const row of weekPronunciations) {
    if (row.word && WORD_TYPES.includes(row.content_type ?? "")) {
      practicedWords.add(row.word.toLowerCase());
    }
  }

  /* 발음 평균: 이번 주 · 지난주 */
  const scoresOf = (rows: PronunciationRow[]) =>
    rows
      .map((row) => row.score)
      .filter((score): score is number => typeof score === "number");

  const thisWeekAvg = average(scoresOf(weekPronunciations));
  const lastWeekAvg = average(
    scoresOf(pronunciations.filter((row) => !isThisWeek(row.created_at)))
  );

  /*
    취약 단어: 최근 7일의 단어별 평균 발음 점수가 낮은 순
    (My Page 의 "집중 연습이 필요한 단어"와 같은 계산을 최근 7일에 적용)

    점수가 같으면 더 많이 연습한 단어, 그래도 같으면 알파벳 순으로 정해서
    언제 계산해도 같은 결과가 나오게 함
  */
  const byWord = new Map<
    string,
    { word: string; contentId: string; scores: number[] }
  >();

  for (const row of weekPronunciations) {
    if (
      !row.word ||
      !row.content_id ||
      typeof row.score !== "number" ||
      !WORD_TYPES.includes(row.content_type ?? "")
    ) {
      continue;
    }

    const entry = byWord.get(row.content_id) ?? {
      word: row.word,
      contentId: row.content_id,
      scores: [],
    };

    entry.scores.push(row.score);

    byWord.set(row.content_id, entry);
  }

  const weakest = Array.from(byWord.values())
    .map((entry) => ({
      ...entry,
      score: average(entry.scores) ?? 0,
      count: entry.scores.length,
      pattern: wordInfo.get(entry.contentId)?.pattern ?? null,
    }))
    /* 이미 안정적으로 발음하는 단어(85점 이상)는 복습 대상으로 고르지 않음 */
    .filter((entry) => entry.score < STABLE_SCORE)
    .sort(
      (a, b) =>
        a.score - b.score ||
        b.count - a.count ||
        a.word.localeCompare(b.word)
    )
    .slice(0, WEAK_WORD_COUNT);

  /* ── 심화 분석 ── */

  /* 날짜별 학습 기록 수 (한국 시간 기준, 오래된 날부터 오늘까지) */
  const countByDay = new Map<string, number>();

  for (const row of [...weekPronunciations, ...weekLearnings, ...tests]) {
    const key = toDayKey(row.created_at);

    countByDay.set(key, (countByDay.get(key) ?? 0) + 1);
  }

  const daily = Array.from({ length: days }, (_, index) => {
    const key = toDayKey(
      new Date(now.getTime() - (days - 1 - index) * DAY_MS).toISOString()
    );

    return { date: key.slice(5), count: countByDay.get(key) ?? 0 };
  });

  /* 영역별 발음 평균 */
  const lastWeekPronunciations = pronunciations.filter(
    (row) => !isThisWeek(row.created_at)
  );

  const areas = Object.keys(AREA_LABEL)
    .map((type) => {
      const scores = scoresOf(
        weekPronunciations.filter((row) => row.content_type === type)
      );

      const thisWeek = average(scores);

      return thisWeek === null
        ? null
        : {
            area: AREA_LABEL[type],
            this_week: thisWeek,
            last_week: average(
              scoresOf(
                lastWeekPronunciations.filter(
                  (row) => row.content_type === type
                )
              )
            ),
            count: scores.length,
          };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  /* 가장 높은 · 가장 낮은 영역: 영역이 둘 이상이고 점수가 다를 때만 */
  const rankedAreas = [...areas].sort(
    (a, b) => b.this_week - a.this_week || a.area.localeCompare(b.area)
  );

  const hasAreaGap =
    rankedAreas.length >= 2 &&
    rankedAreas[0].this_week !== rankedAreas[rankedAreas.length - 1].this_week;

  /* 발음 점수의 구성 요소 */
  const numbersOf = (key: "accuracy" | "completeness" | "volume_score") =>
    weekPronunciations
      .map((row) => row[key])
      .filter((value): value is number => typeof value === "number");

  const components = {
    accuracy: average(numbersOf("accuracy")),
    completeness: average(numbersOf("completeness")),
    volume: average(numbersOf("volume_score")),
  };

  const hasComponents = Object.values(components).some(
    (value) => value !== null
  );

  /* 단어 평균 점수 구간 · 잘하는 단어 · 연습 효과가 있었던 단어 */
  const wordStats = Array.from(byWord.values()).map((entry) => ({
    word: entry.word,
    score: average(entry.scores) ?? 0,
    first: entry.scores[0],
    last: entry.scores[entry.scores.length - 1],
    count: entry.scores.length,
  }));

  const scoreBands = {
    stable: wordStats.filter((item) => item.score >= STABLE_SCORE).length,
    practicing: wordStats.filter(
      (item) => item.score >= PRACTICE_SCORE && item.score < STABLE_SCORE
    ).length,
    needs_focus: wordStats.filter((item) => item.score < PRACTICE_SCORE)
      .length,
  };

  const strongWords = wordStats
    .filter((item) => item.score >= STABLE_SCORE)
    .sort((a, b) => b.score - a.score || a.word.localeCompare(b.word))
    .slice(0, WEAK_WORD_COUNT)
    .map(({ word, score }) => ({ word, score }));

  const improvedWords = wordStats
    .filter((item) => item.count >= 2 && item.last - item.first >= IMPROVED_BY)
    .sort(
      (a, b) =>
        b.last - b.first - (a.last - a.first) || a.word.localeCompare(b.word)
    )
    .slice(0, WEAK_WORD_COUNT)
    .map(({ word, first, last }) => ({
      word,
      from: first,
      to: last,
      gain: last - first,
    }));

  /*
    복습할 단원: 고른 단어가 모두 같은 단원일 때만 정함.
    단원이 섞여 있거나 알 수 없는 단어가 있으면 억지로 하나를 고르지 않고 null
  */
  const patterns = new Set(weakest.map((entry) => entry.pattern));

  const pattern =
    weakest.length > 0 && patterns.size === 1 ? weakest[0].pattern : null;

  const wordLinks: Record<string, string> = {};

  for (const entry of weakest) {
    const info = wordInfo.get(entry.contentId);

    if (info) wordLinks[entry.word] = info.href;
  }

  /*
    Book 이야기 · Conversation 대화 분석
    단어와 같은 방식(항목별 평균 → 낮은 순 / 높은 순)을 이야기 · 대화 단위로 적용.
    한 이야기 · 대화는 전체를 한 번에 녹음해 점수 하나만 남으므로, 그 안의 문장별 분석은 할 수 없음
  */
  const analyzeContent = (
    type: "book" | "conversation"
  ): ContentAnalysis | null => {
    const byItem = new Map<string, number[]>();

    for (const row of weekPronunciations) {
      if (
        row.content_type !== type ||
        !row.content_id ||
        typeof row.score !== "number" ||
        !contentInfo.has(row.content_id)
      ) {
        continue;
      }

      byItem.set(row.content_id, [
        ...(byItem.get(row.content_id) ?? []),
        row.score,
      ]);
    }

    /*
      문장별 녹음 기록: content_id 가 "원래id#문장번호" (components/SentenceRecorder.tsx)
      같은 문장을 여러 번 했으면 평균을 냄
    */
    const bySentence = new Map<string, number[]>();

    for (const row of weekPronunciations) {
      if (
        row.content_type !== type ||
        !row.content_id?.includes("#") ||
        typeof row.score !== "number"
      ) {
        continue;
      }

      const [baseId, indexText] = row.content_id.split("#");

      if (contentInfo.get(baseId)?.sentences[Number(indexText)] === undefined) {
        continue;
      }

      bySentence.set(row.content_id, [
        ...(bySentence.get(row.content_id) ?? []),
        row.score,
      ]);
    }

    const sentenceList = Array.from(bySentence.entries()).map(
      ([key, scores]) => {
        const [baseId, indexText] = key.split("#");
        const info = contentInfo.get(baseId)!;

        return {
          baseId,
          title: info.title,
          sentence: info.sentences[Number(indexText)],
          score: average(scores) ?? 0,
          count: scores.length,
        };
      }
    );

    const weakSentences = sentenceList
      .filter((item) => item.score < STABLE_SCORE)
      .sort(
        (a, b) =>
          a.score - b.score ||
          b.count - a.count ||
          a.sentence.localeCompare(b.sentence)
      )
      .slice(0, WEAK_WORD_COUNT);

    for (const item of weakSentences) {
      wordLinks[`${type}:${item.title}`] = contentInfo.get(item.baseId)!.href;
    }

    const strongSentences = sentenceList
      .filter((item) => item.score >= STABLE_SCORE)
      .sort(
        (a, b) => b.score - a.score || a.sentence.localeCompare(b.sentence)
      )
      .slice(0, WEAK_WORD_COUNT);

    if (byItem.size === 0 && sentenceList.length === 0) return null;

    const list = Array.from(byItem.entries()).map(([contentId, scores]) => {
      const info = contentInfo.get(contentId)!;

      return {
        contentId,
        title: info.title,
        unit: info.unit,
        score: average(scores) ?? 0,
        count: scores.length,
        first: scores[0],
        last: scores[scores.length - 1],
      };
    });

    const weak = list
      .filter((item) => item.score < STABLE_SCORE)
      .sort(
        (a, b) =>
          a.score - b.score ||
          b.count - a.count ||
          a.title.localeCompare(b.title)
      )
      .slice(0, WEAK_WORD_COUNT);

    /* 화면에서 바로 연습하러 갈 수 있게 주소를 함께 남김 */
    for (const item of weak) {
      wordLinks[`${type}:${item.title}`] = contentInfo.get(
        item.contentId
      )!.href;
    }

    return {
      /* 전체 녹음이든 문장 녹음이든 한 번이라도 연습한 이야기 · 대화 수 */
      practiced: new Set([
        ...list.map((item) => item.contentId),
        ...sentenceList.map((item) => item.baseId),
      ]).size,

      /* 전체를 읽은 기록의 평균. 문장만 녹음했으면 문장 점수의 평균 */
      avg:
        average(Array.from(byItem.values()).flat()) ??
        average(Array.from(bySentence.values()).flat()) ??
        0,
      strong: list
        .filter((item) => item.score >= STABLE_SCORE)
        .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
        .slice(0, WEAK_WORD_COUNT)
        .map(({ title, unit, score, count }) => ({
          title,
          unit,
          score,
          count,
        })),
      weak: weak.map(({ title, unit, score, count }) => ({
        title,
        unit,
        score,
        count,
      })),
      improved: list
        .filter(
          (item) => item.count >= 2 && item.last - item.first >= IMPROVED_BY
        )
        .sort(
          (a, b) =>
            b.last - b.first - (a.last - a.first) ||
            a.title.localeCompare(b.title)
        )
        .slice(0, WEAK_WORD_COUNT)
        .map(({ title, first, last }) => ({
          title,
          from: first,
          to: last,
          gain: last - first,
        })),
      next: weak[0]?.title ?? weakSentences[0]?.title ?? null,
      weak_sentences: weakSentences.map(
        ({ title, sentence, score, count }) => ({
          title,
          sentence,
          score,
          count,
        })
      ),
      strong_sentences: strongSentences.map(({ title, sentence, score }) => ({
        title,
        sentence,
        score,
      })),
    };
  };

  const content = {
    book: analyzeContent("book"),
    conversation: analyzeContent("conversation"),
  };

  /* Test 정답률 (기록이 있는 종류만) */
  const testRate = (type: string): number | null => {
    const rows = tests.filter(
      (row) => TEST_LABEL[row.test_type ?? ""] === type
    );

    const total = rows.reduce(
      (sum, row) => sum + (row.total_questions ?? 0),
      0
    );

    if (total === 0) return null;

    const correct = rows.reduce((sum, row) => sum + (row.score ?? 0), 0);

    return Math.round((correct / total) * 100);
  };

  const test = {
    phonics: testRate("phonics"),
    conversation: testRate("conversation"),
    reading: testRate("reading"),
  };

  const hasTest = Object.values(test).some((value) => value !== null);

  return {
    stats: {
      period,
      period_days: days,
      insufficient: false,
      practice_days: practiceDays,
      words_practiced: practicedWords.size > 0 ? practicedWords.size : null,
      avg_pronunciation:
        thisWeekAvg === null && lastWeekAvg === null
          ? null
          : {
              this_week: thisWeekAvg,
              last_week: lastWeekAvg,
              change:
                thisWeekAvg !== null && lastWeekAvg !== null
                  ? thisWeekAvg - lastWeekAvg
                  : null,
            },
      weak_words:
        weakest.length > 0
          ? weakest.map(({ word, score, count, pattern }) => ({
              word,
              score,
              count,
              pattern,
            }))
          : null,
      test: hasTest ? test : null,
      next_focus:
        weakest.length > 0
          ? { pattern, words: weakest.map((entry) => entry.word) }
          : null,
      daily,
      areas: areas.length > 0 ? areas : null,
      strongest_area: hasAreaGap ? rankedAreas[0].area : null,
      weakest_area: hasAreaGap
        ? rankedAreas[rankedAreas.length - 1].area
        : null,
      components: hasComponents ? components : null,
      score_bands: wordStats.length > 0 ? scoreBands : null,
      strong_words: strongWords.length > 0 ? strongWords : null,
      improved_words: improvedWords.length > 0 ? improvedWords : null,
      content: content.book || content.conversation ? content : null,
    },
    wordLinks,
  };
}
