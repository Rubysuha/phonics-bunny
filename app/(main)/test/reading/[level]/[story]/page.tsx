"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  CheckCircle,
  XCircle,
  Trophy,
  ArrowCounterClockwise,
  ListBullets,
} from "@phosphor-icons/react";

import {
  getBookLevel,
  getBookStory,
} from "../../../../book/data";

import {
  generateReadingQuestions,
} from "../../questionGenerator";

import {
  saveReadingTestResult,
} from "@/lib/readingTestProgress";

import {
  getReadingStars,
  isReadingPassed,
} from "@/lib/readingTestRules";

import styles from "./story-quiz.module.css";

export default function ReadingStoryQuizPage() {
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

  const storyParam =
    Array.isArray(
      params.story
    )
      ? params.story[0]
      : params.story;

  const level =
    typeof levelParam ===
    "string"
      ? levelParam
      : "";

  const storySlug =
    typeof storyParam ===
    "string"
      ? storyParam
      : "";

  const currentLevel =
    getBookLevel(
      level
    );

  const currentStory =
    getBookStory(
      level,
      storySlug
    );

  const [
    attempt,
    setAttempt,
  ] =
    useState(0);

  const questions =
    useMemo(
      () =>
        generateReadingQuestions(
          level,
          storySlug,
          attempt
        ),
      [
        attempt,
        level,
        storySlug,
      ]
    );

  const [
    currentIndex,
    setCurrentIndex,
  ] =
    useState(0);

  const [
    selectedChoice,
    setSelectedChoice,
  ] =
    useState<
      string | null
    >(null);

  const [
    score,
    setScore,
  ] =
    useState(0);

  const [
    isFinished,
    setIsFinished,
  ] =
    useState(false);

  const [
    isSaving,
    setIsSaving,
  ] =
    useState(false);

  const [
    saveError,
    setSaveError,
  ] =
    useState<
      string | null
    >(null);

  /* Invalid */

  if (
    !currentLevel ||
    !currentStory ||
    questions.length ===
      0
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
              Quiz not found
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

  const currentQuestion =
    questions[
      currentIndex
    ];

  /* Answer */

  const handleChoice = (
    choice: string
  ) => {
    if (
      selectedChoice !==
      null
    ) {
      return;
    }

    setSelectedChoice(
      choice
    );

    if (
      choice ===
      currentQuestion.answer
    ) {
      setScore(
        (prev) =>
          prev + 1
      );
    }
  };

  /* Next */

  const handleNext =
    async () => {
      if (
        selectedChoice ===
          null ||
        isSaving
      ) {
        return;
      }

      const isLast =
        currentIndex ===
        questions.length -
          1;

      if (isLast) {
        setIsSaving(
          true
        );

        setSaveError(
          null
        );

        try {
          const result =
            await saveReadingTestResult({
              level,

              story:
                storySlug,

              score,

              totalQuestions:
                questions.length,
            });

          if (
            !result.success
          ) {
            setSaveError(
              result.message
            );
          }
        } catch (
          error
        ) {
          console.error(
            "Reading Quiz 저장 실패:",
            error
          );

          setSaveError(
            "테스트 결과를 저장하지 못했습니다."
          );
        } finally {
          setIsSaving(
            false
          );

          setIsFinished(
            true
          );
        }

        return;
      }

      setCurrentIndex(
        (prev) =>
          prev + 1
      );

      setSelectedChoice(
        null
      );
    };

  /* Retry */

  const handleRetry =
    () => {
      setCurrentIndex(
        0
      );

      setSelectedChoice(
        null
      );

      setScore(
        0
      );

      setSaveError(
        null
      );

      setAttempt(
        (prev) =>
          prev + 1
      );

      setIsFinished(
        false
      );
    };

  /* Next Story */

  const nextStory =
    currentLevel.stories[
      currentLevel.stories.findIndex(
        (item) =>
          item.slug ===
          storySlug
      ) + 1
    ];

  const handleNextStory =
    () => {
      if (!nextStory) {
        return;
      }

      setCurrentIndex(
        0
      );

      setSelectedChoice(
        null
      );

      setScore(
        0
      );

      setSaveError(
        null
      );

      setIsFinished(
        false
      );

      router.push(
        `/test/reading/${level}/${nextStory.slug}`
      );
    };

  /* Result */

  if (
    isFinished
  ) {
    const passed =
      isReadingPassed(
        score
      );

    const stars =
      getReadingStars(
        score
      );

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
              styles.resultWrap
            }
          >
            <div
              className={`${styles.resultCard} ${
                passed
                  ? styles.passCard
                  : styles.retryCard
              }`}
            >
              <div
                className={
                  styles.resultIcon
                }
              >
                {passed ? (
                  <Trophy
                    weight="duotone"
                  />
                ) : (
                  <ArrowCounterClockwise
                    weight="duotone"
                  />
                )}
              </div>

              <p
                className={
                  styles.resultEyebrow
                }
              >
                READING QUIZ
              </p>

              <h1>
                {passed
                  ? "Story Complete!"
                  : "Try Again!"}
              </h1>

              <p
                className={
                  styles.storyTitle
                }
              >
                {
                  currentStory.title
                }
              </p>

              <div
                className={
                  styles.stars
                }
              >
                {[
                  1,
                  2,
                  3,
                ].map(
                  (
                    star
                  ) => (
                    <span
                      key={
                        star
                      }
                      className={
                        star <=
                        stars
                          ? styles.starActive
                          : styles.starEmpty
                      }
                    >
                      ★
                    </span>
                  )
                )}
              </div>

              <div
                className={
                  styles.score
                }
              >
                <strong>
                  {
                    score
                  }
                </strong>

                <span>
                  /
                  {
                    questions.length
                  }
                </span>
              </div>

              <p
                className={
                  styles.resultMessage
                }
              >
                {passed
                  ? "Great reading! You understood the story."
                  : "Read the story again and give it another try."}
              </p>

              {saveError && (
                <p
                  className={
                    styles.saveError
                  }
                  role="alert"
                >
                  {
                    saveError
                  }{" "}
                  진행 상황이
                  저장되지 않았어요.
                </p>
              )}

              <div
                className={
                  styles.resultButtons
                }
              >
                {passed &&
                  nextStory && (
                    <button
                      type="button"
                      className={
                        styles.nextStageButton
                      }
                      onClick={
                        handleNextStory
                      }
                    >
                      Next Story

                      <ArrowRight
                        weight="bold"
                      />
                    </button>
                  )}

                <button
                  type="button"
                  className={
                    styles.retryButton
                  }
                  onClick={
                    handleRetry
                  }
                >
                  <ArrowCounterClockwise
                    weight="bold"
                  />

                  Try Again
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/test/reading/${level}`
                    )
                  }
                >
                  <ListBullets
                    weight="bold"
                  />

                  Story List
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const isAnswered =
    selectedChoice !==
    null;

  const isCorrect =
    selectedChoice ===
    currentQuestion.answer;

  /*
    진행 막대는 답을 고른 문제 수 기준
    (1번 문제를 풀기 전에는 0%)
  */
  const progress =
    ((currentIndex +
      (isAnswered
        ? 1
        : 0)) /
      questions.length) *
    100;

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

          <div
            className={
              styles.topRow
            }
          >
            <button
              type="button"
              className={
                styles.backButton
              }
              onClick={() =>
                router.push(
                  `/test/reading/${level}`
                )
              }
            >
              <ArrowLeft
                weight="bold"
              />
            </button>

            <div
              className={
                styles.storyInfo
              }
            >
              <span>
                {
                  currentLevel.title
                }
              </span>

              <strong>
                {
                  currentStory.title
                }
              </strong>
            </div>

            <div
              className={
                styles.questionNumber
              }
            >
              <strong>
                {
                  currentIndex +
                  1
                }
              </strong>

              <span>
                /
                {
                  questions.length
                }
              </span>
            </div>
          </div>

          {/* Progress */}

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
                  `${progress}%`,
              }}
            />
          </div>

          {/* Read Again */}

          <div
            className={
              styles.readAgainRow
            }
          >
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/book/${level}/${storySlug}`
                )
              }
            >
              <BookOpenText
                weight="duotone"
              />

              Read Story Again
            </button>
          </div>

          {/* Question */}

          <div
            className={
              styles.questionCard
            }
          >
            <span
              className={
                styles.questionLabel
              }
            >
              QUESTION{" "}
              {
                currentIndex +
                1
              }
            </span>

            <h1
              className={
                styles.prompt
              }
            >
              {
                currentQuestion.prompt
              }
            </h1>

            {currentQuestion.mainText && (
              <div
                className={
                  styles.mainText
                }
              >
                {
                  currentQuestion.mainText
                }
              </div>
            )}

            {/* Choices */}

            <div
              className={
                styles.choices
              }
            >
              {currentQuestion.choices.map(
                (
                  choice,
                  index
                ) => {
                  const selected =
                    selectedChoice ===
                    choice;

                  const correct =
                    isAnswered &&
                    choice ===
                      currentQuestion.answer;

                  const wrong =
                    isAnswered &&
                    selected &&
                    !correct;

                  return (
                    <button
                      key={`${choice}-${index}`}
                      type="button"
                      disabled={
                        isAnswered
                      }
                      onClick={() =>
                        handleChoice(
                          choice
                        )
                      }
                      className={`${styles.choice} ${
                        correct
                          ? styles.correctChoice
                          : ""
                      } ${
                        wrong
                          ? styles.wrongChoice
                          : ""
                      }`}
                    >
                      <span
                        className={
                          styles.choiceLetter
                        }
                      >
                        {String.fromCharCode(
                          65 +
                            index
                        )}
                      </span>

                      <span
                        className={
                          styles.choiceText
                        }
                      >
                        {
                          choice
                        }
                      </span>

                      {correct && (
                        <CheckCircle
                          weight="fill"
                        />
                      )}

                      {wrong && (
                        <XCircle
                          weight="fill"
                        />
                      )}
                    </button>
                  );
                }
              )}
            </div>

            {/* Feedback */}

            {isAnswered && (
              <div
                className={`${styles.feedback} ${
                  isCorrect
                    ? styles.correctFeedback
                    : styles.wrongFeedback
                }`}
              >
                <div
                  className={
                    styles.feedbackText
                  }
                >
                  {isCorrect ? (
                    <CheckCircle
                      weight="fill"
                    />
                  ) : (
                    <XCircle
                      weight="fill"
                    />
                  )}

                  <div>
                    <strong>
                      {isCorrect
                        ? "Great job!"
                        : "Not quite!"}
                    </strong>

                    <p>
                      {
                        currentQuestion.explanation
                      }
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className={
                    styles.nextButton
                  }
                  disabled={
                    isSaving
                  }
                  onClick={
                    handleNext
                  }
                >
                  {isSaving
                    ? "Saving..."
                    : currentIndex ===
                        questions.length -
                          1
                      ? "See Result"
                      : "Next"}

                  <ArrowRight
                    weight="bold"
                  />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}