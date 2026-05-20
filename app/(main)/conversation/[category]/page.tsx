import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./sentence-list.module.css";
import { conversationCategories } from "../data";

type Props = {
  params: Promise<{
    category: string;
  }>;
};

export default async function ConversationCategoryPage({ params }: Props) {
  const { category: rawCategory } = await params;
  const category = rawCategory.toLowerCase();

  const item = conversationCategories.find(
    (v) => v.slug.toLowerCase() === category
  );

  if (!item) {
    notFound();
  }

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.inner}>
          <h1 className={styles.title}>{item.title}</h1>
          <p className={styles.subtitle}>
            문장 박스를 눌러 학습 페이지로 들어가 보세요.
          </p>

          <div className={styles.grid}>
            {item.sentences.map((sentenceItem) => (
              <Link
                key={sentenceItem.id}
                href={`/conversation/${item.slug}/${sentenceItem.id}`}
                className={styles.card}
              >
                <div className={styles.sentence}>{sentenceItem.sentence}</div>
                <div className={styles.studyButton}>학습하기</div>
              </Link>
            ))}
          </div>

          <div className={styles.bottomRow}>
            <Link href="/conversation" className={styles.backButton}>
              ← Conversation으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}