import type { HelpSection } from "@/components/HelpTooltip";
import { TEST, TEST_COIN, TEST_STAR_SCORES } from "@/lib/learningRules";
import { getPassScore } from "@/lib/phonicsTestRules";
import { READING_PASS_SCORE, READING_QUESTION_COUNT } from "@/lib/readingTestRules";

/*
  Test 화면의 ? 안내
  (숫자는 lib/learningRules.ts 를 그대로 가져와서 기준을 바꾸면 안내도 같이 바뀜)
*/

const normalPass = getPassScore(TEST.questionCount);
const reviewPass = getPassScore(TEST.reviewQuestionCount);

const [star1, star2, star3] = TEST_STAR_SCORES.normal;

/* 별과 코인 (Phonics · Conversation 공통) */
const STAR_COIN_HELP: HelpSection = {
  heading: "별과 당근 코인",
  items: [
    `${TEST.questionCount}문제에서 ${star1}개를 맞히면 별 1개, ${star2}개는 별 2개, ${star3}개를 모두 맞히면 별 3개예요.`,
    `새로 딴 별 1개마다 당근 코인 ${TEST_COIN.stagePerStar}개, 마지막 Stage에서는 ${TEST_COIN.reviewPerStar}개를 받아요.`,
    "이미 딴 별은 다시 풀어도 코인이 없어요. 더 높은 점수로 별을 늘리면 그만큼만 더 받아요.",
    `한 영역을 모두 통과하면 보너스로 ${TEST_COIN.areaBonus}개를 한 번 받아요.`,
  ],
};

const SAVE_HELP = "로그인해야 결과와 별이 저장돼요.";

export const TEST_MENU_HELP: HelpSection[] = [
  {
    heading: "Test는 이런 곳이에요",
    items: [
      "Phonics · Conversation · Book에서 배운 내용을 문제로 확인해요.",
      "Phonics Challenge는 글자와 단어, Conversation Quiz는 대화 표현, Reading Quiz는 읽은 이야기의 내용을 물어봐요.",
      "틀려도 괜찮아요. 몇 번이든 다시 풀 수 있고, 풀 때마다 다른 문제가 나와요.",
    ],
  },
  {
    heading: "통과와 별",
    items: [
      `문제의 ${Math.round(TEST.passRate * 100)}% 이상을 맞히면 통과예요.`,
      "점수가 높을수록 별을 최대 3개까지 받고, 새로 딴 별만큼 당근 코인을 받아요.",
      SAVE_HELP,
    ],
  },
];

export const PHONICS_TEST_HELP: HelpSection[] = [
  {
    heading: "진행 방법",
    items: [
      "영역을 고른 뒤 Stage 1부터 차례로 풀어요. 앞 Stage를 통과해야 다음 Stage가 열려요.",
      "그림 보고 고르기, 소리 듣고 고르기, 빠진 글자 채우기 문제가 섞여서 나와요.",
      "문제는 Phonics에서 배운 단어에서 나오고, 풀 때마다 다른 단어가 나와요.",
    ],
  },
  {
    heading: "통과 기준",
    items: [
      `Stage마다 ${TEST.questionCount}문제이고 ${normalPass}개 이상 맞히면 통과해요.`,
      `마지막 Stage(Review)는 영역 전체에서 ${TEST.reviewQuestionCount}문제가 나오고 ${reviewPass}개 이상 맞혀야 해요.`,
      SAVE_HELP,
    ],
  },
  STAR_COIN_HELP,
];

export const CONVERSATION_TEST_HELP: HelpSection[] = [
  {
    heading: "진행 방법",
    items: [
      "Conversation의 여섯 월드에서 배운 대화가 문제로 나와요.",
      "대화의 한 줄이 빈칸(___)으로 되어 있어요. 그 자리에 알맞은 말을 골라요.",
      "여섯 Topic은 순서와 상관없이 풀 수 있고, 모두 통과하면 Final Challenge가 열려요.",
    ],
  },
  {
    heading: "통과 기준",
    items: [
      `Topic마다 ${TEST.questionCount}문제이고 ${normalPass}개 이상 맞히면 통과해요.`,
      `Final Challenge는 여섯 월드를 섞은 ${TEST.reviewQuestionCount}문제이고 ${reviewPass}개 이상 맞혀야 해요.`,
      SAVE_HELP,
    ],
  },
  STAR_COIN_HELP,
];

export const READING_TEST_HELP: HelpSection[] = [
  {
    heading: "진행 방법",
    items: [
      "Book에서 읽은 이야기의 내용을 확인하는 퀴즈예요.",
      "Level을 고르고 이야기를 선택해요. 먼저 Book에서 이야기를 읽고 오면 더 쉬워요.",
      "이야기에 나온 문장과 단어 고르기, 처음과 마지막 장면, 빈칸에 들어갈 단어, 단어 순서 맞히기 문제가 나와요.",
    ],
  },
  {
    heading: "통과와 별",
    items: [
      `이야기마다 ${READING_QUESTION_COUNT}문제이고 ${READING_PASS_SCORE}개 이상 맞히면 통과해요.`,
      `${READING_PASS_SCORE}개를 맞히면 별 2개, ${READING_QUESTION_COUNT}개를 모두 맞히면 별 3개예요.`,
      `새로 딴 별 1개마다 당근 코인 ${TEST_COIN.readingPerStar}개를 받고, 한 Level의 이야기를 모두 통과하면 보너스 ${TEST_COIN.areaBonus}개를 받아요.`,
      SAVE_HELP,
    ],
  },
];
