import styles from "./BottomActionBar.module.css";

const items = [
  { icon: "📖", label: "My page", color: "pink" },
  { icon: "📄", label: "My Bunny", color: "blue" },
  { icon: "📚", label: "Test", color: "yellow" },
  { icon: "📗", label: "Record", color: "mint" },
  { icon: "👥", label: "Shop", color: "sky" },
];

export default function BottomActionBar() {
  return (
    <section className={styles.bar}>
      {items.map((item) => (
        <button key={item.label} className={styles.item}>
          <div className={`${styles.icon} ${styles[item.color]}`}>{item.icon}</div>
          <span className={styles.label}>{item.label}</span>
        </button>
      ))}
    </section>
  );
}