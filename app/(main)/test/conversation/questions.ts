import {
  type ConversationTopicId,
} from "./data";

import {
  createRandom,
  hashString,
  shuffle,
} from "@/lib/seededRandom";

export type ConversationQuestion = {
  id: string;

  topic: Exclude<
    ConversationTopicId,
    "final"
  >;

  /*
    상황 설명
  */
  situation: string;

  /*
    실제 대화
    ___가 들어간 부분을
    선택지로 완성
  */
  dialogue: string[];

  prompt: string;

  choices: string[];

  answer: string;

  /*
    답을 선택한 뒤 보여줄
    짧은 설명
  */
  explanation: string;

  /*
    나중에 이미지가 필요한
    문제에만 추가 가능
  */
  image?: string;
};

/* ─────────────────────────────
   Greetings
───────────────────────────── */

const greetingsQuestions:
  ConversationQuestion[] = [
  {
    id: "greetings-1",

    topic: "greetings",

    situation:
      "아침에 친구를 만났어요.",

    dialogue: [
      "Mina: Good morning!",
      "You: ___",
    ],

    prompt:
      "What should you say?",

    choices: [
      "Good morning!",
      "Good night!",
      "I'm hungry.",
    ],

    answer:
      "Good morning!",

    explanation:
      "아침에 만났을 때는 “Good morning!”이라고 인사해요.",
  },

  {
    id: "greetings-2",

    topic: "greetings",

    situation:
      "새로운 친구를 처음 만났어요.",

    dialogue: [
      "Leo: Nice to meet you.",
      "You: ___",
    ],

    prompt:
      "Choose the best response.",

    choices: [
      "Nice to meet you, too.",
      "See you tomorrow.",
      "I'm eight years old.",
    ],

    answer:
      "Nice to meet you, too.",

    explanation:
      "처음 만난 사람에게는 “Nice to meet you, too.”라고 답할 수 있어요.",
  },

  {
    id: "greetings-3",

    topic: "greetings",

    situation:
      "친구와 헤어질 시간이에요.",

    dialogue: [
      "Tom: See you tomorrow!",
      "You: ___",
    ],

    prompt:
      "What is the best answer?",

    choices: [
      "See you!",
      "Good morning!",
      "I'm fine.",
    ],

    answer:
      "See you!",

    explanation:
      "헤어질 때는 “See you!”라고 자연스럽게 답할 수 있어요.",
  },

  {
    id: "greetings-4",

    topic: "greetings",

    situation:
      "친구가 고맙다고 말했어요.",

    dialogue: [
      "Emma: Thank you!",
      "You: ___",
    ],

    prompt:
      "Choose the right expression.",

    choices: [
      "You're welcome.",
      "I'm sorry.",
      "Good night.",
    ],

    answer:
      "You're welcome.",

    explanation:
      "Thank you에 대한 대표적인 답은 “You're welcome.”이에요.",
  },

  {
    id: "greetings-5",

    topic: "greetings",

    situation:
      "친구가 실수로 부딪히고 사과했어요.",

    dialogue: [
      "Ben: I'm sorry.",
      "You: ___",
    ],

    prompt:
      "What should you say?",

    choices: [
      "That's okay.",
      "Happy birthday!",
      "I'm thirsty.",
    ],

    answer:
      "That's okay.",

    explanation:
      "상대의 사과를 받아줄 때 “That's okay.”라고 말할 수 있어요.",
  },

  {
    id: "greetings-6",

    topic: "greetings",

    situation:
      "새로운 친구가 이름을 물어봤어요.",

    dialogue: [
      "Anna: What's your name?",
      "You: ___",
    ],

    prompt:
      "Choose the correct answer.",

    choices: [
      "My name is Alex.",
      "I'm seven years old.",
      "It's sunny.",
    ],

    answer:
      "My name is Alex.",

    explanation:
      "What's your name?에는 자신의 이름을 말해요.",
  },

  {
    id: "greetings-7",

    topic: "greetings",

    situation:
      "친구가 나이를 물어봤어요.",

    dialogue: [
      "Sam: How old are you?",
      "You: ___",
    ],

    prompt:
      "Choose the correct answer.",

    choices: [
      "I'm eight years old.",
      "My name is Mina.",
      "I'm hungry.",
    ],

    answer:
      "I'm eight years old.",

    explanation:
      "How old are you?는 나이를 묻는 표현이에요.",
  },

  {
    id: "greetings-8",

    topic: "greetings",

    situation:
      "친구가 기분을 물어봤어요.",

    dialogue: [
      "Amy: How are you?",
      "You: ___",
    ],

    prompt:
      "What is the best response?",

    choices: [
      "I'm good, thank you.",
      "It's a pencil.",
      "I like pizza.",
    ],

    answer:
      "I'm good, thank you.",

    explanation:
      "How are you?에는 자신의 상태나 기분을 대답해요.",
  },

  {
    id: "greetings-9",

    topic: "greetings",

    situation:
      "잠자리에 들기 전에 가족이 인사했어요.",

    dialogue: [
      "Mom: Good night!",
      "You: ___",
    ],

    prompt:
      "Choose the best response.",

    choices: [
      "Good night!",
      "Good afternoon!",
      "You're welcome.",
    ],

    answer:
      "Good night!",

    explanation:
      "밤에 잠자리에 들 때 “Good night!”이라고 인사해요.",
  },

  {
    id: "greetings-10",

    topic: "greetings",

    situation:
      "친구가 생일을 축하해 줬어요.",

    dialogue: [
      "Jin: Happy birthday!",
      "You: ___",
    ],

    prompt:
      "What should you say?",

    choices: [
      "Thank you!",
      "I'm sorry.",
      "See you.",
    ],

    answer:
      "Thank you!",

    explanation:
      "축하를 받았을 때는 “Thank you!”라고 답할 수 있어요.",
  },
];

