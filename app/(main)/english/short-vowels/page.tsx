import Link from "next/link";
import BackButton from "@/components/ui/BackButton";
import styles from "./short-vowels.module.css";

const shortVowelMenus = [
  {
    title: "Short A",
    description: "Cat, Hat",
    href: "/english/short-vowels/a",
    image: "/short-vowels/menu/short_a.png",
    bgClass: "yellow",
  },
  {
    title: "Short E",
    description: "Bed, Pen",
    href: "/english/short-vowels/e",
    image: "/short-vowels/menu/short_e.png",
    bgClass: "blue",
  },
  {
    title: "Short I",
    description: "Sit, Pig",
    href: "/english/short-vowels/i",
    image: "/short-vowels/menu/short_i.png",
    bgClass: "pink",
  },
  {
    title: "Short O",
    description: "Hot, Dog",
    href: "/english/short-vowels/o",
    image: "/short-vowels/menu/short_o.png",
    bgClass: "mint",
  },
  {
    title: "Short U",
    description: "Sun, Cup",
    href: "/english/short-vowels/u",
    image: "/short-vowels/menu/short_u.png",
    bgClass: "cream",
  },
];

export default function ShortVowelsPage() {
  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.inner}>
          <h1 className={styles.title}>Short Vowels</h1>
          <p className={styles.subtitle}>
            짧게 발음되는 A, E, I, O, U 단모음을 익혀보세요.
          </p>

          <div className={styles.grid}>
            {shortVowelMenus.map((menu) => (
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