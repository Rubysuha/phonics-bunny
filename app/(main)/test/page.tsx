"use client";

import { useEffect, useState, } from "react";
import { useRouter, } from "next/navigation";
import { ArrowRight, CheckCircle } from "@phosphor-icons/react";
import styles from "./test.module.css";
import { getPhonicsCategoryProgress, } from "@/lib/testProgress";
import {
  countPassedReadingStories, getReadingProgress,
} from "@/lib/readingTestProgress";
import {
  PHONICS_STAGE_COUNT, PHONICS_TEST_CATEGORY_IDS,
} from "@/lib/phonicsTestRules";
import { getConversationProgress, } from "@/lib/conversationTestProgress";
import { bookLevels, } from "../book/data";
import { conversationTopics, } from "./conversation/data";

const PHONICS_CATEGORIES = PHONICS_TEST_CATEGORY_IDS;
const TOTAL_PHONICS_STAGES = PHONICS_CATEGORIES.length * PHONICS_STAGE_COUNT;
const TOTAL_READING_STORIES = bookLevels.reduce(
  (total, level) => total + level.stories.length, 0
);

const testMenus = [
  {
    id: "phonics",
    title: "Phonics Challenge",
    description: "배운 파닉스의 소리와 단어, 철자를 문제를 풀며 확인해요.",
    cardClassName: "phonicsCard",
    href: "/test/phonics",
  },
  {
    id: "conversation",
    title: "Conversation Quiz",
    description: "상황과 대화를 보고 알맞은 영어 표현을 골라보세요.",
    cardClassName: "conversationCard",
    href: "/test/conversation",
  },
  {
    id: "reading",
    title: "Reading Quiz",
    description: "읽었던 이야기를 떠올리며 내용을 얼마나 이해했는지 확인해요.",
    cardClassName: "readingCard",
    href: "/test/reading",
  },
];

export default function TestPage() {
  const router = useRouter();
  const [completedPhonicsStages, setCompletedPhonicsStages,] = useState(0);
  const [completedReadingStories, setCompletedReadingStories,] = useState(0);
  const [completedConversationTopics, setCompletedConversationTopics,] = useState(0);
  const [isProgressLoading, setIsProgressLoading,] = useState(true);

  useEffect(() => {
    const loadPhonics = async () => {
      try {
        const results = await Promise.all(
          PHONICS_CATEGORIES.map((category) =>
            getPhonicsCategoryProgress(category)
          )
        );

        const completed = results.reduce((total, categoryProgress) => {
          const passedCount = categoryProgress.stages.filter(
            (stage) => stage.passed
          ).length;

          return (total + passedCount);
        }, 0);

        setCompletedPhonicsStages(completed);
      } catch (error) {
        console.error("Phonics 진행률 불러오기 실패:", error);
        setCompletedPhonicsStages(0);
      }
    };

    const loadReading = async () => {
      try {
        const progress = await getReadingProgress();
        setCompletedReadingStories(countPassedReadingStories(progress));
      } catch (error) {
        console.error("Reading 진행률 불러오기 실패:", error);
        setCompletedReadingStories(0);
      }
    };

    const loadConversation = async () => {
      try {
        const progress = await getConversationProgress();
        setCompletedConversationTopics(
          progress.topics.filter((topic) => topic.passed).length
        );
      } catch (error) {
        console.error("Conversation 진행률 불러오기 실패:", error);
        setCompletedConversationTopics(0);
      }
    };

    const loadProgress = async () => {
      setIsProgressLoading(true);
      await Promise.all([loadPhonics(), loadConversation(), loadReading(),]);
      setIsProgressLoading(false);
    };

    loadProgress();
  }, []);

  const menuProgress: Record<string, {
    completed: number;
    total: number;
    unit: string;
  }> = {
    phonics: {
      completed: completedPhonicsStages,
      total: TOTAL_PHONICS_STAGES,
      unit: "Stages",
    },
    conversation: {
      completed: completedConversationTopics,
      total: conversationTopics.length,
      unit: "Topics",
    },
    reading: {
      completed: completedReadingStories,
      total: TOTAL_READING_STORIES,
      unit: "Stories",
    },
  };

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.inner}>
          <header className={styles.header}>
            <div className={styles.signText}>
              <h1 className={styles.title}>
                <span>TEST</span> <span>QUEST</span>
              </h1>

              <p className={styles.subtitle}>
                Check what you learned!
              </p>
            </div>
          </header>

          <div className={styles.grid}>
            {testMenus.map((menu) => {
              const progress = menuProgress[menu.id];

              const progressPercent = progress && progress.total > 0
                ? Math.round((progress.completed / progress.total) * 100)
                : 0;

              const isCompleted = !!progress && progress.total > 0
                && progress.completed === progress.total;

              return (
                <button
                  key={menu.id}
                  type="button"
                  className={`${styles.card} ${styles[menu.cardClassName]}`}
                  onClick={() => router.push(menu.href)}
                >
                  <div className={styles.cardArt} aria-hidden="true">
                    <img src={`/test/quest-${menu.id}.png`} alt="" />
                  </div>

                  <div className={styles.cardContent}>

                    <h2>{menu.title}</h2>

                    <p className={styles.description}>
                      {menu.description}
                    </p>

                    {progress && (
                      <div className={styles.progressArea}>
                        {isProgressLoading ? (
                          <p className={styles.progressLoading}>
                            Loading progress...
                          </p>
                        ) : (
                          <>
                            <div className={styles.progressTop}>
                              <span>
                                {progress.completed} / {progress.total} {progress.unit}
                              </span>

                              <span>{progressPercent}%</span>
                            </div>

                            <div className={styles.progressTrack}>
                              <div
                                className={styles.progressBar}
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <span className={styles.startRow}>
                    <span>
                      {isCompleted
                        ? "Completed"
                        : progress && progress.completed > 0
                          ? "Continue"
                          : "Start"}
                    </span>

                    {isCompleted
                      ? <CheckCircle size={22} weight="fill" />
                      : <ArrowRight size={22} weight="bold" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}