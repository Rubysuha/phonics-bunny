import {
  alphabetBank,
  blendBank,
  longVowelBank,
  shortVowelBank,
  sightWordBank,
  type PhonicsBankCategory,
  type PhonicsBankItem,
} from "./phonicsBank";

import {
  createRandom,
  hashString,
  shuffle,
} from "@/lib/seededRandom";

import {
  FINAL_PHONICS_STAGE,
  PHONICS_STAGE_COUNT,
  getPhonicsQuestionCount,
} from "@/lib/phonicsTestRules";

/* ─────────────────────────────
   Types
───────────────────────────── */

export type PhonicsQuestionType =
  | "letter-choice"
  | "case-match"
  | "image-choice"
  | "listen-choice"
  | "fill-blank"
  | "blend-choice"
  | "word-choice";

export type PhonicsQuestion = {
  id: string;

  type: PhonicsQuestionType;

  prompt: string;

  mainText?: string;

  image?: string;

  /*
    Azure AI가 읽을 텍스트
  */
  speechText?: string;

  choices: string[];

  answer: string;

  targetId: string;

  targetWord?: string;
};

/* ─────────────────────────────
   General Helpers
───────────────────────────── */

function uniqueStrings(
  values: string[]
): string[] {
  return [
    ...new Set<string>(
      values
    ),
  ];
}

function normalizeWord(
  word: string
): string {
  return word
    .trim()
    .toLowerCase();
}

function selectTargets(
  pool:
    PhonicsBankItem[],
  count: number,
  random:
    () => number
): PhonicsBankItem[] {
  if (
    pool.length === 0
  ) {
    return [];
  }

  /*
    한 번 섞은 뒤
    가능한 한 모든 단어를
    먼저 사용함
  */
  const shuffled =
    shuffle(
      pool,
      random
    );

  const result:
    PhonicsBankItem[] =
    [];

  for (
    let i = 0;
    i < count;
    i += 1
  ) {
    /*
      단어 Bank가 문제 수보다
      적을 경우 반복 사용.

      앞으로 단어를 늘리면
      자연스럽게 반복이 줄어듦.
    */
    result.push(
      shuffled[
        i %
          shuffled.length
      ]
    );
  }

  return result;
}

/*
  모음 빈칸 문제(5문제마다 3번째)의 정답이
  같은 모음으로 몰리지 않도록 자리를 바꿔줌

  한 가지 모음만 다루는 Stage에서는 바꿀 단어가 없어 그대로 둠
*/
function spreadFillBlankTargets(
  targets: PhonicsBankItem[]
): PhonicsBankItem[] {
  const result = [
    ...targets,
  ];

  const usedGroups =
    new Set<string>();

  for (
    let i = 2;
    i < result.length;
    i += 5
  ) {
    const group =
      result[i].group ?? "";

    if (
      usedGroups.has(
        group
      )
    ) {
      const swapIndex =
        result.findIndex(
          (item, index) =>
            index % 5 !== 2 &&
            !usedGroups.has(
              item.group ?? ""
            )
        );

      if (
        swapIndex !== -1
      ) {
        [
          result[i],
          result[swapIndex],
        ] = [
          result[swapIndex],
          result[i],
        ];
      }
    }

    usedGroups.add(
      result[i].group ?? ""
    );
  }

  return result;
}

/* ─────────────────────────────
   Word Choices
───────────────────────────── */

function getWordDistractors(
  target:
    PhonicsBankItem,
  pool:
    PhonicsBankItem[],
  count: number,
  random:
    () => number
): string[] {
  const targetWord =
    normalizeWord(
      target.word
    );

  const candidates =
    pool.filter(
      (item) =>
        normalizeWord(
          item.word
        ) !==
        targetWord
    );

  /*
    단어 길이가 비슷한 것을
    우선 오답으로 사용
  */
  const similarLength =
    candidates.filter(
      (item) =>
        Math.abs(
          item.word
            .length -
            target.word
              .length
        ) <= 1
    );

  const source =
    similarLength.length >=
    count
      ? similarLength
      : candidates;

  return uniqueStrings(
    shuffle(
      source,
      random
    ).map(
      (item) =>
        item.word.toUpperCase()
    )
  ).slice(
    0,
    count
  );
}

