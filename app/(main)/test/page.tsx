"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  SpeakerHigh,
  ChatCircleDots,
  BookOpenText,
  ArrowRight,
  CheckCircle,
} from "@phosphor-icons/react";

import styles from "./test.module.css";

import {
  getPhonicsCategoryProgress,
} from "@/lib/testProgress";

import {
  countPassedReadingStories,
  getReadingProgress,
} from "@/lib/readingTestProgress";

import {
  PHONICS_STAGE_COUNT,
  PHONICS_TEST_CATEGORY_IDS,
} from "@/lib/phonicsTestRules";

import {
  bookLevels,
} from "../book/data";

/* ─────────────────────────────
   Phonics Categories
───────────────────────────── */

const PHONICS_CATEGORIES =
  PHONICS_TEST_CATEGORY_IDS;

const TOTAL_PHONICS_STAGES =
  PHONICS_CATEGORIES.length *
  PHONICS_STAGE_COUNT;

const TOTAL_READING_STORIES =
  bookLevels.reduce(
    (
      total,
      level
    ) =>
      total +
      level.stories.length,
    0
  );

/* ─────────────────────────────
   Menu
───────────────────────────── */

const testMenus = [
  {
    id: "phonics",

    title:
      "Phonics Challenge",

    subtitle:
      "Sounds · Words · Spelling",

    description:
      "배운 파닉스의 소리와 단어, 철자를 문제를 풀며 확인해요.",

    icon:
      SpeakerHigh,

    cardClassName:
      "phonicsCard",

    iconClassName:
      "phonicsIcon",

    href:
      "/test/phonics",
  },

  {
    id:
      "conversation",

    title:
      "Conversation Quiz",

    subtitle:
      "Choose the right expression",

    description:
      "상황과 대화를 보고 알맞은 영어 표현을 골라보세요.",

    icon:
      ChatCircleDots,

    cardClassName:
      "conversationCard",

    iconClassName:
      "conversationIcon",

    href:
      "/test/conversation",
  },

  {
    id:
      "reading",

    title:
      "Reading Quiz",

    subtitle:
      "Check your story understanding",

    description:
      "읽었던 이야기를 떠올리며 내용을 얼마나 이해했는지 확인해요.",

    icon:
      BookOpenText,

    cardClassName:
      "readingCard",

    iconClassName:
      "readingIcon",

    href:
      "/test/reading",
  },
];

/* ─────────────────────────────
   Page
───────────────────────────── */

