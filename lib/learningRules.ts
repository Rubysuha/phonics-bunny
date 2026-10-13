/*
  학습 기준 숫자 모음

  숙달 기준 · 단계 · AI Bunny 동작 · Test · 코인의 숫자를 한곳에 모아 둠.
  기준을 바꾸고 싶으면 이 파일의 숫자만 고치면 됨.
*/

/* ─────────────────────────────
   1. 숙달 기준
   (Phonics 단어 · Book 이야기 · Conversation 대화 공통)
───────────────────────────── */

export const MASTERY = {
  /* 녹음 + 듣기 + 내 녹음 재생 합계 */
  totalCount: 60,

  /* 그중 녹음(AI 발음 분석) 횟수 */
  recordCount: 10,

  /* 서로 다른 날 수 */
  days: 4,

  /* 하루에 인정되는 횟수 */
  dailyCap: 20,

  /* 최근 녹음 몇 번의 평균을 볼지 · 그 평균 점수 */
  recentRecords: 5,
  recentScore: 85,
} as const;

/* ─────────────────────────────
   2. 단계
───────────────────────────── */

export const LEVELS = [
  "beginner",
  "elementary",
  "intermediate",
  "advanced",
] as const;

export type LearningLevel = (typeof LEVELS)[number];

export const LEVEL_LABEL: Record<LearningLevel, string> = {
  beginner: "왕초보",
  elementary: "초급",
  intermediate: "중급",
  advanced: "고급",
};

/* 단계가 오르면 AI Bunny 가 어떻게 달라지는지 (축하 화면 안내) */
export const LEVEL_CHANGE_NOTE: Record<LearningLevel, string> = {
  beginner: "아주 짧고 쉬운 문장으로 천천히 말해요.",
  elementary: "문장이 조금 길어지고 가끔 새 단어가 나와요.",
  intermediate: "문장을 이어서 말하고 조금 더 빨리 말해요.",
  advanced: "긴 문장으로 자연스럽게 이야기해요.",
};

export type LearningArea = "phonics" | "book" | "conversation";

export const AREAS: LearningArea[] = ["phonics", "book", "conversation"];

export const AREA_LABEL: Record<LearningArea, string> = {
  phonics: "Phonics",
  book: "Book",
  conversation: "Conversation",
};

/* 무엇을 세는지 (예: "Phonics 단어 2개 더!") */
export const AREA_UNIT: Record<LearningArea, string> = {
  phonics: "단어",
  book: "이야기",
  conversation: "대화",
};

/*
  영역별 단계 기준: 숙달한 개수가 이 값 이상이면 그 단계
  [beginner, elementary, intermediate, advanced]
*/
export const AREA_LEVEL_COUNTS: Record<LearningArea, number[]> = {
  phonics: [0, 50, 150, 350],
  book: [0, 10, 40, 100],
  conversation: [0, 5, 20, 40],
};

/* 단계가 오른 뒤 다시 오르기까지 기다리는 날 수 */
export const LEVEL_UP_COOLDOWN_DAYS = 7;

/* ─────────────────────────────
   4. 약한 단어 · 문장
───────────────────────────── */

export const WEAK = {
  /* 최근 녹음 몇 번의 평균을 볼지 · 이 점수 미만이면 약한 항목 */
  recentRecords: 3,
  score: 85,

  /* AI Bunny 에 넘기는 최대 개수 */
  max: 5,
} as const;

/* ─────────────────────────────
   5. AI Bunny 동작
───────────────────────────── */

/* 말 속도 (Azure TTS prosody rate) */
export const TTS_RATE: Record<LearningLevel, string> = {
  beginner: "-20%",
  elementary: "-12%",
  intermediate: "-8%",
  advanced: "-5%",
};

/* 대답의 다양함 (낮을수록 예측 가능한 쉬운 말) */
export const AI_TEMPERATURE: Record<LearningLevel, number> = {
  beginner: 0.6,
  elementary: 1,
  intermediate: 1,
  advanced: 1,
};

/* beginner: 한 문장이 이 단어 수를 넘으면 한 번 다시 만듦 */
export const BEGINNER_MAX_WORDS_PER_SENTENCE = 5;

/* 배운 단어 안에서만 말하게 하는 단계 · 프롬프트에 넣는 최대 단어 수 */
export const KNOWN_WORD_LEVELS: LearningLevel[] = ["beginner", "elementary"];
export const KNOWN_WORD_MAX = 200;

/* ─────────────────────────────
   7. Conversation 화면
───────────────────────────── */

/* 발음 분석 점수가 이 값 이상이면 Stage 완료 */
export const STAGE_DONE_SCORE = 70;

/* 지도에 보여 주는 3단계 (Stage 번호 기준) */
export const STAGE_TIERS = [
  { id: "starter", label: "Starter", from: 1, to: 2 },
  { id: "basic", label: "Basic", from: 3, to: 6 },
  { id: "challenge", label: "Challenge", from: 7, to: 10 },
] as const;

export type StageTierId = (typeof STAGE_TIERS)[number]["id"];

export function getStageTier(stageNumber: number) {
  return (
    STAGE_TIERS.find(
      (tier) => stageNumber >= tier.from && stageNumber <= tier.to
    ) ?? STAGE_TIERS[STAGE_TIERS.length - 1]
  );
}

/* ─────────────────────────────
   8. Test
───────────────────────────── */

export const TEST = {
  /* Stage 한 번의 문제 수 · 마지막(Review / Final) Stage 의 문제 수 */
  questionCount: 10,
  reviewQuestionCount: 20,

  /* 통과 기준 (맞힌 비율) */
  passRate: 0.8,
} as const;

/*
  별 기준: 맞힌 개수가 이 값 이상이면 별 1 · 2 · 3개
  (별 1개 = 통과 기준)
*/
export const TEST_STAR_SCORES = {
  normal: [8, 9, 10],
  review: [16, 18, 20],
} as const;

/* ─────────────────────────────
   9. Test 코인
   새로 딴 별에만 지급 (하루 코인 한도와 별개)
───────────────────────────── */

export const TEST_COIN = {
  /* Phonics / Conversation 일반 Stage: 새 별 1개당 */
  stagePerStar: 2,

  /* Final / Review Stage: 새 별 1개당 */
  reviewPerStar: 5,

  /* Reading 이야기: 새 별 1개당 */
  readingPerStar: 1,

  /* 한 영역의 Stage 를 모두 통과했을 때 한 번 */
  areaBonus: 20,
} as const;
