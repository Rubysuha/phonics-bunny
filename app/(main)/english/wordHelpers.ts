import { wordAssets } from "./wordAssets";

/*
  Phonics 단어 하나 (Short Vowels · Long Vowels · Blend Sounds 공통)

  그림 · 내 목소리 음성 · 한글 자료는 나중에 천천히 추가되므로
  public 폴더에 파일이 있는지 확인해서(wordAssets) 없으면 비워 둠.
  - image     : 없으면 "" (화면에서는 "그림 준비 중" 표시)
  - audio     : 직접 녹음한 m4a 가 없으면 AI 음성(mp3)으로 대신 재생
  - worksheet : 없으면 "" (자료 받기 버튼을 숨김)
*/
export type PhonicsWord = {
  slug: string;
  word: string;
  image: string;
  audio: string;
  worksheet: string;
  sentence: string;

  /* 목록 화면에서 묶어 보여줄 이름 (예: 블렌드 "bl", Long U 의 소리 구분) */
  section?: string;
};

type Category = "short-vowels" | "long-vowels" | "blend-sounds";

export function makeWord(
  category: Category,
  group: string,
  word: string,
  section?: string
): PhonicsWord {
  const slug = word.toLowerCase();

  /* 그림은 가벼운 WebP 가 기본 (npm run images 로 변환), PNG 도 인식 */
  const imageBase = `/${category}/${group}/${slug}`;

  const image = wordAssets.has(`${imageBase}.webp`)
    ? `${imageBase}.webp`
    : `${imageBase}.png`;
  const recorded = `/audio/${category}/${slug}.m4a`;
  const worksheet = `/worksheets/${category}/${slug}.hwp`;

  return {
    slug,
    word,
    image: wordAssets.has(image) ? image : "",
    audio: wordAssets.has(recorded)
      ? recorded
      : `/audio/${category}-ai/${slug}.mp3`,
    worksheet: wordAssets.has(worksheet) ? worksheet : "",
    sentence: word,
    section,
  };
}

/* "Cat, Hat, Bat" 처럼 쉼표로 적은 목록을 단어들로 바꿈 */
export function makeWords(
  category: Category,
  group: string,
  list: string,
  section?: string
): PhonicsWord[] {
  return list
    .split(",")
    .map((word) => word.trim())
    .filter(Boolean)
    .map((word) => makeWord(category, group, word, section));
}

/* 목록 화면용: section 이 같은 단어끼리 순서대로 묶음 (section 이 없으면 한 묶음) */
export function groupBySection(
  words: PhonicsWord[]
): { section: string; words: PhonicsWord[] }[] {
  const groups: { section: string; words: PhonicsWord[] }[] = [];

  for (const word of words) {
    const section = word.section ?? "";
    const last = groups[groups.length - 1];

    if (last && last.section === section) {
      last.words.push(word);
    } else {
      groups.push({ section, words: [word] });
    }
  }

  return groups;
}
