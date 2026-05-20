import Link from "next/link";
import styles from "./conversation.module.css";
import { conversationCategories } from "./data";

export default function ConversationPage() {
  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.inner}>
          <h1 className={styles.title}>Conversation</h1>
          <p className={styles.subtitle}>
            원하는 주제를 선택해서 짧은 문장을 말해 보세요.
          </p>

          <div className={styles.grid}>
            {conversationCategories.map((category) => (
              <Link
                key={category.slug}
                href={`/conversation/${category.slug}`}
                className={`${styles.card} ${styles[category.color]}`}
              >
                <div className={styles.cardTitle}>{category.title}</div>
                <div className={styles.preview}>{category.preview}</div>
                <div className={styles.cardDescription}>
                  {category.description}
                </div>
                <div className={styles.studyButton}>학습하기</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}