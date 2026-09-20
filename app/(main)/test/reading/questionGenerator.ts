import {
  getBookLevel,
  getBookStory,
  type BookStory,
} from "../../book/data";

import {
  createRandom,
  hashString,
  shuffle,
} from "@/lib/seededRandom";

/* ─────────────────────────────
   Types
───────────────────────────── */

export type ReadingQuestionType =
  | "sentence-choice"
  | "first-event"
  | "last-event"
  | "missing-word"
  | "word-check"
  | "title-check";

export type ReadingQuestion = {
  id: string;

  type: ReadingQuestionType;

  prompt: string;

  /*
    빈칸 문제 등에 사용하는
    메인 문장
  */
  mainText?: string;

  choices: string[];

  answer: string;

  explanation: string;
};

/* ─────────────────────────────
   Helpers
───────────────────────────── */

function uniqueStrings(
  values: string[]
): string[] {
  return [
    ...new Set(
      values
    ),
  ];
}

function buildSentenceChoices(
  answer: string,
  distractors: string[],
  random: () => number
): string[] {
  const wrong =
    shuffle(
      uniqueStrings(
        distractors.filter(
          (sentence) =>
            sentence !==
            answer
        )
      ),
      random
    ).slice(
      0,
      2
    );

  return shuffle(
    [
      answer,
      ...wrong,
    ],
    random
  );
}

/* ─────────────────────────────
   Words
───────────────────────────── */

const STOP_WORDS =
  new Set([
    "the",
    "this",
    "that",
    "with",
    "from",
    "have",
    "has",
    "her",
    "his",
    "their",
    "they",
    "them",
    "then",
    "and",
    "but",
    "for",
    "you",
    "your",
    "she",
    "he",
    "its",
    "into",
    "are",
    "was",
    "were",
    "is",
    "am",
    "it",
    "to",
    "of",
    "in",
    "on",
    "at",
    "a",
    "an",
    "my",
    "i",
  ]);

