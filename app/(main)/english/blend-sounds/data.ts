import { makeWords, type PhonicsWord } from "../wordHelpers";

export type BlendWord = PhonicsWord;

export type BlendItem = {
  group: string;
  title: string;
  preview: string;
  words: BlendWord[];
};

/* 세 번째 값은 목록 화면에서 묶어 보여줄 블렌드 이름 */
const words = (group: string, section: string, list: string) =>
  makeWords("blend-sounds", group, list, section);

export const blendItems: BlendItem[] = [
  {
    group: "l",
    title: "BLEND-L",
    preview: "Black, Clock",
    words: [
      ...words(
        "l",
        "bl",
        "Black, Blow, Block, Blink, Blank, Blend, Blade, Bloom, Blue"
      ),
      ...words(
        "l",
        "cl",
        "Clock, Clap, Clip, Clam, Clay, Clean, Climb, Cloud, Clown"
      ),
      ...words(
        "l",
        "fl",
        "Flag, Fly, Flip, Flat, Flap, Flame, Float, Floor, Flower"
      ),
      ...words(
        "l",
        "gl",
        "Glue, Glad, Glass, Glow, Glove, Globe, Glide, Glitter, Glob"
      ),
      ...words(
        "l",
        "pl",
        "Plant, Plank, Plug, Plum, Plate, Plan, Plow, Plus, Plot"
      ),
      ...words(
        "l",
        "sl",
        "Slip, Slot, Sleep, Sling, Slap, Slug, Slim, Sled, Slime"
      ),
    ],
  },
  {
    group: "r",
    title: "BLEND-R",
    preview: "Brush, Crab",
    words: [
      ...words(
        "r",
        "br",
        "Brush, Bread, Brown, Brick, Bring, Brave, Branch, Bridge, Broom"
      ),
      ...words(
        "r",
        "cr",
        "Crab, Cry, Crow, Crown, Crack, Cream, Crayon, Crib, Crash"
      ),
      ...words(
        "r",
        "dr",
        "Drum, Dress, Drink, Drop, Drive, Dream, Dragon, Drill, Drip"
      ),
      ...words(
        "r",
        "fr",
        "Frog, Free, Fruit, Frame, Freeze, Fresh, Frost, Fry, From"
      ),
      ...words(
        "r",
        "gr",
        "Grass, Grin, Gray, Grow, Grape, Grand, Grill, Ground, Group"
      ),
      ...words(
        "r",
        "pr",
        "Print, Pray, Prize, Press, Proud, Pretty, Price, Prince, Prank"
      ),
      ...words(
        "r",
        "tr",
        "Tree, Train, Truck, Trip, Trap, Track, Trash, Treat, Trick"
      ),
    ],
  },
  {
    group: "s",
    title: "BLEND-S",
    preview: "School, Ski",
    words: [
      ...words(
        "s",
        "sc · sk",
        "School, Ski, Scan, Scarf, Scare, Skate, Skin, Skip, Sky, Skirt, Skunk, Sketch"
      ),
      ...words(
        "s",
        "sm",
        "Smile, Small, Smart, Smell, Smoke, Smooth, Smash, Smog, Smock"
      ),
      ...words(
        "s",
        "sn",
        "Snow, Snake, Snack, Snail, Snap, Sniff, Snore, Snug, Snip"
      ),
      ...words(
        "s",
        "sp",
        "Spoon, Spin, Spot, Space, Spade, Speak, Spell, Spider, Spill"
      ),
      ...words(
        "s",
        "st",
        "Stop, Star, Stay, Step, Stick, Stem, Stamp, Stand, Story"
      ),
      ...words(
        "s",
        "sw",
        "Swim, Swing, Sweep, Sweet, Swan, Swirl, Swamp, Switch, Swish"
      ),
    ],
  },
];
