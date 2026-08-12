"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./dashboard.module.css";

type TodayLearning = {
  alphabet: number;
  shortVowels: number;
  longVowels: number;
  blendSounds: number;
  sightWords: number;
  conversation: number;
  book: number;
  total: number;
};

export default function DashboardPage() {
  const [todayLearning, setTodayLearning] = useState<TodayLearning>({
    alphabet: 0,
    shortVowels: 0,
    longVowels: 0,
    blendSounds: 0,
    sightWords: 0,
    conversation: 0,
    book: 0,
    total: 0,
  });

  useEffect(() => {
    const fetchTodayLearning = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("learning_logs")
        .select("category, title")
        .eq("user_id", user.id)
        .gte("created_at", todayStart.toISOString());

      if (error) {
        console.error("오늘 학습 기록 불러오기 실패:", error);
        return;
      }

      const logs = data ?? [];

      const alphabet = logs.filter(
        (log) => log.category === "alphabet"
      ).length;

      const shortVowels = logs.filter(
        (log) => log.category === "short-vowels"
      ).length;

      const longVowels = logs.filter(
        (log) => log.category === "long-vowels"
      ).length;

      const blendSounds = logs.filter(
        (log) => log.category === "blend-sounds"
      ).length;

      const sightWords = logs.filter(
        (log) => log.category === "sight-words"
      ).length;

      const conversation = logs.filter(
        (log) => log.category === "conversation"
      ).length;

      const book = logs.filter(
        (log) => log.category === "book"
      ).length;

      setTodayLearning({
        alphabet,
        shortVowels,
        longVowels,
        blendSounds,
        sightWords,
        conversation,
        book,
        total: logs.length,
      });
    };

    fetchTodayLearning();
  }, []);

  const getBunnyImage = () => {
    return "/bunny-new.png";
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Home</h1>

        <div className={styles.rightCards}>
          <div className={styles.todayLearningCard}>
            <div className={styles.cardHeader}>
              📚 Today’s Learning
            </div>

            <div className={styles.learningBody}>
              <div className={styles.learningSectionTitle}>
                Phonics
              </div>

              <div className={styles.learningRow}>
                <span>Alphabet</span>
                <strong>{todayLearning.alphabet}</strong>
              </div>

              <div className={styles.learningRow}>
                <span>Short Vowels</span>
                <strong>{todayLearning.shortVowels}</strong>
              </div>

              <div className={styles.learningRow}>
                <span>Long Vowels</span>
                <strong>{todayLearning.longVowels}</strong>
              </div>

              <div className={styles.learningRow}>
                <span>Blend Sounds</span>
                <strong>{todayLearning.blendSounds}</strong>
              </div>

              <div className={styles.learningRow}>
                <span>Sight Words</span>
                <strong>{todayLearning.sightWords}</strong>
              </div>

              <div className={styles.learningDivider}></div>

              <div className={styles.learningSectionTitle}>
                Speaking & Reading
              </div>

              <div className={styles.learningRow}>
                <span>Conversation</span>
                <strong>{todayLearning.conversation}</strong>
              </div>

              <div className={styles.learningRow}>
                <span>Book</span>
                <strong>{todayLearning.book}</strong>
              </div>

              <div className={styles.learningDivider}></div>

              <div className={styles.totalRow}>
                <span>🏆 Total</span>
                <strong>{todayLearning.total}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.centerWrap}>
          <div className={styles.centerArea}>
            <div className={styles.circle}>
              <Image
                src={getBunnyImage()}
                alt="Phonics Bunny"
                fill
                priority
                className={styles.bunny}
              />

              <span className={styles.sparkleLeft}>✦</span>
              <span className={styles.sparkleRight}>✦</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}