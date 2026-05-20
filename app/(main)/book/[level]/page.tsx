import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./level.module.css";
import { getBookLevel } from "../data";

type Props = {
  params: Promise<{
    level: string;
  }>;
};

export default async function BookLevelPage({ params }: Props) {
  const { level } = await params;
  const currentLevel = getBookLevel(level);

  if (!currentLevel) {
    notFound();
  }

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.inner}>
          <h1 className={styles.title}>{currentLevel.title}</h1>
          <p className={styles.subtitle}>{currentLevel.description}</p>

          <div className={styles.grid}>
            {currentLevel.stories.map((story, index) => (
              <Link
                key={story.slug}
                href={`/book/${currentLevel.level}/${story.slug}`}
                className={styles.card}
              >
                <div className={styles.number}>{index + 1}</div>

                <div className={styles.imageWrap}>
                  <img
                    src={story.image}
                    alt={story.title}
                    className={styles.image}
                    draggable={false}
                  />
                </div>

                <h2 className={styles.storyTitle}>{story.title}</h2>
                <p className={styles.storyText}>Read Story ›</p>
              </Link>
            ))}
          </div>

          <div className={styles.bottomRow}>
            <Link href="/book" className={styles.backButton}>
              ← Book Library로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}