// app/(main)/conversation/page.tsx
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import styles from "./conversation.module.css";

const modes = [
  {
    href: "/conversation/ai",
    image: "/conversation/ai-bunny2.webp",
    title: "AI Bunny",
    description: "음성으로 자유롭게 영어 대화를 나눠요.",
    className: "aiCard",
  },
  {
    href: "/conversation/practice",
    image: "/conversation/practice2.webp",
    title: "Practice",
    description: "주어진 문장을 듣고 따라 말해요.",
    className: "practiceCard",
  },
];

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
            {modes.map((mode) => (
              <Link
                key={mode.href}
                href={mode.href}
                className={`${styles.card} ${styles[mode.className]}`}
              >
                {/* AI / PRACTICE 배지는 그림 안에 들어 있음 */}
                <img
                  src={mode.image}
                  alt=""
                  className={styles.cardImage}
                />

                <div className={styles.textRow}>
                  <div>
                    <h2 className={styles.cardTitle}>{mode.title}</h2>

                    <p className={styles.cardDesc}>
                      {mode.description}
                    </p>
                  </div>

                  <span className={styles.arrow}>
                    <ArrowRight weight="bold" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
