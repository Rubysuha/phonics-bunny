export type ShortVowelWord = {
  slug: string;
  word: string;
  image: string;
  audio: string;
  worksheet: string;
  sentence: string;
};

export type ShortVowelItem = {
  vowel: string;
  upper: string;
  lower: string;
  preview: string;
  words: ShortVowelWord[];
};

export const shortVowelItems: ShortVowelItem[] = [
  {
    vowel: "a",
    upper: "A",
    lower: "a",
    preview: "Cat, Hat",
    words: [
      { slug: "cat", word: "Cat", image: "/short-vowels/a/cat.png", audio: "/audio/short-vowels/cat.m4a", worksheet: "/worksheets/short-vowels/cat.hwp", sentence: "Cat" },
      { slug: "hat", word: "Hat", image: "/short-vowels/a/hat.png", audio: "/audio/short-vowels/hat.m4a", worksheet: "/worksheets/short-vowels/hat.hwp", sentence: "Hat" },
      { slug: "bat", word: "Bat", image: "/short-vowels/a/bat.png", audio: "/audio/short-vowels/bat.m4a", worksheet: "/worksheets/short-vowels/bat.hwp", sentence: "Bat" },
      { slug: "jam", word: "Jam", image: "/short-vowels/a/jam.png", audio: "/audio/short-vowels/jam.m4a", worksheet: "/worksheets/short-vowels/jam.hwp", sentence: "Jam" },
      { slug: "map", word: "Map", image: "/short-vowels/a/map.png", audio: "/audio/short-vowels/map.m4a", worksheet: "/worksheets/short-vowels/map.hwp", sentence: "Map" },
      { slug: "man", word: "Man", image: "/short-vowels/a/man.png", audio: "/audio/short-vowels/man.m4a", worksheet: "/worksheets/short-vowels/man.hwp", sentence: "Man" },
    ],
  },

  {
    vowel: "e",
    upper: "E",
    lower: "e",
    preview: "Bed, Pen",
    words: [
      { slug: "bed", word: "Bed", image: "/short-vowels/e/bed.png", audio: "/audio/short-vowels/bed.m4a", worksheet: "/worksheets/short-vowels/bed.hwp", sentence: "Bed" },
      { slug: "pen", word: "Pen", image: "/short-vowels/e/pen.png", audio: "/audio/short-vowels/pen.m4a", worksheet: "/worksheets/short-vowels/pen.hwp", sentence: "Pen" },
      { slug: "red", word: "Red", image: "/short-vowels/e/red.png", audio: "/audio/short-vowels/red.m4a", worksheet: "/worksheets/short-vowels/red.hwp", sentence: "Red" },
      { slug: "net", word: "Net", image: "/short-vowels/e/net.png", audio: "/audio/short-vowels/net.m4a", worksheet: "/worksheets/short-vowels/net.hwp", sentence: "Net" },
      { slug: "hen", word: "Hen", image: "/short-vowels/e/hen.png", audio: "/audio/short-vowels/hen.m4a", worksheet: "/worksheets/short-vowels/hen.hwp", sentence: "Hen" },
      { slug: "leg", word: "Leg", image: "/short-vowels/e/leg.png", audio: "/audio/short-vowels/leg.m4a", worksheet: "/worksheets/short-vowels/leg.hwp", sentence: "Leg" },
    ],
  },

  {
    vowel: "i",
    upper: "I",
    lower: "i",
    preview: "Sit, Pig",
    words: [
      { slug: "sit", word: "Sit", image: "/short-vowels/i/sit.png", audio: "/audio/short-vowels/sit.m4a", worksheet: "/worksheets/short-vowels/sit.hwp", sentence: "Sit" },
      { slug: "pig", word: "Pig", image: "/short-vowels/i/pig.png", audio: "/audio/short-vowels/pig.m4a", worksheet: "/worksheets/short-vowels/pig.hwp", sentence: "Pig" },
      { slug: "lip", word: "Lip", image: "/short-vowels/i/lip.png", audio: "/audio/short-vowels/lip.m4a", worksheet: "/worksheets/short-vowels/lip.hwp", sentence: "Lip" },
      { slug: "fish", word: "Fish", image: "/short-vowels/i/fish.png", audio: "/audio/short-vowels/fish.m4a", worksheet: "/worksheets/short-vowels/fish.hwp", sentence: "Fish" },
      { slug: "milk", word: "Milk", image: "/short-vowels/i/milk.png", audio: "/audio/short-vowels/milk.m4a", worksheet: "/worksheets/short-vowels/milk.hwp", sentence: "Milk" },
      { slug: "kick", word: "Kick", image: "/short-vowels/i/kick.png", audio: "/audio/short-vowels/kick.m4a", worksheet: "/worksheets/short-vowels/kick.hwp", sentence: "Kick" },
    ],
  },

  {
    vowel: "o",
    upper: "O",
    lower: "o",
    preview: "Hot, Dog",
    words: [
      { slug: "hot", word: "Hot", image: "/short-vowels/o/hot.png", audio: "/audio/short-vowels/hot.m4a", worksheet: "/worksheets/short-vowels/hot.hwp", sentence: "Hot" },
      { slug: "dog", word: "Dog", image: "/short-vowels/o/dog.png", audio: "/audio/short-vowels/dog.m4a", worksheet: "/worksheets/short-vowels/dog.hwp", sentence: "Dog" },
      { slug: "box", word: "Box", image: "/short-vowels/o/box.png", audio: "/audio/short-vowels/box.m4a", worksheet: "/worksheets/short-vowels/box.hwp", sentence: "Box" },
      { slug: "top", word: "Top", image: "/short-vowels/o/top.png", audio: "/audio/short-vowels/top.m4a", worksheet: "/worksheets/short-vowels/top.hwp", sentence: "Top" },
      { slug: "rock", word: "Rock", image: "/short-vowels/o/rock.png", audio: "/audio/short-vowels/rock.m4a", worksheet: "/worksheets/short-vowels/rock.hwp", sentence: "Rock" },
      { slug: "sock", word: "Sock", image: "/short-vowels/o/sock.png", audio: "/audio/short-vowels/sock.m4a", worksheet: "/worksheets/short-vowels/sock.hwp", sentence: "Sock" },
    ],
  },

  {
    vowel: "u",
    upper: "U",
    lower: "u",
    preview: "Sun, Cup",
    words: [
      { slug: "sun", word: "Sun", image: "/short-vowels/u/sun.png", audio: "/audio/short-vowels/sun.m4a", worksheet: "/worksheets/short-vowels/sun.hwp", sentence: "Sun" },
      { slug: "cup", word: "Cup", image: "/short-vowels/u/cup.png", audio: "/audio/short-vowels/cup.m4a", worksheet: "/worksheets/short-vowels/cup.hwp", sentence: "Cup" },
      { slug: "bus", word: "Bus", image: "/short-vowels/u/bus.png", audio: "/audio/short-vowels/bus.m4a", worksheet: "/worksheets/short-vowels/bus.hwp", sentence: "Bus" },
      { slug: "mud", word: "Mud", image: "/short-vowels/u/mud.png", audio: "/audio/short-vowels/mud.m4a", worksheet: "/worksheets/short-vowels/mud.hwp", sentence: "Mud" },
      { slug: "run", word: "Run", image: "/short-vowels/u/run.png", audio: "/audio/short-vowels/run.m4a", worksheet: "/worksheets/short-vowels/run.hwp", sentence: "Run" },
      { slug: "bug", word: "Bug", image: "/short-vowels/u/bug.png", audio: "/audio/short-vowels/bug.m4a", worksheet: "/worksheets/short-vowels/bug.hwp", sentence: "Bug" },
    ],
  },
];