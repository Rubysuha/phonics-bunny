"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !password) {
      alert("이메일과 비밀번호를 입력해 주세요.");
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      alert("로그인에 실패했어요. 이메일 또는 비밀번호를 확인해주세요.");
      console.error(error.message);
      return;
    }

    router.push("/dashboard");
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      alert("구글 로그인 연결 중 오류가 발생했어.");
      console.error(error.message);
    }
  };

  const handleFindPassword = async () => {
    if (!email) {
      alert("비밀번호를 재설정할 이메일을 먼저 입력해 주세요.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      alert("비밀번호 재설정 메일 발송에 실패했어요.");
      console.error(error.message);
      return;
    }

    alert("비밀번호 재설정 메일을 보냈어요. 이메일을 확인해주세요.");
  };

  const handleFindEmail = () => {
    alert("Phonics Bunny는 이메일을 아이디로 사용해요. 가입할 때 사용한 이메일로 로그인해주세요.");
  };

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.left}>
          <div className={styles.logo}>🐰</div>

          <h1 className={styles.title}>Phonics Bunny</h1>

          <p className={styles.subtitle}>
            우리 아이의 영어 학습을 시작해 보세요.
          </p>

          <div className={styles.bunnyCircle}>
            <img
              src="/bunny-new.png"
              alt="Phonics Bunny"
              className={styles.bunny}
            />
          </div>
        </div>

        <div className={styles.right}>
          <h2 className={styles.formTitle}>로그인</h2>

          <p className={styles.formText}>
            학습 진도, 보유 코인, 토끼 성장 단계를 확인할 수 있어요.
          </p>

          <form className={styles.form} onSubmit={handleLogin}>
            <label className={styles.label}>
              이메일
              <input
                type="email"
                className={styles.input}
                placeholder="이메일을 입력해 주세요"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <label className={styles.label}>
              비밀번호
              <div className={styles.passwordWrap}>
                <input
                  type={showPassword ? "text" : "password"}
                  className={styles.input}
                  placeholder="비밀번호를 입력해 주세요"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />

                <button
                  type="button"
                  className={styles.showButton}
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? "숨기기" : "보기"}
                </button>
              </div>
            </label>

            <button type="submit" className={styles.loginButton} disabled={isLoading}>
              {isLoading ? "로그인 중..." : "로그인하기"}
            </button>
          </form>

          <div className={styles.findRow}>
            <button type="button" className={styles.findButton} onClick={handleFindEmail}>
              아이디 찾기
            </button>

            <span>|</span>

            <button type="button" className={styles.findButton} onClick={handleFindPassword}>
              비밀번호 찾기
            </button>
          </div>

          <button type="button" className={styles.googleButton} onClick={handleGoogleLogin}>
            Google 계정으로 로그인
          </button>

          <p className={styles.signupText}>
            아직 계정이 없나요? <Link href="/signup">회원가입</Link>
          </p>
        </div>
      </section>
    </main>
  );
}