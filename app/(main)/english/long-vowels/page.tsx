import Link from "next/link";
import styles from "./long-vowels.module.css";

const longVowelMenus = [
  {
    title: "Long A",
    description: "Cake, Day",
    href: "/english/long-vowels/a",
    image: "/long-vowels/menu/long_a.png",
    bgClass: "yellow",
  },
  {
    title: "Long E",
    description: "Bee, Feet",
    href: "/english/long-vowels/e",
    image: "/long-vowels/menu/long_e.png",
    bgClass: "blue",
  },
  {
    title: "Long I",
    description: "Bike, Kite",
    href: "/english/long-vowels/i",
    image: "/long-vowels/menu/long_i.png",
    bgClass: "pink",
  },
  {
    title: "Long O",
    description: "Go, Home",
    href: "/english/long-vowels/o",
    image: "/long-vowels/menu/long_o.png",
    bgClass: "mint",
  },
  {
    title: "Long U",
    description: "Cube, Cute",
    href: "/english/long-vowels/u",
    image: "/long-vowels/menu/long_u.png",
    bgClass: "cream",
  },
];

export default function LongVowelsPage() {
  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.inner}>
          <h1 className={styles.title}>Long Vowels</h1>

          <p className={styles.subtitle}>
            Long Vowel은 영어에서 A, E, I, O, U가 자기 이름처럼 길게 발음되는 경우를 말합니다.
          </p>

          <div className={styles.grid}>
            {longVowelMenus.map((menu) => (
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
            <Link href="/english" className={styles.backButton}>
              ← English로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}