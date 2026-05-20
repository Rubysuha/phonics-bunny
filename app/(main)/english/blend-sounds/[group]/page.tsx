import Link from "next/link";
import styles from "./blend-words.module.css";
import { blendItems } from "../data";

type Props = {
  params: Promise<{
    group: string;
  }>;
};

export default async function BlendWordsPage({ params }: Props) {
  const { group: rawGroup } = await params;
  const group = rawGroup.toLowerCase();

  const item = blendItems.find((v) => v.group.toLowerCase() === group);

  if (!item) {
    return (
      <div style={{ padding: "40px", fontSize: "20px" }}>
        <p>rawGroup: {rawGroup}</p>
        <p>group: {group}</p>
        <pre>{JSON.stringify(blendItems, null, 2)}</pre>
      </div>
    );
  }

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.inner}>
          <h1 className={styles.title}>{item.title}</h1>
          <p className={styles.subtitle}>
            단어 박스를 눌러 학습 페이지로 들어가 보세요.
          </p>

          <div className={styles.grid}>
            {item.words.map((wordItem) => (
              <Link
                key={wordItem.slug}
                href={`/english/blend-sounds/${item.group}/${wordItem.slug}`}
                className={styles.card}
              >
                <div className={styles.word}>{wordItem.word}</div>
                <div className={styles.studyButton}>학습하기</div>
              </Link>
            ))}
          </div>

          <div className={styles.bottomRow}>
            <Link href="/english/blend-sounds" className={styles.backButton}>
              ← Blending Sounds로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}