import { supabase } from "@/lib/supabase";
import { shortVowelItems } from "@/app/(main)/english/short-vowels/data";
import { longVowelItems } from "@/app/(main)/english/long-vowels/data";
import { blendItems } from "@/app/(main)/english/blend-sounds/data";
import { sightWordLevels } from "@/app/(main)/english/sight-words/data";
import { bookLevels } from "@/app/(main)/book/data";
import { conversationCategories } from "@/app/(main)/conversation/data";
import {
  AREAS,
  AREA_LEVEL_COUNTS,
  KNOWN_WORD_MAX,
  LEVELS,
  LEVEL_UP_COOLDOWN_DAYS,
  MASTERY,
  WEAK,
  type LearningArea,
  type LearningLevel,
} from "@/lib/learningRules";
import { LEARNING_UPDATED_EVENT } from "@/lib/learningEvents";

/*
  학습 기록(pronunciation_logs · content_engagement_logs)으로
  항목별 숙달 · 영역별 단계 · AI Bunny 단계 · 약한 단어를 계산

  기준 숫자는 모두 lib/learningRules.ts 에 있음
*/

/* ─────────────────────────────
   학습 항목 목록 (기록의 content_id 와 같은 형태)
───────────────────────────── */

type CatalogItem = {
  area: LearningArea;
  contentType: string;

  /* 단어 또는 제목 */
  label: string;

  /* Book · Conversation 의 문장들 */
  sentences?: string[];
};

const catalog = new Map<string, CatalogItem>();

for (const item of shortVowelItems) {
  for (const word of item.words) {
    catalog.set(`short-vowels-${word.slug}`, {
      area: "phonics",
      contentType: "short-vowels",
      label: word.word,
    });
  }
}

for (const item of longVowelItems) {
  for (const word of item.words) {
    catalog.set(`long-vowels-${word.slug}`, {
      area: "phonics",
      contentType: "long-vowels",
      label: word.word,
    });
  }
}

for (const item of blendItems) {
  for (const word of item.words) {
    catalog.set(`blend-sounds-${word.slug}`, {
      area: "phonics",
      contentType: "blend-sounds",
      label: word.word,
    });
  }
}

for (const level of sightWordLevels) {
  for (const word of level.words) {
    catalog.set(`sight-words-${word.slug}`, {
      area: "phonics",
      contentType: "sight-words",
      label: word.word,
    });
  }
}

for (const level of bookLevels) {
  for (const story of level.stories) {
    catalog.set(`book-${level.level}-${story.slug}`, {
      area: "book",
      contentType: "book",
      label: story.title,
      sentences: story.sentences,
    });
  }
}

for (const category of conversationCategories) {
  for (const dialogue of category.dialogues) {
    catalog.set(`conversation-${dialogue.id}`, {
      area: "conversation",
      contentType: "conversation",
      label: dialogue.title,
      sentences: dialogue.lines.map((line) => line.text),
    });
  }
}

/* 영역별 전체 항목 수 */
export const AREA_TOTAL: Record<LearningArea, number> = {
  phonics: 0,
  book: 0,
  conversation: 0,
};

catalog.forEach((item) => {
  AREA_TOTAL[item.area] += 1;
});

/* ─────────────────────────────
   Types
───────────────────────────── */

export type ItemProgress = {
  contentId: string;
  area: LearningArea;
  label: string;

  /* 녹음 + 듣기 + 내 녹음 재생 (하루 상한 적용) */
  totalCount: number;

  /* 녹음(AI 발음 분석) 횟수 */
  recordCount: number;

  /* 학습한 서로 다른 날 수 */
  days: number;

  /* 최근 녹음 평균 (녹음이 없으면 null) */
  recentScore: number | null;

  /* 지금까지의 최고 점수 (녹음이 없으면 null) */
  bestScore: number | null;

  mastered: boolean;
};

