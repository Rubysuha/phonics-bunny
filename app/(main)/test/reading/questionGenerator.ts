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
  | "title-check"
  | "word-order"
  | "word-not"
  | "sentence-not";

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
  문장 첫 단어의 대문자는 소문자로 바꿔서 꺼냄 (I 는 그대로)
  보기에 "Apple / cold" 처럼 대소문자가 섞이지 않게 하기 위함

  "Ring! My alarm wakes me up." 처럼 한 줄에 문장이 둘이면
  각 문장의 첫 단어를 모두 처리
*/
function extractPlainWords(
  sentence: string
): string[] {
  return sentence
    .split(/[.!?]+/)
    .flatMap(
      (part) =>
        extractWords(
          part
        ).map(
          (word, index) =>
            index === 0 &&
            word !== "I" &&
            !word.startsWith("I'")
              ? word.toLowerCase()
              : word
        )
    );
}

function capitalize(
  text: string
): string {
  return (
    text.charAt(0).toUpperCase() +
    text.slice(1)
  );
}

/*
  이 이야기에 나오지 않는 단어들 (오답 후보)

  대소문자만 다른 같은 단어는 하나로 취급
  (정답이 2개처럼 보이는 것을 막음)
*/
function getOutsideWords(
  otherSentences: string[],
  storyWords: Set<string>,
  random: () => number
): string[] {
  const seen =
    new Set<string>();

  const words =
    otherSentences
      .flatMap(
        extractPlainWords
      )
      .filter(
        (word) => {
          const clean =
            word.toLowerCase();

          if (
            clean.length < 4 ||
            STOP_WORDS.has(
              clean
            ) ||
            storyWords.has(
              clean
            ) ||
            seen.has(
              clean
            )
          ) {
            return false;
          }

          seen.add(
            clean
          );

          return true;
        }
      );

  return shuffle(
    words,
    random
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
  const otherWords =
    getOutsideWords(
      otherSentences,
      storyWords,
      random
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

  /*
    정답이 대문자로 시작하면 (문장 첫 단어)
    오답도 대문자로 맞춰서 정답만 눈에 띄지 않게 함
  */
  const startsUpper =
    answer !== "I" &&
    /^[A-Z]/.test(
      answer
    );

  const wrong =
    source
      .slice(
        0,
        2
      )
      .map(
        (word) =>
          startsUpper
            ? capitalize(
                word
              )
            : word
      );

  return shuffle(
    [
      answer,
      ...wrong,
    ],
    random
  );
}

/*
  단어 단위로 찾아서 빈칸으로 바꿈
  (다른 단어의 일부를 지우지 않도록)
*/
function createBlankSentence(
  sentence: string,
  word: string
): string {
  const escaped =
    word.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

  const pattern =
    new RegExp(
      `(^|[^A-Za-z'])${escaped}(?![A-Za-z'])`,
      "i"
    );

  if (
    !pattern.test(
      sentence
    )
  ) {
    return sentence;
  }

  return sentence.replace(
    pattern,
    "$1____"
  );
}

/*
  같은 단어들의 순서만 바꾼 문장 2개 + 원래 문장
  단어가 3개보다 적으면 만들 수 없어서 null
*/
function buildWordOrderChoices(
  sentence: string,
  random: () => number
): string[] | null {
  const end =
    sentence.match(
      /[.!?]+$/
    )?.[0] ?? "";

  const words =
    sentence
      .slice(
        0,
        sentence.length -
          end.length
      )
      .split(/\s+/)
      .map(
        (word) =>
          word.replace(
            /[,;:]/g,
            ""
          )
      )
      .filter(Boolean)
      .map(
        (word, index) =>
          index === 0 &&
          word !== "I" &&
          !word.startsWith("I'")
            ? word.toLowerCase()
            : word
      );

  if (
    words.length < 3
  ) {
    return null;
  }

  const original =
    words.join(" ");

  const wrong =
    new Set<string>();

  for (
    let tries = 0;
    tries < 40 &&
    wrong.size < 2;
    tries += 1
  ) {
    const mixed =
      shuffle(
        words,
        random
      ).join(" ");

    if (
      mixed !== original
    ) {
      wrong.add(
        capitalize(
          mixed
        ) + end
      );
    }
  }

  if (
    wrong.size < 2
  ) {
    return null;
  }

  return shuffle(
    [
      sentence,
      ...wrong,
    ],
    random
  );
}

/* ─────────────────────────────
   Main Generator
───────────────────────────── */

/*
  attempt = 0 : 항상 같은 문제 (서버/클라이언트 렌더 일치)
  attempt > 0 : Try Again 시 문제와 보기, 문제 순서를 다시 섞음
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

  /* 문장 첫 단어의 대문자를 푼 이야기 속 단어들 */
  const plainStoryWords =
    uniqueStrings(
      sentences.flatMap(
        extractPlainWords
      )
    );

  /*
    빈칸 문제

    한 문장에 두 번 나오는 단어는 빈칸으로 쓰지 않음
    (남은 문장에 정답이 그대로 보이는 것을 막음)
  */
  const buildMissingWord = (
    blankSentence: string,
    exclude: Set<string>
  ): ReadingQuestion => {
    const counts =
      new Map<
        string,
        number
      >();

    extractWords(
      blankSentence
    ).forEach(
      (word) => {
        const clean =
          word.toLowerCase();

        counts.set(
          clean,
          (counts.get(
            clean
          ) ?? 0) + 1
        );
      }
    );

    const blocked =
      new Set(
        exclude
      );

    counts.forEach(
      (count, word) => {
        if (
          count > 1
        ) {
          blocked.add(
            word
          );
        }
      }
    );

    const missingWord =
      chooseWord(
        {
          ...currentStory,

          sentences: [
            blankSentence,
          ],
        },
        random,
        blocked
      );

    return {
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
  };

  let questions:
    ReadingQuestion[];

  if (
    sentences.length >= 3
  ) {
    /* ─────────────────────────────
       3문장 이상의 이야기
    ───────────────────────────── */

    /*
      Q1
      이야기 속 실제 문장 찾기

      처음에는 가운데 문장,
      Try Again 때는 처음과 끝을 뺀 문장 중 하나
    */
    const middleSentence =
      attempt === 0
        ? sentences[
            Math.floor(
              sentences.length /
                2
            )
          ]
        : sentences[
            1 +
              Math.floor(
                random() *
                  (sentences.length -
                    2)
              )
          ];

    const q1:
      ReadingQuestion = {
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
    };

    /* Q2 이야기 처음 */
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
          [
            ...sentences.slice(1),
            ...otherSentences,
          ],
          random
        ),

      answer:
        firstSentence,

      explanation:
        `The story begins with “${firstSentence}”`,
    };

    /* Q3 이야기 마지막 */
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
          [
            ...sentences.slice(
              0,
              -1
            ),
            ...otherSentences,
          ],
          random
        ),

      answer:
        lastSentence,

      explanation:
        `The story ends with “${lastSentence}”`,
    };

    /* Q4 문장 빈칸 */
    const q4 =
      buildMissingWord(
        sentences[
          Math.floor(
            random() *
              sentences.length
          )
        ],
        new Set()
      );

    /*
      Q5
      이야기에서 실제로 나온 단어 찾기
      (문장 첫 단어였다면 소문자로 보여줌)
    */
    const chosenWord =
      chooseWord(
        currentStory,
        random,
        new Set([
          q4.answer.toLowerCase(),
        ])
      );

    const storyWord =
      plainStoryWords.includes(
        chosenWord
      )
        ? chosenWord
        : chosenWord.toLowerCase();

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

    questions = [
      q1,
      q2,
      q3,
      q4,
      q5,
    ];
  } else {
    /* ─────────────────────────────
       1~2문장짜리 짧은 이야기 (Level 1)

       처음/마지막 문제를 내면 다섯 문제가
       모두 같은 단어를 묻게 되므로
       정답이 서로 다른 유형으로 구성
    ───────────────────────────── */

    /* 단어가 가장 많은 문장 */
    const longSentence =
      [...sentences].sort(
        (a, b) =>
          extractWords(b).length -
          extractWords(a).length
      )[0];

    const titleWords =
      new Set(
        extractWords(
          currentStory.title
        ).map(
          (word) =>
            word.toLowerCase()
        )
      );

    /* Q1 제목 찾기 */
    const otherTitles =
      otherStories.map(
        (story) =>
          story.title
      );

    const q1:
      ReadingQuestion = {
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
      이야기 속 문장 찾기
      오답은 같은 단어의 순서만 바꾼 문장
    */
    const orderChoices =
      buildWordOrderChoices(
        longSentence,
        random
      );

    const q2:
      ReadingQuestion = {
      id:
        `${storySlug}-order`,

      type:
        orderChoices
          ? "word-order"
          : "sentence-choice",

      prompt:
        "Which sentence is from this story?",

      choices:
        orderChoices ??
        buildSentenceChoices(
          longSentence,
          otherSentences,
          random
        ),

      answer:
        longSentence,

      explanation:
        `The story says, “${longSentence}”`,
    };

    /*
      Q3
      문장 빈칸
      제목에 나온 단어 말고 다른 단어가 있으면 그 단어를 사용
    */
    const hasOtherWord =
      extractWords(
        longSentence
      ).some(
        (word) => {
          const clean =
            word.toLowerCase();

          return (
            !STOP_WORDS.has(
              clean
            ) &&
            !titleWords.has(
              clean
            )
          );
        }
      );

    const q3 =
      buildMissingWord(
        longSentence,
        hasOtherWord
          ? titleWords
          : new Set()
      );

    /*
      Q4
      이야기에 나오지 않는 단어 찾기
    */
    const meaningfulWords =
      plainStoryWords.filter(
        (word) =>
          word.length >= 3 &&
          !STOP_WORDS.has(
            word.toLowerCase()
          )
      );

    const shownWords =
      shuffle(
        meaningfulWords.length >= 2
          ? meaningfulWords
          : plainStoryWords,
        random
      ).slice(
        0,
        2
      );

    const outsideWord =
      getOutsideWords(
        otherSentences,
        storyWords,
        random
      )[0] ?? "zebra";

    /*
      이야기에 단어가 하나뿐이면 (예: "Run, run, run!")
      보기 3개를 만들 수 없어서 나온 단어 찾기로 대체
    */
    const onlyWord =
      plainStoryWords[0] ??
      currentStory.title;

    const q4:
      ReadingQuestion =
      shownWords.length >= 2
        ? {
            id:
              `${storySlug}-word-not`,

            type:
              "word-not",

            prompt:
              "Which word is NOT in this story?",

            choices:
              shuffle(
                [
                  ...shownWords,
                  outsideWord,
                ],
                random
              ),

            answer:
              outsideWord,

            explanation:
              `“${outsideWord}” is not in the story.`,
          }
        : {
            id:
              `${storySlug}-word`,

            type:
              "word-check",

            prompt:
              "Which word appears in this story?",

            choices:
              buildWordChoices(
                onlyWord,
                otherSentences,
                storyWords,
                random
              ),

            answer:
              onlyWord,

            explanation:
              `“${onlyWord}” appears in the story.`,
          };

    /*
      Q5
      이야기에 없는 문장 찾기
    */
    const outsideSentences =
      otherSentences.filter(
        (sentence) =>
          !sentences.includes(
            sentence
          ) &&
          extractWords(
            sentence
          ).length >= 2
      );

    const outsideSentence =
      outsideSentences[
        Math.floor(
          random() *
            outsideSentences.length
        )
      ] ??
      otherSentences[0] ??
      "";

    const q5:
      ReadingQuestion = {
      id:
        `${storySlug}-sentence-not`,

      type:
        "sentence-not",

      prompt:
        "Which sentence is NOT from this story?",

      choices:
        shuffle(
          [
            ...sentences.slice(
              0,
              2
            ),
            outsideSentence,
          ],
          random
        ),

      answer:
        outsideSentence,

      explanation:
        `“${outsideSentence}” is from a different story.`,
    };

    questions = [
      q1,
      q2,
      q3,
      q4,
      q5,
    ];
  }

  /*
    Try Again 때는 문제 순서도 섞음
  */
  return attempt === 0
    ? questions
    : shuffle(
        questions,
        random
      );
}
