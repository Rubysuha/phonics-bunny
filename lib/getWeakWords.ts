// lib/getWeakWords.ts
import { supabase } from "@/lib/supabase";

export type WeakWordSummary = {
  weakWords: string[]; // 평균 점수가 낮은 단어들 (최대 5개)
  studiedTypes: string[]; // 지금까지 학습한 섹션 종류
};

export async function getWeakWords(userId: string): Promise<WeakWordSummary> {
  const { data, error } = await supabase
    .from("pronunciation_logs")
    .select("word, content_type, score")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error || !data || data.length === 0) {
    return { weakWords: [], studiedTypes: [] };
  }

  const wordScores = new Map<string, { total: number; count: number }>();
  const typeSet = new Set<string>();

  data.forEach((row) => {
    if (!row.word || typeof row.score !== "number") return;

    typeSet.add(row.content_type ?? "");

    const prev = wordScores.get(row.word) ?? { total: 0, count: 0 };
    wordScores.set(row.word, {
      total: prev.total + row.score,
      count: prev.count + 1,
    });
  });

  const weakWords = Array.from(wordScores.entries())
    .map(([word, { total, count }]) => ({ word, avg: total / count }))
    .filter((entry) => entry.avg < 70)
    .sort((a, b) => a.avg - b.avg)
    .slice(0, 5)
    .map((entry) => entry.word);

  return {
    weakWords,
    studiedTypes: Array.from(typeSet).filter(Boolean),
  };
}