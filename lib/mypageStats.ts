// 저장 위치: lib/mypageStats.ts
// My Page에서 보여줄 학습 통계(스트릭, 발음 점수 추이, 단어 요약)를 집계합니다.

import { supabase } from "@/lib/supabase";

export const SECTION_LABELS: Record<string, string> = {
  "short-vowels": "단모음",
  "long-vowels": "장모음",
  "blend-sounds": "블렌드",
  "sight-words": "사이트워드",
  book: "북",
  conversation: "회화",
};

export type SectionTrend = {
  contentType: string;
  label: string;
  points: number[]; // 다운샘플링된 점수 추이 (시간순)
  latestAvg: number; // 최근 5개 평균
};

export type WordSummaryItem = {
  word: string;
  count: number;
  avgScore: number;
};

export type MyPageStats = {
  streakDays: number;
  weekLearningCount: number;
  overallAvgScore: number | null;
  sectionTrends: SectionTrend[];
  mostPracticedWords: WordSummaryItem[];
  weakWords: WordSummaryItem[];
};

const EMPTY_STATS: MyPageStats = {
  streakDays: 0,
  weekLearningCount: 0,
  overallAvgScore: null,
  sectionTrends: [],
  mostPracticedWords: [],
  weakWords: [],
};

function toDateKey(iso: string) {
  return new Date(iso).toDateString();
}

function average(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((sum, n) => sum + n, 0) / nums.length;
}

// 날짜 키 배열(중복 가능)을 받아 오늘 기준 연속 학습일을 계산
function calcStreak(dateKeys: string[]): number {
  if (dateKeys.length === 0) return 0;

  const uniqueDays = Array.from(new Set(dateKeys)).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cursor = new Date(today);

  // 오늘 기록이 없으면 어제부터 이어지는지 확인 (오늘이 아직 안 끝났을 수 있으므로)
  if (uniqueDays[0] !== today.toDateString()) {
    cursor.setDate(cursor.getDate() - 1);
    if (uniqueDays[0] !== cursor.toDateString()) {
      return 0;
    }
  }

  let streak = 0;

  for (const dayKey of uniqueDays) {
    if (dayKey === cursor.toDateString()) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

// 점수 배열을 최대 maxPoints개 구간으로 나눠 평균낸 값으로 다운샘플링 (차트용)
function downsample(scores: number[], maxPoints = 8): number[] {
  if (scores.length <= maxPoints) return scores;

  const chunkSize = Math.ceil(scores.length / maxPoints);
  const result: number[] = [];

  for (let i = 0; i < scores.length; i += chunkSize) {
    result.push(Math.round(average(scores.slice(i, i + chunkSize))));
  }

  return result;
}

export async function getMyPageStats(userId: string): Promise<MyPageStats> {
  const [learningRes, pronunciationRes] = await Promise.all([
    supabase.from("learning_logs").select("created_at").eq("user_id", userId),
    supabase
      .from("pronunciation_logs")
      .select("word, content_type, score, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true }),
  ]);

  if (learningRes.error) {
    console.error("학습 기록 통계 조회 실패:", learningRes.error);
  }

  if (pronunciationRes.error) {
    console.error("발음 기록 통계 조회 실패:", pronunciationRes.error);
  }

  const learningLogs = learningRes.data ?? [];
  const pronunciationLogs = pronunciationRes.data ?? [];

  // 연속 학습일 - learning_logs 기준 (알파벳 포함 전체 활동)
  const streakDays = calcStreak(
    learningLogs.map((log) => toDateKey(log.created_at))
  );

  // 이번 주 학습 수
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const weekLearningCount = learningLogs.filter(
    (log) => new Date(log.created_at) >= weekAgo
  ).length;

  if (pronunciationLogs.length === 0) {
    return { ...EMPTY_STATS, streakDays, weekLearningCount };
  }

  // 전체 평균 발음 점수
  const overallAvgScore = Math.round(
    average(
      pronunciationLogs
        .map((log) => log.score)
        .filter((score): score is number => typeof score === "number")
    )
  );

  // 섹션별 점수 추이
  const byType = new Map<string, number[]>();

  pronunciationLogs.forEach((log) => {
    if (typeof log.score !== "number") return;
    const key = log.content_type ?? "기타";
    const arr = byType.get(key) ?? [];
    arr.push(log.score);
    byType.set(key, arr);
  });

  const sectionTrends: SectionTrend[] = Array.from(byType.entries()).map(
    ([contentType, scores]) => ({
      contentType,
      label: SECTION_LABELS[contentType] ?? contentType,
      points: downsample(scores),
      latestAvg: Math.round(average(scores.slice(-5))),
    })
  );

  // 단어별 연습 횟수 / 평균 점수
  const byWord = new Map<string, { total: number; count: number }>();

  pronunciationLogs.forEach((log) => {
    if (!log.word || typeof log.score !== "number") return;
    const prev = byWord.get(log.word) ?? { total: 0, count: 0 };
    byWord.set(log.word, {
      total: prev.total + log.score,
      count: prev.count + 1,
    });
  });

  const wordSummaries: WordSummaryItem[] = Array.from(byWord.entries()).map(
    ([word, { total, count }]) => ({
      word,
      count,
      avgScore: Math.round(total / count),
    })
  );

  const mostPracticedWords = [...wordSummaries]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const weakWords = [...wordSummaries]
    .filter((item) => item.avgScore < 80)
    .sort((a, b) => a.avgScore - b.avgScore)
    .slice(0, 5);

  return {
    streakDays,
    weekLearningCount,
    overallAvgScore,
    sectionTrends,
    mostPracticedWords,
    weakWords,
  };
}