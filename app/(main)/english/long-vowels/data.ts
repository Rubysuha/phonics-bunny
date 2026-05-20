export type LongVowelWord = {
  slug: string;
  word: string;
  image: string;
  audio: string;
  worksheet: string;
  sentence: string;
};

export type LongVowelItem = {
  vowel: string;
  upper: string;
  lower: string;
  preview: string;
  words: LongVowelWord[];
};

export const longVowelItems: LongVowelItem[] = [
  {
    vowel: "a",
    upper: "A",
    lower: "a",
    preview: "Cake, Day",
    words: [
      { slug: "cake", word: "Cake", image: "/long-vowels/a/cake.png", audio: "/audio/long-vowels/cake.m4a", worksheet: "/worksheets/long-vowels/cake.hwp", sentence: "Cake" },
      { slug: "day", word: "Day", image: "/long-vowels/a/day.png", audio: "/audio/long-vowels/day.m4a", worksheet: "/worksheets/long-vowels/day.hwp", sentence: "Day" },
      { slug: "game", word: "Game", image: "/long-vowels/a/game.png", audio: "/audio/long-vowels/game.m4a", worksheet: "/worksheets/long-vowels/game.hwp", sentence: "Game" },
      { slug: "name", word: "Name", image: "/long-vowels/a/name.png", audio: "/audio/long-vowels/name.m4a", worksheet: "/worksheets/long-vowels/name.hwp", sentence: "Name" },
      { slug: "plane", word: "Plane", image: "/long-vowels/a/plane.png", audio: "/audio/long-vowels/plane.m4a", worksheet: "/worksheets/long-vowels/plane.hwp", sentence: "Plane" },
      { slug: "rain", word: "Rain", image: "/long-vowels/a/rain.png", audio: "/audio/long-vowels/rain.m4a", worksheet: "/worksheets/long-vowels/rain.hwp", sentence: "Rain" },
    ],
  },
  {
    vowel: "e",
    upper: "E",
    lower: "e",
    preview: "Bee, Feet",
    words: [
      { slug: "bee", word: "Bee", image: "/long-vowels/e/bee.png", audio: "/audio/long-vowels/bee.m4a", worksheet: "/worksheets/long-vowels/bee.hwp", sentence: "Bee" },
      { slug: "feet", word: "Feet", image: "/long-vowels/e/feet.png", audio: "/audio/long-vowels/feet.m4a", worksheet: "/worksheets/long-vowels/feet.hwp", sentence: "Feet" },
      { slug: "green", word: "Green", image: "/long-vowels/e/green.png", audio: "/audio/long-vowels/green.m4a", worksheet: "/worksheets/long-vowels/green.hwp", sentence: "Green" },
      { slug: "eat", word: "Eat", image: "/long-vowels/e/eat.png", audio: "/audio/long-vowels/eat.m4a", worksheet: "/worksheets/long-vowels/eat.hwp", sentence: "Eat" },
      { slug: "sheep", word: "Sheep", image: "/long-vowels/e/sheep.png", audio: "/audio/long-vowels/sheep.m4a", worksheet: "/worksheets/long-vowels/sheep.hwp", sentence: "Sheep" },
      { slug: "teeth", word: "Teeth", image: "/long-vowels/e/teeth.png", audio: "/audio/long-vowels/teeth.m4a", worksheet: "/worksheets/long-vowels/teeth.hwp", sentence: "Teeth" },
    ],
  },
  {
    vowel: "i",
    upper: "I",
    lower: "i",
    preview: "Bike, Kite",
    words: [
      { slug: "bike", word: "Bike", image: "/long-vowels/i/bike.png", audio: "/audio/long-vowels/bike.m4a", worksheet: "/worksheets/long-vowels/bike.hwp", sentence: "Bike" },
      { slug: "kite", word: "Kite", image: "/long-vowels/i/kite.png", audio: "/audio/long-vowels/kite.m4a", worksheet: "/worksheets/long-vowels/kite.hwp", sentence: "Kite" },
      { slug: "light", word: "Light", image: "/long-vowels/i/light.png", audio: "/audio/long-vowels/light.m4a", worksheet: "/worksheets/long-vowels/light.hwp", sentence: "Light" },
      { slug: "line", word: "Line", image: "/long-vowels/i/line.png", audio: "/audio/long-vowels/line.m4a", worksheet: "/worksheets/long-vowels/line.hwp", sentence: "Line" },
      { slug: "slide", word: "Slide", image: "/long-vowels/i/slide.png", audio: "/audio/long-vowels/slide.m4a", worksheet: "/worksheets/long-vowels/slide.hwp", sentence: "Slide" },
      { slug: "time", word: "Time", image: "/long-vowels/i/time.png", audio: "/audio/long-vowels/time.m4a", worksheet: "/worksheets/long-vowels/time.hwp", sentence: "Time" },
    ],
  },
  {
    vowel: "o",
    upper: "O",
    lower: "o",
    preview: "Go, Home",
    words: [
      { slug: "go", word: "Go", image: "/long-vowels/o/go.png", audio: "/audio/long-vowels/go.m4a", worksheet: "/worksheets/long-vowels/go.hwp", sentence: "Go" },
      { slug: "home", word: "Home", image: "/long-vowels/o/home.png", audio: "/audio/long-vowels/home.m4a", worksheet: "/worksheets/long-vowels/home.hwp", sentence: "Home" },
      { slug: "nose", word: "Nose", image: "/long-vowels/o/nose.png", audio: "/audio/long-vowels/nose.m4a", worksheet: "/worksheets/long-vowels/nose.hwp", sentence: "Nose" },
      { slug: "rope", word: "Rope", image: "/long-vowels/o/rope.png", audio: "/audio/long-vowels/rope.m4a", worksheet: "/worksheets/long-vowels/rope.hwp", sentence: "Rope" },
      { slug: "rose", word: "Rose", image: "/long-vowels/o/rose.png", audio: "/audio/long-vowels/rose.m4a", worksheet: "/worksheets/long-vowels/rose.hwp", sentence: "Rose" },
      { slug: "stone", word: "Stone", image: "/long-vowels/o/stone.png", audio: "/audio/long-vowels/stone.m4a", worksheet: "/worksheets/long-vowels/stone.hwp", sentence: "Stone" },
    ],
  },
  {
    vowel: "u",
    upper: "U",
    lower: "u",
    preview: "Cube, Cute",
    words: [
      { slug: "cube", word: "Cube", image: "/long-vowels/u/cube.png", audio: "/audio/long-vowels/cube.m4a", worksheet: "/worksheets/long-vowels/cube.hwp", sentence: "Cube" },
      { slug: "cute", word: "Cute", image: "/long-vowels/u/cute.png", audio: "/audio/long-vowels/cute.m4a", worksheet: "/worksheets/long-vowels/cute.hwp", sentence: "Cute" },
      { slug: "mule", word: "Mule", image: "/long-vowels/u/mule.png", audio: "/audio/long-vowels/mule.m4a", worksheet: "/worksheets/long-vowels/mule.hwp", sentence: "Mule" },
      { slug: "flute", word: "Flute", image: "/long-vowels/u/flute.png", audio: "/audio/long-vowels/flute.m4a", worksheet: "/worksheets/long-vowels/flute.hwp", sentence: "Flute" },
      { slug: "rule", word: "Rule", image: "/long-vowels/u/rule.png", audio: "/audio/long-vowels/rule.m4a", worksheet: "/worksheets/long-vowels/rule.hwp", sentence: "Rule" },
      { slug: "tube", word: "Tube", image: "/long-vowels/u/tube.png", audio: "/audio/long-vowels/tube.m4a", worksheet: "/worksheets/long-vowels/tube.hwp", sentence: "Tube" },
    ],
  },
];