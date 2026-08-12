"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./shop.module.css";
import { categories, bunnySkins, backgroundSkins } from "./data";

export default function ShopPage() {
  const router = useRouter();

  const [coin, setCoin] = useState<number>(0);

  const [selectedBunnyImage, setSelectedBunnyImage] =
    useState<string>("/shop/bunny.png");

  const [backgroundImage, setBackgroundImage] = useState<string>(
    "/shop/closet-bg.png"
  );

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("coins, selected_bunny_id, selected_background_id")
        .eq("id", user.id)
        .single();

      if (error || !data) {
        console.error("프로필 불러오기 실패:", error);
        return;
      }

      setCoin(data.coins ?? 0);

      const selectedBunny = bunnySkins.find(
        (bunny) => bunny.id === data.selected_bunny_id
      );

      if (selectedBunny) {
        setSelectedBunnyImage(selectedBunny.image);
      }

      const selectedBg = backgroundSkins.find(
        (bg) => bg.id === (data.selected_background_id ?? "default_bg")
      );

      if (selectedBg) {
        setBackgroundImage(selectedBg.image);
      }
    };

    fetchProfile();
  }, []);

  return (
    <section className={styles.page}>
      <div className={styles.pageInner}>
        <img src={backgroundImage} alt="closet" className={styles.bg} />

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
              className={styles.categoryButton}
              onClick={() => router.push(`/shop/${category.id}`)}
            >
              <span>{category.icon}</span>
              <strong>{category.label}</strong>
            </button>
          ))}
        </div>

        <div className={styles.bunnyArea}>
          <img
            src={selectedBunnyImage}
            alt="Selected Bunny"
            className={styles.bunny}
          />
        </div>
      </div>
    </section>
  );
}