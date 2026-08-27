// lib/getWeakWords.ts
import { supabase } from "@/lib/supabase";
import { conversationCategories } from "@/app/(main)/conversation/data";

export type LearningLevel = "beginner" | "elementary" | "intermediate" | "advanced";

export type WeakWordSummary = {
  weakWords: string[];
  studiedTypes: string[];
  level: LearningLevel;
  masteredWordCount: number;
  highestContentLevel: number;
};

const MASTERY_MIN_COUNT = 50;
const MASTERY_MIN_SCORE = 50;
const SOLID_WORD_MASTERY_COUNT = 10;

const dialogueLevelMap: Map<string, number> = new Map(
  conversationCategories.flatMap((category) =>
    category.dialogues.map((dialogue) => [dialogue.id, dialogue.level] as const)
  )
);

const WORD_CONTENT_TYPES = ["short-vowels", "long-vowels", "blend-sounds", "sight-words"];

type ContentStats = {
  recordCount: number;
  scoreSum: number;
  scoreCount: number;
  listenCount: number; // listen + listen_line 합산 (볼륨 기준)
  fullListenCount: number; // listen만 (완주 여부 기준, conversation 게이트용)
  playbackCount: number;
};

function isMastered(stats: ContentStats, contentType: string): boolean {
  const avgScore = stats.scoreCount > 0 ? stats.scoreSum / stats.scoreCount : 0;

  const passesCoreBar =
    stats.recordCount >= MASTERY_MIN_COUNT &&
    stats.listenCount >= MASTERY_MIN_COUNT &&
    stats.playbackCount >= MASTERY_MIN_COUNT &&
    avgScore >= MASTERY_MIN_SCORE;

  if (!passesCoreBar) return false;

  // Conversation은 개별 줄 다시듣기만으로 50번을 채울 수 있어서,
  // 최소 한 번은 전체듣기(handlePlayAll)를 완주했는지 추가로 확인
  if (contentType === "conversation" && stats.fullListenCount < 1) return false;

  return true;
}

async function getHighestContentLevel(
  userId: string,
  statsByContentId: Map<string, ContentStats>,
  contentTypeById: Map<string, string>
): Promise<number> {
  let highest = 0;

  statsByContentId.forEach((stats, contentId) => {
    const type = contentTypeById.get(contentId) ?? "";

    if (type === "book") {
      const match = contentId.match(/^book-level(\d+)-/);
      if (match && isMastered(stats, type)) {
        const level = Number(match[1]);
        if (level > highest) highest = level;
      }
    } else if (type === "conversation") {
      const dialogueId = contentId.replace(/^conversation-/, "");
      const level = dialogueLevelMap.get(dialogueId);
      if (level && isMastered(stats, type)) {
        if (level > highest) highest = level;
      }
    }
  });

  return highest;
}

function computeLevel(
  highestContentLevel: number,
  solidWordPractice: boolean
): LearningLevel {
  if (highestContentLevel >= 4) return "advanced";
  if (highestContentLevel === 3) return solidWordPractice ? "advanced" : "intermediate";
  if (highestContentLevel === 2) return solidWordPractice ? "intermediate" : "elementary";
  return solidWordPractice ? "elementary" : "beginner";
}

export async function getWeakWords(userId: string): Promise<WeakWordSummary> {
  const { data: pronunciationData, error: pronunciationError } = await supabase
    .from("pronunciation_logs")
    .select("content_id, content_type, word, score")
    .eq("user_id", userId);

  const { data: engagementData, error: engagementError } = await supabase
    .from("content_engagement_logs")
    .select("content_id, content_type, action")
    .eq("user_id", userId);

  const statsByContentId = new Map<string, ContentStats>();
  const contentTypeById = new Map<string, string>();
  const wordById = new Map<string, string>();
  const typeSet = new Set<string>();

  const getOrCreateStats = (contentId: string): ContentStats => {
    const existing = statsByContentId.get(contentId);
    if (existing) return existing;
    const fresh: ContentStats = {
      recordCount: 0,
      scoreSum: 0,
      scoreCount: 0,
      listenCount: 0,
      fullListenCount: 0,
      playbackCount: 0,
    };
    statsByContentId.set(contentId, fresh);
    return fresh;
  };

  if (!pronunciationError && pronunciationData) {
    pronunciationData.forEach((row) => {
      if (!row.content_id) return;

      contentTypeById.set(row.content_id, row.content_type ?? "");
      typeSet.add(row.content_type ?? "");
      if (row.word) wordById.set(row.content_id, row.word);

      const stats = getOrCreateStats(row.content_id);
      stats.recordCount += 1;

      if (typeof row.score === "number") {
        stats.scoreSum += row.score;
        stats.scoreCount += 1;
      }
    });
  }

  if (!engagementError && engagementData) {
    engagementData.forEach((row) => {
      if (!row.content_id) return;

      const stats = getOrCreateStats(row.content_id);

      if (row.action === "listen") {
        stats.listenCount += 1;
        stats.fullListenCount += 1;
      } else if (row.action === "listen_line") {
        stats.listenCount += 1;
      } else if (row.action === "playback") {
        stats.playbackCount += 1;
      }
    });
  }

  const weakWords = Array.from(statsByContentId.entries())
    .filter(([contentId]) => WORD_CONTENT_TYPES.includes(contentTypeById.get(contentId) ?? ""))
    .map(([contentId, stats]) => ({
      word: wordById.get(contentId) ?? "",
      avg: stats.scoreCount > 0 ? stats.scoreSum / stats.scoreCount : 0,
    }))
    .filter((entry) => entry.word && entry.avg < 70)
    .sort((a, b) => a.avg - b.avg)
    .slice(0, 5)
    .map((entry) => entry.word);

  let masteredWordCount = 0;
  statsByContentId.forEach((stats, contentId) => {
    const type = contentTypeById.get(contentId) ?? "";
    if (WORD_CONTENT_TYPES.includes(type) && isMastered(stats, type)) {
      masteredWordCount += 1;
    }
  });

  const highestContentLevel = await getHighestContentLevel(
    userId,
    statsByContentId,
    contentTypeById
  );

  const solidWordPractice = masteredWordCount >= SOLID_WORD_MASTERY_COUNT;
  const level = computeLevel(highestContentLevel, solidWordPractice);

  return {
    weakWords,
    studiedTypes: Array.from(typeSet).filter(Boolean),
    level,
    masteredWordCount,
    highestContentLevel,
  };
}