/* ─────────────────────────────
   School
───────────────────────────── */

const schoolQuestions:
  ConversationQuestion[] = [
  {
    id: "school-1",

    topic: "school",

    situation:
      "연필을 가져오지 않았어요. 친구에게 빌리고 싶어요.",

    dialogue: [
      "You: ___",
      "Friend: Sure!",
    ],

    prompt:
      "What should you say?",

    choices: [
      "Can I borrow your pencil?",
      "Do you like pizza?",
      "Where is my mom?",
    ],

    answer:
      "Can I borrow your pencil?",

    explanation:
      "물건을 빌리고 싶을 때 “Can I borrow ...?”를 사용할 수 있어요.",
  },

  {
    id: "school-2",

    topic: "school",

    situation:
      "선생님이 수업을 시작하려고 해요.",

    dialogue: [
      "Teacher: Are you ready?",
      "You: ___",
    ],

    prompt:
      "Choose the best answer.",

    choices: [
      "Yes, I am.",
      "Yes, I do.",
      "It's a book.",
    ],

    answer:
      "Yes, I am.",

    explanation:
      "Are you ...?로 물으면 “Yes, I am.”으로 대답할 수 있어요.",
  },

  {
    id: "school-3",

    topic: "school",

    situation:
      "선생님의 말을 잘 듣지 못했어요.",

    dialogue: [
      "Teacher: Please write your name.",
      "You: ___",
    ],

    prompt:
      "What can you say?",

    choices: [
      "Can you say it again, please?",
      "Can I have some juice?",
      "See you tomorrow.",
    ],

    answer:
      "Can you say it again, please?",

    explanation:
      "다시 말해 달라고 부탁할 때 사용할 수 있는 표현이에요.",
  },

  {
    id: "school-4",

    topic: "school",

    situation:
      "수업 중 화장실에 가고 싶어요.",

    dialogue: [
      "You: ___",
      "Teacher: Yes, you may.",
    ],

    prompt:
      "Choose the right expression.",

    choices: [
      "May I go to the bathroom?",
      "What is your name?",
      "Are you hungry?",
    ],

    answer:
      "May I go to the bathroom?",

    explanation:
      "허락을 정중하게 구할 때 “May I ...?”를 사용할 수 있어요.",
  },

  {
    id: "school-5",

    topic: "school",

    situation:
      "선생님이 책을 가리키며 물어봤어요.",

    dialogue: [
      "Teacher: What is this?",
      "You: ___",
    ],

    prompt:
      "Choose the correct answer.",

    choices: [
      "It's a book.",
      "I'm a book.",
      "I like books.",
    ],

    answer:
      "It's a book.",

    explanation:
      "사물이 무엇인지 말할 때 “It's a ...”라고 해요.",
  },

  {
    id: "school-6",

    topic: "school",

    situation:
      "선생님이 책을 펴라고 했어요.",

    dialogue: [
      "Teacher: Open your book, please.",
      "You: ___",
    ],

    prompt:
      "What is a natural response?",

    choices: [
      "Okay.",
      "Good night.",
      "I'm hungry.",
    ],

    answer:
      "Okay.",

    explanation:
      "간단한 지시를 이해했을 때 “Okay.”라고 답할 수 있어요.",
  },

  {
    id: "school-7",

    topic: "school",

    situation:
      "문제를 잘 모르겠어서 친구의 도움이 필요해요.",

    dialogue: [
      "You: ___",
      "Friend: Of course!",
    ],

    prompt:
      "What should you say?",

    choices: [
      "Can you help me?",
      "How old are you?",
      "Do you want some milk?",
    ],

    answer:
      "Can you help me?",

    explanation:
      "도움이 필요할 때 “Can you help me?”라고 물어볼 수 있어요.",
  },

  {
    id: "school-8",

    topic: "school",

    situation:
      "친구가 cat의 철자를 물어봤어요.",

    dialogue: [
      "Friend: How do you spell 'cat'?",
      "You: ___",
    ],

    prompt:
      "Choose the correct answer.",

    choices: [
      "C-A-T.",
      "Cat is cute.",
      "I have a cat.",
    ],

    answer:
      "C-A-T.",

    explanation:
      "How do you spell ...?은 철자를 묻는 표현이에요.",
  },

  {
    id: "school-9",

    topic: "school",

    situation:
      "숙제를 깜빡하고 가져오지 않았어요.",

    dialogue: [
      "Teacher: Where is your homework?",
      "You: ___",
    ],

    prompt:
      "Choose the best response.",

    choices: [
      "I'm sorry. I forgot it.",
      "It's delicious.",
      "I'm eight years old.",
    ],

    answer:
      "I'm sorry. I forgot it.",

    explanation:
      "실수한 상황에서는 사과하고 이유를 말할 수 있어요.",
  },

  {
    id: "school-10",

    topic: "school",

    situation:
      "수업이 끝나고 선생님이 인사했어요.",

    dialogue: [
      "Teacher: Have a nice day!",
      "You: ___",
    ],

    prompt:
      "What should you say?",

    choices: [
      "You too!",
      "I'm sorry.",
      "No, I don't.",
    ],

    answer:
      "You too!",

    explanation:
      "상대방이 좋은 하루를 보내라고 하면 “You too!”라고 답할 수 있어요.",
  },
];

