export type ConversationTopicId =
  | "greetings"
  | "school"
  | "family"
  | "food"
  | "friends"
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

export const conversationTopics: ConversationTopic[] = [
  {
    id: "greetings",

    title: "Greetings",

    subtitle: "Hello · Goodbye · Thanks",

    description:
      "인사하거나 처음 만났을 때 상황에 맞는 표현을 골라봐요.",

    questionCount: 10,

    badge: "Hi!",

    cardClassName:
      "greetingsCard",

    badgeClassName:
      "greetingsBadge",
  },

  {
    id: "school",

    title: "School",

    subtitle: "Classroom · Teacher · Study",

    description:
      "학교와 교실에서 자주 사용하는 영어 표현을 확인해요.",

    questionCount: 10,

    badge: "ABC",

    cardClassName:
      "schoolCard",

    badgeClassName:
      "schoolBadge",
  },

  {
    id: "family",

    title: "Family",

    subtitle: "Home · Family · Daily Life",

    description:
      "가족과 집에서 사용할 수 있는 자연스러운 표현을 골라봐요.",

    questionCount: 10,

    badge: "HOME",

    cardClassName:
      "familyCard",

    badgeClassName:
      "familyBadge",
  },

  {
    id: "food",

    title: "Food",

    subtitle: "Eat · Drink · Order",

    description:
      "음식을 먹거나 원하는 것을 말할 때 알맞은 표현을 찾아봐요.",

    questionCount: 10,

    badge: "YUM",

    cardClassName:
      "foodCard",

    badgeClassName:
      "foodBadge",
  },

  {
    id: "friends",

    title: "Friends",

    subtitle: "Play · Feelings · Together",

    description:
      "친구와 놀거나 마음을 표현할 때 사용할 말을 골라봐요.",

    questionCount: 10,

    badge: "WE",

    cardClassName:
      "friendsCard",

    badgeClassName:
      "friendsBadge",
  },

  {
    id: "final",

    title: "Final Challenge",

    subtitle: "Mixed Situations",

    description:
      "여러 상황을 섞어서 배운 영어 표현을 종합적으로 확인해요.",

    questionCount: 15,

    badge: "★",

    cardClassName:
      "finalCard",

    badgeClassName:
      "finalBadge",

    isFinal: true,
  },
];

export function getConversationTopic(
  id: string
): ConversationTopic | undefined {
  return conversationTopics.find(
    (topic) =>
      topic.id === id
  );
}