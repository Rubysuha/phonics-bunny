export type ConversationSentence = {
  id: string;
  sentence: string;
  pattern: string;
  keywords: string[];
  level: number;
  image: string;
};

export type ConversationCategory = {
  slug: string;
  title: string;
  description: string;
  preview: string;
  color: "pink" | "blue" | "yellow" | "mint" | "purple" | "cream";
  sentences: ConversationSentence[];
};

export const conversationCategories: ConversationCategory[] = [
  {
    slug: "family",
    title: "Family",
    description: "가족과 관련된 쉬운 문장을 말해 보세요.",
    preview: "mom, dad, sister",
    color: "pink",
    sentences: [
      {
        id: "this-is-my-mom",
        sentence: "This is my mom.",
        pattern: "This is my ___",
        keywords: ["mom"],
        level: 1,
        image: "/conversation/family/mom.png",
      },
      {
        id: "this-is-my-dad",
        sentence: "This is my dad.",
        pattern: "This is my ___",
        keywords: ["dad"],
        level: 1,
        image: "/conversation/family/dad.png",
      },
      {
        id: "this-is-my-sister",
        sentence: "This is my sister.",
        pattern: "This is my ___",
        keywords: ["sister"],
        level: 1,
        image: "/conversation/family/sister.png",
      },
      {
        id: "i-love-my-family",
        sentence: "I love my family.",
        pattern: "I love my ___",
        keywords: ["family"],
        level: 1,
        image: "/conversation/family/family.png",
      },
    ],
  },
  {
    slug: "school",
    title: "School",
    description: "학교에서 자주 쓰는 문장을 연습해 보세요.",
    preview: "teacher, class, book",
    color: "blue",
    sentences: [
      {
        id: "this-is-my-teacher",
        sentence: "This is my teacher.",
        pattern: "This is my ___",
        keywords: ["teacher"],
        level: 1,
        image: "/conversation/school/teacher.png",
      },
      {
        id: "i-am-in-class",
        sentence: "I am in class.",
        pattern: "I am in ___",
        keywords: ["class"],
        level: 1,
        image: "/conversation/school/class.png",
      },
      {
        id: "this-is-my-book",
        sentence: "This is my book.",
        pattern: "This is my ___",
        keywords: ["book"],
        level: 1,
        image: "/conversation/school/book.png",
      },
      {
        id: "i-like-my-school",
        sentence: "I like my school.",
        pattern: "I like my ___",
        keywords: ["school"],
        level: 1,
        image: "/conversation/school/school.png",
      },
    ],
  },
  {
    slug: "food",
    title: "Food",
    description: "음식과 관련된 짧은 문장을 말해 보세요.",
    preview: "apple, banana, milk",
    color: "yellow",
    sentences: [
      {
        id: "i-like-apples",
        sentence: "I like apples.",
        pattern: "I like ___",
        keywords: ["apples"],
        level: 1,
        image: "/conversation/food/apples.png",
      },
      {
        id: "this-is-a-banana",
        sentence: "This is a banana.",
        pattern: "This is a ___",
        keywords: ["banana"],
        level: 1,
        image: "/conversation/food/banana.png",
      },
      {
        id: "i-drink-milk",
        sentence: "I drink milk.",
        pattern: "I drink ___",
        keywords: ["milk"],
        level: 1,
        image: "/conversation/food/milk.png",
      },
      {
        id: "i-eat-rice",
        sentence: "I eat rice.",
        pattern: "I eat ___",
        keywords: ["rice"],
        level: 1,
        image: "/conversation/food/rice.png",
      },
    ],
  },
  {
    slug: "weather",
    title: "Weather",
    description: "날씨와 관련된 쉬운 문장을 연습해 보세요.",
    preview: "sunny, rainy, windy",
    color: "mint",
    sentences: [
      {
        id: "it-is-sunny",
        sentence: "It is sunny.",
        pattern: "It is ___",
        keywords: ["sunny"],
        level: 1,
        image: "/conversation/weather/sunny.png",
      },
      {
        id: "it-is-rainy",
        sentence: "It is rainy.",
        pattern: "It is ___",
        keywords: ["rainy"],
        level: 1,
        image: "/conversation/weather/rainy.png",
      },
      {
        id: "it-is-windy",
        sentence: "It is windy.",
        pattern: "It is ___",
        keywords: ["windy"],
        level: 1,
        image: "/conversation/weather/windy.png",
      },
      {
        id: "it-is-snowy",
        sentence: "It is snowy.",
        pattern: "It is ___",
        keywords: ["snowy"],
        level: 1,
        image: "/conversation/weather/snowy.png",
      },
    ],
  },
  {
    slug: "animals",
    title: "Animals",
    description: "동물 이름과 쉬운 문장을 연습해 보세요.",
    preview: "cat, dog, rabbit",
    color: "purple",
    sentences: [
      {
        id: "this-is-a-cat",
        sentence: "This is a cat.",
        pattern: "This is a ___",
        keywords: ["cat"],
        level: 1,
        image: "/conversation/animals/cat.png",
      },
      {
        id: "this-is-a-dog",
        sentence: "This is a dog.",
        pattern: "This is a ___",
        keywords: ["dog"],
        level: 1,
        image: "/conversation/animals/dog.png",
      },
      {
        id: "this-is-a-rabbit",
        sentence: "This is a rabbit.",
        pattern: "This is a ___",
        keywords: ["rabbit"],
        level: 1,
        image: "/conversation/animals/rabbit.png",
      },
      {
        id: "i-like-bears",
        sentence: "I like bears.",
        pattern: "I like ___",
        keywords: ["bears"],
        level: 1,
        image: "/conversation/animals/bear.png",
      },
    ],
  },
  {
    slug: "daily-routine",
    title: "Daily Routine",
    description: "일상생활 문장을 따라 말해 보세요.",
    preview: "wake up, eat, sleep",
    color: "cream",
    sentences: [
      {
        id: "i-wake-up",
        sentence: "I wake up.",
        pattern: "I ___",
        keywords: ["wake up"],
        level: 1,
        image: "/conversation/daily-routine/wake-up.png",
      },
      {
        id: "i-eat-breakfast",
        sentence: "I eat breakfast.",
        pattern: "I eat ___",
        keywords: ["breakfast"],
        level: 1,
        image: "/conversation/daily-routine/breakfast.png",
      },
      {
        id: "i-go-to-school",
        sentence: "I go to school.",
        pattern: "I go to ___",
        keywords: ["school"],
        level: 1,
        image: "/conversation/daily-routine/go-school.png",
      },
      {
        id: "i-go-to-sleep",
        sentence: "I go to sleep.",
        pattern: "I go to ___",
        keywords: ["sleep"],
        level: 1,
        image: "/conversation/daily-routine/sleep.png",
      },
    ],
  },
];