export default function TestPage() {
  const router =
    useRouter();

  const [
    completedPhonicsStages,
    setCompletedPhonicsStages,
  ] =
    useState(0);

  const [
    completedReadingStories,
    setCompletedReadingStories,
  ] =
    useState(0);

  const [
    isProgressLoading,
    setIsProgressLoading,
  ] =
    useState(true);

  /* ─────────────────────────────
     Load Progress
  ───────────────────────────── */

  useEffect(() => {
    /*
      5개 파닉스 영역의
      진행상황을 동시에 불러옴
    */
    const loadPhonics =
      async () => {
        try {
          const results =
            await Promise.all(
              PHONICS_CATEGORIES.map(
                (
                  category
                ) =>
                  getPhonicsCategoryProgress(
                    category
                  )
              )
            );

          /*
            passed === true인 Stage만
            완료된 Stage로 계산
          */
          const completed =
            results.reduce(
              (
                total,
                categoryProgress
              ) => {
                const passedCount =
                  categoryProgress.stages.filter(
                    (
                      stage
                    ) =>
                      stage.passed
                  ).length;

                return (
                  total +
                  passedCount
                );
              },
              0
            );

          setCompletedPhonicsStages(
            completed
          );
        } catch (
          error
        ) {
          console.error(
            "Phonics 진행률 불러오기 실패:",
            error
          );

          setCompletedPhonicsStages(
            0
          );
        }
      };

    /*
      통과한 Reading 이야기 수
    */
    const loadReading =
      async () => {
        try {
          const progress =
            await getReadingProgress();

          setCompletedReadingStories(
            countPassedReadingStories(
              progress
            )
          );
        } catch (
          error
        ) {
          console.error(
            "Reading 진행률 불러오기 실패:",
            error
          );

          setCompletedReadingStories(
            0
          );
        }
      };

    const loadProgress =
      async () => {
        setIsProgressLoading(
          true
        );

        await Promise.all([
          loadPhonics(),
          loadReading(),
        ]);

        setIsProgressLoading(
          false
        );
      };

    loadProgress();
  }, []);

  /* ─────────────────────────────
     Progress

     진행도를 보여주는 카드만 등록
  ───────────────────────────── */

  const menuProgress:
    Record<
      string,
      {
        completed: number;
        total: number;
        unit: string;
      }
    > = {
    phonics: {
      completed:
        completedPhonicsStages,

      total:
        TOTAL_PHONICS_STAGES,

      unit:
        "Stages",
    },

    reading: {
      completed:
        completedReadingStories,

      total:
        TOTAL_READING_STORIES,

      unit:
        "Stories",
    },
  };

  /* ─────────────────────────────
     Render
  ───────────────────────────── */

  return (
    <section
      className={
        styles.page
      }
    >
      <div
        className={
          styles.hero
        }
      >
        <div
          className={
            styles.inner
          }
        >
          {/* Header */}

          <div
            className={
              styles.header
            }
          >
            <p
              className={
                styles.eyebrow
              }
            >
              CHECK YOUR LEARNING
            </p>

            <h1
              className={
                styles.title
              }
            >
              Test
            </h1>

            <p
              className={
                styles.subtitle
              }
            >
              Choose a challenge
              and check what you
              learned!
            </p>
          </div>

          {/* Cards */}

          <div
            className={
              styles.grid
            }
          >
            {testMenus.map(
              (
                menu
              ) => {
                const Icon =
                  menu.icon;

                const progress =
                  menuProgress[
                    menu.id
                  ];

                const progressPercent =
                  progress &&
                  progress.total >
                    0
                    ? Math.round(
                        (progress.completed /
                          progress.total) *
                          100
                      )
                    : 0;

                const isCompleted =
                  !!progress &&
                  progress.total >
                    0 &&
                  progress.completed ===
                    progress.total;

                return (
                  <button
                    key={
                      menu.id
                    }
                    type="button"
                    className={`${styles.card} ${
                      styles[
                        menu
                          .cardClassName
                      ]
                    }`}
                    onClick={() =>
                      router.push(
                        menu.href
                      )
                    }
                  >
                    {/* Icon */}

                    <div
                      className={`${styles.iconBox} ${
                        styles[
                          menu
                            .iconClassName
                        ]
                      }`}
                    >
                      <Icon
                        size={50}
                        weight="duotone"
                      />
                    </div>

                    {/* Text */}

                    <div
                      className={
                        styles.cardContent
                      }
                    >
                      <h2>
                        {
                          menu.title
                        }
                      </h2>

                      <p
                        className={
                          styles.cardSubtitle
                        }
                      >
                        {
                          menu.subtitle
                        }
                      </p>

                      <p
                        className={
                          styles.description
                        }
                      >
                        {
                          menu.description
                        }
                      </p>

                      {/* Progress */}

                      {progress && (
                        <div
                          className={
                            styles.progressArea
                          }
                        >
                          {isProgressLoading ? (
                            <p
                              className={
                                styles.progressLoading
                              }
                            >
                              Loading progress...
                            </p>
                          ) : (
                            <>
                              <div
                                className={
                                  styles.progressTop
                                }
                              >
                                <span
                                  className={
                                    styles.progressText
                                  }
                                >
                                  {progress.completed}
                                  {" / "}
                                  {progress.total}
                                  {" "}
                                  {progress.unit}
                                </span>

                                <span
                                  className={
                                    styles.progressPercent
                                  }
                                >
                                  {
                                    progressPercent
                                  }
                                  %
                                </span>
                              </div>

                              <div
                                className={
                                  styles.progressTrack
                                }
                              >
                                <div
                                  className={
                                    styles.progressBar
                                  }
                                  style={{
                                    width:
                                      `${progressPercent}%`,
                                  }}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom */}

                    <div
                      className={
                        styles.startRow
                      }
                    >
                      <span>
                        {isCompleted
                          ? "Completed"
                          : progress &&
                              progress.completed >
                                0
                            ? "Continue"
                            : "Start"}
                      </span>

                      <span
                        className={
                          styles.arrow
                        }
                      >
                        {isCompleted ? (
                          <CheckCircle
                            size={
                              21
                            }
                            weight="fill"
                          />
                        ) : (
                          <ArrowRight
                            size={
                              20
                            }
                            weight="bold"
                          />
                        )}
                      </span>
                    </div>
                  </button>
                );
              }
            )}
          </div>

          {/* Bottom Guide */}

          <div
            className={
              styles.guideBox
            }
          >
            <div>
              <strong>
                Complete a test
              </strong>

              <p>
                학습한 내용을
                확인하고 결과를 My
                Page에서 다시 볼 수
                있어요.
              </p>
            </div>

            <span
              className={
                styles.guideBadge
              }
            >
              3 Challenges
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}