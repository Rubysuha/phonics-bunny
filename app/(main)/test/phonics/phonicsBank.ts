import { alphabetItems } from "@/app/(main)/english/alphabet/data";
import { shortVowelItems } from "@/app/(main)/english/short-vowels/data";
import { longVowelItems } from "@/app/(main)/english/long-vowels/data";
import { blendItems } from "@/app/(main)/english/blend-sounds/data";
import { sightWordLevels } from "@/app/(main)/english/sight-words/data";
import type { PhonicsTestCategoryId } from "@/lib/phonicsTestRules";

/* ─────────────────────────────
   Category
───────────────────────────── */

export type PhonicsBankCategory =
  PhonicsTestCategoryId;

/* ─────────────────────────────
   공통 Test용 데이터 타입
───────────────────────────── */

export type PhonicsBankItem = {
  /*
    Test 안에서 사용하는 고유 ID
    예:
    alphabet-a
    short-vowels-a-cat
    long-vowels-i-bike
  */
  id: string;

  category: PhonicsBankCategory;

  /*
    하위 그룹

    alphabet     → a, b, c...
    short-vowels → a, e, i, o, u
    long-vowels  → a, e, i, o, u
    blend-sounds → l, r, s
    sight-words  → level-1, level-2...
  */
  group: string;

  /*
    실제 학습 단어
  */
  word: string;

  /*
    기존 원본 데이터의 slug
  */
  slug: string;

  /*
    이미지가 있는 영역에서만 존재
    Sight Words에는 없어도 됨
  */
  image?: string;

  /*
    기존 Phonics 음원
  */
  audio?: string;

  /*
    Alphabet에서 사용
  */
  letter?: string;
  upper?: string;
  lower?: string;
};

/* ─────────────────────────────
   Alphabet
───────────────────────────── */

export const alphabetBank: PhonicsBankItem[] =
  alphabetItems.map((item) => ({
    id: `alphabet-${item.letter}`,

    category: "alphabet",

    group: item.letter,

    slug: item.letter,

    word: item.word,

    image: item.image,

    audio: item.audio,

    letter: item.letter,

    upper: item.upper,

    lower: item.lower,
  }));

/* ─────────────────────────────
   Short Vowels
───────────────────────────── */

export const shortVowelBank: PhonicsBankItem[] =
  shortVowelItems.flatMap((vowel) =>
    vowel.words.map((item) => ({
      id: `short-vowels-${vowel.vowel}-${item.slug}`,

      category: "short-vowels",

      group: vowel.vowel,

      slug: item.slug,

      word: item.word,

      image: item.image,

      audio: item.audio,
    }))
  );

/* ─────────────────────────────
   Long Vowels
───────────────────────────── */

export const longVowelBank: PhonicsBankItem[] =
  longVowelItems.flatMap((vowel) =>
    vowel.words.map((item) => ({
      id: `long-vowels-${vowel.vowel}-${item.slug}`,

      category: "long-vowels",

      group: vowel.vowel,

      slug: item.slug,

      word: item.word,

      image: item.image,

      audio: item.audio,
    }))
  );

/* ─────────────────────────────
   Blend Sounds
───────────────────────────── */

export const blendBank: PhonicsBankItem[] =
  blendItems.flatMap((blend) =>
    blend.words.map((item) => ({
      id: `blend-sounds-${blend.group}-${item.slug}`,

      category: "blend-sounds",

      group: blend.group,

      slug: item.slug,

      word: item.word,

      image: item.image,

      audio: item.audio,
    }))
  );

/* ─────────────────────────────
   Sight Words
───────────────────────────── */

export const sightWordBank: PhonicsBankItem[] =
  sightWordLevels.flatMap((level) =>
    level.words.map((item) => ({
      id: `sight-words-${level.level}-${item.slug}`,

      category: "sight-words",

      group: level.level,

      slug: item.slug,

      word: item.word,

      audio: item.audio,

      /*
        Sight Words는 현재 원본 데이터에
        image가 없기 때문에 넣지 않음
      */
    }))
  );

/* ─────────────────────────────
   전체 Phonics Bank
───────────────────────────── */

export const phonicsBank: PhonicsBankItem[] = [
  ...alphabetBank,
  ...shortVowelBank,
  ...longVowelBank,
  ...blendBank,
  ...sightWordBank,
];

/* ─────────────────────────────
   Helper Functions
───────────────────────────── */

/*
  특정 카테고리의 모든 데이터

  예:
  getPhonicsBankByCategory("short-vowels")
*/
export function getPhonicsBankByCategory(
  category: PhonicsBankCategory
): PhonicsBankItem[] {
  return phonicsBank.filter(
    (item) => item.category === category
  );
}

/*
  특정 카테고리 + 그룹

  예:
  Short A 단어 전체

  getPhonicsBankByGroup(
    "short-vowels",
    "a"
  )
*/
export function getPhonicsBankByGroup(
  category: PhonicsBankCategory,
  group: string
): PhonicsBankItem[] {
  return phonicsBank.filter(
    (item) =>
      item.category === category &&
      item.group === group
  );
}

/*
  ID로 한 개 찾기
*/
export function getPhonicsBankItem(
  id: string
): PhonicsBankItem | undefined {
  return phonicsBank.find(
    (item) => item.id === id
  );
}

/*
  단어로 찾기

  같은 단어가 여러 영역에 있을 수 있어서
  배열로 반환함.

  예:
  cat은 Alphabet C에도 있을 수 있고
  Short A에도 있을 수 있음.
*/
export function findPhonicsWords(
  word: string
): PhonicsBankItem[] {
  const normalized =
    word.trim().toLowerCase();

  return phonicsBank.filter(
    (item) =>
      item.word.trim().toLowerCase() ===
      normalized
  );
}

/*
  이미지가 있는 데이터만 가져오기

  Picture Quiz 만들 때 사용
*/
export function getImageBank(
  category?: PhonicsBankCategory
): PhonicsBankItem[] {
  return phonicsBank.filter((item) => {
    if (!item.image) return false;

    if (!category) return true;

    return item.category === category;
  });
}

/*
  음원이 있는 데이터만 가져오기

  Listen Quiz 만들 때 사용
*/
export function getAudioBank(
  category?: PhonicsBankCategory
): PhonicsBankItem[] {
  return phonicsBank.filter((item) => {
    if (!item.audio) return false;

    if (!category) return true;

    return item.category === category;
  });
}