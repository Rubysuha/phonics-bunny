export const READING_QUESTION_COUNT = 5;

export const READING_PASS_SCORE = 4;

/* ─────────────────────────────
   Story Key

   test_results에는 이야기 전용 컬럼이 없으므로
   category에 "level1/my-dog" 형태로 저장
───────────────────────────── */

export function getReadingStoryKey(
  level: string,
  story: string
): string {
  return `${level}/${story}`;
}

/* ─────────────────────────────
   Stars

   5문제
   5 = 3개 / 4 = 2개
   통과(4점)하지 못하면 별 없음
───────────────────────────── */

export function getReadingStars(
  score: number
): number {
  if (score >= READING_QUESTION_COUNT) {
    return 3;
  }

  if (score >= READING_PASS_SCORE) {
    return 2;
  }

  return 0;
}

/* ─────────────────────────────
   Passed
───────────────────────────── */

export function isReadingPassed(
  score: number
): boolean {
  return score >= READING_PASS_SCORE;
}
