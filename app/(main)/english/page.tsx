import Link from "next/link";
import styles from "./english.module.css";

const englishMenus = [
  {
    title: "Alphabet Sounds",
    description: "알파벳 단어와 소리 익히기",
    href: "/english/alphabet",
    image: "/english/alphabet_menu.png",
    bgClass: "blue",
  },
  {
    title: "Short Vowels",
    description: "단모음 발음 익히기",
    href: "/english/short-vowels",
    image: "/english/short_vowels_menu.png",
    bgClass: "pink",
  },
  {
    title: "Long Vowels",
    description: "장모음 발음 익히기",
    href: "/english/long-vowels",
    image: "/english/long_vowels_menu.png",
    bgClass: "yellow",
  },
  {
    title: "Blending Sounds",
    description: "블렌딩 소리 익히기",
    href: "/english/blend-sounds",
    image: "/english/blend_sounds_menu.png",
    bgClass: "cream",
  },
  {
    title: "Sight Words",
    description: "자주 쓰는 단어 익히기",
    href: "/english/sight-words",
    image: "/english/sight_words_menu.png",
    bgClass: "mint",
  },
];

export default function EnglishPage() {
  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.inner}>
          <div className={styles.titleBox}>
            <h1 className={styles.title}>Phonics 🐰</h1>

            <p className={styles.englishSubtitle}>
              Choose a menu and start your phonics adventure!
            </p>

            <p className={styles.subtitle}>
              원하는 학습 메뉴를 선택해서 들어가 보세요.
            </p>
          </div>

          <div className={styles.grid}>
            {englishMenus.map((menu) => (
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

                  <div className={styles.arrow}>›</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}