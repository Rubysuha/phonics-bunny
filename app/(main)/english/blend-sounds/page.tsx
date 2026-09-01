import Link from "next/link";
import BackButton from "@/components/ui/BackButton";
import styles from "./blend-sounds.module.css";

const blendMenus = [
  {
    title: "Blend-L",
    description: "Black, Clock",
    href: "/english/blend-sounds/l",
    image: "/blend-sounds/menu/blend_l.png",
    bgClass: "yellow",
  },
  {
    title: "Blend-R",
    description: "Brush, Crab",
    href: "/english/blend-sounds/r",
    image: "/blend-sounds/menu/blend_r.png",
    bgClass: "blue",
  },
  {
    title: "Blend-S",
    description: "School, Ski",
    href: "/english/blend-sounds/s",
    image: "/blend-sounds/menu/blend_s.png",
    bgClass: "pink",
  },
];

export default function BlendSoundsPage() {
  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.inner}>
          <h1 className={styles.title}>Blending Sounds</h1>

          <p className={styles.subtitle}>
            Blending Sounds는 자음이 이어지는 소리를 자연스럽게 읽는 연습입니다.
          </p>

          <div className={styles.grid}>
            {blendMenus.map((menu) => (
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
              Phonics로 돌아가기
            </BackButton>
          </div>
        </div>
      </div>
    </section>
  );
}