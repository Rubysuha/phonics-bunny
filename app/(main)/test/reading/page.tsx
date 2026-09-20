"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
} from "@phosphor-icons/react";

import {
  bookLevels,
} from "../../book/data";

import {
  countPassedReadingStories,
  getReadingProgress,
  type ReadingProgress,
} from "@/lib/readingTestProgress";

import styles from "./reading-test.module.css";

export default function ReadingTestPage() {
  const router =
    useRouter();

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
    const loadProgress =
      async () => {
        try {
          setProgress(
            await getReadingProgress()
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
  }, []);

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
          {/* Back */}

          <button
            type="button"
            className={
              styles.backButton
            }
            onClick={() =>
              router.push(
                "/test"
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
            <div
              className={
                styles.headerIcon
              }
            >
              <BookOpenText
                weight="duotone"
              />
            </div>

            <p
              className={
                styles.eyebrow
              }
            >
              READING TEST
            </p>

            <h1
              className={
                styles.title
              }
            >
              Reading Quiz
            </h1>

            <p
              className={
                styles.subtitle
              }
            >
              Choose a level and check
              how well you understood
              the stories.
            </p>
          </header>

          {/* Levels */}

          <div
            className={
              styles.grid
            }
          >
            {bookLevels.map(
              (
                level,
                index
              ) => (
                <button
                  key={
                    level.level
                  }
                  type="button"
                  className={
                    styles.levelCard
                  }
                  onClick={() =>
                    router.push(
                      `/test/reading/${level.level}`
                    )
                  }
                >
                  <div
                    className={
                      styles.levelNumber
                    }
                  >
                    {
                      index + 1
                    }
                  </div>

                  <div
                    className={
                      styles.cardContent
                    }
                  >
                    <p
                      className={
                        styles.levelLabel
                      }
                    >
                      READING LEVEL
                    </p>

                    <h2>
                      {
                        level.title
                      }
                    </h2>

                    <p
                      className={
                        styles.description
                      }
                    >
                      {
                        level.description
                      }
                    </p>

                    <div
                      className={
                        styles.storyCount
                      }
                    >
                      <strong>
                        {
                          level
                            .stories
                            .length
                        }
                      </strong>

                      {" "}
                      Stories
                    </div>

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
                              {countPassedReadingStories(
                                progress,
                                level.level
                              )}
                              {" / "}
                              {
                                level
                                  .stories
                                  .length
                              }
                              {" "}
                              Passed
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
                                  `${
                                    (countPassedReadingStories(
                                      progress,
                                      level.level
                                    ) /
                                      level
                                        .stories
                                        .length) *
                                    100
                                  }%`,
                              }}
                            />
                          </div>
                        </>
                      )}
                    </div>
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
              )
            )}
          </div>

          {/* Guide */}

          <div
            className={
              styles.guideBox
            }
          >
            <div>
              <strong>
                Read first, then quiz!
              </strong>

              <p>
                Book에서 읽었던 이야기를
                선택하고 내용과 순서를
                얼마나 이해했는지 확인해요.
              </p>
            </div>

            <span
              className={
                styles.guideBadge
              }
            >
              5 Questions
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}