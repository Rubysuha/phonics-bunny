import Link from "next/link";
import BackButton from "@/components/ui/BackButton";
import PageTitle from "@/components/PageTitle";
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
          <PageTitle
            eyebrow="PHONICS"
            title="Long Vowels"
            subtitle="Learn the long sounds of A, E, I, O, and U. They say their names!"
          />

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
            <BackButton href="/english">
              Phonics로 돌아가기
            </BackButton>
          </div>
        </div>
      </div>
    </section>
  );
}