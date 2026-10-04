"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import styles from "./LoginNotice.module.css";

/*
  로그인하지 않은 사용자에게
  테스트를 시작하기 전에 결과가 저장되지 않는다는 것을 알려줌
  (로그인 상태이거나 확인 중일 때는 아무것도 표시하지 않음)
*/
export default function LoginNotice() {
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();

      setIsLoggedOut(!data.user);
    };

    checkUser();
  }, []);

  if (!isLoggedOut) {
    return null;
  }

  return (
    <div className={styles.notice} role="note">
      <p>
        로그인하지 않으면 테스트 결과와 진행 상황이 저장되지 않아요.
      </p>

      <Link href="/login" className={styles.loginLink}>
        로그인하기
      </Link>
    </div>
  );
}