function extractWords(
  sentence: string
): string[] {
  return (
    sentence.match(
      /[A-Za-z']+/g
    ) ?? []
  );
}

function getUsefulWords(
  sentences: string[]
): string[] {
  const words =
    sentences.flatMap(
      extractWords
    );

  return uniqueStrings(
    words.filter(
      (word) => {
        const clean =
          word.toLowerCase();

        return (
          clean.length >= 4 &&
          !STOP_WORDS.has(
            clean
          )
        );
      }
    )
  );
}

/*
  exclude에 든 단어는 피해서 고름 (다른 문제와 정답이 겹치지 않게)

  1순위 4글자 이상의 의미 있는 단어
  2순위 3글자 이상의 의미 있는 단어 (짧은 문장의 Level 1용)
  3순위 아무 단어
  그래도 없으면 exclude를 무시하고 처음 방식대로 고름
*/
function chooseWord(
  story: BookStory,
  random: () => number,
  exclude: Set<string> = new Set()
): string {
  const isFree = (
    word: string
  ) =>
    !exclude.has(
      word.toLowerCase()
    );

  const allWords =
    uniqueStrings(
      story.sentences.flatMap(
        extractWords
      )
    );

  const meaningful =
    allWords.filter(
      (word) =>
        !STOP_WORDS.has(
          word.toLowerCase()
        )
    );

  const tiers = [
    getUsefulWords(
      story.sentences
    ),

    meaningful.filter(
      (word) =>
        word.length >= 3
    ),

    allWords,
  ];

  for (const tier of tiers) {
    const free =
      tier.filter(
        isFree
      );

    if (
      free.length >
      0
    ) {
      return free[
        Math.floor(
          random() *
            free.length
        )
      ];
    }
  }

  const useful =
    getUsefulWords(
      story.sentences
    );

  if (
    useful.length >
    0
  ) {
    return useful[
      Math.floor(
        random() *
          useful.length
      )
    ];
  }

  return (
    allWords[0] ??
    story.title
  );
}

/*
  오답 후보에서 이 이야기에 나온 단어는 제외
  (정답이 2개가 되는 것을 막음)
*/
function buildWordChoices(
  answer: string,
  otherSentences: string[],
  storyWords: Set<string>,
  random: () => number
): string[] {
  const normalized =
    answer.toLowerCase();

  const otherWords =
    getUsefulWords(
      otherSentences
    ).filter(
      (word) => {
        const clean =
          word.toLowerCase();

        return (
          clean !==
            normalized &&
          !storyWords.has(
            clean
          )
        );
      }
    );

  /*
    길이가 비슷한 단어를
    오답으로 우선 사용
  */
  const similar =
    otherWords.filter(
      (word) =>
        Math.abs(
          word.length -
            answer.length
        ) <= 2
    );

  const source =
    similar.length >= 2
      ? similar
      : otherWords;

  const wrong =
    shuffle(
      source,
      random
    ).slice(
      0,
      2
    );

  return shuffle(
    [
      answer,
      ...wrong,
    ],
    random
  );
}

function createBlankSentence(
  sentence: string,
  word: string
): string {
  const index =
    sentence
      .toLowerCase()
      .indexOf(
        word.toLowerCase()
      );

  if (
    index === -1
  ) {
    return sentence;
  }

  return (
    sentence.slice(
      0,
      index
    ) +
    "____" +
    sentence.slice(
      index +
        word.length
    )
  );
}

/* ─────────────────────────────
   Main Generator
───────────────────────────── */

/*
  attempt = 0 : 항상 같은 문제 (서버/클라이언트 렌더 일치)
  attempt > 0 : Try Again 시 문제와 보기를 다시 섞음
*/
export function generateReadingQuestions(
  level: string,
  storySlug: string,
  attempt = 0
): ReadingQuestion[] {
  const currentLevel =
    getBookLevel(
      level
    );

  const currentStory =
    getBookStory(
      level,
      storySlug
    );

  if (
    !currentLevel ||
    !currentStory
  ) {
    return [];
  }

  const random =
    createRandom(
      hashString(
        attempt === 0
          ? `${level}-${storySlug}-reading`
          : `${level}-${storySlug}-reading-retry-${attempt}`
      )
    );

  /*
    이 이야기에 나온 단어 (소문자)
  */
  const storyWords =
    new Set(
      currentStory.sentences
        .flatMap(
          extractWords
        )
        .map(
          (word) =>
            word.toLowerCase()
        )
    );

  /*
    현재 이야기 외의 문장들은
    오답 선택지로 사용
  */
  const otherStories =
    currentLevel.stories.filter(
      (story) =>
        story.slug !==
        storySlug
    );

  const otherSentences =
    otherStories.flatMap(
      (story) =>
        story.sentences
    );

  const sentences =
    currentStory.sentences;

  const firstSentence =
    sentences[0];

  const lastSentence =
    sentences[
      sentences.length - 1
    ];

  const middleSentence =
    sentences[
      Math.floor(
        sentences.length /
          2
      )
    ];

  /*
    Q1
    이야기 속 실제 문장 찾기

    2문장짜리 이야기는 가운데 문장이
    마지막 문장과 같아져 Q3과 겹치므로
    제목 찾기 문제로 대체
  */
  const otherTitles =
    otherStories.map(
      (story) =>
        story.title
    );

  const q1:
    ReadingQuestion =
    sentences.length >= 3
      ? {
          id:
            `${storySlug}-sentence-1`,

          type:
            "sentence-choice",

          prompt:
            "Which sentence is from this story?",

          choices:
            buildSentenceChoices(
              middleSentence,
              otherSentences,
              random
            ),

          answer:
            middleSentence,

          explanation:
            `The story says, “${middleSentence}”`,
        }
      : {
          id:
            `${storySlug}-title`,

          type:
            "title-check",

          prompt:
            "Which title matches this story?",

          choices:
            buildSentenceChoices(
              currentStory.title,
              otherTitles,
              random
            ),

          answer:
            currentStory.title,

          explanation:
            `The story is called “${currentStory.title}”.`,
        };

  /*
    Q2
    이야기 처음
  */

  const laterSentences =
    sentences.slice(1);

  const firstDistractors =
    [
      ...laterSentences,
      ...otherSentences,
    ];

  const q2:
    ReadingQuestion = {
    id:
      `${storySlug}-first`,

    type:
      "first-event",

    prompt:
      "What happens first in the story?",

    choices:
      buildSentenceChoices(
        firstSentence,
        firstDistractors,
        random
      ),

    answer:
      firstSentence,

    explanation:
      `The story begins with “${firstSentence}”`,
  };

  /*
    Q3
    이야기 마지막
  */

  const earlierSentences =
    sentences.slice(
      0,
      -1
    );

  const lastDistractors =
    [
      ...earlierSentences,
      ...otherSentences,
    ];

  const q3:
    ReadingQuestion = {
    id:
      `${storySlug}-last`,

    type:
      "last-event",

    prompt:
      "What happens at the end of the story?",

    choices:
      buildSentenceChoices(
        lastSentence,
        lastDistractors,
        random
      ),

    answer:
      lastSentence,

    explanation:
      `The story ends with “${lastSentence}”`,
  };

  /*
    Q4
    문장 빈칸
  */

  const blankSentence =
    sentences[
      Math.floor(
        random() *
          sentences.length
      )
    ];

  const blankStory:
    BookStory = {
    ...currentStory,

    sentences: [
      blankSentence,
    ],
  };

  const missingWord =
    chooseWord(
      blankStory,
      random
    );

  const q4:
    ReadingQuestion = {
    id:
      `${storySlug}-blank`,

    type:
      "missing-word",

    prompt:
      "Choose the missing word.",

    mainText:
      createBlankSentence(
        blankSentence,
        missingWord
      ),

    choices:
      buildWordChoices(
        missingWord,
        otherSentences,
        storyWords,
        random
      ),

    answer:
      missingWord,

    explanation:
      `The missing word is “${missingWord}”.`,
  };

  /*
    Q5
    이야기에서 실제로 나온 단어 찾기
  */

  const storyWord =
    chooseWord(
      currentStory,
      random,
      new Set([
        missingWord.toLowerCase(),
      ])
    );

  const q5:
    ReadingQuestion = {
    id:
      `${storySlug}-word`,

    type:
      "word-check",

    prompt:
      "Which word appears in this story?",

    choices:
      buildWordChoices(
        storyWord,
        otherSentences,
        storyWords,
        random
      ),

    answer:
      storyWord,

    explanation:
      `“${storyWord}” appears in the story.`,
  };

  return [
    q1,
    q2,
    q3,
    q4,
    q5,
  ];
}