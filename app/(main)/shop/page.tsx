"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./shop.module.css";

const categories = [
  { id: "hat", label: "모자", icon: "👒" },
  { id: "bag", label: "가방", icon: "👜" },
  { id: "clothes", label: "옷", icon: "👗" },
  { id: "glasses", label: "안경", icon: "👓" },
  { id: "hair", label: "가발", icon: "👩" },
  { id: "item", label: "아이템", icon: "⭐" },
];

const equippedItems = [
  {
    id: 1,
    category: "hat",
    name: "Straw Hat",
    image: "/shop/items/straw-hat.png",
  },
  {
    id: 2,
    category: "bag",
    name: "Pink Bag",
    image: "/shop/items/pink-bag.png",
  },
];

export default function ShopPage() {
  const router = useRouter();
  const [coin] = useState(125);
  const [selectedCategory, setSelectedCategory] = useState("hat");
  const [showStage, setShowStage] = useState(false);

  return (
    <section className={styles.page}>
      <div className={styles.pageInner}>
        <img src="/shop/closet-bg.png" alt="closet" className={styles.bg} />

        <button
          className={styles.backButton}
          onClick={() => router.push("/dashboard")}
        >
          ←
        </button>

        <div className={styles.titleBox}>
          <h1>Bunny Closet</h1>
        </div>

        <div className={styles.coinBox}>
          <span>🥕</span>
          <strong>{coin}</strong>
          <span>Coin</span>
        </div>

        <div className={styles.categoryBox}>
          {categories.map((category) => (
            <button
              key={category.id}
              className={`${styles.categoryButton} ${
                selectedCategory === category.id ? styles.active : ""
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span>{category.icon}</span>
              <strong>{category.label}</strong>
            </button>
          ))}
        </div>

        <div className={styles.bunnyArea}>
          <img src="/shop/bunny.png" alt="Bunny" className={styles.bunny} />

          {equippedItems.map((item) => (
            <img
              key={item.category}
              src={item.image}
              alt={item.name}
              className={`${styles.equippedItem} ${
                styles[`equipped_${item.category}`]
              }`}
            />
          ))}

          <button
            className={styles.previewButton}
            onClick={() => setShowStage(true)}
          >
            이미지 보기
          </button>
        </div>

        <div className={styles.equippedPanel}>
          <div className={styles.equippedTitle}>현재 착용 아이템</div>

          <div className={styles.equippedList}>
            {equippedItems.map((item) => (
              <div key={item.id} className={styles.equippedCard}>
                <img src={item.image} alt={item.name} />
                <strong>{item.name}</strong>
              </div>
            ))}
          </div>
        </div>

        {showStage && (
          <div className={styles.modal}>
            <div className={styles.stage}>
              <button
                className={styles.closeButton}
                onClick={() => setShowStage(false)}
              >
                ×
              </button>

              <div className={styles.sparkle}>✨ 짜라란! ✨</div>

              <div className={styles.stageCircle}>
                <img
                  src="/shop/bunny.png"
                  alt="Bunny"
                  className={styles.stageBunny}
                />

                {equippedItems.map((item) => (
                  <img
                    key={item.category}
                    src={item.image}
                    alt={item.name}
                    className={`${styles.stageItem} ${
                      styles[`stage_${item.category}`]
                    }`}
                  />
                ))}
              </div>

              <p>오늘의 Bunny Look!</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}