/* ─────────────────────────────
   Family
───────────────────────────── */

const familyQuestions:
  ConversationQuestion[] = [
  {
    id: "family-1",

    topic: "family",

    situation:
      "엄마가 저녁 식사가 준비됐다고 불렀어요.",

    dialogue: [
      "Mom: Dinner is ready!",
      "You: ___",
    ],

    prompt:
      "Choose the best response.",

    choices: [
      "Okay, I'm coming!",
      "Good morning!",
      "It's a pencil.",
    ],

    answer:
      "Okay, I'm coming!",

    explanation:
      "누군가 부를 때 가고 있다고 말하는 자연스러운 표현이에요.",
  },

  {
    id: "family-2",

    topic: "family",

    situation:
      "아빠가 양치했는지 물어봤어요.",

    dialogue: [
      "Dad: Did you brush your teeth?",
      "You: ___",
    ],

    prompt:
      "Choose the correct answer.",

    choices: [
      "Yes, I did.",
      "Yes, I am.",
      "Yes, I can.",
    ],

    answer:
      "Yes, I did.",

    explanation:
      "Did you ...?에는 “Yes, I did.”로 대답할 수 있어요.",
  },

  {
    id: "family-3",

    topic: "family",

    situation:
      "아빠가 어디 있는지 궁금해요.",

    dialogue: [
      "You: ___",
      "Mom: He's in the kitchen.",
    ],

    prompt:
      "What should you ask?",

    choices: [
      "Where is Dad?",
      "How old is Dad?",
      "What does Dad like?",
    ],

    answer:
      "Where is Dad?",

    explanation:
      "사람의 위치를 물을 때 “Where is ...?”를 사용해요.",
  },

  {
    id: "family-4",

    topic: "family",

    situation:
      "동생이 같이 놀자고 했어요.",

    dialogue: [
      "Brother: Do you want to play?",
      "You: ___",
    ],

    prompt:
      "Choose a natural response.",

    choices: [
      "Sure!",
      "It's blue.",
      "Good night.",
    ],

    answer:
      "Sure!",

    explanation:
      "제안을 받아들일 때 “Sure!”라고 말할 수 있어요.",
  },

  {
    id: "family-5",

    topic: "family",

    situation:
      "배가 고파서 가족에게 말하고 싶어요.",

    dialogue: [
      "Mom: What's wrong?",
      "You: ___",
    ],

    prompt:
      "What should you say?",

    choices: [
      "I'm hungry.",
      "I'm seven.",
      "I'm a student.",
    ],

    answer:
      "I'm hungry.",

    explanation:
      "배고픈 상태는 “I'm hungry.”라고 표현해요.",
  },

  {
    id: "family-6",

    topic: "family",

    situation:
      "많이 피곤해요.",

    dialogue: [
      "Dad: Are you okay?",
      "You: ___",
    ],

    prompt:
      "Choose the best answer.",

    choices: [
      "I'm tired.",
      "I'm a pencil.",
      "I'm delicious.",
    ],

    answer:
      "I'm tired.",

    explanation:
      "피곤할 때는 “I'm tired.”라고 표현해요.",
  },

  {
    id: "family-7",

    topic: "family",

    situation:
      "신발끈을 묶기 어려워서 도움이 필요해요.",

    dialogue: [
      "You: ___",
      "Mom: Sure.",
    ],

    prompt:
      "What should you say?",

    choices: [
      "Can you help me, please?",
      "Can you eat this?",
      "Can you see a dog?",
    ],

    answer:
      "Can you help me, please?",

    explanation:
      "정중하게 도움을 부탁하는 표현이에요.",
  },

  {
    id: "family-8",

    topic: "family",

    situation:
      "밖에 나갈 때 아빠가 조심하라고 말했어요.",

    dialogue: [
      "Dad: Be careful!",
      "You: ___",
    ],

    prompt:
      "Choose the natural response.",

    choices: [
      "Okay!",
      "Happy birthday!",
      "It's sunny.",
    ],

    answer:
      "Okay!",

    explanation:
      "상대의 말을 알겠다고 할 때 “Okay!”라고 답할 수 있어요.",
  },

  {
    id: "family-9",

    topic: "family",

    situation:
      "가족에게 사랑한다고 말하고 싶어요.",

    dialogue: [
      "You: ___",
      "Mom: I love you, too.",
    ],

    prompt:
      "Choose the correct expression.",

    choices: [
      "I love you.",
      "I see you.",
      "I know you.",
    ],

    answer:
      "I love you.",

    explanation:
      "사랑하는 마음을 표현하는 기본 문장이에요.",
  },

  {
    id: "family-10",

    topic: "family",

    situation:
      "엄마가 무엇을 하고 있는지 물어봤어요.",

    dialogue: [
      "Mom: What are you doing?",
      "You: ___",
    ],

    prompt:
      "Choose the correct response.",

    choices: [
      "I'm doing my homework.",
      "I'm eight years old.",
      "It's my homework.",
    ],

    answer:
      "I'm doing my homework.",

    explanation:
      "지금 하고 있는 행동은 “I'm ...ing.” 형태로 말할 수 있어요.",
  },
];

