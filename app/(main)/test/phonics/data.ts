import type {
  PhonicsTestCategoryId,
} from "@/lib/phonicsTestRules";

export type PhonicsTestCategoryInfo = {
  id: PhonicsTestCategoryId;
  badge: string;
  title: string;
  shortTitle: string;
  description: string;
  stages: string[];
  colorClass: string;
  badgeClass: string;
};

export const phonicsTestCategories: PhonicsTestCategoryInfo[] = [
  {
    id: "alphabet",
    badge: "ABC",
    title: "Alphabet",
    shortTitle: "Letters & Sounds",
    description:
      "알파벳의 모양과 소리를 구분하고 알맞은 글자를 찾아봐요.",
    stages: [
      "A – F",
      "G – L",
      "M – R",
      "S – Z",
      "Alphabet Review",
    ],
    colorClass: "alphabetCard",
    badgeClass: "alphabetBadge",
  },

  {
    id: "short-vowels",
    badge: "A",
    title: "Short Vowels",
    shortTitle: "a · e · i · o · u",
    description:
      "단모음 소리를 듣고 알맞은 단어와 철자를 찾아봐요.",
    stages: [
      "Short A",
      "Short E",
      "Short I",
      "Short O & U",
      "Short Vowel Review",
    ],
    colorClass: "shortCard",
    badgeClass: "shortBadge",
  },

  {
    id: "long-vowels",
    badge: "Ā",
    title: "Long Vowels",
    shortTitle: "Long vowel sounds",
    description:
      "장모음 소리를 구별하고 알맞은 단어를 선택해요.",
    stages: [
      "Long A",
      "Long E",
      "Long I",
      "Long O & U",
      "Long Vowel Review",
    ],
    colorClass: "longCard",
    badgeClass: "longBadge",
  },

  {
    id: "blend-sounds",
    badge: "BL",
    title: "Blend Sounds",
    shortTitle: "bl · br · cl · sk",
    description:
      "두 개 이상의 소리가 연결된 단어를 듣고 구별해요.",
    stages: [
      "L Blends",
      "R Blends",
      "S Blends",
      "Mixed Blends",
      "Blend Review",
    ],
    colorClass: "blendCard",
    badgeClass: "blendBadge",
  },

  {
    id: "sight-words",
    badge: "THE",
    title: "Sight Words",
    shortTitle: "Read at a glance",
    description:
      "자주 사용하는 영어 단어를 빠르게 읽고 찾아봐요.",
    stages: [
      "Sight Words 1",
      "Sight Words 2",
      "Sight Words 3",
      "Mixed Words",
      "Sight Word Review",
    ],
    colorClass: "sightCard",
    badgeClass: "sightBadge",
  },
];

export function getPhonicsTestCategory(
  id: string
): PhonicsTestCategoryInfo | undefined {
  return phonicsTestCategories.find(
    (category) => category.id === id
  );
}