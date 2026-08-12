import Link from "next/link";
import BackButton from "@/components/ui/BackButton";
import styles from "./practice.module.css";
import { conversationCategories } from "../data";

export default function ConversationPracticePage() {
  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.inner}>
          <div className={styles.header}>
            <h1 className={styles.title}>Conversation Practice</h1>
            <p className={styles.subtitle}>
              원하는 주제를 선택해서 짧은 문장을 말해 보세요.
            </p>
          </div>

          <div className={styles.grid}>
            {conversationCategories.map((category) => (
              <Link
                key={category.slug}
                href={`/conversation/${category.slug}`}
                className={`${styles.card} ${styles[category.color]}`}
              >
                <div className={styles.imageArea}>
                  <img
                    src={category.menuImage}
                    alt={category.title}
                    className={styles.cardImage}
                  />
                </div>

                <div className={styles.textArea}>
                  <h2>{category.title}</h2>
                  <p className={styles.preview}>{category.preview}</p>
                  <p className={styles.description}>
                    {category.description}
                  </p>
                </div>

                <div className={styles.studyButton}>학습하기</div>
              </Link>
            ))}
          </div>

          <div className={styles.bottomRow}>
            <BackButton href="/conversation">
              Conversation으로 돌아가기
            </BackButton>
          </div>
        </div>
      </div>
    </section>
  );
}