export type AreaProgress = {
  area: LearningArea;

  /* 숙달한 개수 · 전체 개수 */
  mastered: number;
  total: number;

  level: LearningLevel;

  /* 다음 단계 기준 개수 (최고 단계면 null) */
  nextCount: number | null;
};

export type LearningSummary = {
  /* AI Bunny 단계 (저장된 값: 한 단계씩 오르고 내려가지 않음) */
  level: LearningLevel;

  areas: Record<LearningArea, AreaProgress>;

  /*
    다음 AI Bunny 단계까지
    - bottleneck : 가장 많이 남은 영역 (최고 단계면 null)
    - remaining  : 그 영역에서 더 숙달해야 하는 개수
    - progress   : 진행 막대 (0~1)
    - waitDays   : 기준은 채웠지만 아직 기다려야 하는 날 수 (0 이면 없음)
  */
  bottleneck: LearningArea | null;
  remaining: number;
  progress: number;
  waitDays: number;

  /* AI Bunny 가 다시 꺼내 줄 약한 단어 · 문장 */
  weakWords: string[];

  /* 지금까지 학습한 단어 (많이 연습한 순) */
  knownWords: string[];

  /* 학습 기록이 있는 영역 종류 (short-vowels, book …) */
  studiedTypes: string[];

  items: Map<string, ItemProgress>;
};

/* ─────────────────────────────
   기록 불러오기
───────────────────────────── */

type LogRow = {
  content_id: string | null;
  created_at: string;
  score?: number | null;
};

/* Supabase 는 한 번에 1000줄까지만 주므로 끝까지 나눠서 가져옴 */
async function fetchAllLogs(
  table: "pronunciation_logs" | "content_engagement_logs",
  columns: string,
  userId: string
): Promise<LogRow[]> {
  const PAGE = 1000;
  const rows: LogRow[] = [];

  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .range(from, from + PAGE - 1);

    if (error) {
      console.error(`${table} 불러오기 실패:`, error);
      break;
    }

    rows.push(...((data ?? []) as unknown as LogRow[]));

    if (!data || data.length < PAGE) break;
  }

  return rows;
}

