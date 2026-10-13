"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CaretRight, Carrot } from "@phosphor-icons/react";
import { supabase } from "@/lib/supabase";
import styles from "./TopBar.module.css";

type UserInfo = {
  bunnyName: string;
  coins: number;
};

export default function TopBar() {
  /* 불러오는 동안에는 "로그인"이 잠깐 보이지 않도록 비워 둠 */
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const getUserInfo = async () => {
      const { data, error } = await supabase.auth.getUser();

      const user = data.user;

      if (error || !user) {
        setUserInfo(null);
        setIsLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("bunny_name, coins")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("프로필 불러오기 실패:", profileError);
      }

      setUserInfo({
        bunnyName: profile?.bunny_name ?? "My Bunny",
        coins: profile?.coins ?? 0,
      });
      setIsLoading(false);
    };

    getUserInfo();

    window.addEventListener("coin-updated", getUserInfo);

    return () => {
      window.removeEventListener("coin-updated", getUserInfo);
    };
  }, []);

  return (
    <header className={styles.topbar}>
      <Link href="/dashboard" className={styles.brand} aria-label="Home으로 가기">
        <span className={styles.brandIcon}>
          <Carrot size={32} weight="fill" />
        </span>
        <span className={styles.brandText}>Phonics Bunny</span>
      </Link>

      <div className={styles.right}>
        {isLoading ? (
          <div
            className={`${styles.userBox} ${styles.userBoxLoading}`}
            aria-hidden="true"
          />
        ) : userInfo ? (
          <Link
            href="/mypage"
            className={styles.userBox}
            aria-label={`당근 ${userInfo.coins}개, ${userInfo.bunnyName} 마이페이지`}
          >
            <span className={styles.coinChip}>
              <Carrot size={20} weight="fill" />
              <span className={styles.coinText}>{userInfo.coins}</span>
            </span>

            <span className={styles.role}>{userInfo.bunnyName}</span>

            <CaretRight
              className={styles.caret}
              size={16}
              weight="bold"
            />
          </Link>
        ) : (
          <Link href="/login" className={styles.userBox}>
            <span className={styles.role}>로그인</span>

            <CaretRight
              className={styles.caret}
              size={16}
              weight="bold"
            />
          </Link>
        )}
      </div>
    </header>
  );
}
