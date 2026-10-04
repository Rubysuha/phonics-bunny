"use client";

import {
  useEffect,
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
  CheckCircle,
  XCircle,
  Trophy,
  ArrowCounterClockwise,
  ListBullets,
} from "@phosphor-icons/react";

import styles from "./topic.module.css";

import {
  conversationTopics,
  getConversationTopic,
  type ConversationTopicId,
} from "../data";

import {
  getConversationQuestions,
} from "../questions";

import {
  getConversationPassScore,
  getConversationStars,
  isConversationTopicPassed,
} from "@/lib/conversationTestRules";

import {
  getConversationProgress,
  saveConversationTestResult,
} from "@/lib/conversationTestProgress";

/* ─────────────────────────────
   Topic Check
───────────────────────────── */

const VALID_TOPICS:
  ConversationTopicId[] = [
    "greetings",
    "school",
    "family",
    "food",
    "friends",
    "final",
  ];

function isConversationTopic(
  value: string
): value is ConversationTopicId {
  return VALID_TOPICS.includes(
    value as ConversationTopicId
  );
}

/* ─────────────────────────────
   Page
───────────────────────────── */

export default function ConversationTopicPage() {
  const router =
    useRouter();

  const params =
    useParams();

  const topicParam =
    Array.isArray(
      params.topic
    )
      ? params.topic[0]
      : params.topic;

  const topicId =
    typeof topicParam ===
    "string"
      ? topicParam
      : "";

  const validTopic =
    isConversationTopic(
      topicId
    );

  const topic =
    validTopic
      ? getConversationTopic(
          topicId
        )
      : undefined;

  const [
    attempt,
    setAttempt,
  ] =
    useState(0);

  const questions =
    useMemo(() => {
      if (
        !validTopic
      ) {
        return [];
      }

      return getConversationQuestions(
        topicId,
        attempt
      );
    }, [
      attempt,
      topicId,
      validTopic,
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
    hasAccess,
    setHasAccess,
  ] =
    useState(true);

  const currentQuestion =
    questions[
      currentIndex
    ];

  /* ─────────────────────────────
     Final Access
  ───────────────────────────── */

  useEffect(() => {
    const checkAccess =
      async () => {
        if (
          !validTopic
        ) {
          setIsCheckingAccess(
            false
          );

          return;
        }

        /*
          Final이 아닌 Topic은
          항상 접근 가능
        */
        if (
          topicId !==
          "final"
        ) {
          setHasAccess(
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
            await getConversationProgress();

          setHasAccess(
            progress.finalUnlocked
          );
        } catch (
          error
        ) {
          console.error(
            "Final Challenge 접근 확인 실패:",
            error
          );

          setHasAccess(
            false
          );
        } finally {
          setIsCheckingAccess(
            false
          );
        }
      };

    checkAccess();
  }, [
    topicId,
    validTopic,
  ]);

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
              Checking Quiz...
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
    !validTopic ||
    !topic ||
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

            <p>
              대화 문제를 찾을 수
              없어요.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/test/conversation"
                )
              }
            >
              Back to Conversation Quiz
            </button>
          </div>
        </div>
      </section>
    );
  }

  /* ─────────────────────────────
     Locked Final
  ───────────────────────────── */

  if (
    topicId ===
      "final" &&
    !hasAccess
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
              🔒 Final Challenge
            </h1>

            <p>
              Greetings, School,
              Family, Food,
              Friends를 모두
              통과하면 Final
              Challenge가 열려요.
            </p>

            <button
              type="button"
              onClick={() =>
                router.replace(
                  "/test/conversation"
                )
              }
            >
              Back to Topic List
            </button>
          </div>
        </div>
      </section>
    );
  }

  /* ─────────────────────────────
     Answer
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

      /*
        마지막 문제 완료
        → Supabase 저장
      */

      setIsSaving(
        true
      );

      setSaveError(
        null
      );

      try {
        const result =
          await saveConversationTestResult({
            topic:
              topicId,

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
          "Conversation Quiz 저장 실패:",
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
     Next Topic
     (Final은 잠금 조건이 있어서 목록에서 들어가도록 제외)
  ───────────────────────────── */

  const nextTopic =
    conversationTopics[
      conversationTopics.findIndex(
        (item) =>
          item.id ===
          topicId
      ) + 1
    ];

  const handleNextTopic =
    () => {
      if (!nextTopic) {
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

      setIsCheckingAccess(
        true
      );

      router.push(
        `/test/conversation/${nextTopic.id}`
      );
    };

  /* ─────────────────────────────
     Result
  ───────────────────────────── */

  if (
    isFinished
  ) {
    const passScore =
      getConversationPassScore(
        topicId
      );

    const passed =
      isConversationTopicPassed(
        score,
        topicId
      );

    const stars =
      getConversationStars(
        score,
        topicId
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
                CONVERSATION QUIZ
              </p>

              <h1
                className={
                  styles.resultTitle
                }
              >
                {passed
                  ? "Quiz Complete!"
                  : "Try Again!"}
              </h1>

              <p
                className={
                  styles.resultTopic
                }
              >
                {
                  topic.title
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
                  : `You need ${passScore} out of ${questions.length} to pass.`}
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
                  nextTopic &&
                  !nextTopic.isFinal && (
                    <button
                      type="button"
                      className={
                        styles.nextStageButton
                      }
                      onClick={
                        handleNextTopic
                      }
                    >
                      Next Topic

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
                    styles.listButton
                  }
                  onClick={() =>
                    router.push(
                      "/test/conversation"
                    )
                  }
                >
                  <ListBullets
                    size={20}
                    weight="bold"
                  />

                  Topic List
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ─────────────────────────────
     Current
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
              onClick={() =>
                router.push(
                  "/test/conversation"
                )
              }
            >
              <ArrowLeft
                size={21}
                weight="bold"
              />
            </button>

            <div
              className={
                styles.topicInfo
              }
            >
              <span
                className={
                  styles.quizName
                }
              >
                CONVERSATION QUIZ
              </span>

              <span
                className={
                  styles.topicName
                }
              >
                {
                  topic.title
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
                SITUATION{" "}
                {
                  currentIndex +
                  1
                }
              </span>

              <p
                className={
                  styles.situation
                }
              >
                {
                  currentQuestion.situation
                }
              </p>

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

            {/* Optional Image */}

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
                  alt="Conversation situation"
                />
              </div>
            )}

            {/* Dialogue */}

            <div
              className={
                styles.dialogueBox
              }
            >
              {currentQuestion.dialogue.map(
                (
                  line,
                  index
                ) => (
                  <div
                    key={`${line}-${index}`}
                    className={`${styles.bubble} ${
                      index %
                        2 ===
                      0
                        ? styles.leftBubble
                        : styles.rightBubble
                    }`}
                  >
                    {
                      line
                    }
                  </div>
                )
              )}
            </div>

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
                            styles.choiceState
                          }
                          weight="fill"
                        />
                      )}

                      {wrong && (
                        <XCircle
                          className={
                            styles.choiceState
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
                    styles.feedbackContent
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