function buildWordChoices(
  target:
    PhonicsBankItem,
  pool:
    PhonicsBankItem[],
  random:
    () => number
): string[] {
  const answer =
    target.word.toUpperCase();

  const distractors =
    getWordDistractors(
      target,
      pool,
      2,
      random
    );

  return shuffle(
    uniqueStrings([
      answer,
      ...distractors,
    ]),
    random
  );
}

/* ─────────────────────────────
   Letter Choices
───────────────────────────── */

function buildLetterChoices(
  targetLetter:
    string,
  random:
    () => number,
  lowercase =
    false
): string[] {
  const answer =
    lowercase
      ? targetLetter.toLowerCase()
      : targetLetter.toUpperCase();

  const letters:
    string[] =
    alphabetBank
      .map(
        (item) => {
          if (
            lowercase
          ) {
            return (
              item.lower ??
              item.letter?.toLowerCase() ??
              ""
            );
          }

          return (
            item.upper ??
            item.letter?.toUpperCase() ??
            ""
          );
        }
      )
      .filter(
        (letter) =>
          letter !==
            "" &&
          letter !==
            answer
      );

  const distractors =
    shuffle(
      uniqueStrings(
        letters
      ),
      random
    ).slice(
      0,
      2
    );

  return shuffle(
    [
      answer,
      ...distractors,
    ],
    random
  );
}

/* ─────────────────────────────
   Vowels
───────────────────────────── */

const VOWELS = [
  "A",
  "E",
  "I",
  "O",
  "U",
];

function createVowelBlank(
  word: string,
  vowel: string
): string {
  const upperWord =
    word.toUpperCase();

  const index =
    upperWord.indexOf(
      vowel.toUpperCase()
    );

  if (
    index === -1
  ) {
    return upperWord;
  }

  return (
    upperWord.slice(
      0,
      index
    ) +
    "_" +
    upperWord.slice(
      index + 1
    )
  );
}

function buildVowelChoices(
  vowel: string,
  random:
    () => number
): string[] {
  const answer =
    vowel.toUpperCase();

  const distractors =
    shuffle(
      VOWELS.filter(
        (item) =>
          item !==
          answer
      ),
      random
    ).slice(
      0,
      2
    );

  return shuffle(
    [
      answer,
      ...distractors,
    ],
    random
  );
}

/* ─────────────────────────────
   Blend
───────────────────────────── */

function getInitialBlend(
  word: string
): string {
  const match =
    word
      .toLowerCase()
      .match(
        /^[^aeiou]+/
      );

  return (
    match?.[0] ??
    ""
  ).toUpperCase();
}

function createBlendBlank(
  word: string
): string {
  const upperWord =
    word.toUpperCase();

  const blend =
    getInitialBlend(
      word
    );

  if (!blend) {
    return upperWord;
  }

  return (
    "__" +
    upperWord.slice(
      blend.length
    )
  );
}

function buildBlendChoices(
  target:
    PhonicsBankItem,
  random:
    () => number
): string[] {
  const answer =
    getInitialBlend(
      target.word
    );

  const allBlends =
    uniqueStrings(
      blendBank
        .map(
          (item) =>
            getInitialBlend(
              item.word
            )
        )
        .filter(
          (blend) =>
            Boolean(
              blend
            )
        )
    ).filter(
      (blend) =>
        blend !==
        answer
    );

  const distractors =
    shuffle(
      allBlends,
      random
    ).slice(
      0,
      2
    );

  return shuffle(
    [
      answer,
      ...distractors,
    ],
    random
  );
}

/* ─────────────────────────────
   Stage Pool
───────────────────────────── */

