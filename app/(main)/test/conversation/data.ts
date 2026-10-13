import { conversationCategories } from "@/app/(main)/conversation/data";
import { getConversationQuestionCount } from "@/lib/conversationTestRules";

/*
  Conversation Test 의 Topic
  = Conversation 학습의 6개 월드 + Final Challenge
  (문제는 questions.ts 에서 월드의 대화 데이터로 만듦)
*/

export type ConversationTopicId =
  | "family"
  | "school"
  | "food"
  | "weather"
  | "animals"
  | "daily-routine"
  | "final";

export type ConversationTopic = {
  id: ConversationTopicId;
  title: string;
  subtitle: string;
  description: string;
  questionCount: number;
  badge: string;
  cardClassName: string;
  badgeClassName: string;
  isFinal?: boolean;
};

/* 월드별 카드 표시 (제목은 학습 데이터의 월드 이름을 그대로 사용) */
const WORLD_CARDS: Record<
  Exclude<ConversationTopicId, "final">,
  Pick<
    ConversationTopic,
    "subtitle" | "description" | "badge" | "cardClassName" | "badgeClassName"
  >
> = {
  family: {
    subtitle: "Mom · Dad · Family",
    description: "가족과 집에서 나누는 대화에 알맞은 표현을 골라봐요.",
    badge: "HOME",
    cardClassName: "familyCard",
    badgeClassName: "familyBadge",
  },
  school: {
    subtitle: "Classroom · Teacher · Friends",
    description: "학교와 교실에서 자주 쓰는 영어 표현을 확인해요.",
    badge: "ABC",
    cardClassName: "schoolCard",
    badgeClassName: "schoolBadge",
  },
  food: {
    subtitle: "Eat · Drink · Share",
    description: "음식을 먹거나 원하는 것을 말할 때 알맞은 표현을 찾아봐요.",
    badge: "YUM",
    cardClassName: "foodCard",
    badgeClassName: "foodBadge",
  },
  weather: {
    subtitle: "Sunny · Rainy · Snowy",
    description: "날씨를 묻고 답할 때 쓰는 표현을 골라봐요.",
    badge: "SUN",
    cardClassName: "weatherCard",
    badgeClassName: "weatherBadge",
  },
  animals: {
    subtitle: "Pets · Zoo · Farm",
    description: "동물에 대해 이야기할 때 쓰는 표현을 확인해요.",
    badge: "ZOO",
    cardClassName: "animalsCard",
    badgeClassName: "animalsBadge",
  },
  "daily-routine": {
    subtitle: "Morning · School · Bedtime",
    description: "하루 일과를 말할 때 알맞은 표현을 골라봐요.",
    badge: "DAY",
    cardClassName: "routineCard",
    badgeClassName: "routineBadge",
  },
};

export const conversationTopics: ConversationTopic[] = [
  ...conversationCategories.map((category) => {
    const id = category.slug as Exclude<ConversationTopicId, "final">;

    return {
      id,
      title: category.title,
      questionCount: getConversationQuestionCount(id),
      ...WORLD_CARDS[id],
    };
  }),

  {
    id: "final",
    title: "Final Challenge",
    subtitle: "Mixed Worlds",
    description: "여섯 월드의 대화를 섞어서 배운 표현을 종합적으로 확인해요.",
    questionCount: getConversationQuestionCount("final"),
    badge: "★",
    cardClassName: "finalCard",
    badgeClassName: "finalBadge",
    isFinal: true,
  },
];

export function getConversationTopic(
  id: string
): ConversationTopic | undefined {
  return conversationTopics.find((topic) => topic.id === id);
}
