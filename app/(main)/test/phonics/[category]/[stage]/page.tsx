"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  SpeakerHigh,
  CheckCircle,
  XCircle,
  ArrowCounterClockwise,
  ListBullets,
  Trophy,
} from "@phosphor-icons/react";

import styles from "./stage.module.css";

import {
  generatePhonicsStageQuestions,
} from "../../questionGenerator";

import {
  getPhonicsTestCategory,
} from "../../data";

import {
  savePhonicsTestResult,
  getPhonicsCategoryProgress,
} from "@/lib/testProgress";

import {
  FINAL_PHONICS_STAGE,
  getPhonicsPassScore,
  getPhonicsStars,
  isPhonicsStagePassed,
  isPhonicsTestCategoryId,
  isValidPhonicsStage,
} from "@/lib/phonicsTestRules";

/* ─────────────────────────────
   Page
───────────────────────────── */

export default function PhonicsStagePage() {
  const router =
    useRouter();

  const params =
    useParams();

  /* ─────────────────────────────
     Params
  ───────────────────────────── */

  const categoryParam =
    Array.isArray(
      params.category
    )
      ? params.category[0]
      : params.category;

  const stageParam =
    Array.isArray(
      params.stage
    )
      ? params.stage[0]
      : params.stage;

  const categoryId =
    typeof categoryParam ===
    "string"
      ? categoryParam
      : "";

  const stageNumber =
    Number(
      stageParam
    );

  const validCategory =
    isPhonicsTestCategoryId(
      categoryId
    );

  const validStage =
    isValidPhonicsStage(
      stageNumber
    );

  /* ─────────────────────────────
     Info
  ───────────────────────────── */

  const categoryInfo =
    validCategory
      ? getPhonicsTestCategory(
          categoryId
        )
      : undefined;

  const stageTitle =
    categoryInfo &&
    validStage
      ? categoryInfo.stages[
          stageNumber - 1
        ]
      : "";

  const passScore =
    validStage
      ? getPhonicsPassScore(
          stageNumber
        )
      : 0;

  /* ─────────────────────────────
     Questions
  ───────────────────────────── */

  const [
    attempt,
    setAttempt,
  ] =
    useState(0);

  const questions =
    useMemo(() => {
      if (
        !validCategory ||
        !validStage
      ) {
        return [];
      }

      return generatePhonicsStageQuestions(
        categoryId,
        stageNumber,
        attempt
      );
    }, [
      attempt,
      categoryId,
      stageNumber,
      validCategory,
      validStage,
    ]);

  /* ─────────────────────────────
     State
  ───────────────────────────── */

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

  const [
    isCheckingAccess,
    setIsCheckingAccess,
  ] =
    useState(true);

  const [
    hasStageAccess,
    setHasStageAccess,
  ] =
    useState(false);

  const [
    isAudioLoading,
    setIsAudioLoading,
  ] =
    useState(false);

  const currentQuestion =
    questions[
      currentIndex
    ];

  /* ─────────────────────────────
     Audio
  ───────────────────────────── */

  const audioCacheRef =
    useRef<
      Map<
        string,
        string
      >
    >(
      new Map()
    );

  const currentAudioRef =
    useRef<
      HTMLAudioElement | null
    >(null);

  /* ─────────────────────────────
     Stage Access
  ───────────────────────────── */

  useEffect(() => {
    const checkStageAccess =
      async () => {
        if (
          !validCategory ||
          !validStage
        ) {
          setHasStageAccess(
            false
          );

          setIsCheckingAccess(
            false
          );

          return;
        }

        if (
          stageNumber === 1
        ) {
          setHasStageAccess(
            true
          );

          setIsCheckingAccess(
            false
          );

          return;
        }

        try {
          setIsCheckingAccess(
            true
          );

          const progress =
            await getPhonicsCategoryProgress(
              categoryId
            );

          setHasStageAccess(
            progress.unlockedStages.includes(
              stageNumber
            )
          );
        } catch (
          error
        ) {
          console.error(
            "Stage 접근 확인 실패:",
            error
          );

          setHasStageAccess(
            false
          );
        } finally {
          setIsCheckingAccess(
            false
          );
        }
      };

    checkStageAccess();
  }, [
    categoryId,
    stageNumber,
    validCategory,
    validStage,
  ]);

  /* ─────────────────────────────
     Audio Cleanup
  ───────────────────────────── */

  useEffect(() => {
    const cache =
      audioCacheRef.current;

    return () => {
      currentAudioRef.current?.pause();

      currentAudioRef.current =
        null;

      cache.forEach(
        (url) => {
          URL.revokeObjectURL(
            url
          );
        }
      );

      cache.clear();
    };
  }, []);

  const stopCurrentAudio =
    () => {
      if (
        !currentAudioRef.current
      ) {
        return;
      }

      currentAudioRef.current.pause();

      currentAudioRef.current.currentTime =
        0;

      currentAudioRef.current =
        null;
    };

  /* ─────────────────────────────
     Azure AI Voice
  ───────────────────────────── */

  const handlePlayAudio =
    async () => {
      if (
        !currentQuestion?.speechText ||
        isAudioLoading
      ) {
        return;
      }

      const text =
        currentQuestion.speechText;

      try {
        stopCurrentAudio();

        const cachedUrl =
          audioCacheRef.current.get(
            text
          );

        if (
          cachedUrl
        ) {
          const audio =
            new Audio(
              cachedUrl
            );

          currentAudioRef.current =
            audio;

          await audio.play();

          return;
        }

        setIsAudioLoading(
          true
        );

        const response =
          await fetch(
            "/api/text-to-speech",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  text,
                }),
            }
          );

        if (
          !response.ok
        ) {
          throw new Error(
            "TTS 요청에 실패했습니다."
          );
        }

        const blob =
          await response.blob();

        const audioUrl =
          URL.createObjectURL(
            blob
          );

        audioCacheRef.current.set(
          text,
          audioUrl
        );

        const audio =
          new Audio(
            audioUrl
          );

        currentAudioRef.current =
          audio;

        await audio.play();
      } catch (
        error
      ) {
        console.error(
          "AI 음성 재생 실패:",
          error
        );
      } finally {
        setIsAudioLoading(
          false
        );
      }
    };

  /* ─────────────────────────────
     Loading
  ───────────────────────────── */

  if (
    isCheckingAccess
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
              Checking Stage...
            </h1>

            <p>
              학습 진행 상황을
              확인하고 있어요.
            </p>
          </div>
        </div>
      </section>
    );
  }

  /* ─────────────────────────────
     Invalid
  ───────────────────────────── */

  if (
    !validCategory ||
    !validStage ||
    !categoryInfo ||
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
              Test not found
            </h1>

            <p>
              테스트 정보를
              찾을 수 없습니다.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/test/phonics"
                )
              }
            >
              Back to Phonics Test
            </button>
          </div>
        </div>
      </section>
    );
  }

  /* ─────────────────────────────
     Locked
  ───────────────────────────── */

  if (
    !hasStageAccess
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
              🔒 Stage Locked
            </h1>

            <p>
              이전 Stage를 먼저
              통과해야 이 Stage를
              시작할 수 있어요.
            </p>

            <button
              type="button"
              onClick={() =>
                router.replace(
                  `/test/phonics/${categoryId}`
                )
              }
            >
              Back to Stage List
            </button>
          </div>
        </div>
      </section>
    );
  }

  /* ─────────────────────────────
     Choice
  ───────────────────────────── */

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

  /* ─────────────────────────────
     Next
  ───────────────────────────── */

  const handleNext =
    async () => {
      if (
        selectedChoice ===
        null
      ) {
        return;
      }

      stopCurrentAudio();

      const isLast =
        currentIndex ===
        questions.length -
          1;

      if (!isLast) {
        setCurrentIndex(
          (prev) =>
            prev + 1
        );

        setSelectedChoice(
          null
        );

        return;
      }

      setIsSaving(
        true
      );

      setSaveError(
        null
      );

      try {
        const result =
          await savePhonicsTestResult({
            category:
              categoryId,

            stage:
              stageNumber,

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
          "Test save error:",
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
    };

  /* ─────────────────────────────
     Retry
  ───────────────────────────── */

  const handleRetry =
    () => {
      stopCurrentAudio();

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

  /* ─────────────────────────────
     Next Stage
     (통과해서 결과가 저장된 경우에만 버튼이 보임)
  ───────────────────────────── */

  const handleNextStage =
    () => {
      stopCurrentAudio();

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

      setIsCheckingAccess(
        true
      );

      router.push(
        `/test/phonics/${categoryId}/${
          stageNumber + 1
        }`
      );
    };

  /* ─────────────────────────────
     Result
  ───────────────────────────── */

  if (
    isFinished
  ) {
    const passed =
      isPhonicsStagePassed(
        score,
        stageNumber
      );

    const stars =
      getPhonicsStars(
        score,
        stageNumber
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
                {
                  categoryInfo.title
                }
                {" · "}
                Stage{" "}
                {
                  stageNumber
                }
              </p>

              <h1
                className={
                  styles.resultTitle
                }
              >
                {passed
                  ? "Challenge Complete!"
                  : "Try Again!"}
              </h1>

              <p
                className={
                  styles.resultStage
                }
              >
                {
                  stageTitle
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
                  styles.scoreBox
                }
              >
                <span
                  className={
                    styles.scoreNumber
                  }
                >
                  {
                    score
                  }
                </span>

                <span
                  className={
                    styles.scoreDivider
                  }
                >
                  /
                </span>

                <span
                  className={
                    styles.scoreTotal
                  }
                >
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
                  ? `Great work! You passed with ${score} out of ${questions.length}.`
                  : `You need ${passScore} out of ${questions.length} to pass. Try again!`}
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
                  !saveError &&
                  stageNumber <
                    FINAL_PHONICS_STAGE && (
                    <button
                      type="button"
                      className={
                        styles.nextStageButton
                      }
                      onClick={
                        handleNextStage
                      }
                    >
                      Next Stage

                      <ArrowRight
                        size={20}
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
                    size={20}
                    weight="bold"
                  />

                  Try Again
                </button>

                <button
                  type="button"
                  className={
                    styles.stageListButton
                  }
                  onClick={() =>
                    router.push(
                      `/test/phonics/${categoryId}`
                    )
                  }
                >
                  <ListBullets
                    size={20}
                    weight="bold"
                  />

                  Stage List
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ─────────────────────────────
     Current Question
  ───────────────────────────── */

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
              onClick={() => {
                stopCurrentAudio();

                router.push(
                  `/test/phonics/${categoryId}`
                );
              }}
            >
              <ArrowLeft
                size={21}
                weight="bold"
              />
            </button>

            <div
              className={
                styles.stageInfo
              }
            >
              <span
                className={
                  styles.categoryName
                }
              >
                {
                  categoryInfo.title
                }
              </span>

              <span
                className={
                  styles.stageName
                }
              >
                Stage{" "}
                {
                  stageNumber
                }
                {" · "}
                {
                  stageTitle
                }
              </span>
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
                /{" "}
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

          {/* Question */}

          <div
            className={
              styles.questionCard
            }
          >
            <div
              className={
                styles.questionHeader
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
            </div>

            {/* Image */}

            {currentQuestion.image && (
              <div
                className={
                  styles.imageArea
                }
              >
                <img
                  src={
                    currentQuestion.image
                  }
                  alt={
                    currentQuestion.targetWord
                      ? `${currentQuestion.targetWord} question`
                      : "Phonics question"
                  }
                  className={
                    styles.questionImage
                  }
                />
              </div>
            )}

            {/* Main Text */}

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

            {/* AI Voice */}

            {currentQuestion.speechText && (
              <div
                className={
                  styles.audioArea
                }
              >
                <button
                  type="button"
                  className={
                    styles.audioButton
                  }
                  onClick={
                    handlePlayAudio
                  }
                  disabled={
                    isAudioLoading
                  }
                >
                  <span
                    className={
                      styles.audioIcon
                    }
                  >
                    <SpeakerHigh
                      weight="fill"
                    />
                  </span>

                  <span>
                    {isAudioLoading
                      ? "Loading..."
                      : "Listen"}
                  </span>
                </button>
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
                    choice !==
                      currentQuestion.answer;

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
                      className={`${styles.choiceButton} ${
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
                          className={
                            styles.choiceStateIcon
                          }
                          weight="fill"
                        />
                      )}

                      {wrong && (
                        <XCircle
                          className={
                            styles.choiceStateIcon
                          }
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
                    <>
                      <CheckCircle
                        weight="fill"
                      />

                      <div>
                        <strong>
                          Great job!
                        </strong>

                        <p>
                          That&apos;s
                          correct.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle
                        weight="fill"
                      />

                      <div>
                        <strong>
                          Not quite!
                        </strong>

                        <p>
                          The correct
                          answer is{" "}
                          <b>
                            {
                              currentQuestion.answer
                            }
                          </b>
                          .
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  className={
                    styles.nextButton
                  }
                  onClick={
                    handleNext
                  }
                  disabled={
                    isSaving
                  }
                >
                  {isSaving
                    ? "Saving..."
                    : currentIndex ===
                        questions.length -
                          1
                      ? "See Result"
                      : "Next"}

                  {!isSaving && (
                    <ArrowRight
                      weight="bold"
                    />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}