function getStagePool(
  category:
    PhonicsBankCategory,
  stage: number
): PhonicsBankItem[] {
  /* Alphabet */

  if (
    category ===
    "alphabet"
  ) {
    const ranges:
      Record<
        number,
        [string, string]
      > = {
      1: [
        "a",
        "f",
      ],

      2: [
        "g",
        "l",
      ],

      3: [
        "m",
        "r",
      ],

      4: [
        "s",
        "z",
      ],
    };

    if (
      stage === FINAL_PHONICS_STAGE
    ) {
      return alphabetBank;
    }

    const range =
      ranges[
        stage
      ];

    if (!range) {
      return alphabetBank;
    }

    return alphabetBank.filter(
      (item) => {
        const letter =
          item.letter?.toLowerCase();

        if (!letter) {
          return false;
        }

        return (
          letter >=
            range[0] &&
          letter <=
            range[1]
        );
      }
    );
  }

  /* Short Vowels */

  if (
    category ===
    "short-vowels"
  ) {
    if (
      stage === 1
    ) {
      return shortVowelBank.filter(
        (item) =>
          item.group.toLowerCase() ===
          "a"
      );
    }

    if (
      stage === 2
    ) {
      return shortVowelBank.filter(
        (item) =>
          item.group.toLowerCase() ===
          "e"
      );
    }

    if (
      stage === 3
    ) {
      return shortVowelBank.filter(
        (item) =>
          item.group.toLowerCase() ===
          "i"
      );
    }

    if (
      stage === 4
    ) {
      return shortVowelBank.filter(
        (item) => {
          const group =
            item.group.toLowerCase();

          return (
            group ===
              "o" ||
            group ===
              "u"
          );
        }
      );
    }

    /*
      Stage 5
      전체 Short Vowels
    */
    return shortVowelBank;
  }

  /* Long Vowels */

  if (
    category ===
    "long-vowels"
  ) {
    if (
      stage === 1
    ) {
      return longVowelBank.filter(
        (item) =>
          item.group.toLowerCase() ===
          "a"
      );
    }

    if (
      stage === 2
    ) {
      return longVowelBank.filter(
        (item) =>
          item.group.toLowerCase() ===
          "e"
      );
    }

    if (
      stage === 3
    ) {
      return longVowelBank.filter(
        (item) =>
          item.group.toLowerCase() ===
          "i"
      );
    }

    if (
      stage === 4
    ) {
      return longVowelBank.filter(
        (item) => {
          const group =
            item.group.toLowerCase();

          return (
            group ===
              "o" ||
            group ===
              "u"
          );
        }
      );
    }

    /*
      Stage 5
      전체 Long Vowels
    */
    return longVowelBank;
  }

  /* Blend Sounds */

  if (
    category ===
    "blend-sounds"
  ) {
    if (
      stage === 1
    ) {
      return blendBank.filter(
        (item) =>
          item.group
            .toLowerCase()
            .startsWith(
              "l"
            )
      );
    }

    if (
      stage === 2
    ) {
      return blendBank.filter(
        (item) =>
          item.group
            .toLowerCase()
            .startsWith(
              "r"
            )
      );
    }

    if (
      stage === 3
    ) {
      return blendBank.filter(
        (item) =>
          item.group
            .toLowerCase()
            .startsWith(
              "s"
            )
      );
    }

    /*
      Stage 4 Mixed
      Stage 5 Final
    */
    return blendBank;
  }

  /* Sight Words */

  if (
    category ===
    "sight-words"
  ) {
    /*
      데이터 안에 실제로 존재하는
      level 값을 순서대로 가져옴.
      level 이름을 하드코딩하지 않음.
    */
    const groups =
      uniqueStrings(
        sightWordBank.map(
          (item) =>
            item.group
        )
      );

    if (
      stage >= 1 &&
      stage <= 3 &&
      groups[
        stage - 1
      ]
    ) {
      return sightWordBank.filter(
        (item) =>
          item.group ===
          groups[
            stage - 1
          ]
      );
    }

    /*
      Stage 4 Mixed
      Stage 5 Final
    */
    return sightWordBank;
  }

  return [];
}

/* ─────────────────────────────
   Alphabet Questions
───────────────────────────── */

