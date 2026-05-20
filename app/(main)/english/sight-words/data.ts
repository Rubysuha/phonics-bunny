export type SightWordItem = {
  slug: string;
  word: string;
  audio: string;
};

export type SightWordLevel = {
  level: string;
  title: string;
  preview: string;
  worksheet: string;
  words: SightWordItem[];
};

export const sightWordLevels: SightWordLevel[] = [
  {
    level: "level-1",
    title: "Level 1",
    preview: "the, to, is, go",
    worksheet: "/worksheets/sight-words/level1.hwp",
    words: [
      { slug: "the", word: "the", audio: "/audio/sight-words/the.m4a" },
      { slug: "to", word: "to", audio: "/audio/sight-words/to.m4a" },
      { slug: "is", word: "is", audio: "/audio/sight-words/is.m4a" },
      { slug: "go", word: "go", audio: "/audio/sight-words/go.m4a" },
      { slug: "i", word: "I", audio: "/audio/sight-words/I.m4a" },
      { slug: "you", word: "you", audio: "/audio/sight-words/you.m4a" },
      { slug: "it", word: "it", audio: "/audio/sight-words/it.m4a" },
      { slug: "in", word: "in", audio: "/audio/sight-words/in.m4a" },
      { slug: "on", word: "on", audio: "/audio/sight-words/on.m4a" },
      { slug: "at", word: "at", audio: "/audio/sight-words/at.m4a" },
    ],
  },
  {
    level: "level-2",
    title: "Level 2",
    preview: "we, he, she, my",
    worksheet: "/worksheets/sight-words/level2.hwp",
    words: [
      { slug: "we", word: "we", audio: "/audio/sight-words/we.m4a" },
      { slug: "he", word: "he", audio: "/audio/sight-words/he.m4a" },
      { slug: "she", word: "she", audio: "/audio/sight-words/she.m4a" },
      { slug: "my", word: "my", audio: "/audio/sight-words/my.m4a" },
      { slug: "me", word: "me", audio: "/audio/sight-words/me.m4a" },
      { slug: "can", word: "can", audio: "/audio/sight-words/can.m4a" },
      { slug: "see", word: "see", audio: "/audio/sight-words/see.m4a" },
      { slug: "up", word: "up", audio: "/audio/sight-words/up.m4a" },
      { slug: "no", word: "no", audio: "/audio/sight-words/no.m4a" },
      { slug: "yes", word: "yes", audio: "/audio/sight-words/yes.m4a" },
    ],
  },
  {
    level: "level-3",
    title: "Level 3",
    preview: "like, look, come, here",
    worksheet: "/worksheets/sight-words/level3.hwp",
    words: [
      { slug: "like", word: "like", audio: "/audio/sight-words/like.m4a" },
      { slug: "look", word: "look", audio: "/audio/sight-words/look.m4a" },
      { slug: "come", word: "come", audio: "/audio/sight-words/come.m4a" },
      { slug: "here", word: "here", audio: "/audio/sight-words/here.m4a" },
      { slug: "this", word: "this", audio: "/audio/sight-words/this.m4a" },
      { slug: "that", word: "that", audio: "/audio/sight-words/that.m4a" },
      { slug: "big", word: "big", audio: "/audio/sight-words/big.m4a" },
      { slug: "little", word: "little", audio: "/audio/sight-words/little.m4a" },
      { slug: "run", word: "run", audio: "/audio/sight-words/run.m4a" },
      { slug: "jump", word: "jump", audio: "/audio/sight-words/jump.m4a" },
    ],
  },
];