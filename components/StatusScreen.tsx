import styles from "./StatusScreen.module.css";

type Props = {
  icon: React.ReactNode;
  title: string;
  message?: string;

  /* 불러오는 중일 때 아이콘이 통통 튐 */
  bounce?: boolean;

  /* 앱 틀(사이드바 · 상단 바) 없이 화면 전체에 보여 줄 때 */
  fullPage?: boolean;

  children?: React.ReactNode;
};

/* 불러오는 중 · 오류 · 없는 페이지 화면 공통 모양 */
export default function StatusScreen({
  icon,
  title,
  message,
  bounce,
  fullPage,
  children,
}: Props) {
  return (
    <div
      className={`${styles.screen} ${fullPage ? styles.fullPage : ""}`}
      role={bounce ? "status" : undefined}
    >
      <span
        className={`${styles.icon} ${bounce ? styles.bounce : ""}`}
        aria-hidden="true"
      >
        {icon}
      </span>

      <h1 className={styles.title}>{title}</h1>

      {message && <p className={styles.message}>{message}</p>}

      {children && <div className={styles.actions}>{children}</div>}
    </div>
  );
}

export { styles as statusStyles };