function generateAlphabetQuestion(
  target:
    PhonicsBankItem,
  questionIndex:
    number,
  random:
    () => number
): PhonicsQuestion {
  /*
    5가지 유형 반복

    0 / 5 / 10
    1 / 6 / 11
    ...
  */
  const typeIndex =
    questionIndex %
    5;

  const upper =
    target.upper ??
    target.letter?.toUpperCase() ??
    "";

  const lower =
    target.lower ??
    target.letter?.toLowerCase() ??
    "";

  /* Letter Choice */

  if (
    typeIndex === 0
  ) {
    return {
      id:
        `${target.id}-upper-${questionIndex}`,

      type:
        "letter-choice",

      prompt:
        `Find the letter ${upper}.`,

      choices:
        buildLetterChoices(
          upper,
          random
        ),

      answer:
        upper,

      targetId:
        target.id,

      targetWord:
        target.word,
    };
  }

  /* Case Match */

  if (
    typeIndex === 1
  ) {
    return {
      id:
        `${target.id}-case-${questionIndex}`,

      type:
        "case-match",

      prompt:
        "Choose the matching lowercase letter.",

      mainText:
        upper,

      choices:
        buildLetterChoices(
          lower,
          random,
          true
        ),

      answer:
        lower,

      targetId:
        target.id,

      targetWord:
        target.word,
    };
  }

  /* Image */

  if (
    typeIndex === 2 &&
    target.image
  ) {
    return {
      id:
        `${target.id}-image-${questionIndex}`,

      type:
        "image-choice",

      prompt:
        "Which letter does this word start with?",

      image:
        target.image,

      choices:
        buildLetterChoices(
          upper,
          random
        ),

      answer:
        upper,

      targetId:
        target.id,

      targetWord:
        target.word,
    };
  }

  /* AI Listening */

  if (
    typeIndex === 3
  ) {
    return {
      id:
        `${target.id}-listen-${questionIndex}`,

      type:
        "listen-choice",

      prompt:
        "Listen and choose the first letter.",

      speechText:
        target.word,

      choices:
        buildLetterChoices(
          upper,
          random
        ),

      answer:
        upper,

      targetId:
        target.id,

      targetWord:
        target.word,
    };
  }

  /* Word → Letter */

  return {
    id:
      `${target.id}-word-${questionIndex}`,

    type:
      "letter-choice",

    prompt:
      "Which letter does this word start with?",

    mainText:
      target.word.toUpperCase(),

    choices:
      buildLetterChoices(
        upper,
        random
      ),

    answer:
      upper,

    targetId:
      target.id,

    targetWord:
      target.word,
  };
}

/* ─────────────────────────────
   Vowel Questions
───────────────────────────── */

function generateVowelQuestion(
  target:
    PhonicsBankItem,
  questionIndex:
    number,
  categoryPool:
    PhonicsBankItem[],
  random:
    () => number
): PhonicsQuestion {
  const typeIndex =
    questionIndex %
    5;

  /*
    1 / 4
    Picture
  */
  if (
    (
      typeIndex ===
        0 ||
      typeIndex ===
        3
    ) &&
    target.image
  ) {
    return {
      id:
        `${target.id}-image-${questionIndex}`,

      type:
        "image-choice",

      prompt:
        "Which word matches the picture?",

      image:
        target.image,

      choices:
        buildWordChoices(
          target,
          categoryPool,
          random
        ),

      answer:
        target.word.toUpperCase(),

      targetId:
        target.id,

      targetWord:
        target.word,
    };
  }

  /*
    2 / 5
    AI Listening
  */
  if (
    typeIndex ===
      1 ||
    typeIndex ===
      4
  ) {
    return {
      id:
        `${target.id}-listen-${questionIndex}`,

      type:
        "listen-choice",

      prompt:
        "Listen and choose the word.",

      speechText:
        target.word,

      choices:
        buildWordChoices(
          target,
          categoryPool,
          random
        ),

      answer:
        target.word.toUpperCase(),

      targetId:
        target.id,

      targetWord:
        target.word,
    };
  }

  /*
    3
    Missing Vowel
  */

  const vowel =
    target.group
      .toUpperCase();

  return {
    id:
      `${target.id}-blank-${questionIndex}`,

    type:
      "fill-blank",

    prompt:
      "Choose the missing vowel.",

    mainText:
      createVowelBlank(
        target.word,
        vowel
      ),

    choices:
      buildVowelChoices(
        vowel,
        random
      ),

    answer:
      vowel,

    targetId:
      target.id,

    targetWord:
      target.word,
  };
}

/* ─────────────────────────────
   Blend Questions
───────────────────────────── */

function generateBlendQuestion(
  target:
    PhonicsBankItem,
  questionIndex:
    number,
  random:
    () => number
): PhonicsQuestion {
  const typeIndex =
    questionIndex %
    5;

  /* Picture */

  if (
    (
      typeIndex ===
        0 ||
      typeIndex ===
        3
    ) &&
    target.image
  ) {
    return {
      id:
        `${target.id}-image-${questionIndex}`,

      type:
        "image-choice",

      prompt:
        "Which word matches the picture?",

      image:
        target.image,

      choices:
        buildWordChoices(
          target,
          blendBank,
          random
        ),

      answer:
        target.word.toUpperCase(),

      targetId:
        target.id,

      targetWord:
        target.word,
    };
  }

  /* AI Listening */

  if (
    typeIndex ===
      1 ||
    typeIndex ===
      4
  ) {
    return {
      id:
        `${target.id}-listen-${questionIndex}`,

      type:
        "listen-choice",

      prompt:
        "Listen and choose the word.",

      speechText:
        target.word,

      choices:
        buildWordChoices(
          target,
          blendBank,
          random
        ),

      answer:
        target.word.toUpperCase(),

      targetId:
        target.id,

      targetWord:
        target.word,
    };
  }

  /* Missing Blend */

  const blend =
    getInitialBlend(
      target.word
    );

  return {
    id:
      `${target.id}-blend-${questionIndex}`,

    type:
      "blend-choice",

    prompt:
      "Choose the missing blend.",

    mainText:
      createBlendBlank(
        target.word
      ),

    choices:
      buildBlendChoices(
        target,
        random
      ),

    answer:
      blend,

    targetId:
      target.id,

    targetWord:
      target.word,
  };
}

