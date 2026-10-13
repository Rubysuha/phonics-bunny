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
  getPhonicsQuestionCount,
  getPhonicsStageCount,
  isFinalPhonicsStage,
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

/*
  문제로 낼 단어를 고름

  세부 묶음(모음 · 레벨 · bl/cl/fl 같은 블렌드)마다 고르게 뽑음:
  묶음별로 섞어 둔 뒤, 묶음을 돌아가며 하나씩 꺼냄.
  묶음이 하나뿐인 Stage 에서는 그냥 섞어서 앞에서부터 뽑는 것과 같음.
*/
function selectTargets(
  pool: PhonicsBankItem[],
  count: number,
  random: () => number
): PhonicsBankItem[] {
  if (pool.length === 0) {
    return [];
  }

  const byGroup = new Map<string, PhonicsBankItem[]>();

  for (const item of pool) {
    const key = item.section ?? item.group;

    byGroup.set(key, [...(byGroup.get(key) ?? []), item]);
  }

  /* 묶음 순서와 묶음 안의 단어 순서를 모두 섞음 */
  const groups = shuffle(
    Array.from(byGroup.values()).map((items) => shuffle(items, random)),
    random
  );

  const ordered: PhonicsBankItem[] = [];

  for (let round = 0; ordered.length < pool.length; round += 1) {
    for (const items of groups) {
      if (round < items.length) {
        ordered.push(items[round]);
      }
    }
  }

  /* 단어가 문제 수보다 적으면 처음부터 다시 사용 */
  const selected = Array.from(
    { length: count },
    (_, index) => ordered[index % ordered.length]
  );

  /* 같은 묶음이 연달아 나오지 않게 한 번 더 섞음 */
  return shuffle(selected, random);
}

/*
  그림 문제 자리(5문제마다 1 · 4번째)에 그림이 있는 단어가 오도록 순서를 바꿈

  그림이 적은 묶음(예: S 블렌드)에서도 그림 문제가 한쪽으로 몰리거나
  빠지지 않고, 있는 그림은 그림 문제에 쓰이게 됨
*/
function arrangeForImageSlots(
  targets: PhonicsBankItem[]
): PhonicsBankItem[] {
  const withImage = targets.filter((item) => item.image);
  const withoutImage = targets.filter((item) => !item.image);

  return targets.map((_, index) => {
    const isImageSlot = index % 5 === 0 || index % 5 === 3;

    const first = isImageSlot ? withImage : withoutImage;
    const second = isImageSlot ? withoutImage : withImage;

    return (first.shift() ?? second.shift())!;
  });
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
  category: PhonicsBankCategory,
  stage: number
): PhonicsBankItem[] {
  const banks: Record<PhonicsBankCategory, PhonicsBankItem[]> = {
    alphabet: alphabetBank,
    "short-vowels": shortVowelBank,
    "long-vowels": longVowelBank,
    "blend-sounds": blendBank,
    "sight-words": sightWordBank,
  };

  const bank = banks[category];

  /* 마지막 Stage(Review)는 영역 전체 */
  if (isFinalPhonicsStage(category, stage)) {
    return bank;
  }

  /* Alphabet: A–F / G–L / M–R / S–Z */
  if (category === "alphabet") {
    const ranges: [string, string][] = [
      ["a", "f"],
      ["g", "l"],
      ["m", "r"],
      ["s", "z"],
    ];

    const [from, to] = ranges[stage - 1];

    return bank.filter((item) => {
      const letter = item.letter?.toLowerCase();

      return !!letter && letter >= from && letter <= to;
    });
  }

  /* Blend Sounds: L / R / S 블렌드, Stage 4 는 전체 혼합 */
  if (category === "blend-sounds") {
    const groups = ["l", "r", "s"];

    return stage <= groups.length
      ? bank.filter((item) =>
          item.group.toLowerCase().startsWith(groups[stage - 1])
        )
      : bank;
  }

  /*
    Short / Long Vowels: A · E · I · O · U
    Sight Words: Level 1~5

    데이터에 있는 그룹 순서대로 Stage 하나씩
  */
  const groups = uniqueStrings(bank.map((item) => item.group));
  const group = groups[stage - 1];

  return group ? bank.filter((item) => item.group === group) : bank;
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

  const vowel =
    target.group
      .toUpperCase();

  /*
    빈칸(3번째) 문제는 단어에 그 모음 글자가 실제로 있을 때만 출제
    (Moon · Few 처럼 U 소리지만 글자 u 가 없는 단어는 제외)

    그 밖의 경우 — 듣기 차례이거나, 그림이 아직 없는 단어의 그림 차례 —
    는 모두 듣기 문제로 출제
  */
  const canBlank =
    typeIndex === 2 &&
    target.word
      .toUpperCase()
      .includes(vowel);

  if (!canBlank) {
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

  /*
    AI Listening

    그림이 없는 단어가 그림 자리에 오면
    첫 번째 자리는 Missing Blend, 두 번째 자리는 Listening 으로 나눠서
    한 가지 문제만 이어지지 않게 함
  */

  if (
    typeIndex === 1 ||
    typeIndex === 4 ||
    (typeIndex === 3 && !target.image)
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

/*
  seed 가 같으면 같은 문제가 나옴.
  화면에서 들어올 때마다(다시 풀 때도) 새 seed 를 넘겨서 매번 다른 단어를 냄
*/
export function generatePhonicsStageQuestions(
  category: PhonicsBankCategory,
  stage: number,
  seed = 0
): PhonicsQuestion[] {
  const safeStage = Math.min(
    getPhonicsStageCount(category),
    Math.max(1, stage)
  );

  const questionCount = getPhonicsQuestionCount(category, safeStage);

  const random = createRandom(
    hashString(`${category}-stage-${safeStage}-${seed}`)
  );

  const stagePool = getStagePool(category, safeStage);

  if (stagePool.length === 0) {
    return [];
  }

  const selectedTargets = arrangeForImageSlots(
    selectTargets(stagePool, questionCount, random)
  );

  const targets =
    category === "short-vowels" || category === "long-vowels"
      ? spreadFillBlankTargets(selectedTargets)
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