/* 이 기기 시간 기준 날짜 (예: "2026-10-13") */
function toDateKey(iso: string): string {
  const date = new Date(iso);

  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/* ─────────────────────────────
   계산
───────────────────────────── */

type RawStats = {
  /* 날짜별 횟수 (녹음 + 듣기 + 재생) */
  countByDay: Map<string, number>;

  /* 녹음 점수 (오래된 것부터) */
  scores: number[];

  recordCount: number;
};

function levelFromCount(area: LearningArea, mastered: number): LearningLevel {
  const counts = AREA_LEVEL_COUNTS[area];

  let index = 0;

  for (let i = 0; i < counts.length; i += 1) {
    if (mastered >= counts[i]) index = i;
  }

  return LEVELS[index];
}

/* Book · Conversation 의 약한 항목에서 AI Bunny 에 넘길 문장 하나 */
function pickSentence(sentences: string[]): string {
  const wordCount = (text: string) => text.trim().split(/\s+/).length;

  return (
    sentences.find((text) => wordCount(text) >= 3 && wordCount(text) <= 8) ??
    sentences[sentences.length - 1] ??
    ""
  );
}

/*
  저장된 AI Bunny 단계를 계산한 단계에 맞춰 올림
  - 한 번에 한 단계씩, 오른 뒤 LEVEL_UP_COOLDOWN_DAYS 동안은 다시 오르지 않음
  - 내려가지 않음
  - 아직 한 번도 정해지지 않은 사용자는 지금까지의 기록으로 바로 정함
*/
async function syncStoredLevel(
  userId: string,
  computedIndex: number
): Promise<{ index: number; waitDays: number }> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("ai_level, ai_level_updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("AI Bunny 단계 불러오기 실패:", error);

    return { index: 0, waitDays: 0 };
  }

  const storedIndex = Math.max(
    0,
    LEVELS.indexOf((profile?.ai_level ?? "beginner") as LearningLevel)
  );

  const updatedAt = profile?.ai_level_updated_at
    ? new Date(profile.ai_level_updated_at)
    : null;

  if (computedIndex <= storedIndex) {
    return { index: storedIndex, waitDays: 0 };
  }

  let nextIndex: number;

  if (!updatedAt && storedIndex === 0) {
    /* 처음 정하는 경우: 기존 기록으로 계산한 단계 그대로 */
    nextIndex = computedIndex;
  } else {
    const DAY = 24 * 60 * 60 * 1000;

    const passedDays = updatedAt
      ? (Date.now() - updatedAt.getTime()) / DAY
      : LEVEL_UP_COOLDOWN_DAYS;

    if (passedDays < LEVEL_UP_COOLDOWN_DAYS) {
      return {
        index: storedIndex,
        waitDays: Math.ceil(LEVEL_UP_COOLDOWN_DAYS - passedDays),
      };
    }

    nextIndex = storedIndex + 1;
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      ai_level: LEVELS[nextIndex],
      ai_level_updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (updateError) {
    console.error("AI Bunny 단계 저장 실패:", updateError);

    return { index: storedIndex, waitDays: 0 };
  }

  return { index: nextIndex, waitDays: 0 };
}

async function buildSummary(userId: string): Promise<LearningSummary> {
  const [records, engagements] = await Promise.all([
    fetchAllLogs("pronunciation_logs", "content_id, created_at, score", userId),
    fetchAllLogs("content_engagement_logs", "content_id, created_at", userId),
  ]);

  const statsById = new Map<string, RawStats>();

  const getStats = (contentId: string): RawStats => {
    let stats = statsById.get(contentId);

    if (!stats) {
      stats = { countByDay: new Map(), scores: [], recordCount: 0 };
      statsById.set(contentId, stats);
    }

    return stats;
  };

  const addCount = (stats: RawStats, createdAt: string) => {
    const day = toDateKey(createdAt);

    stats.countByDay.set(day, (stats.countByDay.get(day) ?? 0) + 1);
  };

  for (const row of records) {
    if (!row.content_id || !catalog.has(row.content_id)) continue;

    const stats = getStats(row.content_id);

    addCount(stats, row.created_at);
    stats.recordCount += 1;

    if (typeof row.score === "number") {
      stats.scores.push(row.score);
    }
  }

  for (const row of engagements) {
    if (!row.content_id || !catalog.has(row.content_id)) continue;

    addCount(getStats(row.content_id), row.created_at);
  }

  /* 항목별 진행 */

  const items = new Map<string, ItemProgress>();
  const masteredCount: Record<LearningArea, number> = {
    phonics: 0,
    book: 0,
    conversation: 0,
  };

  const weak: { text: string; score: number }[] = [];
  const known: { word: string; count: number }[] = [];
  const studiedTypes = new Set<string>();

  statsById.forEach((stats, contentId) => {
    const info = catalog.get(contentId)!;

    let totalCount = 0;

    stats.countByDay.forEach((count) => {
      totalCount += Math.min(count, MASTERY.dailyCap);
    });

    const recent = stats.scores.slice(-MASTERY.recentRecords);
    const recentScore = recent.length > 0 ? average(recent) : null;

    const mastered =
      totalCount >= MASTERY.totalCount &&
      stats.recordCount >= MASTERY.recordCount &&
      stats.countByDay.size >= MASTERY.days &&
      recentScore !== null &&
      recentScore >= MASTERY.recentScore;

    if (mastered) masteredCount[info.area] += 1;

    items.set(contentId, {
      contentId,
      area: info.area,
      label: info.label,
      totalCount,
      recordCount: stats.recordCount,
      days: stats.countByDay.size,
      recentScore,
      bestScore: stats.scores.length > 0 ? Math.max(...stats.scores) : null,
      mastered,
    });

    studiedTypes.add(info.contentType);

    if (info.area === "phonics") {
      known.push({ word: info.label, count: totalCount });
    }

    /* 약한 단어 · 문장: 최근 녹음 평균이 기준 미만 */
    const weakRecent = stats.scores.slice(-WEAK.recentRecords);

    if (weakRecent.length > 0 && average(weakRecent) < WEAK.score) {
      const text = info.sentences ? pickSentence(info.sentences) : info.label;

      if (text) weak.push({ text, score: average(weakRecent) });
    }
  });

  /* 영역별 단계 */

  const areas = {} as Record<LearningArea, AreaProgress>;

  for (const area of AREAS) {
    const level = levelFromCount(area, masteredCount[area]);
    const nextIndex = LEVELS.indexOf(level) + 1;

    areas[area] = {
      area,
      mastered: masteredCount[area],
      total: AREA_TOTAL[area],
      level,
      nextCount: AREA_LEVEL_COUNTS[area][nextIndex] ?? null,
    };
  }

  /* AI Bunny 단계: 세 영역 중 가장 낮은 단계 */

  const computedIndex = Math.min(
    ...AREAS.map((area) => LEVELS.indexOf(areas[area].level))
  );

  const stored = await syncStoredLevel(userId, computedIndex);

  /* 다음 단계까지: 가장 많이 남은 영역 */

  let bottleneck: LearningArea | null = null;
  let remaining = 0;
  let progress = 1;

  const targetIndex = stored.index + 1;

  if (targetIndex < LEVELS.length) {
    let lowest = Infinity;

    for (const area of AREAS) {
      const from = AREA_LEVEL_COUNTS[area][stored.index];
      const to = AREA_LEVEL_COUNTS[area][targetIndex];

      const ratio = Math.min(
        1,
        Math.max(0, (masteredCount[area] - from) / (to - from))
      );

      if (ratio < lowest) {
        lowest = ratio;
        bottleneck = area;
        remaining = Math.max(0, to - masteredCount[area]);
        progress = ratio;
      }
    }
  }

  return {
    level: LEVELS[stored.index],
    areas,
    bottleneck,
    remaining,
    progress,
    waitDays: stored.waitDays,
    weakWords: weak
      .sort((a, b) => a.score - b.score)
      .slice(0, WEAK.max)
      .map((entry) => entry.text),
    knownWords: known
      .sort((a, b) => b.count - a.count)
      .slice(0, KNOWN_WORD_MAX)
      .map((entry) => entry.word),
    studiedTypes: Array.from(studiedTypes),
    items,
  };
}

/* ─────────────────────────────
   불러오기 (한 화면에서 여러 번 불러도 조회는 한 번)
───────────────────────────── */

let cache: {
  userId: string;
  loadedAt: number;
  promise: Promise<LearningSummary>;
} | null = null;

/* 학습하고 돌아왔을 때 반영되도록 잠깐만 재사용 */
const REUSE_MS = 3000;

export function loadLearningSummary(userId: string): Promise<LearningSummary> {
  if (
    !cache ||
    cache.userId !== userId ||
    Date.now() - cache.loadedAt > REUSE_MS
  ) {
    cache = {
      userId,
      loadedAt: Date.now(),
      promise: buildSummary(userId),
    };
  }

  return cache.promise;
}

/* 로그인한 사용자의 학습 요약 (로그인하지 않았으면 null) */
export async function loadMyLearningSummary(): Promise<LearningSummary | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? loadLearningSummary(user.id) : null;
}

/*
  학습 기록이 새로 저장되면 다음 조회는 새로 불러옴
  (화면의 표시들보다 먼저 등록되므로, 표시들은 이벤트를 받고 다시 불러오기만 하면 됨)
*/
if (typeof window !== "undefined") {
  window.addEventListener(LEARNING_UPDATED_EVENT, () => {
    cache = null;
  });
}
