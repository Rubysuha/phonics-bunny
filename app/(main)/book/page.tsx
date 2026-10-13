import Link from "next/link";
import PageTitle from "@/components/PageTitle";
import styles from "./book.module.css";
import { bookLevels } from "./data";

export default function BookPage() {
  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.inner}>
          <PageTitle
            eyebrow="READ"
            title="Book Library"
            subtitle="Choose a level and start your reading adventure!"
          />

          <div className={styles.grid}>
            {bookLevels.map((item) => (
              <Link
                key={item.level}
                href={`/book/${item.level}`}
                className={`${styles.card} ${styles[item.colorClass]}`}
              >
                <div className={styles.levelBadge}>{item.title}</div>

                <div className={styles.imageWrap}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className={styles.image}
                    draggable={false}
                  />
                </div>

                <div className={styles.textRow}>
                  <div>
                    <h2 className={styles.cardTitle}>{item.description}</h2>
                    <p className={styles.cardText}>📖 30+ Books</p>
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