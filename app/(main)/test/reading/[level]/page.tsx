"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
} from "@phosphor-icons/react";

import {
  getBookLevel,
} from "../../../book/data";

import {
  countPassedReadingStories,
  getReadingProgress,
  getReadingStoryProgress,
  type ReadingProgress,
} from "@/lib/readingTestProgress";

import {
  READING_QUESTION_COUNT,
} from "@/lib/readingTestRules";

import styles from "./level.module.css";

import LoginNotice from "../../LoginNotice";

export default function ReadingLevelPage() {
  const router =
    useRouter();

  const params =
    useParams();

  const levelParam =
    Array.isArray(
      params.level
    )
      ? params.level[0]
      : params.level;

  const level =
    typeof levelParam ===
    "string"
      ? levelParam
      : "";

  const currentLevel =
    getBookLevel(
      level
    );

  /* ─────────────────────────────
     Progress
  ───────────────────────────── */

  const [
    progress,
    setProgress,
  ] =
    useState<ReadingProgress>({
      stories: {},
    });

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true);

  useEffect(() => {
    if (
      !currentLevel
    ) {
      setIsLoading(
        false
      );

      return;
    }

    const loadProgress =
      async () => {
        try {
          setIsLoading(
            true
          );

          setProgress(
            await getReadingProgress(
              level
            )
          );
        } catch (
          error
        ) {
          console.error(
            "Reading 진행률 불러오기 실패:",
            error
          );
        } finally {
          setIsLoading(
            false
          );
        }
      };

    loadProgress();
  }, [
    currentLevel,
    level,
  ]);

  if (
    !currentLevel
  ) {
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
              styles.invalidBox
            }
          >
            <h1>
              Level not found
            </h1>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/test/reading"
                )
              }
            >
              Back to Reading Quiz
            </button>
          </div>
        </div>
      </section>
    );
  }

  const totalStories =
    currentLevel.stories.length;

  const passedStories =
    countPassedReadingStories(
      progress,
      level
    );

  const progressPercent =
    totalStories > 0
      ? Math.round(
          (passedStories /
            totalStories) *
            100
        )
      : 0;

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
          {/* Top */}

          <button
            type="button"
            className={
              styles.backButton
            }
            onClick={() =>
              router.push(
                "/test/reading"
              )
            }
          >
            <ArrowLeft
              size={22}
              weight="bold"
            />
          </button>

          {/* Header */}

          <header
            className={
              styles.header
            }
          >
            <p
              className={
                styles.eyebrow
              }
            >
              READING QUIZ
            </p>

            <h1>
              {
                currentLevel.title
              }
            </h1>

            <p
              className={
                styles.levelDescription
              }
            >
              {
                currentLevel.description
              }
            </p>

            <p
              className={
                styles.guide
              }
            >
              읽었던 이야기를 선택해서
              이해도 퀴즈를 풀어보세요.
            </p>

            <div
              className={
                styles.progressArea
              }
            >
              {isLoading ? (
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
                    <span>
                      {
                        passedStories
                      }
                      {" / "}
                      {
                        totalStories
                      }
                      {" "}
                      Stories Passed
                    </span>

                    <span>
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
          </header>

          <LoginNotice />

          {/* Stories */}

          <div
            className={
              styles.grid
            }
          >
            {currentLevel.stories.map(
              (
                story,
                index
              ) => {
                const storyProgress =
                  getReadingStoryProgress(
                    progress,
                    level,
                    story.slug
                  );

                return (
                <button
                  key={
                    story.slug
                  }
                  type="button"
                  className={`${styles.storyCard} ${
                    storyProgress?.passed
                      ? styles.passedCard
                      : ""
                  }`}
                  onClick={() =>
                    router.push(
                      `/test/reading/${currentLevel.level}/${story.slug}`
                    )
                  }
                >
                  <div
                    className={
                      styles.storyNumber
                    }
                  >
                    {
                      index + 1
                    }
                  </div>

                  <div
                    className={
                      styles.storyContent
                    }
                  >
                    <h2>
                      {
                        story.title
                      }
                    </h2>

                    <div
                      className={
                        styles.storyMeta
                      }
                    >
                      <BookOpen
                        weight="duotone"
                      />

                      <span>
                        {
                          story
                            .sentences
                            .length
                        }
                        {" "}
                        Sentences
                      </span>

                      <span>
                        ·
                      </span>

                      <span>
                        {
                          READING_QUESTION_COUNT
                        }
                        {" "}
                        Questions
                      </span>
                    </div>

                    {storyProgress && (
                      <div
                        className={
                          styles.storyResult
                        }
                      >
                        <span
                          className={
                            styles.storyStars
                          }
                          aria-label={`${storyProgress.stars} stars`}
                        >
                          {[
                            1,
                            2,
                            3,
                          ].map(
                            (
                              star
                            ) =>
                              star <=
                              storyProgress.stars
                                ? "★"
                                : "☆"
                          )}
                        </span>

                        <span>
                          Best{" "}
                          {
                            storyProgress.bestScore
                          }
                          /
                          {
                            storyProgress.totalQuestions
                          }
                        </span>

                        {storyProgress.passed && (
                          <span
                            className={
                              styles.passedBadge
                            }
                          >
                            Passed
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <span
                    className={
                      styles.arrow
                    }
                  >
                    <ArrowRight
                      weight="bold"
                    />
                  </span>
                </button>
                );
              }
            )}
          </div>
        </div>
      </div>
    </section>
  );
}