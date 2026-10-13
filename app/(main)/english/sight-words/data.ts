import { wordAssets } from "../wordAssets";

export type SightWordItem = {
  slug: string;
  word: string;
  audio: string;
};

export type SightWordLevel = {
  level: string;
  title: string;
  preview: string;

  /* 한글 자료 · 메뉴 그림이 아직 없으면 "" */
  worksheet: string;
  menuImage: string;

  words: SightWordItem[];
};

const asset = (path: string) => (wordAssets.has(path) ? path : "");

function makeLevel(
  level: string,
  title: string,
  preview: string,
  file: string,
  list: string
): SightWordLevel {
  return {
    level,
    title,
    preview,
    worksheet: asset(`/worksheets/sight-words/${file}.hwp`),
    menuImage: asset(`/sight-words/menu/${file}.png`),
    words: list
      .split(",")
      .map((word) => word.trim())
      .filter(Boolean)
      .map((word) => ({
        slug: word.toLowerCase(),
        word,
        audio: `/audio/sight-words/${word}.mp3`,
      })),
  };
}

export const sightWordLevels: SightWordLevel[] = [
  makeLevel(
    "level-1",
    "Level 1",
    "the, to, is, go",
    "level1",
    "the, to, is, go, I, you, it, in, on, at, a, an, am, " +
    "are, be, do, of, and, for, as, by, or, so, if, us, now, " +
    "too, yet, our, let"
  ),
  makeLevel(
    "level-2",
    "Level 2",
    "we, he, she, my",
    "level2",
    "we, he, she, my, me, can, see, up, no, yes, was, were, " +
    "has, have, had, did, not, but, all, one, two, three, " +
    "four, five, out, down, off, with, his, her"
  ),
  makeLevel(
    "level-3",
    "Level 3",
    "like, look, come, here",
    "level3",
    "like, look, come, here, this, that, big, little, run, " +
    "jump, said, say, make, take, give, get, find, help, " +
    "play, want, good, bad, happy, sad, new, old, fast, " +
    "slow, away, back"
  ),
  makeLevel(
    "level-4",
    "Level 4",
    "because, before, after",
    "level4",
    "because, before, after, about, again, always, never, " +
    "every, some, many, more, most, other, another, first, " +
    "last, next, under, over, between, around, where, when, " +
    "what, why, who, which, how, there, very"
  ),
  makeLevel(
    "level-5",
    "Level 5",
    "could, would, should",
    "level5",
    "could, would, should, might, must, their, they, them, " +
    "these, those, people, friend, family, once, twice, any, " +
    "anything, something, everyone, through"
  ),
];
