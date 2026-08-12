import Link from "next/link";
import BackButton from "@/components/ui/BackButton";
import styles from "./sight-words.module.css";

const sightMenus = [
  {
    title: "Level 1",
    description: "the, to, is, go",
    href: "/english/sight-words/level-1",
    image: "/sight-words/menu/level1.png",
    bgClass: "yellow",
  },
  {
    title: "Level 2",
    description: "we, he, she, my",
    href: "/english/sight-words/level-2",
    image: "/sight-words/menu/level2.png",
    bgClass: "blue",
  },
  {
    title: "Level 3",
    description: "like, look, come, here",
    href: "/english/sight-words/level-3",
    image: "/sight-words/menu/level3.png",
    bgClass: "pink",
  },
];

export default function SightWordsPage() {
  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.inner}>
          <h1 className={styles.title}>Sight Words</h1>

          <p className={styles.subtitle}>
            Level을 선택해서 자주 쓰는 단어를 학습해 보세요.
          </p>

          <div className={styles.grid}>
            {sightMenus.map((menu) => (
              <Link
                key={menu.href}
                href={menu.href}
                className={`${styles.card} ${styles[menu.bgClass]}`}
              >
                <div className={styles.imageWrap}>
                  <img
                    src={menu.image}
                    alt={menu.title}
                    className={styles.image}
                    draggable={false}
                  />
                </div>

                <div className={styles.textRow}>
                  <div>
                    <h2 className={styles.cardTitle}>{menu.title}</h2>

                    <p className={styles.cardDescription}>
                      {menu.description}
                    </p>
                  </div>

                  <span className={styles.arrow}>›</span>
                </div>
              </Link>
            ))}
          </div>

          <div className={styles.bottomRow}>
            <BackButton href="/english">
              English로 돌아가기
            </BackButton>
          </div>
        </div>
      </div>
    </section>
  );
}