/* ─────────────────────────────
   Food
───────────────────────────── */

const foodQuestions:
  ConversationQuestion[] = [
  {
    id: "food-1",

    topic: "food",

    situation:
      "목이 말라서 물을 부탁하고 싶어요.",

    dialogue: [
      "You: ___",
      "Mom: Sure.",
    ],

    prompt:
      "What should you say?",

    choices: [
      "Can I have some water, please?",
      "Where is the water?",
      "Do you see water?",
    ],

    answer:
      "Can I have some water, please?",

    explanation:
      "음식이나 음료를 부탁할 때 사용할 수 있는 자연스러운 표현이에요.",
  },

  {
    id: "food-2",

    topic: "food",

    situation:
      "먹고 싶은 음식을 물어봤어요.",

    dialogue: [
      "Dad: What do you want to eat?",
      "You: ___",
    ],

    prompt:
      "Choose the best answer.",

    choices: [
      "I'd like pizza, please.",
      "Pizza is red.",
      "I see pizza.",
    ],

    answer:
      "I'd like pizza, please.",

    explanation:
      "원하는 것을 정중하게 말할 때 “I'd like ...”를 사용할 수 있어요.",
  },

  {
    id: "food-3",

    topic: "food",

    situation:
      "브로콜리를 좋아하지 않아요.",

    dialogue: [
      "Mom: Do you like broccoli?",
      "You: ___",
    ],

    prompt:
      "Choose the correct response.",

    choices: [
      "No, I don't.",
      "No, I am not.",
      "No, I can't.",
    ],

    answer:
      "No, I don't.",

    explanation:
      "Do you like ...?에는 “Yes, I do.” 또는 “No, I don't.”라고 답해요.",
  },

  {
    id: "food-4",

    topic: "food",

    situation:
      "좋아하는 과일을 이야기하고 있어요.",

    dialogue: [
      "Friend: What fruit do you like?",
      "You: ___",
    ],

    prompt:
      "Choose the best answer.",

    choices: [
      "I like strawberries.",
      "I am strawberries.",
      "It is strawberries.",
    ],

    answer:
      "I like strawberries.",

    explanation:
      "좋아하는 것을 말할 때 “I like ...”를 사용해요.",
  },

  {
    id: "food-5",

    topic: "food",

    situation:
      "식당에서 샌드위치를 주문하고 싶어요.",

    dialogue: [
      "Server: What would you like?",
      "You: ___",
    ],

    prompt:
      "What should you say?",

    choices: [
      "I'd like a sandwich, please.",
      "I see a sandwich.",
      "Sandwich is here.",
    ],

    answer:
      "I'd like a sandwich, please.",

    explanation:
      "주문할 때도 “I'd like ...” 표현을 사용할 수 있어요.",
  },

  {
    id: "food-6",

    topic: "food",

    situation:
      "친구가 배가 고픈지 물어봤어요.",

    dialogue: [
      "Friend: Are you hungry?",
      "You: ___",
    ],

    prompt:
      "Choose the correct answer.",

    choices: [
      "Yes, I am.",
      "Yes, I do.",
      "Yes, I have.",
    ],

    answer:
      "Yes, I am.",

    explanation:
      "Are you ...? 질문에는 “Yes, I am.”이라고 답할 수 있어요.",
  },

  {
    id: "food-7",

    topic: "food",

    situation:
      "주스를 마실지 물어봤어요.",

    dialogue: [
      "Mom: Would you like some juice?",
      "You: ___",
    ],

    prompt:
      "Choose a natural response.",

    choices: [
      "Yes, please.",
      "Yes, I am.",
      "Yes, I see.",
    ],

    answer:
      "Yes, please.",

    explanation:
      "음식이나 음료를 제안받았을 때 “Yes, please.”라고 답할 수 있어요.",
  },

  {
    id: "food-8",

    topic: "food",

    situation:
      "밥을 많이 먹어서 이제 배가 불러요.",

    dialogue: [
      "Mom: Do you want more?",
      "You: ___",
    ],

    prompt:
      "What should you say?",

    choices: [
      "No, thank you. I'm full.",
      "No, I'm tall.",
      "No, I'm eight.",
    ],

    answer:
      "No, thank you. I'm full.",

    explanation:
      "배가 부를 때는 “I'm full.”이라고 표현해요.",
  },

  {
    id: "food-9",

    topic: "food",

    situation:
      "음식이 정말 맛있어요.",

    dialogue: [
      "Dad: How is the food?",
      "You: ___",
    ],

    prompt:
      "Choose the best answer.",

    choices: [
      "It's delicious!",
      "It's tired!",
      "It's hungry!",
    ],

    answer:
      "It's delicious!",

    explanation:
      "음식이 맛있을 때 “It's delicious!”라고 말할 수 있어요.",
  },

  {
    id: "food-10",

    topic: "food",

    situation:
      "친구가 먹고 있는 간식을 조금 먹고 싶어요.",

    dialogue: [
      "You: ___",
      "Friend: Sure!",
    ],

    prompt:
      "Choose the polite expression.",

    choices: [
      "Can I have some, please?",
      "Give me everything.",
      "Where are you?",
    ],

    answer:
      "Can I have some, please?",

    explanation:
      "다른 사람의 음식을 부탁할 때 정중하게 말하는 표현이에요.",
  },
];

