export const PHONICS_STAGE_COUNT = 5;

export const FINAL_PHONICS_STAGE = PHONICS_STAGE_COUNT;

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

export function isValidPhonicsStage(
  stage: number
): boolean {
  return (
    Number.isInteger(stage) &&
    stage >= 1 &&
    stage <= PHONICS_STAGE_COUNT
  );
}

/* ─────────────────────────────
   Question Count

   Stage 1~4 = 10문제
   Stage 5   = 15문제
───────────────────────────── */

export function getPhonicsQuestionCount(
  stage: number
): number {
  return stage === FINAL_PHONICS_STAGE
    ? 15
    : 10;
}

/* ─────────────────────────────
   Pass Score

   Stage 1~4 = 7 / 10
   Stage 5   = 11 / 15
───────────────────────────── */

export function getPhonicsPassScore(
  stage: number
): number {
  return stage === FINAL_PHONICS_STAGE
    ? 11
    : 7;
}

/* ─────────────────────────────
   Stars
───────────────────────────── */

export function getPhonicsStars(
  score: number,
  stage: number
): number {
  /*
    Final Stage
    15문제
  */
  if (stage === FINAL_PHONICS_STAGE) {
    if (score === 15) {
      return 3;
    }

    if (score >= 13) {
      return 2;
    }

    if (score >= 11) {
      return 1;
    }

    return 0;
  }

  /*
    Stage 1~4
    10문제
  */
  if (score === 10) {
    return 3;
  }

  if (score >= 8) {
    return 2;
  }

  if (score >= 7) {
    return 1;
  }

  return 0;
}

/* ─────────────────────────────
   Passed
───────────────────────────── */

export function isPhonicsStagePassed(
  score: number,
  stage: number
): boolean {
  const passScore =
    getPhonicsPassScore(stage);

  return score >= passScore;
}