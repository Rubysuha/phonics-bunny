import Link from "next/link";
import styles from "./vowel-words.module.css";
import { longVowelItems } from "../data";

type Props = {
  params: Promise<{
    vowel: string;
  }>;
};

export default async function LongVowelWordsPage({ params }: Props) {
  const { vowel: rawVowel } = await params;
  const vowel = rawVowel.toLowerCase();

  const item = longVowelItems.find(
    (v) => v.vowel.toLowerCase() === vowel
  );

  if (!item) {
    return (
      <div style={{ padding: "40px", fontSize: "20px" }}>
        <p>rawVowel: {rawVowel}</p>
        <p>vowel: {vowel}</p>
        <pre>{JSON.stringify(longVowelItems, null, 2)}</pre>
      </div>
    );
  }

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.inner}>
          <h1 className={styles.title}>Long {item.upper}</h1>
          <p className={styles.subtitle}>
            단어 박스를 눌러 학습 페이지로 들어가 보세요.
          </p>

          <div className={styles.grid}>
            {item.words.map((wordItem) => (
              <Link
                key={wordItem.slug}
                href={`/english/long-vowels/${item.vowel}/${wordItem.slug}`}
                className={styles.card}
              >
                <div className={styles.word}>{wordItem.word}</div>
                <div className={styles.studyButton}>학습하기</div>
              </Link>
            ))}
          </div>

          <div className={styles.bottomRow}>
            <Link href="/english/long-vowels" className={styles.backButton}>
              ← Long Vowels로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}