/* ─────────────────────────────
   Friends
───────────────────────────── */

const friendsQuestions:
  ConversationQuestion[] = [
  {
    id: "friends-1",

    topic: "friends",

    situation:
      "친구에게 같이 놀자고 하고 싶어요.",

    dialogue: [
      "You: ___",
      "Friend: Sure!",
    ],

    prompt:
      "What should you say?",

    choices: [
      "Do you want to play with me?",
      "Are you a teacher?",
      "Where is your mom?",
    ],

    answer:
      "Do you want to play with me?",

    explanation:
      "친구에게 함께 놀자고 제안할 때 사용할 수 있어요.",
  },

  {
    id: "friends-2",

    topic: "friends",

    situation:
      "친구가 슬퍼 보여요.",

    dialogue: [
      "You: ___",
      "Friend: I'm a little sad.",
    ],

    prompt:
      "What should you ask?",

    choices: [
      "Are you okay?",
      "Are you hungry?",
      "Are you eight?",
    ],

    answer:
      "Are you okay?",

    explanation:
      "상대방이 괜찮은지 걱정할 때 “Are you okay?”라고 물을 수 있어요.",
  },

  {
    id: "friends-3",

    topic: "friends",

    situation:
      "친구의 장난감을 잠깐 사용하고 싶어요.",

    dialogue: [
      "You: ___",
      "Friend: Yes, you can.",
    ],

    prompt:
      "Choose the right expression.",

    choices: [
      "Can I use it?",
      "Can I eat it?",
      "Can I see school?",
    ],

    answer:
      "Can I use it?",

    explanation:
      "물건을 사용해도 되는지 물을 때 “Can I use it?”이라고 해요.",
  },

  {
    id: "friends-4",

    topic: "friends",

    situation:
      "실수로 친구의 블록을 넘어뜨렸어요.",

    dialogue: [
      "You: ___",
      "Friend: That's okay.",
    ],

    prompt:
      "What should you say?",

    choices: [
      "I'm sorry.",
      "Thank you.",
      "Good morning.",
    ],

    answer:
      "I'm sorry.",

    explanation:
      "잘못했을 때는 “I'm sorry.”라고 사과해요.",
  },

  {
    id: "friends-5",

    topic: "friends",

    situation:
      "친구가 도와줘서 고맙다고 말했어요.",

    dialogue: [
      "Friend: Thank you for helping me!",
      "You: ___",
    ],

    prompt:
      "Choose the best response.",

    choices: [
      "You're welcome!",
      "I'm hungry!",
      "Good night!",
    ],

    answer:
      "You're welcome!",

    explanation:
      "고맙다는 말을 들었을 때 자연스럽게 답하는 표현이에요.",
  },

  {
    id: "friends-6",

    topic: "friends",

    situation:
      "친구들이 게임을 하고 있어요. 같이 하고 싶어요.",

    dialogue: [
      "You: ___",
      "Friend: Of course!",
    ],

    prompt:
      "What should you say?",

    choices: [
      "Can I play with you?",
      "Can I sleep with you?",
      "Can I eat your book?",
    ],

    answer:
      "Can I play with you?",

    explanation:
      "친구들의 놀이에 함께하고 싶을 때 사용할 수 있어요.",
  },

  {
    id: "friends-7",

    topic: "friends",

    situation:
      "친구가 어려운 문제를 잘 풀었어요.",

    dialogue: [
      "You: ___",
      "Friend: Thanks!",
    ],

    prompt:
      "Choose the best expression.",

    choices: [
      "Great job!",
      "I'm sorry!",
      "Good night!",
    ],

    answer:
      "Great job!",

    explanation:
      "친구를 칭찬할 때 “Great job!”이라고 말할 수 있어요.",
  },

  {
    id: "friends-8",

    topic: "friends",

    situation:
      "친구가 뛰다가 넘어졌어요.",

    dialogue: [
      "You: ___",
      "Friend: I'm okay.",
    ],

    prompt:
      "What should you ask?",

    choices: [
      "Are you hurt?",
      "What color is it?",
      "How old is your dog?",
    ],

    answer:
      "Are you hurt?",

    explanation:
      "친구가 넘어졌을 때 다쳤는지 물어보는 표현이에요.",
  },

  {
    id: "friends-9",

    topic: "friends",

    situation:
      "친구가 축구를 하자고 제안했어요.",

    dialogue: [
      "Friend: Let's play soccer!",
      "You: ___",
    ],

    prompt:
      "Choose a natural response.",

    choices: [
      "Sounds good!",
      "It's a pencil!",
      "I'm seven!",
    ],

    answer:
      "Sounds good!",

    explanation:
      "상대의 제안이 좋다고 할 때 “Sounds good!”이라고 할 수 있어요.",
  },

  {
    id: "friends-10",

    topic: "friends",

    situation:
      "센터에서 친구와 헤어지는 시간이에요.",

    dialogue: [
      "Friend: Bye! See you tomorrow.",
      "You: ___",
    ],

    prompt:
      "Choose the best response.",

    choices: [
      "See you tomorrow!",
      "Good morning!",
      "I'm full!",
    ],

    answer:
      "See you tomorrow!",

    explanation:
      "다음 날 다시 볼 친구에게 자연스럽게 할 수 있는 인사예요.",
  },
];

