import { makeWords, type PhonicsWord } from "../wordHelpers";

export type ShortVowelWord = PhonicsWord;

export type ShortVowelItem = {
  vowel: string;
  upper: string;
  lower: string;
  preview: string;
  words: ShortVowelWord[];
};

const words = (group: string, list: string, section?: string) =>
  makeWords("short-vowels", group, list, section);

export const shortVowelItems: ShortVowelItem[] = [
  {
    vowel: "a",
    upper: "A",
    lower: "a",
    preview: "Cat, Hat",
    words: [
      ...words(
        "a",
          "Cat, Hat, Bat, Jam, Map, Man, Rat, Mat, Sat, Pat, Van, " +
          "Fan, Pan, Cab, Tan, Cap, Tap, Nap, Lap, Bag, Tag, Rag, " +
          "Wag, Dad, Gas, Yam, Mad, Ham, Ram, Pad"
      ),
    ],
  },
  {
    vowel: "e",
    upper: "E",
    lower: "e",
    preview: "Bed, Pen",
    words: [
      ...words(
        "e",
          "Bed, Pen, Red, Net, Hen, Leg, Pet, Wet, Mess, Jet, Vet, " +
          "Set, Bet, Ten, Men, Den, Peg, Beg, Keg, Led, Fed, Web, " +
          "Gem, Bell, Sell, Yell, Tent, Nest, Desk, Egg"
      ),
    ],
  },
  {
    vowel: "i",
    upper: "I",
    lower: "i",
    preview: "Sit, Pig",
    words: [
      ...words(
        "i",
          "Sit, Pig, Lip, Fish, Milk, Kick, Pin, Bin, Fin, Win, Tin, " +
          "Kit, Dig, Fig, Wig, Jig, Rib, Bib, Kid, Lid, Hid, Dim, " +
          "Sip, Bit, Fit, Pit, Zip, Rip, Dip, Six"
      ),
    ],
  },
  {
    vowel: "o",
    upper: "O",
    lower: "o",
    preview: "Hot, Dog",
    words: [
      ...words(
        "o",
          "Hot, Dog, Box, Top, Rock, Sock, Pot, Dot, Cot, Lot, Cod, " +
          "Got, Rot, Hop, Mop, Pop, Shop, Log, Fog, Hog, Jog, Rod, " +
          "Pod, Nod, Job, Mom, Fox, Dock, Lock, Moth"
      ),
    ],
  },
  {
    vowel: "u",
    upper: "U",
    lower: "u",
    preview: "Sun, Cup",
    words: [
      ...words(
        "u",
          "Sun, Cup, Bus, Mud, Run, Bug, Bun, Fun, Pup, Cut, Hut, " +
          "Nut, Tub, Rub, Cub, Hug, Mug, Rug, Dug, Tug, Gum, Hum, " +
          "Duck, Jug, Sum, Luck, Puff, Buzz, Hub, Bud"
      ),
    ],
  },
];
