import { TEST, TEST_STAR_SCORES } from "@/lib/learningRules";

/* ─────────────────────────────
   Categories
───────────────────────────── */

export const PHONICS_TEST_CATEGORY_IDS = [
  "alphabet",
  "short-vowels",
  "long-vowels",
  "blend-sounds",
  "sight-words",
] as const;

export type PhonicsTestCategoryId =
  (typeof PHONICS_TEST_CATEGORY_IDS)[number];

export function isPhonicsTestCategoryId(
  value: string
): value is PhonicsTestCategoryId {
  return (
    PHONICS_TEST_CATEGORY_IDS as readonly string[]
  ).includes(value);
}

/* ─────────────────────────────
   Stage Count

   Alphabet · Blend Sounds  = 5 (묶음 4개 + Review)
   Short / Long Vowels      = 6 (A · E · I · O · U + Review)
   Sight Words              = 6 (Level 1~5 + Review)

   마지막 Stage 가 항상 Review(Final)
───────────────────────────── */

const PHONICS_STAGE_COUNTS: Record<PhonicsTestCategoryId, number> = {
  alphabet: 5,
  "short-vowels": 6,
  "long-vowels": 6,
  "blend-sounds": 5,
  "sight-words": 6,
};

export function getPhonicsStageCount(
  category: PhonicsTestCategoryId
): number {
  return PHONICS_STAGE_COUNTS[category];
}

/* 모든 영역의 Stage 수 합계 */
export const TOTAL_PHONICS_STAGE_COUNT =
  PHONICS_TEST_CATEGORY_IDS.reduce(
    (sum, category) => sum + PHONICS_STAGE_COUNTS[category],
    0
  );

export function isFinalPhonicsStage(
  category: PhonicsTestCategoryId,
  stage: number
): boolean {
  return stage === PHONICS_STAGE_COUNTS[category];
}

export function isValidPhonicsStage(
  category: PhonicsTestCategoryId,
  stage: number
): boolean {
  return (
    Number.isInteger(stage) &&
    stage >= 1 &&
    stage <= PHONICS_STAGE_COUNTS[category]
  );
}

/* ─────────────────────────────
   Question Count · Pass Score · Stars
   (숫자는 lib/learningRules.ts 의 TEST)

   일반 Stage = 10문제, 8개 이상 통과
   Review     = 20문제, 16개 이상 통과
───────────────────────────── */

export function getPhonicsQuestionCount(
  category: PhonicsTestCategoryId,
  stage: number
): number {
  return isFinalPhonicsStage(category, stage)
    ? TEST.reviewQuestionCount
    : TEST.questionCount;
}

/* 문제 수에 대한 통과 점수 (Phonics · Conversation Test 공통) */
export function getPassScore(questionCount: number): number {
  return Math.ceil(questionCount * TEST.passRate);
}

/* 맞힌 개수에 대한 별 개수 (Phonics · Conversation Test 공통) */
export function getStars(score: number, isReview: boolean): number {
  const steps = isReview
    ? TEST_STAR_SCORES.review
    : TEST_STAR_SCORES.normal;

  return steps.filter((step) => score >= step).length;
}

export function getPhonicsPassScore(
  category: PhonicsTestCategoryId,
  stage: number
): number {
  return getPassScore(getPhonicsQuestionCount(category, stage));
}

export function getPhonicsStars(
  score: number,
  category: PhonicsTestCategoryId,
  stage: number
): number {
  return getStars(score, isFinalPhonicsStage(category, stage));
}

export function isPhonicsStagePassed(
  score: number,
  category: PhonicsTestCategoryId,
  stage: number
): boolean {
  return score >= getPhonicsPassScore(category, stage);
}