/* ─────────────────────────────
   Topic Bank
───────────────────────────── */

export const conversationQuestionBank = {
  greetings:
    greetingsQuestions,

  school:
    schoolQuestions,

  family:
    familyQuestions,

  food:
    foodQuestions,

  friends:
    friendsQuestions,
};

/* ─────────────────────────────
   Final Challenge

   각 주제에서 3문제씩
   = 총 15문제
───────────────────────────── */

const finalQuestions:
  ConversationQuestion[] = [
  greetingsQuestions[1],
  greetingsQuestions[4],
  greetingsQuestions[7],

  schoolQuestions[0],
  schoolQuestions[3],
  schoolQuestions[6],

  familyQuestions[0],
  familyQuestions[4],
  familyQuestions[9],

  foodQuestions[1],
  foodQuestions[6],
  foodQuestions[8],

  friendsQuestions[0],
  friendsQuestions[3],
  friendsQuestions[8],
].map(
  (
    question,
    index
  ) => ({
    ...question,

    id:
      `final-${index + 1}-${question.id}`,
  })
);

/* ─────────────────────────────
   Choices

   원본 데이터는 choices[0]이 정답이므로
   그대로 보여주면 정답이 항상 1번이 됨.

   정답 위치를 1·2·3번에 고르게 나눠서 배정하고
   나머지 보기 순서도 섞음.
───────────────────────────── */

