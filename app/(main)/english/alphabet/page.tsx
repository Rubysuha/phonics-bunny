import Link from "next/link";
import styles from "./alphabet.module.css";
import { alphabetItems } from "./data";

const cardColors = [
  "pink",
  "blue",
  "mint",
  "yellow",
  "purple",
  "cream",
  "lavender",
  "sky",
  "lime",
  "rose",
];

export default function AlphabetPage() {
  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.inner}>
          <div className={styles.titleBox}>
            <h1 className={styles.title}>Alphabet Sounds</h1>
            <p className={styles.subtitle}>
              알파벳 카드를 눌러 학습 페이지로 들어가 보세요.
            </p>
          </div>

          <div className={styles.grid}>
            {alphabetItems.map((item, index) => (
              <Link
                key={item.letter}
                href={`/english/alphabet/${item.letter}`}
                className={`${styles.card} ${
                  styles[cardColors[index % cardColors.length]]
                }`}
              >
                <div className={styles.letterRow}>
                  <span className={styles.upper}>{item.upper}</span>
                  <span className={styles.lower}>{item.lower}</span>
                </div>

                <p className={styles.word}>{item.word}</p>
              </Link>
            ))}
          </div>

          <div className={styles.bottomRow}>
            <Link href="/english" className={styles.backLink}>
              <span className={styles.backButton}>← English로 돌아가기</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}