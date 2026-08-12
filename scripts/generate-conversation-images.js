const fs = require("fs");
const path = require("path");

const conversationDialogues = [
  { slug: "family", id: "greeting-mom", desc: "a mom and a boy greeting each other happily at home" },
  { slug: "family", id: "greeting-dad", desc: "a dad and a girl greeting each other in the morning" },
  { slug: "family", id: "wheres-my-book", desc: "a sister and brother looking for a book together" },
  { slug: "family", id: "whos-this", desc: "a mom and boy looking at a family photo together" },
  { slug: "family", id: "hello-grandma", desc: "a grandma hugging her grandson happily" },
  { slug: "family", id: "dinner-is-ready", desc: "a family sitting together at the dinner table" },
  { slug: "family", id: "park-with-grandpa", desc: "a grandpa and granddaughter watching birds at the park" },
  { slug: "family", id: "wake-up-sweetie", desc: "a mom waking up her son for breakfast" },
  { slug: "family", id: "look-at-the-baby", desc: "a sister and brother looking at their baby sibling" },
  { slug: "family", id: "weekend-plan", desc: "a family planning a weekend visit together, happy and excited" },

  { slug: "school", id: "good-morning-class", desc: "a teacher greeting a boy student in the morning at school" },
  { slug: "school", id: "whats-your-name", desc: "a boy and girl meeting and introducing themselves at school" },
  { slug: "school", id: "do-you-have-a-pencil", desc: "a teacher and a girl student with a pencil in the classroom" },
  { slug: "school", id: "wheres-the-library", desc: "a girl asking a boy for directions to the library at school" },
  { slug: "school", id: "may-i-go-to-the-bathroom", desc: "a boy raising his hand asking the teacher a question" },
  { slug: "school", id: "lets-play-at-recess", desc: "a boy and girl playing tag at recess" },
  { slug: "school", id: "favorite-subject", desc: "a teacher and boy student talking about drawing and art" },
  { slug: "school", id: "new-student", desc: "a teacher introducing a new girl student to the classroom" },
  { slug: "school", id: "help-with-math", desc: "a girl helping a boy with his math homework" },
  { slug: "school", id: "how-was-your-day", desc: "a teacher and boy student chatting happily after school" },

  { slug: "food", id: "im-hungry", desc: "a hungry boy and girl about to eat lunch together" },
  { slug: "food", id: "what-do-you-want-to-eat", desc: "a boy and girl talking about pizza for lunch" },
  { slug: "food", id: "sweet-apple", desc: "a boy sharing a sweet apple with a girl" },
  { slug: "food", id: "milk-or-juice", desc: "a mom giving a glass of milk to her son" },
  { slug: "food", id: "favorite-food", desc: "a boy and girl talking about their favorite foods, rice and bread" },
  { slug: "food", id: "dinner-is-ready-food", desc: "a dad serving rice and fish for dinner to his daughter" },
  { slug: "food", id: "sharing-snacks", desc: "a boy sharing bread with a girl friend" },
  { slug: "food", id: "at-a-restaurant", desc: "a waiter serving a cake and water to a girl at a restaurant" },
  { slug: "food", id: "cooking-breakfast", desc: "a mom and son cooking breakfast together with eggs and toast" },
  { slug: "food", id: "picnic-day", desc: "a dad and daughter packing a picnic basket with bread and apples" },

  { slug: "weather", id: "hows-the-weather", desc: "a boy and girl looking at a sunny sky" },
  { slug: "weather", id: "its-raining", desc: "a boy and girl with an umbrella in the rain" },
  { slug: "weather", id: "windy-day", desc: "a girl's hat flying away on a windy day, boy laughing" },
  { slug: "weather", id: "snowy-day", desc: "a mom and boy looking at snow outside the window" },
  { slug: "weather", id: "hot-day", desc: "a boy and girl drinking water on a hot sunny day" },
  { slug: "weather", id: "cold-day", desc: "a dad giving a warm jacket to his daughter on a cold day" },
  { slug: "weather", id: "weather-tomorrow", desc: "a boy and girl looking at cloudy sky, planning to meet outside" },
  { slug: "weather", id: "sunny-and-warm", desc: "a teacher and students happily going outside on a sunny warm day" },
  { slug: "weather", id: "cloudy-trip", desc: "a dad and son looking at cloudy sky before a trip" },
  { slug: "weather", id: "favorite-season", desc: "a boy and girl talking about winter snow and sunny days" },

  { slug: "animals", id: "look-at-that-cat", desc: "a boy and girl looking at a cute cat" },
  { slug: "animals", id: "do-you-have-a-pet", desc: "a boy and girl talking about a pet dog" },
  { slug: "animals", id: "rabbit-at-the-zoo", desc: "a boy and girl looking at a fluffy rabbit at the zoo" },
  { slug: "animals", id: "favorite-animal", desc: "a boy and girl talking about bears and birds" },
  { slug: "animals", id: "duck-at-the-pond", desc: "a boy and girl feeding a duck at a pond" },
  { slug: "animals", id: "aquarium-visit", desc: "a boy and girl looking at colorful fish at an aquarium" },
  { slug: "animals", id: "see-the-lions", desc: "a dad and daughter looking at lions at the zoo" },
  { slug: "animals", id: "pet-shop-visit", desc: "a mom and son picking a rabbit at a pet shop" },
  { slug: "animals", id: "farm-visit", desc: "a teacher and students visiting a farm with ducks and cats" },
  { slug: "animals", id: "animal-report", desc: "a boy and girl reading a book about lions at the library" },

  { slug: "daily-routine", id: "wake-up", desc: "a mom waking up her son in the morning" },
  { slug: "daily-routine", id: "time-for-breakfast", desc: "a dad calling his daughter for breakfast" },
  { slug: "daily-routine", id: "brushed-my-teeth", desc: "a mom checking her son brushing his teeth" },
  { slug: "daily-routine", id: "school-time", desc: "a boy and girl walking to school together in the morning" },
  { slug: "daily-routine", id: "morning-routine", desc: "a mom helping her daughter wash her face and get dressed" },
  { slug: "daily-routine", id: "after-school", desc: "a dad and son talking about homework after school" },
  { slug: "daily-routine", id: "evening-routine", desc: "a mom and daughter having dinner together in the evening" },
  { slug: "daily-routine", id: "playtime-with-friends", desc: "a boy finishing homework to play with his girl friend" },
  { slug: "daily-routine", id: "bedtime-routine", desc: "a dad reading a bedtime story to his daughter" },
  { slug: "daily-routine", id: "daily-recap", desc: "a mom and son talking about their happy day together" },
];

async function downloadImage(url, filePath) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`이미지 생성 실패: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(filePath, buffer);
}

async function main() {
  for (const d of conversationDialogues) {
    const folderPath = path.join(process.cwd(), "public", "conversation", d.slug);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const filePath = path.join(folderPath, `${d.id}.png`);

    if (fs.existsSync(filePath)) {
      console.log(`이미 있음: ${d.slug}/${d.id}.png`);
      continue;
    }

    const prompt = `
cute children's illustration of ${d.desc},
white bunny and brown bear style characters,
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
clean illustration,
16:9 ratio
`;

    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;

    console.log(`생성 중: ${d.slug}/${d.id}.png`);
    await downloadImage(url, filePath);

    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  console.log("Conversation 대화 이미지 생성 완료!");
}

main();