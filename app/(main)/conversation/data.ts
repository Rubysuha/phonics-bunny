export type ConversationLine = {
  role: string;
  gender: "male" | "female";
  text: string;
  audio: string;
};

export type ConversationDialogue = {
  id: string;
  title: string;
  lines: ConversationLine[];
  keywords: string[];
  level: number;
  image: string;
};

export type ConversationCategory = {
  slug: string;
  title: string;
  description: string;
  preview: string;
  color: "pink" | "blue" | "yellow" | "mint" | "purple" | "cream";
  menuImage: string;
  dialogues: ConversationDialogue[];
};

export const conversationCategories: ConversationCategory[] = [
  {
    slug: "family",
    title: "Family",
    description: "가족과 나누는 짧은 대화를 연습해 보세요.",
    preview: "mom, dad, family",
    color: "pink",
    menuImage: "/conversation/menu/family.png",
    dialogues: [
      {
        id: "greeting-mom", title: "Greeting Mom", level: 1, keywords: ["mom", "hello"],
        image: "/conversation/family/greeting-mom.png",
        lines: [
          { role: "Mom", gender: "female", text: "Hello!", audio: "/audio/conversation/greeting-mom-0.mp3" },
          { role: "Boy", gender: "male", text: "Hi, Mom!", audio: "/audio/conversation/greeting-mom-1.mp3" },
        ],
      },
      {
        id: "greeting-dad", title: "Good Morning, Dad", level: 2, keywords: ["dad", "morning"],
        image: "/conversation/family/greeting-dad.png",
        lines: [
          { role: "Dad", gender: "male", text: "Good morning!", audio: "/audio/conversation/greeting-dad-0.mp3" },
          { role: "Girl", gender: "female", text: "Good morning, Dad!", audio: "/audio/conversation/greeting-dad-1.mp3" },
        ],
      },
      {
        id: "wheres-my-book", title: "Where Is My Book?", level: 3, keywords: ["book", "sister"],
        image: "/conversation/family/wheres-my-book.png",
        lines: [
          { role: "Sister", gender: "female", text: "Where is my book?", audio: "/audio/conversation/wheres-my-book-0.mp3" },
          { role: "Brother", gender: "male", text: "It is on the desk.", audio: "/audio/conversation/wheres-my-book-1.mp3" },
          { role: "Sister", gender: "female", text: "Thank you!", audio: "/audio/conversation/wheres-my-book-2.mp3" },
        ],
      },
      {
        id: "whos-this", title: "Who Is This?", level: 3, keywords: ["sister", "family"],
        image: "/conversation/family/whos-this.png",
        lines: [
          { role: "Mom", gender: "female", text: "Who is this?", audio: "/audio/conversation/whos-this-0.mp3" },
          { role: "Boy", gender: "male", text: "This is my sister.", audio: "/audio/conversation/whos-this-1.mp3" },
          { role: "Mom", gender: "female", text: "She is pretty.", audio: "/audio/conversation/whos-this-2.mp3" },
        ],
      },
      {
        id: "hello-grandma", title: "Hello, Grandma", level: 4, keywords: ["grandma"],
        image: "/conversation/family/hello-grandma.png",
        lines: [
          { role: "Grandma", gender: "female", text: "Hello, my dear!", audio: "/audio/conversation/hello-grandma-0.mp3" },
          { role: "Boy", gender: "male", text: "Hi, Grandma!", audio: "/audio/conversation/hello-grandma-1.mp3" },
          { role: "Grandma", gender: "female", text: "How are you?", audio: "/audio/conversation/hello-grandma-2.mp3" },
          { role: "Boy", gender: "male", text: "I am good!", audio: "/audio/conversation/hello-grandma-3.mp3" },
        ],
      },
      {
        id: "dinner-is-ready", title: "Dinner Is Ready", level: 4, keywords: ["dinner", "family"],
        image: "/conversation/family/dinner-is-ready.png",
        lines: [
          { role: "Dad", gender: "male", text: "Dinner is ready.", audio: "/audio/conversation/dinner-is-ready-0.mp3" },
          { role: "Girl", gender: "female", text: "Yay! I am hungry.", audio: "/audio/conversation/dinner-is-ready-1.mp3" },
          { role: "Mom", gender: "female", text: "Wash your hands first.", audio: "/audio/conversation/dinner-is-ready-2.mp3" },
          { role: "Girl", gender: "female", text: "Okay, Mom.", audio: "/audio/conversation/dinner-is-ready-3.mp3" },
        ],
      },
      {
        id: "park-with-grandpa", title: "Park With Grandpa", level: 5, keywords: ["grandpa", "park"],
        image: "/conversation/family/park-with-grandpa.png",
        lines: [
          { role: "Grandpa", gender: "male", text: "Let's go to the park.", audio: "/audio/conversation/park-with-grandpa-0.mp3" },
          { role: "Girl", gender: "female", text: "I love the park!", audio: "/audio/conversation/park-with-grandpa-1.mp3" },
          { role: "Grandpa", gender: "male", text: "Do you see the birds?", audio: "/audio/conversation/park-with-grandpa-2.mp3" },
          { role: "Girl", gender: "female", text: "Yes! They are so cute.", audio: "/audio/conversation/park-with-grandpa-3.mp3" },
          { role: "Grandpa", gender: "male", text: "Let's watch them together.", audio: "/audio/conversation/park-with-grandpa-4.mp3" },
        ],
      },
      {
        id: "wake-up-sweetie", title: "Wake Up, Sweetie", level: 6, keywords: ["breakfast", "morning"],
        image: "/conversation/family/wake-up-sweetie.png",
        lines: [
          { role: "Mom", gender: "female", text: "Wake up, sweetie.", audio: "/audio/conversation/wake-up-sweetie-0.mp3" },
          { role: "Boy", gender: "male", text: "I'm awake, Mom.", audio: "/audio/conversation/wake-up-sweetie-1.mp3" },
          { role: "Mom", gender: "female", text: "Time for breakfast.", audio: "/audio/conversation/wake-up-sweetie-2.mp3" },
          { role: "Boy", gender: "male", text: "What are we eating?", audio: "/audio/conversation/wake-up-sweetie-3.mp3" },
          { role: "Mom", gender: "female", text: "Eggs and toast.", audio: "/audio/conversation/wake-up-sweetie-4.mp3" },
          { role: "Boy", gender: "male", text: "Yummy!", audio: "/audio/conversation/wake-up-sweetie-5.mp3" },
        ],
      },
      {
        id: "look-at-the-baby", title: "Look At The Baby", level: 7, keywords: ["baby", "brother"],
        image: "/conversation/family/look-at-the-baby.png",
        lines: [
          { role: "Sister", gender: "female", text: "Look at the baby!", audio: "/audio/conversation/look-at-the-baby-0.mp3" },
          { role: "Brother", gender: "male", text: "She is so small.", audio: "/audio/conversation/look-at-the-baby-1.mp3" },
          { role: "Sister", gender: "female", text: "She has tiny hands.", audio: "/audio/conversation/look-at-the-baby-2.mp3" },
          { role: "Brother", gender: "male", text: "Can I hold her?", audio: "/audio/conversation/look-at-the-baby-3.mp3" },
          { role: "Sister", gender: "female", text: "Yes, be careful.", audio: "/audio/conversation/look-at-the-baby-4.mp3" },
          { role: "Brother", gender: "male", text: "I will.", audio: "/audio/conversation/look-at-the-baby-5.mp3" },
          { role: "Sister", gender: "female", text: "You are a good brother.", audio: "/audio/conversation/look-at-the-baby-6.mp3" },
        ],
      },
      {
        id: "weekend-plan", title: "Weekend Plan", level: 8, keywords: ["grandma", "family"],
        image: "/conversation/family/weekend-plan.png",
        lines: [
          { role: "Dad", gender: "male", text: "What should we do today?", audio: "/audio/conversation/weekend-plan-0.mp3" },
          { role: "Mom", gender: "female", text: "Let's visit Grandma.", audio: "/audio/conversation/weekend-plan-1.mp3" },
          { role: "Boy", gender: "male", text: "Can we bring flowers?", audio: "/audio/conversation/weekend-plan-2.mp3" },
          { role: "Mom", gender: "female", text: "That's a good idea.", audio: "/audio/conversation/weekend-plan-3.mp3" },
          { role: "Dad", gender: "male", text: "I will drive the car.", audio: "/audio/conversation/weekend-plan-4.mp3" },
          { role: "Boy", gender: "male", text: "I'm so excited!", audio: "/audio/conversation/weekend-plan-5.mp3" },
          { role: "Mom", gender: "female", text: "Grandma will be happy.", audio: "/audio/conversation/weekend-plan-6.mp3" },
          { role: "Dad", gender: "male", text: "Let's go now.", audio: "/audio/conversation/weekend-plan-7.mp3" },
        ],
      },
    ],
  },
  {
    slug: "school",
    title: "School",
    description: "학교에서 나누는 대화를 연습해 보세요.",
    preview: "teacher, class, friend",
    color: "blue",
    menuImage: "/conversation/menu/school.png",
    dialogues: [
      {
        id: "good-morning-class", title: "Good Morning, Class!", level: 1, keywords: ["teacher", "morning"],
        image: "/conversation/school/good-morning-class.png",
        lines: [
          { role: "Teacher", gender: "female", text: "Good morning, class!", audio: "/audio/conversation/good-morning-class-0.mp3" },
          { role: "Boy", gender: "male", text: "Good morning, teacher!", audio: "/audio/conversation/good-morning-class-1.mp3" },
        ],
      },
      {
        id: "whats-your-name", title: "What's Your Name?", level: 2, keywords: ["friend", "name"],
        image: "/conversation/school/whats-your-name.png",
        lines: [
          { role: "Boy", gender: "male", text: "Hi! What is your name?", audio: "/audio/conversation/whats-your-name-0.mp3" },
          { role: "Girl", gender: "female", text: "My name is Amy.", audio: "/audio/conversation/whats-your-name-1.mp3" },
        ],
      },
      {
        id: "do-you-have-a-pencil", title: "Do You Have A Pencil?", level: 3, keywords: ["pencil", "teacher"],
        image: "/conversation/school/do-you-have-a-pencil.png",
        lines: [
          { role: "Teacher", gender: "female", text: "Do you have a pencil?", audio: "/audio/conversation/do-you-have-a-pencil-0.mp3" },
          { role: "Girl", gender: "female", text: "Yes, I do.", audio: "/audio/conversation/do-you-have-a-pencil-1.mp3" },
          { role: "Teacher", gender: "female", text: "Great, let's start.", audio: "/audio/conversation/do-you-have-a-pencil-2.mp3" },
        ],
      },
      {
        id: "wheres-the-library", title: "Where's The Library?", level: 3, keywords: ["library", "friend"],
        image: "/conversation/school/wheres-the-library.png",
        lines: [
          { role: "Girl", gender: "female", text: "Where is the library?", audio: "/audio/conversation/wheres-the-library-0.mp3" },
          { role: "Boy", gender: "male", text: "It is next to the classroom.", audio: "/audio/conversation/wheres-the-library-1.mp3" },
          { role: "Girl", gender: "female", text: "Thank you!", audio: "/audio/conversation/wheres-the-library-2.mp3" },
        ],
      },
      {
        id: "may-i-go-to-the-bathroom", title: "May I Go To The Bathroom?", level: 4, keywords: ["teacher", "bathroom"],
        image: "/conversation/school/may-i-go-to-the-bathroom.png",
        lines: [
          { role: "Boy", gender: "male", text: "May I go to the bathroom?", audio: "/audio/conversation/may-i-go-to-the-bathroom-0.mp3" },
          { role: "Teacher", gender: "female", text: "Yes, you may.", audio: "/audio/conversation/may-i-go-to-the-bathroom-1.mp3" },
          { role: "Boy", gender: "male", text: "Thank you, teacher.", audio: "/audio/conversation/may-i-go-to-the-bathroom-2.mp3" },
          { role: "Teacher", gender: "female", text: "Come back quickly.", audio: "/audio/conversation/may-i-go-to-the-bathroom-3.mp3" },
        ],
      },
      {
        id: "lets-play-at-recess", title: "Let's Play At Recess", level: 4, keywords: ["friend", "play"],
        image: "/conversation/school/lets-play-at-recess.png",
        lines: [
          { role: "Boy", gender: "male", text: "Let's play at recess.", audio: "/audio/conversation/lets-play-at-recess-0.mp3" },
          { role: "Girl", gender: "female", text: "Sure! What should we play?", audio: "/audio/conversation/lets-play-at-recess-1.mp3" },
          { role: "Boy", gender: "male", text: "How about tag?", audio: "/audio/conversation/lets-play-at-recess-2.mp3" },
          { role: "Girl", gender: "female", text: "That sounds fun!", audio: "/audio/conversation/lets-play-at-recess-3.mp3" },
        ],
      },
      {
        id: "favorite-subject", title: "Favorite Subject", level: 5, keywords: ["teacher", "art"],
        image: "/conversation/school/favorite-subject.png",
        lines: [
          { role: "Teacher", gender: "female", text: "What is your favorite subject?", audio: "/audio/conversation/favorite-subject-0.mp3" },
          { role: "Boy", gender: "male", text: "I like art.", audio: "/audio/conversation/favorite-subject-1.mp3" },
          { role: "Teacher", gender: "female", text: "That's wonderful.", audio: "/audio/conversation/favorite-subject-2.mp3" },
          { role: "Boy", gender: "male", text: "I love drawing.", audio: "/audio/conversation/favorite-subject-3.mp3" },
          { role: "Teacher", gender: "female", text: "Show me your picture.", audio: "/audio/conversation/favorite-subject-4.mp3" },
        ],
      },
      {
        id: "new-student", title: "New Student", level: 6, keywords: ["teacher", "friend"],
        image: "/conversation/school/new-student.png",
        lines: [
          { role: "Teacher", gender: "female", text: "Class, this is a new student.", audio: "/audio/conversation/new-student-0.mp3" },
          { role: "Girl", gender: "female", text: "Hello, everyone.", audio: "/audio/conversation/new-student-1.mp3" },
          { role: "Boy", gender: "male", text: "Hi! Welcome to our class.", audio: "/audio/conversation/new-student-2.mp3" },
          { role: "Girl", gender: "female", text: "Thank you, I'm happy to be here.", audio: "/audio/conversation/new-student-3.mp3" },
          { role: "Teacher", gender: "female", text: "Please sit next to Tom.", audio: "/audio/conversation/new-student-4.mp3" },
          { role: "Girl", gender: "female", text: "Okay, thank you.", audio: "/audio/conversation/new-student-5.mp3" },
        ],
      },
      {
        id: "help-with-math", title: "Help With Math", level: 7, keywords: ["friend", "math"],
        image: "/conversation/school/help-with-math.png",
        lines: [
          { role: "Boy", gender: "male", text: "Can you help me with math?", audio: "/audio/conversation/help-with-math-0.mp3" },
          { role: "Girl", gender: "female", text: "Sure, what's the problem?", audio: "/audio/conversation/help-with-math-1.mp3" },
          { role: "Boy", gender: "male", text: "I don't understand this.", audio: "/audio/conversation/help-with-math-2.mp3" },
          { role: "Girl", gender: "female", text: "Let me show you.", audio: "/audio/conversation/help-with-math-3.mp3" },
          { role: "Boy", gender: "male", text: "Oh, now I understand.", audio: "/audio/conversation/help-with-math-4.mp3" },
          { role: "Girl", gender: "female", text: "Great job!", audio: "/audio/conversation/help-with-math-5.mp3" },
          { role: "Boy", gender: "male", text: "Thank you for your help.", audio: "/audio/conversation/help-with-math-6.mp3" },
        ],
      },
      {
        id: "how-was-your-day", title: "How Was Your Day?", level: 8, keywords: ["teacher", "school"],
        image: "/conversation/school/how-was-your-day.png",
        lines: [
          { role: "Teacher", gender: "female", text: "How was your day?", audio: "/audio/conversation/how-was-your-day-0.mp3" },
          { role: "Boy", gender: "male", text: "It was fun!", audio: "/audio/conversation/how-was-your-day-1.mp3" },
          { role: "Teacher", gender: "female", text: "What did you learn?", audio: "/audio/conversation/how-was-your-day-2.mp3" },
          { role: "Boy", gender: "male", text: "I learned about animals.", audio: "/audio/conversation/how-was-your-day-3.mp3" },
          { role: "Teacher", gender: "female", text: "That's great.", audio: "/audio/conversation/how-was-your-day-4.mp3" },
          { role: "Boy", gender: "male", text: "Can we learn more tomorrow?", audio: "/audio/conversation/how-was-your-day-5.mp3" },
          { role: "Teacher", gender: "female", text: "Yes, of course.", audio: "/audio/conversation/how-was-your-day-6.mp3" },
          { role: "Boy", gender: "male", text: "I can't wait!", audio: "/audio/conversation/how-was-your-day-7.mp3" },
        ],
      },
    ],
  },
  {
    slug: "food",
    title: "Food",
    description: "음식과 관련된 대화를 연습해 보세요.",
    preview: "hungry, lunch, snack",
    color: "yellow",
    menuImage: "/conversation/menu/food.png",
    dialogues: [
      {
        id: "im-hungry", title: "I'm Hungry", level: 1, keywords: ["hungry", "lunch"],
        image: "/conversation/food/im-hungry.png",
        lines: [
          { role: "Boy", gender: "male", text: "I am hungry.", audio: "/audio/conversation/im-hungry-0.mp3" },
          { role: "Girl", gender: "female", text: "Let's eat lunch.", audio: "/audio/conversation/im-hungry-1.mp3" },
        ],
      },
      {
        id: "what-do-you-want-to-eat", title: "What Do You Want To Eat?", level: 2, keywords: ["pizza"],
        image: "/conversation/food/what-do-you-want-to-eat.png",
        lines: [
          { role: "Girl", gender: "female", text: "What do you want to eat?", audio: "/audio/conversation/what-do-you-want-to-eat-0.mp3" },
          { role: "Boy", gender: "male", text: "I want pizza.", audio: "/audio/conversation/what-do-you-want-to-eat-1.mp3" },
        ],
      },
      {
        id: "sweet-apple", title: "A Sweet Apple", level: 3, keywords: ["apple"],
        image: "/conversation/food/sweet-apple.png",
        lines: [
          { role: "Boy", gender: "male", text: "This apple is sweet.", audio: "/audio/conversation/sweet-apple-0.mp3" },
          { role: "Girl", gender: "female", text: "Can I try one?", audio: "/audio/conversation/sweet-apple-1.mp3" },
          { role: "Boy", gender: "male", text: "Sure, here you go.", audio: "/audio/conversation/sweet-apple-2.mp3" },
        ],
      },
      {
        id: "milk-or-juice", title: "Milk Or Juice?", level: 3, keywords: ["milk", "mom"],
        image: "/conversation/food/milk-or-juice.png",
        lines: [
          { role: "Mom", gender: "female", text: "Do you want milk or juice?", audio: "/audio/conversation/milk-or-juice-0.mp3" },
          { role: "Boy", gender: "male", text: "I want milk, please.", audio: "/audio/conversation/milk-or-juice-1.mp3" },
          { role: "Mom", gender: "female", text: "Here you are.", audio: "/audio/conversation/milk-or-juice-2.mp3" },
        ],
      },
      {
        id: "favorite-food", title: "Favorite Food", level: 4, keywords: ["rice", "bread"],
        image: "/conversation/food/favorite-food.png",
        lines: [
          { role: "Girl", gender: "female", text: "What is your favorite food?", audio: "/audio/conversation/favorite-food-0.mp3" },
          { role: "Boy", gender: "male", text: "I love rice and eggs.", audio: "/audio/conversation/favorite-food-1.mp3" },
          { role: "Girl", gender: "female", text: "I love bread and cake.", audio: "/audio/conversation/favorite-food-2.mp3" },
          { role: "Boy", gender: "male", text: "That sounds yummy.", audio: "/audio/conversation/favorite-food-3.mp3" },
        ],
      },
      {
        id: "dinner-is-ready-food", title: "Dinner Is Ready", level: 4, keywords: ["fish", "rice"],
        image: "/conversation/food/dinner-is-ready-food.png",
        lines: [
          { role: "Dad", gender: "male", text: "Dinner is ready.", audio: "/audio/conversation/dinner-is-ready-food-0.mp3" },
          { role: "Girl", gender: "female", text: "What are we having?", audio: "/audio/conversation/dinner-is-ready-food-1.mp3" },
          { role: "Dad", gender: "male", text: "We have rice and fish.", audio: "/audio/conversation/dinner-is-ready-food-2.mp3" },
          { role: "Girl", gender: "female", text: "My favorite!", audio: "/audio/conversation/dinner-is-ready-food-3.mp3" },
        ],
      },
      {
        id: "sharing-snacks", title: "Sharing Snacks", level: 5, keywords: ["bread", "friend"],
        image: "/conversation/food/sharing-snacks.png",
        lines: [
          { role: "Boy", gender: "male", text: "I have some bread.", audio: "/audio/conversation/sharing-snacks-0.mp3" },
          { role: "Girl", gender: "female", text: "Can I have a piece?", audio: "/audio/conversation/sharing-snacks-1.mp3" },
          { role: "Boy", gender: "male", text: "Of course, here you go.", audio: "/audio/conversation/sharing-snacks-2.mp3" },
          { role: "Girl", gender: "female", text: "Thank you! It's delicious.", audio: "/audio/conversation/sharing-snacks-3.mp3" },
          { role: "Boy", gender: "male", text: "You're welcome.", audio: "/audio/conversation/sharing-snacks-4.mp3" },
        ],
      },
      {
        id: "at-a-restaurant", title: "At A Restaurant", level: 6, keywords: ["cake", "water"],
        image: "/conversation/food/at-a-restaurant.png",
        lines: [
          { role: "Waiter", gender: "male", text: "What would you like to order?", audio: "/audio/conversation/at-a-restaurant-0.mp3" },
          { role: "Girl", gender: "female", text: "I would like a cake, please.", audio: "/audio/conversation/at-a-restaurant-1.mp3" },
          { role: "Waiter", gender: "male", text: "Anything to drink?", audio: "/audio/conversation/at-a-restaurant-2.mp3" },
          { role: "Girl", gender: "female", text: "Water, please.", audio: "/audio/conversation/at-a-restaurant-3.mp3" },
          { role: "Waiter", gender: "male", text: "Coming right up.", audio: "/audio/conversation/at-a-restaurant-4.mp3" },
          { role: "Girl", gender: "female", text: "Thank you.", audio: "/audio/conversation/at-a-restaurant-5.mp3" },
        ],
      },
      {
        id: "cooking-breakfast", title: "Cooking Breakfast", level: 7, keywords: ["eggs", "mom"],
        image: "/conversation/food/cooking-breakfast.png",
        lines: [
          { role: "Mom", gender: "female", text: "Let's make breakfast.", audio: "/audio/conversation/cooking-breakfast-0.mp3" },
          { role: "Boy", gender: "male", text: "Can I help?", audio: "/audio/conversation/cooking-breakfast-1.mp3" },
          { role: "Mom", gender: "female", text: "Yes, please crack the eggs.", audio: "/audio/conversation/cooking-breakfast-2.mp3" },
          { role: "Boy", gender: "male", text: "Okay, I did it!", audio: "/audio/conversation/cooking-breakfast-3.mp3" },
          { role: "Mom", gender: "female", text: "Now let's make toast.", audio: "/audio/conversation/cooking-breakfast-4.mp3" },
          { role: "Boy", gender: "male", text: "This is fun!", audio: "/audio/conversation/cooking-breakfast-5.mp3" },
          { role: "Mom", gender: "female", text: "You are a great helper.", audio: "/audio/conversation/cooking-breakfast-6.mp3" },
        ],
      },
      {
        id: "picnic-day", title: "Picnic Day", level: 8, keywords: ["bread", "apples"],
        image: "/conversation/food/picnic-day.png",
        lines: [
          { role: "Dad", gender: "male", text: "Let's have a picnic today.", audio: "/audio/conversation/picnic-day-0.mp3" },
          { role: "Girl", gender: "female", text: "Yay! What should we bring?", audio: "/audio/conversation/picnic-day-1.mp3" },
          { role: "Dad", gender: "male", text: "Let's bring bread and cake.", audio: "/audio/conversation/picnic-day-2.mp3" },
          { role: "Girl", gender: "female", text: "And apples too!", audio: "/audio/conversation/picnic-day-3.mp3" },
          { role: "Dad", gender: "male", text: "Good idea.", audio: "/audio/conversation/picnic-day-4.mp3" },
          { role: "Girl", gender: "female", text: "Can we bring water?", audio: "/audio/conversation/picnic-day-5.mp3" },
          { role: "Dad", gender: "male", text: "Yes, of course.", audio: "/audio/conversation/picnic-day-6.mp3" },
          { role: "Girl", gender: "female", text: "This will be so fun!", audio: "/audio/conversation/picnic-day-7.mp3" },
        ],
      },
    ],
  },
  {
    slug: "weather",
    title: "Weather",
    description: "날씨와 관련된 대화를 연습해 보세요.",
    preview: "sunny, rainy, windy",
    color: "mint",
    menuImage: "/conversation/menu/weather.png",
    dialogues: [
      {
        id: "hows-the-weather", title: "How's The Weather?", level: 1, keywords: ["sunny"],
        image: "/conversation/weather/hows-the-weather.png",
        lines: [
          { role: "Girl", gender: "female", text: "How is the weather today?", audio: "/audio/conversation/hows-the-weather-0.mp3" },
          { role: "Boy", gender: "male", text: "It is sunny.", audio: "/audio/conversation/hows-the-weather-1.mp3" },
        ],
      },
      {
        id: "its-raining", title: "It's Raining", level: 2, keywords: ["rainy", "umbrella"],
        image: "/conversation/weather/its-raining.png",
        lines: [
          { role: "Boy", gender: "male", text: "It is raining outside.", audio: "/audio/conversation/its-raining-0.mp3" },
          { role: "Girl", gender: "female", text: "I need an umbrella.", audio: "/audio/conversation/its-raining-1.mp3" },
        ],
      },
      {
        id: "windy-day", title: "A Windy Day", level: 3, keywords: ["windy"],
        image: "/conversation/weather/windy-day.png",
        lines: [
          { role: "Girl", gender: "female", text: "It is so windy today.", audio: "/audio/conversation/windy-day-0.mp3" },
          { role: "Boy", gender: "male", text: "Yes, hold your hat!", audio: "/audio/conversation/windy-day-1.mp3" },
          { role: "Girl", gender: "female", text: "Oops, it flew away!", audio: "/audio/conversation/windy-day-2.mp3" },
        ],
      },
      {
        id: "snowy-day", title: "A Snowy Day", level: 3, keywords: ["snowy", "mom"],
        image: "/conversation/weather/snowy-day.png",
        lines: [
          { role: "Mom", gender: "female", text: "It is snowy outside.", audio: "/audio/conversation/snowy-day-0.mp3" },
          { role: "Boy", gender: "male", text: "Can we play in the snow?", audio: "/audio/conversation/snowy-day-1.mp3" },
          { role: "Mom", gender: "female", text: "Yes, put on your coat.", audio: "/audio/conversation/snowy-day-2.mp3" },
        ],
      },
      {
        id: "hot-day", title: "A Hot Day", level: 4, keywords: ["hot", "water"],
        image: "/conversation/weather/hot-day.png",
        lines: [
          { role: "Boy", gender: "male", text: "It is very hot today.", audio: "/audio/conversation/hot-day-0.mp3" },
          { role: "Girl", gender: "female", text: "Let's drink some water.", audio: "/audio/conversation/hot-day-1.mp3" },
          { role: "Boy", gender: "male", text: "Good idea.", audio: "/audio/conversation/hot-day-2.mp3" },
          { role: "Girl", gender: "female", text: "Let's find some shade.", audio: "/audio/conversation/hot-day-3.mp3" },
        ],
      },
      {
        id: "cold-day", title: "A Cold Day", level: 4, keywords: ["cold", "dad"],
        image: "/conversation/weather/cold-day.png",
        lines: [
          { role: "Dad", gender: "male", text: "It is cold today.", audio: "/audio/conversation/cold-day-0.mp3" },
          { role: "Girl", gender: "female", text: "I need my jacket.", audio: "/audio/conversation/cold-day-1.mp3" },
          { role: "Dad", gender: "male", text: "Here it is.", audio: "/audio/conversation/cold-day-2.mp3" },
          { role: "Girl", gender: "female", text: "Thank you, Dad.", audio: "/audio/conversation/cold-day-3.mp3" },
        ],
      },
      {
        id: "weather-tomorrow", title: "Weather Tomorrow", level: 5, keywords: ["cloudy"],
        image: "/conversation/weather/weather-tomorrow.png",
        lines: [
          { role: "Girl", gender: "female", text: "What is the weather like tomorrow?", audio: "/audio/conversation/weather-tomorrow-0.mp3" },
          { role: "Boy", gender: "male", text: "It will be cloudy.", audio: "/audio/conversation/weather-tomorrow-1.mp3" },
          { role: "Girl", gender: "female", text: "Should we still go outside?", audio: "/audio/conversation/weather-tomorrow-2.mp3" },
          { role: "Boy", gender: "male", text: "Yes, it won't rain.", audio: "/audio/conversation/weather-tomorrow-3.mp3" },
          { role: "Girl", gender: "female", text: "Great, let's meet at ten.", audio: "/audio/conversation/weather-tomorrow-4.mp3" },
        ],
      },
      {
        id: "sunny-and-warm", title: "Sunny And Warm", level: 6, keywords: ["warm", "sunny"],
        image: "/conversation/weather/sunny-and-warm.png",
        lines: [
          { role: "Teacher", gender: "female", text: "Look outside, class.", audio: "/audio/conversation/sunny-and-warm-0.mp3" },
          { role: "Boy", gender: "male", text: "It is warm and sunny!", audio: "/audio/conversation/sunny-and-warm-1.mp3" },
          { role: "Teacher", gender: "female", text: "Perfect for outdoor play.", audio: "/audio/conversation/sunny-and-warm-2.mp3" },
          { role: "Girl", gender: "female", text: "Can we go to the park?", audio: "/audio/conversation/sunny-and-warm-3.mp3" },
          { role: "Teacher", gender: "female", text: "Yes, let's go.", audio: "/audio/conversation/sunny-and-warm-4.mp3" },
          { role: "Boy", gender: "male", text: "Yay!", audio: "/audio/conversation/sunny-and-warm-5.mp3" },
        ],
      },
      {
        id: "cloudy-trip", title: "A Cloudy Trip", level: 7, keywords: ["cloudy", "dad"],
        image: "/conversation/weather/cloudy-trip.png",
        lines: [
          { role: "Dad", gender: "male", text: "The weather looks cloudy.", audio: "/audio/conversation/cloudy-trip-0.mp3" },
          { role: "Boy", gender: "male", text: "Will it rain on our trip?", audio: "/audio/conversation/cloudy-trip-1.mp3" },
          { role: "Dad", gender: "male", text: "I don't think so.", audio: "/audio/conversation/cloudy-trip-2.mp3" },
          { role: "Boy", gender: "male", text: "I hope it stays warm.", audio: "/audio/conversation/cloudy-trip-3.mp3" },
          { role: "Dad", gender: "male", text: "Me too.", audio: "/audio/conversation/cloudy-trip-4.mp3" },
          { role: "Boy", gender: "male", text: "Let's check again tomorrow.", audio: "/audio/conversation/cloudy-trip-5.mp3" },
          { role: "Dad", gender: "male", text: "Good idea.", audio: "/audio/conversation/cloudy-trip-6.mp3" },
        ],
      },
      {
        id: "favorite-season", title: "Favorite Season", level: 8, keywords: ["cold", "sunny"],
        image: "/conversation/weather/favorite-season.png",
        lines: [
          { role: "Girl", gender: "female", text: "I love when it is sunny.", audio: "/audio/conversation/favorite-season-0.mp3" },
          { role: "Boy", gender: "male", text: "I like the cold winter.", audio: "/audio/conversation/favorite-season-1.mp3" },
          { role: "Girl", gender: "female", text: "Why do you like it cold?", audio: "/audio/conversation/favorite-season-2.mp3" },
          { role: "Boy", gender: "male", text: "Because I can play in the snow.", audio: "/audio/conversation/favorite-season-3.mp3" },
          { role: "Girl", gender: "female", text: "That sounds fun.", audio: "/audio/conversation/favorite-season-4.mp3" },
          { role: "Boy", gender: "male", text: "What do you like about sunny days?", audio: "/audio/conversation/favorite-season-5.mp3" },
          { role: "Girl", gender: "female", text: "I can play outside all day.", audio: "/audio/conversation/favorite-season-6.mp3" },
          { role: "Boy", gender: "male", text: "Let's play together!", audio: "/audio/conversation/favorite-season-7.mp3" },
        ],
      },
    ],
  },
  {
    slug: "animals",
    title: "Animals",
    description: "동물과 관련된 대화를 연습해 보세요.",
    preview: "cat, dog, zoo",
    color: "purple",
    menuImage: "/conversation/menu/animals.png",
    dialogues: [
      {
        id: "look-at-that-cat", title: "Look At That Cat!", level: 1, keywords: ["cat"],
        image: "/conversation/animals/look-at-that-cat.png",
        lines: [
          { role: "Boy", gender: "male", text: "Look at that cat!", audio: "/audio/conversation/look-at-that-cat-0.mp3" },
          { role: "Girl", gender: "female", text: "It is so cute.", audio: "/audio/conversation/look-at-that-cat-1.mp3" },
        ],
      },
      {
        id: "do-you-have-a-pet", title: "Do You Have A Pet?", level: 2, keywords: ["dog"],
        image: "/conversation/animals/do-you-have-a-pet.png",
        lines: [
          { role: "Girl", gender: "female", text: "Do you have a pet?", audio: "/audio/conversation/do-you-have-a-pet-0.mp3" },
          { role: "Boy", gender: "male", text: "Yes, I have a dog.", audio: "/audio/conversation/do-you-have-a-pet-1.mp3" },
        ],
      },
      {
        id: "rabbit-at-the-zoo", title: "A Rabbit At The Zoo", level: 3, keywords: ["rabbit"],
        image: "/conversation/animals/rabbit-at-the-zoo.png",
        lines: [
          { role: "Boy", gender: "male", text: "I see a rabbit!", audio: "/audio/conversation/rabbit-at-the-zoo-0.mp3" },
          { role: "Girl", gender: "female", text: "It's so fluffy.", audio: "/audio/conversation/rabbit-at-the-zoo-1.mp3" },
          { role: "Boy", gender: "male", text: "I want to pet it.", audio: "/audio/conversation/rabbit-at-the-zoo-2.mp3" },
        ],
      },
      {
        id: "favorite-animal", title: "Favorite Animal", level: 3, keywords: ["bears", "bird"],
        image: "/conversation/animals/favorite-animal.png",
        lines: [
          { role: "Girl", gender: "female", text: "What is your favorite animal?", audio: "/audio/conversation/favorite-animal-0.mp3" },
          { role: "Boy", gender: "male", text: "I like bears.", audio: "/audio/conversation/favorite-animal-1.mp3" },
          { role: "Girl", gender: "female", text: "I like birds.", audio: "/audio/conversation/favorite-animal-2.mp3" },
        ],
      },
      {
        id: "duck-at-the-pond", title: "A Duck At The Pond", level: 4, keywords: ["duck"],
        image: "/conversation/animals/duck-at-the-pond.png",
        lines: [
          { role: "Boy", gender: "male", text: "Look, a duck!", audio: "/audio/conversation/duck-at-the-pond-0.mp3" },
          { role: "Girl", gender: "female", text: "It is swimming.", audio: "/audio/conversation/duck-at-the-pond-1.mp3" },
          { role: "Boy", gender: "male", text: "Can we feed it?", audio: "/audio/conversation/duck-at-the-pond-2.mp3" },
          { role: "Girl", gender: "female", text: "Yes, let's try.", audio: "/audio/conversation/duck-at-the-pond-3.mp3" },
        ],
      },
      {
        id: "aquarium-visit", title: "Aquarium Visit", level: 4, keywords: ["fish"],
        image: "/conversation/animals/aquarium-visit.png",
        lines: [
          { role: "Girl", gender: "female", text: "There are so many fish!", audio: "/audio/conversation/aquarium-visit-0.mp3" },
          { role: "Boy", gender: "male", text: "They are so colorful.", audio: "/audio/conversation/aquarium-visit-1.mp3" },
          { role: "Girl", gender: "female", text: "I love this one.", audio: "/audio/conversation/aquarium-visit-2.mp3" },
          { role: "Boy", gender: "male", text: "Me too!", audio: "/audio/conversation/aquarium-visit-3.mp3" },
        ],
      },
      {
        id: "see-the-lions", title: "See The Lions", level: 5, keywords: ["lion", "dad"],
        image: "/conversation/animals/see-the-lions.png",
        lines: [
          { role: "Dad", gender: "male", text: "Let's see the lions.", audio: "/audio/conversation/see-the-lions-0.mp3" },
          { role: "Girl", gender: "female", text: "I'm a little scared.", audio: "/audio/conversation/see-the-lions-1.mp3" },
          { role: "Dad", gender: "male", text: "Don't worry, they are safe here.", audio: "/audio/conversation/see-the-lions-2.mp3" },
          { role: "Girl", gender: "female", text: "Okay, let's go.", audio: "/audio/conversation/see-the-lions-3.mp3" },
          { role: "Dad", gender: "male", text: "They are so strong!", audio: "/audio/conversation/see-the-lions-4.mp3" },
        ],
      },
      {
        id: "pet-shop-visit", title: "Pet Shop Visit", level: 6, keywords: ["rabbit", "mom"],
        image: "/conversation/animals/pet-shop-visit.png",
        lines: [
          { role: "Mom", gender: "female", text: "Which pet do you like?", audio: "/audio/conversation/pet-shop-visit-0.mp3" },
          { role: "Boy", gender: "male", text: "I like the little rabbit.", audio: "/audio/conversation/pet-shop-visit-1.mp3" },
          { role: "Mom", gender: "female", text: "It is very soft.", audio: "/audio/conversation/pet-shop-visit-2.mp3" },
          { role: "Boy", gender: "male", text: "Can we take it home?", audio: "/audio/conversation/pet-shop-visit-3.mp3" },
          { role: "Mom", gender: "female", text: "Let's ask Dad first.", audio: "/audio/conversation/pet-shop-visit-4.mp3" },
          { role: "Boy", gender: "male", text: "Okay!", audio: "/audio/conversation/pet-shop-visit-5.mp3" },
        ],
      },
      {
        id: "farm-visit", title: "Farm Visit", level: 7, keywords: ["duck", "cat"],
        image: "/conversation/animals/farm-visit.png",
        lines: [
          { role: "Teacher", gender: "female", text: "Look at the animals here.", audio: "/audio/conversation/farm-visit-0.mp3" },
          { role: "Boy", gender: "male", text: "I see a duck and a bird.", audio: "/audio/conversation/farm-visit-1.mp3" },
          { role: "Girl", gender: "female", text: "There's a cat too!", audio: "/audio/conversation/farm-visit-2.mp3" },
          { role: "Teacher", gender: "female", text: "Yes, farms have many animals.", audio: "/audio/conversation/farm-visit-3.mp3" },
          { role: "Boy", gender: "male", text: "Can we feed the duck?", audio: "/audio/conversation/farm-visit-4.mp3" },
          { role: "Teacher", gender: "female", text: "Yes, be gentle.", audio: "/audio/conversation/farm-visit-5.mp3" },
          { role: "Girl", gender: "female", text: "This is so fun.", audio: "/audio/conversation/farm-visit-6.mp3" },
        ],
      },
      {
        id: "animal-report", title: "Animal Report", level: 8, keywords: ["lion"],
        image: "/conversation/animals/animal-report.png",
        lines: [
          { role: "Girl", gender: "female", text: "I did a report on lions.", audio: "/audio/conversation/animal-report-0.mp3" },
          { role: "Boy", gender: "male", text: "What did you learn?", audio: "/audio/conversation/animal-report-1.mp3" },
          { role: "Girl", gender: "female", text: "Lions live in groups called prides.", audio: "/audio/conversation/animal-report-2.mp3" },
          { role: "Boy", gender: "male", text: "That's interesting!", audio: "/audio/conversation/animal-report-3.mp3" },
          { role: "Girl", gender: "female", text: "They can run very fast.", audio: "/audio/conversation/animal-report-4.mp3" },
          { role: "Boy", gender: "male", text: "Wow, I want to learn more.", audio: "/audio/conversation/animal-report-5.mp3" },
          { role: "Girl", gender: "female", text: "Let's go to the library.", audio: "/audio/conversation/animal-report-6.mp3" },
          { role: "Boy", gender: "male", text: "Great idea!", audio: "/audio/conversation/animal-report-7.mp3" },
        ],
      },
    ],
  },
  {
    slug: "daily-routine",
    title: "Daily Routine",
    description: "일상생활 속 대화를 연습해 보세요.",
    preview: "wake up, eat, sleep",
    color: "cream",
    menuImage: "/conversation/menu/routine.png",
    dialogues: [
      {
        id: "wake-up", title: "Wake Up!", level: 1, keywords: ["wake up", "mom"],
        image: "/conversation/daily-routine/wake-up.png",
        lines: [
          { role: "Mom", gender: "female", text: "Wake up!", audio: "/audio/conversation/wake-up-0.mp3" },
          { role: "Boy", gender: "male", text: "I'm awake, Mom.", audio: "/audio/conversation/wake-up-1.mp3" },
        ],
      },
      {
        id: "time-for-breakfast", title: "Time For Breakfast", level: 2, keywords: ["breakfast", "dad"],
        image: "/conversation/daily-routine/time-for-breakfast.png",
        lines: [
          { role: "Dad", gender: "male", text: "Time to eat breakfast.", audio: "/audio/conversation/time-for-breakfast-0.mp3" },
          { role: "Girl", gender: "female", text: "Coming, Dad!", audio: "/audio/conversation/time-for-breakfast-1.mp3" },
        ],
      },
      {
        id: "brushed-my-teeth", title: "Brushing Teeth", level: 3, keywords: ["teeth", "mom"],
        image: "/conversation/daily-routine/brushed-my-teeth.png",
        lines: [
          { role: "Mom", gender: "female", text: "Did you brush your teeth?", audio: "/audio/conversation/brushed-my-teeth-0.mp3" },
          { role: "Boy", gender: "male", text: "Yes, I did.", audio: "/audio/conversation/brushed-my-teeth-1.mp3" },
          { role: "Mom", gender: "female", text: "Good job!", audio: "/audio/conversation/brushed-my-teeth-2.mp3" },
        ],
      },
      {
        id: "school-time", title: "School Time", level: 3, keywords: ["school", "friend"],
        image: "/conversation/daily-routine/school-time.png",
        lines: [
          { role: "Boy", gender: "male", text: "What time do you go to school?", audio: "/audio/conversation/school-time-0.mp3" },
          { role: "Girl", gender: "female", text: "I go at eight.", audio: "/audio/conversation/school-time-1.mp3" },
          { role: "Boy", gender: "male", text: "Me too!", audio: "/audio/conversation/school-time-2.mp3" },
        ],
      },
      {
        id: "morning-routine", title: "Morning Routine", level: 4, keywords: ["face", "mom"],
        image: "/conversation/daily-routine/morning-routine.png",
        lines: [
          { role: "Mom", gender: "female", text: "Wash your face first.", audio: "/audio/conversation/morning-routine-0.mp3" },
          { role: "Girl", gender: "female", text: "Okay, Mom.", audio: "/audio/conversation/morning-routine-1.mp3" },
          { role: "Mom", gender: "female", text: "Then get dressed.", audio: "/audio/conversation/morning-routine-2.mp3" },
          { role: "Girl", gender: "female", text: "I will hurry.", audio: "/audio/conversation/morning-routine-3.mp3" },
        ],
      },
      {
        id: "after-school", title: "After School", level: 4, keywords: ["homework", "dad"],
        image: "/conversation/daily-routine/after-school.png",
        lines: [
          { role: "Dad", gender: "male", text: "How was school today?", audio: "/audio/conversation/after-school-0.mp3" },
          { role: "Boy", gender: "male", text: "It was great!", audio: "/audio/conversation/after-school-1.mp3" },
          { role: "Dad", gender: "male", text: "Do you have homework?", audio: "/audio/conversation/after-school-2.mp3" },
          { role: "Boy", gender: "male", text: "Yes, a little.", audio: "/audio/conversation/after-school-3.mp3" },
        ],
      },
      {
        id: "evening-routine", title: "Evening Routine", level: 5, keywords: ["dinner", "mom"],
        image: "/conversation/daily-routine/evening-routine.png",
        lines: [
          { role: "Mom", gender: "female", text: "Time for dinner.", audio: "/audio/conversation/evening-routine-0.mp3" },
          { role: "Girl", gender: "female", text: "I'm not hungry yet.", audio: "/audio/conversation/evening-routine-1.mp3" },
          { role: "Mom", gender: "female", text: "You should eat something.", audio: "/audio/conversation/evening-routine-2.mp3" },
          { role: "Girl", gender: "female", text: "Okay, I will try.", audio: "/audio/conversation/evening-routine-3.mp3" },
          { role: "Mom", gender: "female", text: "Good girl.", audio: "/audio/conversation/evening-routine-4.mp3" },
        ],
      },
      {
        id: "playtime-with-friends", title: "Playtime With Friends", level: 6, keywords: ["homework", "friend"],
        image: "/conversation/daily-routine/playtime-with-friends.png",
        lines: [
          { role: "Girl", gender: "female", text: "Can you play with me?", audio: "/audio/conversation/playtime-with-friends-0.mp3" },
          { role: "Boy", gender: "male", text: "Sure, after my homework.", audio: "/audio/conversation/playtime-with-friends-1.mp3" },
          { role: "Girl", gender: "female", text: "Okay, I will wait.", audio: "/audio/conversation/playtime-with-friends-2.mp3" },
          { role: "Boy", gender: "male", text: "I'm almost done.", audio: "/audio/conversation/playtime-with-friends-3.mp3" },
          { role: "Girl", gender: "female", text: "Take your time.", audio: "/audio/conversation/playtime-with-friends-4.mp3" },
          { role: "Boy", gender: "male", text: "Thank you for waiting.", audio: "/audio/conversation/playtime-with-friends-5.mp3" },
        ],
      },
      {
        id: "bedtime-routine", title: "Bedtime Routine", level: 7, keywords: ["sleep", "dad"],
        image: "/conversation/daily-routine/bedtime-routine.png",
        lines: [
          { role: "Dad", gender: "male", text: "Time for bed.", audio: "/audio/conversation/bedtime-routine-0.mp3" },
          { role: "Girl", gender: "female", text: "Can I read one more book?", audio: "/audio/conversation/bedtime-routine-1.mp3" },
          { role: "Dad", gender: "male", text: "Okay, just one.", audio: "/audio/conversation/bedtime-routine-2.mp3" },
          { role: "Girl", gender: "female", text: "Thank you, Dad!", audio: "/audio/conversation/bedtime-routine-3.mp3" },
          { role: "Dad", gender: "male", text: "Then straight to sleep.", audio: "/audio/conversation/bedtime-routine-4.mp3" },
          { role: "Girl", gender: "female", text: "I promise.", audio: "/audio/conversation/bedtime-routine-5.mp3" },
          { role: "Dad", gender: "male", text: "Good night, sweetie.", audio: "/audio/conversation/bedtime-routine-6.mp3" },
        ],
      },
      {
        id: "daily-recap", title: "Daily Recap", level: 8, keywords: ["breakfast", "friend"],
        image: "/conversation/daily-routine/daily-recap.png",
        lines: [
          { role: "Mom", gender: "female", text: "Let's talk about your day.", audio: "/audio/conversation/daily-recap-0.mp3" },
          { role: "Boy", gender: "male", text: "I woke up early.", audio: "/audio/conversation/daily-recap-1.mp3" },
          { role: "Mom", gender: "female", text: "What did you do next?", audio: "/audio/conversation/daily-recap-2.mp3" },
          { role: "Boy", gender: "male", text: "I ate breakfast and went to school.", audio: "/audio/conversation/daily-recap-3.mp3" },
          { role: "Mom", gender: "female", text: "Then what happened?", audio: "/audio/conversation/daily-recap-4.mp3" },
          { role: "Boy", gender: "male", text: "I played with my friends.", audio: "/audio/conversation/daily-recap-5.mp3" },
          { role: "Mom", gender: "female", text: "Sounds like a great day.", audio: "/audio/conversation/daily-recap-6.mp3" },
          { role: "Boy", gender: "male", text: "Yes, it was so much fun!", audio: "/audio/conversation/daily-recap-7.mp3" },
        ],
      },
    ],
  },
];