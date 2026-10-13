"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Sparkle } from "@phosphor-icons/react";
import { supabase } from "@/lib/supabase";
import styles from "./FloatingReportButton.module.css";

/*
  Home 오른쪽 아래에 떠 있는 "AI Learning Coach" 버튼

  누르면 AI Learning Coach 화면(/coach)으로 이동만 함 (여기서는 리포트를 만들지 않음).
  로그인한 경우에만 보임
*/
export default function FloatingReportButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;

    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (!cancelled) setIsLoggedIn(Boolean(data.user));
      })
      .catch(() => {
        /* 확인하지 못하면 버튼을 보이지 않음 */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <Link
      href="/coach"
      className={styles.button}
      aria-label="AI Learning Coach 열기"
    >
      <Sparkle size={26} weight="fill" />

      <span className={styles.tooltip} role="tooltip">
        AI Learning Coach
      </span>
    </Link>
  );
}
