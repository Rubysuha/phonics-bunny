export type BookStory = {
  slug: string;
  title: string;
  image: string;
  sentences: string[];
};

export type BookLevel = {
  level: string;
  title: string;
  description: string;
  image: string;
  colorClass: string;
  stories: BookStory[];
};

const makeSlug = (title: string) => title.toLowerCase().replaceAll(" ", "-");

const makeStories = (
  level: string,
  titles: string[],
  sentenceMaker: (title: string) => string[]
): BookStory[] =>
  titles.map((title) => {
    const slug = makeSlug(title);

    return {
      slug,
      title,
      image: `/book/${level}/${slug}.png`,
      sentences: sentenceMaker(title),
    };
  });

export const bookLevels: BookLevel[] = [
  {
    level: "level1",
    title: "Level 1",
    description: "First Words",
    image: "/book/book_level1.png",
    colorClass: "green",
    stories: makeStories(
      "level1",
      [
        "Cat", "Dog", "Pig", "Sun", "Hat", "Bag", "Cup", "Pen", "Book", "Ball",
        "Fish", "Milk", "Cake", "Apple", "Car", "Bus", "Box", "Toy", "Bed", "Chair",
        "Tree", "Flower", "Moon", "Star", "Rain", "Snow", "Egg", "Jam", "Map", "Run",
      ],
      (title) => [title + ".", `This is a ${title.toLowerCase()}.`]
    ),
  },
  {
    level: "level2",
    title: "Level 2",
    description: "Simple Sentences",
    image: "/book/book_level2.png",
    colorClass: "yellow",
    stories: makeStories(
      "level2",
      [
        "My Cat", "My Dog", "My Bag", "My Book", "My Toy", "My Ball",
        "I See a Fish", "I Like Milk", "I Eat Cake", "I Ride a Bus",
        "This Is My Hat", "This Is My Pen", "This Is My Bed", "This Is My Cup",
        "The Sun Is Up", "The Moon Is Bright", "A Red Apple", "A Big Box",
        "A Small Egg", "A Green Tree", "I Can Run", "I Can Jump",
        "I Can Sit", "I Can Play", "My Chair", "My Map", "My Jam",
        "My Flower", "My Star", "My Home",
      ],
      (title) => [`This is ${title.toLowerCase()}.`, "I can read it.", "I like it."]
    ),
  },
  {
    level: "level3",
    title: "Level 3",
    description: "Daily Life",
    image: "/book/book_level3.png",
    colorClass: "pink",
    stories: makeStories(
      "level3",
      [
        "My Morning", "At Home", "At School", "My Friend", "My Family",
        "Lunch Time", "Play Time", "Reading Time", "My Room", "My Desk",
        "My Teacher", "My Class", "My Pet", "My Shoes", "My Bike",
        "A Rainy Day", "A Sunny Day", "A Snowy Day", "Going Home", "Going Outside",
        "Clean Up", "Snack Time", "Bath Time", "Bed Time", "The Park",
        "The Library", "The Bus Stop", "The Playground", "My Birthday", "My Picture",
      ],
      (title) => [
        `This is ${title.toLowerCase()}.`,
        "I see many things.",
        "I feel happy today.",
        "I want to do it again.",
      ]
    ),
  },
  {
    level: "level4",
    title: "Level 4",
    description: "Fun Activities",
    image: "/book/book_level4.png",
    colorClass: "blue",
    stories: makeStories(
      "level4",
      [
        "Playing Soccer", "Riding a Bike", "Drawing Pictures", "Making Cookies",
        "Flying a Kite", "Jumping Rope", "Going Camping", "Making a Sandcastle",
        "Swimming Day", "Picnic Day", "Music Class", "Dance Time",
        "Planting Seeds", "Feeding the Fish", "Building Blocks", "Painting Day",
        "Treasure Hunt", "Bubble Play", "Water Play", "Toy Shop",
        "Puzzle Time", "Making a Card", "Visiting Grandma", "Helping Mom",
        "Helping Dad", "Cleaning My Room", "Cooking Soup", "Taking Photos",
        "Reading with Bunny", "Game Day",
      ],
      (title) => [
        `Today I am ${title.toLowerCase()}.`,
        "I get ready with my friend.",
        "We laugh and play together.",
        "It is a fun day.",
        "I want to try again tomorrow.",
      ]
    ),
  },
  {
    level: "level5",
    title: "Level 5",
    description: "Adventure Stories",
    image: "/book/book_level5.png",
    colorClass: "purple",
    stories: makeStories(
      "level5",
      [
        "The Little Map", "The Lost Bag", "The Big Hill", "The Forest Path",
        "The Blue Boat", "The Train Ride", "The Airport Day", "The Secret Door",
        "The Tiny Key", "The Magic Garden", "The Brave Bunny", "The Friendly Bear",
        "The Night Walk", "The Rainbow Bridge", "The Cloud Trip", "The River Stone",
        "The Hidden Box", "The Tall Tower", "The Windy Road", "The Star Ticket",
        "The Quiet Cave", "The Happy Camp", "The Ocean Walk", "The Mountain Hat",
        "The Green Island", "The Small Lighthouse", "The Sunny Farm", "The Busy Market",
        "The Long Train", "The New Town",
      ],
      (title) => [
        `One day, Bunny finds ${title.toLowerCase()}.`,
        "Bunny looks around carefully.",
        "Bear walks beside Bunny.",
        "They see something new.",
        "They are a little surprised.",
        "At the end, they smile together.",
      ]
    ),
  },
  {
    level: "level6",
    title: "Level 6",
    description: "Longer Stories",
    image: "/book/book_level6.png",
    colorClass: "mint",
    stories: makeStories(
      "level6",
      [
        "Bunny and the Moon", "The Book Under the Tree", "The Cat by the Window",
        "The Long Rainy Day", "The Quiet Night", "The Little Helper",
        "The Best Present", "The Warm Scarf", "The New Neighbor", "The Missing Carrot",
        "The Sleepy Bear", "The Kind Frog", "The Small Promise", "The Big Question",
        "The Starry Room", "The Letter from Friend", "The Secret Picnic",
        "The Winter Story", "The Summer Story", "The Spring Flower",
        "The Autumn Leaves", "The Long Walk Home", "The Library Light",
        "The Dream Train", "The Happy Mistake", "The Brave Choice",
        "The First Stage", "The Last Cookie", "The Night Book", "The Good Memory",
      ],
      (title) => [
        `Bunny reads a story called ${title}.`,
        "At first, Bunny does not understand everything.",
        "Bunny reads slowly and listens carefully.",
        "Bear helps Bunny with a kind voice.",
        "They read the words again and again.",
        "Soon, Bunny can read the story by herself.",
        "Bunny feels proud and closes the book with a smile.",
      ]
    ),
  },
];

export function getBookLevel(level: string) {
  return bookLevels.find((item) => item.level === level);
}

export function getBookStory(level: string, story: string) {
  const currentLevel = getBookLevel(level);
  return currentLevel?.stories.find((item) => item.slug === story);
}