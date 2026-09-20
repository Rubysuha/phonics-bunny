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
  ChatCircleDots,
  CheckCircle,
  Lock,
} from "@phosphor-icons/react";

import styles from "./conversation-test.module.css";

import {
  conversationTopics,
  type ConversationTopicId,
} from "./data";

import {
  getConversationProgress,
  type ConversationProgress,
} from "@/lib/conversationTestProgress";

/* ─────────────────────────────
   Page
───────────────────────────── */

export default function ConversationTestPage() {
  const router =
    useRouter();

  const [
    progress,
    setProgress,
  ] =
    useState<ConversationProgress>({
      topics: [],

      finalUnlocked:
        false,
    });

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true);

  /* ─────────────────────────────
     Progress
  ───────────────────────────── */

  useEffect(() => {
    const loadProgress =
      async () => {
        try {
          setIsLoading(
            true
          );

          const result =
            await getConversationProgress();

          setProgress(
            result
          );
        } catch (
          error
        ) {
          console.error(
            "Conversation Quiz 진행률 조회 실패:",
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

  /* ─────────────────────────────
     Helpers
  ───────────────────────────── */

  const getTopicProgress = (
    topic:
      ConversationTopicId
  ) => {
    return progress.topics.find(
      (item) =>
        item.topic ===
        topic
    );
  };

  const completedTopics =
    progress.topics.filter(
      (item) =>
        item.topic !==
          "final" &&
        item.passed
    ).length;

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
              <ChatCircleDots
                weight="duotone"
              />
            </div>

            <p
              className={
                styles.eyebrow
              }
            >
              CONVERSATION TEST
            </p>

            <h1
              className={
                styles.title
              }
            >
              Conversation Quiz
            </h1>

            <p
              className={
                styles.subtitle
              }
            >
              Choose the right
              expression for each
              situation.
            </p>
          </header>

          {isLoading ? (
            <div
              className={
                styles.loadingBox
              }
            >
              Loading topics...
            </div>
          ) : (
            <>
              {/* Topics */}

              <div
                className={
                  styles.grid
                }
              >
                {conversationTopics.map(
                  (
                    topic
                  ) => {
                    const topicProgress =
                      getTopicProgress(
                        topic.id
                      );

                    const passed =
                      topicProgress?.passed ??
                      false;

                    const stars =
                      topicProgress?.stars ??
                      0;

                    const bestScore =
                      topicProgress?.bestScore;

                    const locked =
                      topic.id ===
                        "final" &&
                      !progress.finalUnlocked;

                    return (
                      <button
                        key={
                          topic.id
                        }
                        type="button"
                        disabled={
                          locked
                        }
                        className={`${styles.card} ${
                          styles[
                            topic
                              .cardClassName
                          ]
                        } ${
                          topic.isFinal
                            ? styles.finalCardLayout
                            : ""
                        } ${
                          passed
                            ? styles.passedCard
                            : ""
                        } ${
                          locked
                            ? styles.lockedCard
                            : ""
                        }`}
                        onClick={() => {
                          if (
                            locked
                          ) {
                            return;
                          }

                          router.push(
                            `/test/conversation/${topic.id}`
                          );
                        }}
                      >
                        {/* Badge */}

                        <div
                          className={`${styles.badge} ${
                            styles[
                              topic
                                .badgeClassName
                            ]
                          }`}
                        >
                          {locked ? (
                            <Lock
                              weight="fill"
                            />
                          ) : passed ? (
                            <CheckCircle
                              weight="fill"
                            />
                          ) : (
                            topic.badge
                          )}
                        </div>

                        {/* Content */}

                        <div
                          className={
                            styles.cardContent
                          }
                        >
                          <p
                            className={
                              styles.topicLabel
                            }
                          >
                            {topic.isFinal
                              ? "FINAL TEST"
                              : "TOPIC"}
                          </p>

                          <h2>
                            {
                              topic.title
                            }
                          </h2>

                          <p
                            className={
                              styles.cardSubtitle
                            }
                          >
                            {
                              topic.subtitle
                            }
                          </p>

                          <p
                            className={
                              styles.description
                            }
                          >
                            {
                              topic.description
                            }
                          </p>

                          {passed && (
                            <div
                              className={
                                styles.topicStars
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
                                        ? styles.activeStar
                                        : styles.emptyStar
                                    }
                                  >
                                    ★
                                  </span>
                                )
                              )}
                            </div>
                          )}
                        </div>

                        {/* Bottom */}

                        <div
                          className={
                            styles.bottomRow
                          }
                        >
                          {locked ? (
                            <span
                              className={
                                styles.questionCount
                              }
                            >
                              Complete all
                              topics
                            </span>
                          ) : passed ? (
                            <span
                              className={
                                styles.questionCount
                              }
                            >
                              Best{" "}
                              <strong>
                                {
                                  bestScore
                                }
                                /
                                {
                                  topic.questionCount
                                }
                              </strong>
                            </span>
                          ) : (
                            <span
                              className={
                                styles.questionCount
                              }
                            >
                              <strong>
                                {
                                  topic.questionCount
                                }
                              </strong>
                              {" "}
                              Questions
                            </span>
                          )}

                          {!locked && (
                            <span
                              className={
                                styles.arrow
                              }
                            >
                              <ArrowRight
                                weight="bold"
                              />
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  }
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
                    {
                      completedTopics
                    }
                    {" / 5 Topics Complete"}
                  </strong>

                  <p>
                    5개 Topic을 모두
                    통과하면 Final
                    Challenge가 열려요.
                  </p>
                </div>

                <span
                  className={
                    styles.guideBadge
                  }
                >
                  Pass · 7 / 10
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}