/* ─────────────────────────────
   Sight Word Questions
───────────────────────────── */

function generateSightWordQuestion(
  target:
    PhonicsBankItem,
  questionIndex:
    number,
  random:
    () => number
): PhonicsQuestion {
  const typeIndex =
    questionIndex %
    5;

  /*
    Q1 / Q3 / Q5
    AI Listening
  */
  if (
    typeIndex ===
      0 ||
    typeIndex ===
      2 ||
    typeIndex ===
      4
  ) {
    return {
      id:
        `${target.id}-listen-${questionIndex}`,

      type:
        "listen-choice",

      prompt:
        "Listen and choose the word.",

      speechText:
        target.word,

      choices:
        buildWordChoices(
          target,
          sightWordBank,
          random
        ),

      answer:
        target.word.toUpperCase(),

      targetId:
        target.id,

      targetWord:
        target.word,
    };
  }

  /*
    Q2 / Q4
    Word Recognition
  */

  const wrongChoices =
    getWordDistractors(
      target,
      sightWordBank,
      2,
      random
    ).map(
      (word) =>
        word.toLowerCase()
    );

  return {
    id:
      `${target.id}-recognition-${questionIndex}`,

    type:
      "word-choice",

    prompt:
      "Choose the same word.",

    mainText:
      target.word.toUpperCase(),

    choices:
      shuffle(
        [
          target.word.toLowerCase(),
          ...wrongChoices,
        ],
        random
      ),

    answer:
      target.word.toLowerCase(),

    targetId:
      target.id,

    targetWord:
      target.word,
  };
}

/* ─────────────────────────────
   Main Generator
───────────────────────────── */

export function generatePhonicsStageQuestions(
  category:
    PhonicsBankCategory,
  stage: number,
  attempt = 0
): PhonicsQuestion[] {
  const safeStage =
    Math.min(
      PHONICS_STAGE_COUNT,
      Math.max(
        1,
        stage
      )
    );

  /*
    Stage 1~4 = 10
    Stage 5 = 15
  */
  const questionCount =
    getPhonicsQuestionCount(
      safeStage
    );

  /*
    같은 Stage에 다시 들어오면
    같은 문제 순서를 유지 (서버/클라이언트 렌더 결과 일치)

    Try Again(attempt > 0)일 때만
    문제와 보기 순서를 바꿔 정답 암기를 막음
  */
  const seed =
    attempt === 0
      ? `${category}-stage-${safeStage}`
      : `${category}-stage-${safeStage}-retry-${attempt}`;

  const random =
    createRandom(
      hashString(
        seed
      )
    );

  const stagePool =
    getStagePool(
      category,
      safeStage
    );

  if (
    stagePool.length ===
    0
  ) {
    return [];
  }

  const selectedTargets =
    selectTargets(
      stagePool,
      questionCount,
      random
    );

  const targets =
    category === "short-vowels" ||
    category === "long-vowels"
      ? spreadFillBlankTargets(
          selectedTargets
        )
      : selectedTargets;

  return targets.map(
    (
      target,
      index
    ): PhonicsQuestion => {
      if (
        category ===
        "alphabet"
      ) {
        return generateAlphabetQuestion(
          target,
          index,
          random
        );
      }

      if (
        category ===
        "short-vowels"
      ) {
        return generateVowelQuestion(
          target,
          index,
          shortVowelBank,
          random
        );
      }

      if (
        category ===
        "long-vowels"
      ) {
        return generateVowelQuestion(
          target,
          index,
          longVowelBank,
          random
        );
      }

      if (
        category ===
        "blend-sounds"
      ) {
        return generateBlendQuestion(
          target,
          index,
          random
        );
      }

      return generateSightWordQuestion(
        target,
        index,
        random
      );
    }
  );
}