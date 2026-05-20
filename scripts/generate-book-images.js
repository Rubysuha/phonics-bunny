const fs = require("fs");
const path = require("path");

const bookLevels = [
  {
    level: "level1",
    stories: [
      "Cat", "Dog", "Pig", "Sun", "Hat", "Bag", "Cup", "Pen", "Book", "Ball",
      "Fish", "Milk", "Cake", "Apple", "Car", "Bus", "Box", "Toy", "Bed", "Chair",
      "Tree", "Flower", "Moon", "Star", "Rain", "Snow", "Egg", "Jam", "Map", "Run",
    ],
  },
  {
    level: "level2",
    stories: [
      "My Cat", "My Dog", "My Bag", "My Book", "My Toy", "My Ball",
      "I See a Fish", "I Like Milk", "I Eat Cake", "I Ride a Bus",
      "This Is My Hat", "This Is My Pen", "This Is My Bed", "This Is My Cup",
      "The Sun Is Up", "The Moon Is Bright", "A Red Apple", "A Big Box",
      "A Small Egg", "A Green Tree", "I Can Run", "I Can Jump",
      "I Can Sit", "I Can Play", "My Chair", "My Map", "My Jam",
      "My Flower", "My Star", "My Home",
    ],
  },
  {
    level: "level3",
    stories: [
      "My Morning", "At Home", "At School", "My Friend", "My Family",
      "Lunch Time", "Play Time", "Reading Time", "My Room", "My Desk",
      "My Teacher", "My Class", "My Pet", "My Shoes", "My Bike",
      "A Rainy Day", "A Sunny Day", "A Snowy Day", "Going Home", "Going Outside",
      "Clean Up", "Snack Time", "Bath Time", "Bed Time", "The Park",
      "The Library", "The Bus Stop", "The Playground", "My Birthday", "My Picture",
    ],
  },
  {
    level: "level4",
    stories: [
      "Playing Soccer", "Riding a Bike", "Drawing Pictures", "Making Cookies",
      "Flying a Kite", "Jumping Rope", "Going Camping", "Making a Sandcastle",
      "Swimming Day", "Picnic Day", "Music Class", "Dance Time",
      "Planting Seeds", "Feeding the Fish", "Building Blocks", "Painting Day",
      "Treasure Hunt", "Bubble Play", "Water Play", "Toy Shop",
      "Puzzle Time", "Making a Card", "Visiting Grandma", "Helping Mom",
      "Helping Dad", "Cleaning My Room", "Cooking Soup", "Taking Photos",
      "Reading with Bunny", "Game Day",
    ],
  },
  {
    level: "level5",
    stories: [
      "The Little Map", "The Lost Bag", "The Big Hill", "The Forest Path",
      "The Blue Boat", "The Train Ride", "The Airport Day", "The Secret Door",
      "The Tiny Key", "The Magic Garden", "The Brave Bunny", "The Friendly Bear",
      "The Night Walk", "The Rainbow Bridge", "The Cloud Trip", "The River Stone",
      "The Hidden Box", "The Tall Tower", "The Windy Road", "The Star Ticket",
      "The Quiet Cave", "The Happy Camp", "The Ocean Walk", "The Mountain Hat",
      "The Green Island", "The Small Lighthouse", "The Sunny Farm", "The Busy Market",
      "The Long Train", "The New Town",
    ],
  },
  {
    level: "level6",
    stories: [
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
  },
];

const toSlug = (title) => title.toLowerCase().replaceAll(" ", "-");

async function downloadImage(url, filePath) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`이미지 생성 실패: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(filePath, buffer);
}

async function main() {
  for (const level of bookLevels) {
    const folderPath = path.join(process.cwd(), "public", "book", level.level);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    for (const title of level.stories) {
      const slug = toSlug(title);
      const filePath = path.join(folderPath, `${slug}.png`);

      if (fs.existsSync(filePath)) {
        console.log(`이미 있음: ${level.level}/${slug}.png`);
        continue;
      }

      const prompt = `
cute children's illustration of ${title},
white bunny and brown bear,
playing together in a natural scene,
soft pastel cartoon style,
bright warm colors,
full wide background,
landscape composition,
fill entire frame,
no words,
no letters,
no text,
no typography,
no watermark,
no logo,
no book cover,
clean illustration,
16:9 ratio
`;

      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;

      console.log(`생성 중: ${level.level}/${slug}.png`);
      await downloadImage(url, filePath);

      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  console.log("Book 이미지 생성 완료!");
}

main();