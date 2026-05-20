export type BlendWord = {
  slug: string;
  word: string;
  image: string;
  audio: string;
  worksheet: string;
  sentence: string;
};

export type BlendItem = {
  group: string;
  title: string;
  preview: string;
  words: BlendWord[];
};

export const blendItems: BlendItem[] = [
  {
    group: "l",
    title: "BLEND-L",
    preview: "Black, Clock",
    words: [
      {
        slug: "black",
        word: "Black",
        image: "/blend-sounds/l/black.png",
        audio: "/audio/blend-sounds/black.m4a",
        worksheet: "/worksheets/blend-sounds/black.hwp",
        sentence: "Black",
      },
      {
        slug: "clock",
        word: "Clock",
        image: "/blend-sounds/l/clock.png",
        audio: "/audio/blend-sounds/clock.m4a",
        worksheet: "/worksheets/blend-sounds/clock.hwp",
        sentence: "Clock",
      },
      {
        slug: "flag",
        word: "Flag",
        image: "/blend-sounds/l/flag.png",
        audio: "/audio/blend-sounds/flag.m4a",
        worksheet: "/worksheets/blend-sounds/flag.hwp",
        sentence: "Flag",
      },
      {
        slug: "glue",
        word: "Glue",
        image: "/blend-sounds/l/glue.png",
        audio: "/audio/blend-sounds/glue.m4a",
        worksheet: "/worksheets/blend-sounds/glue.hwp",
        sentence: "Glue",
      },
      {
        slug: "plant",
        word: "Plant",
        image: "/blend-sounds/l/plant.png",
        audio: "/audio/blend-sounds/plant.m4a",
        worksheet: "/worksheets/blend-sounds/plant.hwp",
        sentence: "Plant",
      },
      {
        slug: "slip",
        word: "Slip",
        image: "/blend-sounds/l/slip.png",
        audio: "/audio/blend-sounds/slip.m4a",
        worksheet: "/worksheets/blend-sounds/slip.hwp",
        sentence: "Slip",
      },
    ],
  },
  {
    group: "r",
    title: "BLEND-R",
    preview: "Brush, Crab",
    words: [
      {
        slug: "brush",
        word: "Brush",
        image: "/blend-sounds/r/brush.png",
        audio: "/audio/blend-sounds/brush.m4a",
        worksheet: "/worksheets/blend-sounds/brush.hwp",
        sentence: "Brush",
      },
      {
        slug: "crab",
        word: "Crab",
        image: "/blend-sounds/r/crab.png",
        audio: "/audio/blend-sounds/crab.m4a",
        worksheet: "/worksheets/blend-sounds/crab.hwp",
        sentence: "Crab",
      },
      {
        slug: "drum",
        word: "Drum",
        image: "/blend-sounds/r/drum.png",
        audio: "/audio/blend-sounds/drum.m4a",
        worksheet: "/worksheets/blend-sounds/drum.hwp",
        sentence: "Drum",
      },
      {
        slug: "frog",
        word: "Frog",
        image: "/blend-sounds/r/frog.png",
        audio: "/audio/blend-sounds/frog.m4a",
        worksheet: "/worksheets/blend-sounds/frog.hwp",
        sentence: "Frog",
      },
      {
        slug: "grass",
        word: "Grass",
        image: "/blend-sounds/r/grass.png",
        audio: "/audio/blend-sounds/grass.m4a",
        worksheet: "/worksheets/blend-sounds/grass.hwp",
        sentence: "Grass",
      },
      {
        slug: "print",
        word: "Print",
        image: "/blend-sounds/r/print.png",
        audio: "/audio/blend-sounds/print.m4a",
        worksheet: "/worksheets/blend-sounds/print.hwp",
        sentence: "Print",
      },
      {
        slug: "tree",
        word: "Tree",
        image: "/blend-sounds/r/tree.png",
        audio: "/audio/blend-sounds/tree.m4a",
        worksheet: "/worksheets/blend-sounds/tree.hwp",
        sentence: "Tree",
      },
    ],
  },
  {
    group: "s",
    title: "BLEND-S",
    preview: "School, Ski",
    words: [
      {
        slug: "school",
        word: "School",
        image: "/blend-sounds/s/school.png",
        audio: "/audio/blend-sounds/school.m4a",
        worksheet: "/worksheets/blend-sounds/school.hwp",
        sentence: "School",
      },
      {
        slug: "ski",
        word: "Ski",
        image: "/blend-sounds/s/ski.png",
        audio: "/audio/blend-sounds/ski.m4a",
        worksheet: "/worksheets/blend-sounds/ski.hwp",
        sentence: "Ski",
      },
      {
        slug: "smile",
        word: "Smile",
        image: "/blend-sounds/s/smile.png",
        audio: "/audio/blend-sounds/smile.m4a",
        worksheet: "/worksheets/blend-sounds/smile.hwp",
        sentence: "Smile",
      },
      {
        slug: "snow",
        word: "Snow",
        image: "/blend-sounds/s/snow.png",
        audio: "/audio/blend-sounds/snow.m4a",
        worksheet: "/worksheets/blend-sounds/snow.hwp",
        sentence: "Snow",
      },
      {
        slug: "spoon",
        word: "Spoon",
        image: "/blend-sounds/s/spoon.png",
        audio: "/audio/blend-sounds/spoon.m4a",
        worksheet: "/worksheets/blend-sounds/spoon.hwp",
        sentence: "Spoon",
      },
      {
        slug: "stop",
        word: "Stop",
        image: "/blend-sounds/s/stop.png",
        audio: "/audio/blend-sounds/stop.m4a",
        worksheet: "/worksheets/blend-sounds/stop.hwp",
        sentence: "Stop",
      },
      {
        slug: "swim",
        word: "Swim",
        image: "/blend-sounds/s/swim.png",
        audio: "/audio/blend-sounds/swim.m4a",
        worksheet: "/worksheets/blend-sounds/swim.hwp",
        sentence: "Swim",
      },
    ],
  },
];