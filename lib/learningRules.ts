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
  beginner: "짧고 쉬운 문장으로 천천히 말해요.",
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
export const BEGINNER_MAX_WORDS_PER_SENTENCE = 7;

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

/* ─────────────────────────────
   AI Bunny 첫 인사

   1순위: AI 가 만든 인사 (단계 · 배운 단어 · 약한 단어 반영)
   2순위: 아래의 단계별 고정 목록 · 약한 단어 템플릿 (API 호출 없음)
   3순위: 화면에 원래 있던 OPENING_LINES
───────────────────────────── */

/* AI 첫 인사를 기다리는 최대 시간 (넘으면 2순위 문장을 그대로 씀) */
export const GREETING_TIMEOUT_MS = 2500;

/* 단계별 문장 길이 (단어 수): [최소, 최대] */
export const GREETING_WORD_RANGE: Record<LearningLevel, [number, number]> = {
  beginner: [3, 7],
  elementary: [5, 8],
  intermediate: [8, 12],
  advanced: [12, 16],
};

/*
  단계별 고정 인사
  "Hi!" 같은 짧은 인사 뒤의 문장이 위 단어 수 범위에 들어가게 씀.
  무섭거나 슬픈 주제 · 개인정보 질문 · 이모지 · 특수문자 · 숫자는 쓰지 않음
*/
export const LEVEL_GREETINGS: Record<LearningLevel, string[]> = {
  beginner: [
    "Hi! Do you like cats?",
    "Hello! How are you today?",
    "Hi! What do you like?",
    "Hello! Do you like apples?",
    "Hi! Can you jump high?",
    "Hello! Are you happy today?",
    "Hi! Do you like dogs?",
    "Hello! Do you like the sun?",
  ],
  elementary: [
    "Hi! What is your favorite animal?",
    "Hello! What did you eat for breakfast?",
    "Hi! What do you like to play?",
    "Hello! What is your favorite fruit?",
    "Hi! Do you like to draw pictures?",
    "Hello! What do you like to eat for lunch?",
    "Hi! Do you like rainy days or sunny days?",
    "Hello! What is your favorite color today?",
  ],
  intermediate: [
    "Hi! What do you like to do after school with your friends?",
    "Hello! What is your favorite food, and why do you like it?",
    "Hi! What did you do this morning before you came here?",
    "Hello! Which animal do you want to see at the zoo?",
    "Hi! What game do you like to play on a rainy day?",
    "Hello! What is the best thing about your day so far?",
  ],
  advanced: [
    "Hello! What is your favorite thing to do when you have free time at home?",
    "Hi! If you could visit any place in the world, where would you like to go?",
    "Hello! What is something fun that you did this week, and who did you do it with?",
    "Hi! Which season do you like the most, and what do you like to do then?",
    "Hello! What kind of animal would you like to have as a pet, and why?",
  ],
};

/* 약한 단어가 있을 때 쓰는 인사 ({word} 자리에 약한 단어가 들어감) */
export const WEAK_WORD_GREETINGS: Record<LearningLevel, string[]> = {
  beginner: [
    "Hi! Let's say {word}!",
    "Hello! Can you say {word}?",
  ],
  elementary: [
    "Hi! Can you say the word {word} with me?",
    "Hello! Let's practice the word {word} today!",
  ],
  intermediate: [
    "Hi! Let's practice the word {word} together, can you say it?",
    "Hello! Do you remember the word {word} from your lessons this week?",
  ],
  advanced: [
    "Hello! I remember you practiced the word {word}, so can you say it for me today?",
    "Hi! Let's warm up with the word {word} first, and then we can talk about your day.",
  ],
};

/*
  인사 문장이 그 단계의 규칙을 지키는지

  - 영어 글자 · 띄어쓰기 · 기본 문장부호(. , ! ? ')만 있어야 함 (이모지 · 숫자 · 특수문자 없음)
  - 어느 문장도 최대 단어 수를 넘지 않고,
    가장 긴 문장은 최소 단어 수 이상 ("Hi!" 같은 짧은 인사는 앞에 붙어도 됨)
*/
export function isGreetingWithinLevel(
  text: string,
  level: LearningLevel
): boolean {
  if (!/^[A-Za-z ,.!?'’]+$/.test(text)) {
    return false;
  }

  const counts = text
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .map((sentence) => sentence.split(/\s+/).length);

  if (counts.length === 0) {
    return false;
  }

  const [min, max] = GREETING_WORD_RANGE[level];
  const longest = Math.max(...counts);

  return longest >= min && longest <= max;
}