function arrangeChoices(
  questions:
    ConversationQuestion[],
  seed: string
): ConversationQuestion[] {
  const random =
    createRandom(
      hashString(
        seed
      )
    );

  const order =
    shuffle(
      questions.map(
        (_, index) =>
          index
      ),
      random
    );

  /*
    10문제 / 보기 3개처럼 나누어떨어지지 않을 때
    남는 자리가 늘 1번에 몰리지 않도록 시작 위치를 섞음
  */
  const offset =
    Math.floor(
      random() * 3
    );

  return questions.map(
    (
      question,
      index
    ) => {
      const answerPosition =
        (order[index] + offset) %
        question.choices.length;

      const distractors =
        shuffle(
          question.choices.filter(
            (choice) =>
              choice !==
              question.answer
          ),
          random
        );

      const choices = [
        ...distractors,
      ];

      choices.splice(
        answerPosition,
        0,
        question.answer
      );

      return {
        ...question,
        choices,
      };
    }
  );
}

/* ─────────────────────────────
   Getter

   attempt = 0  : 항상 같은 순서 (서버/클라이언트 일치)
   attempt > 0  : Try Again 시 보기 위치를 다시 섞음
───────────────────────────── */

export function getConversationQuestions(
  topic:
    ConversationTopicId,
  attempt = 0
): ConversationQuestion[] {
  const questions =
    topic === "final"
      ? finalQuestions
      : conversationQuestionBank[
          topic
        ];

  if (
    attempt === 0
  ) {
    return arrangeChoices(
      questions,
      topic
    );
  }

  /*
    Try Again 때는 문제 순서도 섞어서
    순서를 외워 푸는 것을 막음
  */
  const seed =
    `${topic}-retry-${attempt}`;

  return shuffle(
    arrangeChoices(
      questions,
      seed
    ),
    createRandom(
      hashString(
        `${seed}-order`
      )
    )
  );
}
