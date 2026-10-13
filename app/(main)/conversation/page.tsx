// app/(main)/conversation/page.tsx
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import PageTitle from "@/components/PageTitle";
import styles from "./conversation.module.css";

const modes = [
  {
    href: "/conversation/ai",
    image: "/conversation/ai-bunny2.webp",
    title: "AI Bunny",
    description: "Talk freely in English with your voice.",
    className: "aiCard",
  },
  {
    href: "/conversation/practice",
    image: "/conversation/practice2.webp",
    title: "Practice",
    description: "Listen to each conversation and repeat.",
    className: "practiceCard",
  },
];

export default function ConversationPage() {
  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.inner}>
          <div className={styles.titleArea}>
            <PageTitle
              eyebrow="SPEAK"
              title="Conversation"
              subtitle="Talk freely with AI Bunny, or practice conversations by topic."
            />
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
