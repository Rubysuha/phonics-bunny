// app/(main)/conversation/page.tsx
import Link from "next/link";
import styles from "./conversation.module.css";

export default function ConversationPage() {
  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.inner}>
          <div className={styles.titleArea}>
            <h1 className={styles.title}>Conversation</h1>
            <p className={styles.subtitle}>
              AI Bunny와 대화하거나, 주제별 회화를 직접 공부해 보세요.
            </p>
          </div>

          <div className={styles.cardWrap}>
            <Link href="/conversation/ai" className={`${styles.card} ${styles.aiCard}`}>
              <span className={styles.badge}>AI</span>

              <div className={styles.imageWrap}>
                <img
                  src="/images/conversation/ai-bunny.png"
                  alt="AI Bunny"
                  className={styles.cardImage}
                />
              </div>

              <div className={styles.textRow}>
                <div>
                  <h2 className={styles.cardTitle}>AI Bunny</h2>
                  <p className={styles.cardDesc}>
                    음성으로 자유롭게 영어 대화를 나눠요.
                  </p>
                </div>
                <span className={styles.arrow}>›</span>
              </div>
            </Link>

            <Link href="/conversation/practice" className={`${styles.card} ${styles.practiceCard}`}>
              <span className={styles.badge}>PRACTICE</span>

              <div className={styles.imageWrap}>
                <img
                  src="/images/conversation/practice-bunny.png"
                  alt="Practice"
                  className={styles.cardImage}
                />
              </div>

              <div className={styles.textRow}>
                <div>
                  <h2 className={styles.cardTitle}>Practice</h2>
                  <p className={styles.cardDesc}>
                    주어진 문장을 듣고 따라 말해요.
                  </p>
                </div>
                <span className={styles.arrow}>›</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}