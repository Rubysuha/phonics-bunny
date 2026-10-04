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
  CheckCircle,
  Flag,
  Lock,
} from "@phosphor-icons/react";

import styles from "./category.module.css";

import LoginNotice from "../../LoginNotice";

import {
  getPhonicsTestCategory,
} from "../data";

import {
  getPhonicsCategoryProgress,
  type CategoryProgress,
} from "@/lib/testProgress";

import {
  FINAL_PHONICS_STAGE,
  getPhonicsPassScore,
  getPhonicsQuestionCount,
  isPhonicsTestCategoryId,
} from "@/lib/phonicsTestRules";

/* ─────────────────────────────
   Page
───────────────────────────── */

export default function PhonicsCategoryPage() {
  const router =
    useRouter();

  const params =
    useParams();

  const categoryParam =
    Array.isArray(
      params.category
    )
      ? params.category[0]
      : params.category;

  const categoryId =
    typeof categoryParam ===
    "string"
      ? categoryParam
      : "";

  const validCategory =
    isPhonicsTestCategoryId(
      categoryId
    );

  const category =
    validCategory
      ? getPhonicsTestCategory(
          categoryId
        )
      : undefined;

  /* ─────────────────────────────
     Progress
  ───────────────────────────── */

  const [
    progress,
    setProgress,
  ] =
    useState<CategoryProgress>({
      stages: [],

      unlockedStages:
        [1],
    });

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true);

  useEffect(() => {
    if (
      !validCategory
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

          const result =
            await getPhonicsCategoryProgress(
              categoryId
            );

          setProgress(
            result
          );
        } catch (
          error
        ) {
          console.error(
            "진행상황 불러오기 실패:",
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
    categoryId,
    validCategory,
  ]);

  /* ─────────────────────────────
     Invalid
  ───────────────────────────── */

  if (
    !validCategory ||
    !category
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
              styles.notFound
            }
          >
            <h1>
              Category not found
            </h1>

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
     Helpers
  ───────────────────────────── */

  const getStageProgress = (
    stageNumber:
      number
  ) => {
    return progress.stages.find(
      (item) =>
        item.stage ===
        stageNumber
    );
  };

  const isStageUnlocked = (
    stageNumber:
      number
  ) => {
    return progress.unlockedStages.includes(
      stageNumber
    );
  };

  const completedStages =
    progress.stages.filter(
      (item) =>
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
                "/test/phonics"
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
              PHONICS CHALLENGE
            </p>

            <h1
              className={
                styles.title
              }
            >
              {
                category.title
              }
            </h1>

            <p
              className={
                styles.categoryLabel
              }
            >
              {
                category.shortTitle
              }
            </p>

            <p
              className={
                styles.description
              }
            >
              {
                category.description
              }
            </p>
          </header>

          <LoginNotice />

          {/* Loading */}

          {isLoading ? (
            <div
              className={
                styles.loadingBox
              }
            >
              Loading stages...
            </div>
          ) : (
            <>
              <div
                className={
                  styles.stageGrid
                }
              >
                {category.stages.map(
                  (
                    stageTitle,
                    index
                  ) => {
                    const stageNumber =
                      index +
                      1;

                    const questionCount =
                      getPhonicsQuestionCount(
                        stageNumber
                      );

                    const passScore =
                      getPhonicsPassScore(
                        stageNumber
                      );

                    const stageProgress =
                      getStageProgress(
                        stageNumber
                      );

                    const unlocked =
                      isStageUnlocked(
                        stageNumber
                      );

                    const passed =
                      stageProgress?.passed ??
                      false;

                    const bestScore =
                      stageProgress?.bestScore;

                    const stars =
                      stageProgress?.stars ??
                      0;

                    const isFinal =
                      stageNumber ===
                      FINAL_PHONICS_STAGE;

                    return (
                      <button
                        key={
                          stageNumber
                        }
                        type="button"
                        disabled={
                          !unlocked
                        }
                        className={`${styles.stageCard} ${
                          isFinal
                            ? styles.finalStage
                            : ""
                        } ${
                          !unlocked
                            ? styles.lockedStage
                            : ""
                        } ${
                          passed
                            ? styles.passedStage
                            : ""
                        }`}
                        onClick={() => {
                          if (
                            !unlocked
                          ) {
                            return;
                          }

                          router.push(
                            `/test/phonics/${category.id}/${stageNumber}`
                          );
                        }}
                      >
                        {/* Top */}

                        <div
                          className={
                            styles.stageTop
                          }
                        >
                          <span
                            className={
                              styles.stageNumber
                            }
                          >
                            {!unlocked ? (
                              <Lock
                                weight="fill"
                              />
                            ) : passed ? (
                              <CheckCircle
                                weight="fill"
                              />
                            ) : isFinal ? (
                              <Flag
                                weight="fill"
                              />
                            ) : (
                              stageNumber
                            )}
                          </span>

                          <span
                            className={
                              styles.questionCount
                            }
                          >
                            {
                              questionCount
                            }{" "}
                            Questions
                          </span>
                        </div>

                        {/* Stage Text */}

                        <div
                          className={
                            styles.stageContent
                          }
                        >
                          <span
                            className={
                              styles.stageLabel
                            }
                          >
                            {isFinal
                              ? "FINAL STAGE"
                              : `STAGE ${stageNumber}`}
                          </span>

                          <h2>
                            {
                              stageTitle
                            }
                          </h2>

                          {passed && (
                            <div
                              className={
                                styles.starRow
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
                          )}
                        </div>

                        {/* Bottom */}

                        <div
                          className={
                            styles.stageBottom
                          }
                        >
                          {!unlocked ? (
                            <span
                              className={
                                styles.lockText
                              }
                            >
                              Locked
                            </span>
                          ) : stageProgress ? (
                            <div
                              className={
                                styles.bestScore
                              }
                            >
                              <span>
                                Best
                              </span>

                              <strong>
                                {
                                  bestScore
                                }
                                /
                                {
                                  questionCount
                                }
                              </strong>
                            </div>
                          ) : (
                            <span>
                              {isFinal
                                ? `Pass ${passScore}/${questionCount}`
                                : "Start"}
                            </span>
                          )}

                          {unlocked && (
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
                  styles.bottomInfo
                }
              >
                <div>
                  <strong>
                    {
                      completedStages
                    }
                    {" / "}
                    {
                      category
                        .stages
                        .length
                    }
                    {" "}
                    Stages Complete
                  </strong>

                  <p>
                    {`Stage 1~${
                      FINAL_PHONICS_STAGE -
                      1
                    }는 ${getPhonicsPassScore(
                      1
                    )}/${getPhonicsQuestionCount(
                      1
                    )} 이상, Final Stage는 ${getPhonicsPassScore(
                      FINAL_PHONICS_STAGE
                    )}/${getPhonicsQuestionCount(
                      FINAL_PHONICS_STAGE
                    )} 이상 맞히면 통과해요.`}
                  </p>
                </div>

                <div
                  className={
                    styles.rule
                  }
                >
                  {`Final · ${getPhonicsQuestionCount(
                    FINAL_PHONICS_STAGE
                  )} Questions`}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}