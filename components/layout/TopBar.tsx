"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./TopBar.module.css";

export default function TopBar() {
  const [bunnyName, setBunnyName] = useState("로그인");

  useEffect(() => {
    const getUserInfo = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error(error.message);
        return;
      }

      const user = data.user;

      if (user?.user_metadata?.bunny_name) {
        setBunnyName(user.user_metadata.bunny_name);
      }
    };

    getUserInfo();
  }, []);

  return (
    <header className={styles.topbar}>
      <div className={styles.brand}>
        <span className={styles.brandIcon}>🥕</span>
        <span className={styles.brandText}>Phonics Bunny</span>
      </div>

      <div className={styles.right}>
        <div className={styles.userBox}>
          <span className={styles.coin}>🪙</span>
          <span className={styles.coinText}>25</span>

          <span className={styles.divider}>|</span>

          <span className={styles.role}>{bunnyName}</span>
        </div>
      </div>
    </header>
  );
}