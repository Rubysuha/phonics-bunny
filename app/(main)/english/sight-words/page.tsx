import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import BackButton from "@/components/ui/BackButton";
import PageTitle from "@/components/PageTitle";
import styles from "./sight-words.module.css";
import { sightWordLevels } from "./data";

/* 카드에 크게 보여 줄 예시 단어 수 */
const SAMPLE_WORD_COUNT = 4;

const sightMenus = sightWordLevels.map((level) => ({
  title: level.title,
  href: `/english/sight-words/${level.level}`,
  samples: level.words.slice(0, SAMPLE_WORD_COUNT).map((item) => item.word),
  count: level.words.length,
}));

export default function SightWordsPage() {
  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.inner}>
          <PageTitle
            eyebrow="PHONICS"
            title="Sight Words"
            subtitle="Choose a level and learn the words you see most often."
          />

          <div className={styles.grid}>
            {sightMenus.map((menu, index) => (
              <Link
                key={menu.href}
                href={menu.href}
                className={`${styles.card} ${styles[`tone${(index % 5) + 1}`]}`}
              >
                <span className={styles.levelNumber}>{index + 1}</span>

                <div className={styles.titleRow}>
                  <h2 className={styles.cardTitle}>{menu.title}</h2>

                  <span className={styles.cardCount}>{menu.count} words</span>
                </div>

                {/* 그림 대신 이 레벨에서 배우는 단어를 보여 줌 */}
                <ul className={styles.samples} aria-label="예시 단어">
                  {menu.samples.map((word) => (
                    <li key={word}>{word}</li>
                  ))}
                </ul>

                <div className={styles.startRow}>
                  Start
                  <span className={styles.arrow}>
                    <ArrowRight size={18} weight="bold" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className={styles.footer}>
            <BackButton href="/english">Phonics로 돌아가기</BackButton>
          </div>
        </div>
      </div>
    </section>
  );
}
