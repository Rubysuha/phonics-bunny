import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import BackButton from "@/components/ui/BackButton";
import PageTitle from "@/components/PageTitle";
import styles from "./sight-words.module.css";
import { sightWordLevels } from "./data";

const sightMenus = sightWordLevels.map((level) => ({
  title: level.title,
  description: level.preview,
  href: `/english/sight-words/${level.level}`,
  image: level.menuImage,
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
            subtitle="Level을 선택해서 자주 쓰는 단어를 학습해 보세요."
          />

          <div className={styles.grid}>
            {sightMenus.map((menu, index) => (
              <Link key={menu.href} href={menu.href} className={styles.card}>
                <div className={styles.imageWrap}>
                  {menu.image ? (
                    <img
                      src={menu.image}
                      alt=""
                      className={styles.image}
                      draggable={false}
                    />
                  ) : (
                    /* 메뉴 그림이 아직 없는 레벨: 레벨 숫자를 크게 */
                    <span className={styles.noImage}>{index + 1}</span>
                  )}
                </div>

                <div className={styles.textRow}>
                  <div className={styles.cardText}>
                    <h2 className={styles.cardTitle}>{menu.title}</h2>

                    <p className={styles.cardDescription}>
                      {menu.description}
                    </p>

                    <p className={styles.cardCount}>{menu.count} words</p>
                  </div>

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
