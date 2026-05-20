"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import styles from "./signup.module.css";

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    role: "parent",
    email: "",
    password: "",
    passwordCheck: "",
    phone: "",
    childName: "",
    childAge: "",
    childGender: "선택 안 함",
    bunnyName: "",
    englishLevel: "처음이에요",
    teacherClassAge: "",
    teacherInstitution: "",
  });

  const passwordMismatch =
    form.passwordCheck.length > 0 && form.password !== form.passwordCheck;

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !form.email ||
      !form.password ||
      !form.passwordCheck ||
      !form.phone ||
      !form.bunnyName
    ) {
      alert("필수 항목을 모두 입력해 주세요.");
      return;
    }

    if (passwordMismatch) {
      alert("비밀번호가 서로 달라요.");
      return;
    }

    if (form.role === "parent" && (!form.childName || !form.childAge)) {
      alert("학부모 가입은 아이 이름과 나이를 입력해 주세요.");
      return;
    }

    if (
      form.role === "teacher" &&
      (!form.teacherClassAge || !form.teacherInstitution)
    ) {
      alert("선생님 가입은 담당 반과 기관명을 입력해 주세요.");
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          role: form.role,
          phone: form.phone,
          child_name: form.role === "parent" ? form.childName : "",
          child_age: form.role === "parent" ? form.childAge : "",
          child_gender: form.role === "parent" ? form.childGender : "",
          teacher_class_age:
            form.role === "teacher" ? form.teacherClassAge : "",
          teacher_institution:
            form.role === "teacher" ? form.teacherInstitution : "",
          bunny_name: form.bunnyName,
          english_level: form.englishLevel,
          coins: 0,
          bunny_stage: "Kindergarten",
        },
      },
    });

    if (error) {
      setIsLoading(false);
      alert("회원가입에 실패했어. 이메일이나 비밀번호를 확인해줘.");
      console.error(error.message);
      return;
    }

    const userId = data.user?.id;

    if (userId) {
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: userId,
          email: form.email,
          bunny_name: form.bunnyName,
          phone: form.phone,
        },
      ]);

      if (profileError) {
        console.error(profileError.message);
      }
    }

    setIsLoading(false);

    alert("회원가입이 완료됐어. 이메일 인증 후 로그인해줘.");
    router.push("/login");
  };

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>🐰</div>

          <div>
            <h1 className={styles.title}>회원가입</h1>
            <p className={styles.subtitle}>
              가입 유형과 학습 정보를 입력해 주세요.
            </p>
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSignup}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>가입 유형</h2>

            <div className={styles.modeRow}>
              <label
                className={`${styles.modeCard} ${
                  form.role === "parent" ? styles.activeMode : ""
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="parent"
                  checked={form.role === "parent"}
                  onChange={handleChange}
                />
                <strong>학부모</strong>
                <span>아이 학습 관리</span>
              </label>

              <label
                className={`${styles.modeCard} ${
                  form.role === "teacher" ? styles.activeMode : ""
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="teacher"
                  checked={form.role === "teacher"}
                  onChange={handleChange}
                />
                <strong>선생님</strong>
                <span>학습 관리 및 지도</span>
              </label>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>계정 정보</h2>

            <div className={styles.grid}>
              <label className={styles.label}>
                이메일
                <input
                  name="email"
                  type="email"
                  className={styles.input}
                  placeholder="이메일"
                  value={form.email}
                  onChange={handleChange}
                />
              </label>

              <label className={styles.label}>
                전화번호
                <input
                  name="phone"
                  type="tel"
                  className={styles.input}
                  placeholder="010-0000-0000"
                  value={form.phone}
                  onChange={handleChange}
                />
              </label>

              <label className={styles.label}>
                비밀번호
                <input
                  name="password"
                  type="password"
                  className={styles.input}
                  placeholder="비밀번호"
                  value={form.password}
                  onChange={handleChange}
                />
              </label>

              <label className={styles.label}>
                비밀번호 확인
                <input
                  name="passwordCheck"
                  type="password"
                  className={`${styles.input} ${
                    passwordMismatch ? styles.inputError : ""
                  }`}
                  placeholder="비밀번호 확인"
                  value={form.passwordCheck}
                  onChange={handleChange}
                />

                {passwordMismatch && (
                  <span className={styles.errorText}>
                    비밀번호가 서로 달라요.
                  </span>
                )}
              </label>
            </div>
          </div>

          {form.role === "parent" && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>아이 정보</h2>

              <div className={styles.grid}>
                <label className={styles.label}>
                  아이 이름
                  <input
                    name="childName"
                    type="text"
                    className={styles.input}
                    placeholder="아이 이름"
                    value={form.childName}
                    onChange={handleChange}
                  />
                </label>

                <label className={styles.label}>
                  아이 나이
                  <input
                    name="childAge"
                    type="number"
                    className={styles.input}
                    placeholder="예: 7"
                    value={form.childAge}
                    onChange={handleChange}
                  />
                </label>

                <label className={styles.label}>
                  성별
                  <select
                    name="childGender"
                    className={styles.input}
                    value={form.childGender}
                    onChange={handleChange}
                  >
                    <option>남아</option>
                    <option>여아</option>
                  </select>
                </label>
              </div>
            </div>
          )}

          {form.role === "teacher" && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>선생님 정보</h2>

              <div className={styles.grid}>
                <label className={styles.label}>
                  담당 반
                  <input
                    name="teacherClassAge"
                    type="text"
                    className={styles.input}
                    placeholder="예: 6세반 / 7세반 / 초등 저학년"
                    value={form.teacherClassAge}
                    onChange={handleChange}
                  />
                </label>

                <label className={styles.label}>
                  기관명
                  <input
                    name="teacherInstitution"
                    type="text"
                    className={styles.input}
                    placeholder="유치원, 학원, 공부방 이름"
                    value={form.teacherInstitution}
                    onChange={handleChange}
                  />
                </label>
              </div>
            </div>
          )}

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>토끼와 학습 설정</h2>

            <div className={styles.grid}>
              <label className={styles.label}>
                토끼 이름
                <input
                  name="bunnyName"
                  type="text"
                  className={styles.input}
                  placeholder="예: Bunny"
                  value={form.bunnyName}
                  onChange={handleChange}
                />
              </label>

              <label className={styles.label}>
                영어 학습 수준
                <select
                  name="englishLevel"
                  className={styles.input}
                  value={form.englishLevel}
                  onChange={handleChange}
                >
                  <option>처음이에요</option>
                  <option>알파벳 정도 알아요</option>
                  <option>간단한 단어는 알아요</option>
                  <option>간단한 문장은 가능해요</option>
                </select>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className={styles.signupButton}
            disabled={isLoading || passwordMismatch}
          >
            {isLoading ? "가입 중..." : "가입하고 시작하기"}
          </button>
        </form>

        <p className={styles.loginText}>
          이미 계정이 있나요? <Link href="/login">로그인</Link>
        </p>
      </section>
    </main>
  );
}