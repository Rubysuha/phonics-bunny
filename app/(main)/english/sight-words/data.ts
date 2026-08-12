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
      { slug: "the", word: "the", audio: "/audio/sight-words/the.mp3" },
      { slug: "to", word: "to", audio: "/audio/sight-words/to.mp3" },
      { slug: "is", word: "is", audio: "/audio/sight-words/is.mp3" },
      { slug: "go", word: "go", audio: "/audio/sight-words/go.mp3" },
      { slug: "i", word: "I", audio: "/audio/sight-words/I.mp3" },
      { slug: "you", word: "you", audio: "/audio/sight-words/you.mp3" },
      { slug: "it", word: "it", audio: "/audio/sight-words/it.mp3" },
      { slug: "in", word: "in", audio: "/audio/sight-words/in.mp3" },
      { slug: "on", word: "on", audio: "/audio/sight-words/on.mp3" },
      { slug: "at", word: "at", audio: "/audio/sight-words/at.mp3" },
    ],
  },
  {
    level: "level-2",
    title: "Level 2",
    preview: "we, he, she, my",
    worksheet: "/worksheets/sight-words/level2.hwp",
    words: [
      { slug: "we", word: "we", audio: "/audio/sight-words/we.mp3" },
      { slug: "he", word: "he", audio: "/audio/sight-words/he.mp3" },
      { slug: "she", word: "she", audio: "/audio/sight-words/she.mp3" },
      { slug: "my", word: "my", audio: "/audio/sight-words/my.mp3" },
      { slug: "me", word: "me", audio: "/audio/sight-words/me.mp3" },
      { slug: "can", word: "can", audio: "/audio/sight-words/can.mp3" },
      { slug: "see", word: "see", audio: "/audio/sight-words/see.mp3" },
      { slug: "up", word: "up", audio: "/audio/sight-words/up.mp3" },
      { slug: "no", word: "no", audio: "/audio/sight-words/no.mp3" },
      { slug: "yes", word: "yes", audio: "/audio/sight-words/yes.mp3" },
    ],
  },
  {
    level: "level-3",
    title: "Level 3",
    preview: "like, look, come, here",
    worksheet: "/worksheets/sight-words/level3.hwp",
    words: [
      { slug: "like", word: "like", audio: "/audio/sight-words/like.mp3" },
      { slug: "look", word: "look", audio: "/audio/sight-words/look.mp3" },
      { slug: "come", word: "come", audio: "/audio/sight-words/come.mp3" },
      { slug: "here", word: "here", audio: "/audio/sight-words/here.mp3" },
      { slug: "this", word: "this", audio: "/audio/sight-words/this.mp3" },
      { slug: "that", word: "that", audio: "/audio/sight-words/that.mp3" },
      { slug: "big", word: "big", audio: "/audio/sight-words/big.mp3" },
      { slug: "little", word: "little", audio: "/audio/sight-words/little.mp3" },
      { slug: "run", word: "run", audio: "/audio/sight-words/run.mp3" },
      { slug: "jump", word: "jump", audio: "/audio/sight-words/jump.mp3" },
    ],
  },
];