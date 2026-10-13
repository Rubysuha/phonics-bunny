import styles from "./PageTitle.module.css";

type Props = {
  /* 제목 위의 작은 글씨 (어느 메뉴에 속하는지) */
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
};

/* 메뉴 · 목록 화면 맨 위의 제목 (Phonics · Book · Conversation 공통) */
export default function PageTitle({ eyebrow, title, subtitle }: Props) {
  return (
    <header className={styles.header}>
      <p className={styles.eyebrow}>{eyebrow}</p>

      <h1 className={styles.title}>{title}</h1>

      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </header>
  );
}
