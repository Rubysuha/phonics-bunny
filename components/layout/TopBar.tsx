"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./TopBar.module.css";

export default function TopBar() {
  const router = useRouter();

  const [bunnyName, setBunnyName] = useState("로그인");
  const [coins, setCoins] = useState(0);

  useEffect(() => {
  const getUserInfo = async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error(error.message);
      return;
    }

    const user = data.user;

    if (!user) return;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("bunny_name, coins")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("프로필 불러오기 실패:", profileError);
      return;
    }

    setBunnyName(profile?.bunny_name ?? "로그인");
    setCoins(profile?.coins ?? 0);
  };

  getUserInfo();

  window.addEventListener("coin-updated", getUserInfo);

  return () => {
    window.removeEventListener("coin-updated", getUserInfo);
  };
}, []);

  return (
    <header className={styles.topbar}>
      <div className={styles.brand}>
        <span className={styles.brandIcon}>🥕</span>
        <span className={styles.brandText}>Phonics Bunny</span>
      </div>

      <div className={styles.right}>
        <div
          className={styles.userBox}
          onClick={() => router.push("/mypage")}
        >
          <span className={styles.coin}>🥕</span>
          <span className={styles.coinText}>{coins}</span>

          <span className={styles.divider}>|</span>

          <span className={styles.role}>
          {bunnyName} ›
          </span>
        </div>
      </div>
    </header>
  );
}