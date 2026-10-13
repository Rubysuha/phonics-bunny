import { makeWords, type PhonicsWord } from "../wordHelpers";

export type LongVowelWord = PhonicsWord;

export type LongVowelItem = {
  vowel: string;
  upper: string;
  lower: string;
  preview: string;
  words: LongVowelWord[];
};

const words = (group: string, list: string, section?: string) =>
  makeWords("long-vowels", group, list, section);

export const longVowelItems: LongVowelItem[] = [
  {
    vowel: "a",
    upper: "A",
    lower: "a",
    preview: "Cake, Day",
    words: [
      ...words(
        "a",
          "Cake, Day, Game, Name, Plane, Rain, Cage, Page, Bake, " +
          "Lake, Gate, Late, Face, Race, Cave, Wave, Safe, Same, " +
          "Tail, Mail, Sail, Nail, Wait, Paint, Pay, May, Ray, Hay, " +
          "Bay, Way"
      ),
    ],
  },
  {
    vowel: "e",
    upper: "E",
    lower: "e",
    preview: "Bee, Feet",
    words: [
      ...words(
        "e",
          "Bee, Feet, Green, Eat, Sheep, Teeth, Weed, Seed, Feed, " +
          "Need, Week, Deep, Keep, Knee, Sea, Tea, Leaf, Team, Bean, " +
          "Mean, Beach, Meat, Seat, Key, Peel, Jeep, Beef, Heat, " +
          "Meet, Pea"
      ),
    ],
  },
  {
    vowel: "i",
    upper: "I",
    lower: "i",
    preview: "Bike, Kite",
    words: [
      ...words(
        "i",
          "Bike, Kite, Light, Line, Slide, Time, Hike, Ride, Hide, " +
          "Side, Wide, Dime, Nine, Fine, Pine, Mine, White, Night, " +
          "Fight, Right, High, Sigh, Pie, Tie, Lie, Dive, Hive, " +
          "Bite, Wipe, Vine"
      ),
    ],
  },
  {
    vowel: "o",
    upper: "O",
    lower: "o",
    preview: "Go, Home",
    words: [
      ...words(
        "o",
          "Go, Home, Nose, Rope, Rose, Stone, Hope, Joke, Poke, " +
          "Woke, Cone, Phone, Bone, Note, Boat, Coat, Goat, Road, " +
          "Soap, Loaf, Hole, Pole, Rode, Toe, Doe, Low, Mow, Tow, " +
          "Coal, Load"
      ),
    ],
  },
  {
    vowel: "u",
    upper: "U",
    lower: "u",
    preview: "Cube, Cute",
    words: [
      ...words(
        "u",
          "Cube, Cute, Mule, Use, Huge, Cue, Fuse, Mute, June, Fume, " +
          "Cure, Pure, Few, Hue, Music",
        "Cute 소리"
      ),
      ...words(
        "u",
          "Flute, Rule, Tube, Moon, Zoo, Food, Cool, Pool, Tool, " +
          "Room, Soon, Boot, Juice, Suit, Chew",
        "Moon 소리"
      ),
    ],
  },
];
