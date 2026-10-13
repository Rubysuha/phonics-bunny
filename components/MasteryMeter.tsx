"use client";

import { useEffect, useState } from "react";
import {
  CalendarCheck,
  Repeat,
  Sparkle,
  Star,
  type Icon,
} from "@phosphor-icons/react";
import {
  loadMyLearningSummary,
  type ItemProgress,
} from "@/lib/learningProgress";
import { LEARNING_UPDATED_EVENT } from "@/lib/learningEvents";
import { MASTERY } from "@/lib/learningRules";
import styles from "./MasteryMeter.module.css";

type Props = {
  /* 학습 기록의 content_id (예: "short-vowels-cat") */
  contentId: string;
};

type Goal = {
  key: string;
  icon: Icon;

  /* 0~1 */
  ratio: number;

  /* 눌렀을 때 보여 주는 설명 */
  detail: string;
};

/*
  단어 · 이야기 · 대화 하나의 숙달 진행 표시
  - 동그라미 세 개: 연습 횟수 · 연습한 날 수 · 최근 점수 (찰수록 채워짐)
  - 모두 채우면 별
  - 누르면 자세한 숫자 (부모용)
*/
export default function MasteryMeter({ contentId }: Props) {
  /* undefined = 로그인하지 않았거나 불러오는 중 */
  const [progress, setProgress] = useState<ItemProgress | null | undefined>(
    undefined
  );
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const summary = await loadMyLearningSummary();

      if (cancelled || !summary) return;

      setProgress(summary.items.get(contentId) ?? null);
    };

    load();

    /* 방금 저장한 학습 기록이 바로 반영되게 다시 불러옴 */
    window.addEventListener(LEARNING_UPDATED_EVENT, load);

    return () => {
      cancelled = true;
      window.removeEventListener(LEARNING_UPDATED_EVENT, load);
    };
  }, [contentId]);

  if (progress === undefined) {
    return null;
  }

  const totalCount = progress?.totalCount ?? 0;
  const recordCount = progress?.recordCount ?? 0;
  const days = progress?.days ?? 0;
  const recentScore = progress?.recentScore ?? null;

  /* 연습: 전체 횟수와 녹음 횟수 중 덜 채운 쪽 */
  const practiceRatio = Math.min(
    1,
    totalCount / MASTERY.totalCount,
    recordCount / MASTERY.recordCount
  );

  const goals: Goal[] = [
    {
      key: "practice",
      icon: Repeat,
      ratio: practiceRatio,
      detail: `연습 ${Math.min(totalCount, MASTERY.totalCount)}/${
        MASTERY.totalCount
      }회 (녹음 ${Math.min(recordCount, MASTERY.recordCount)}/${
        MASTERY.recordCount
      }회)`,
    },
    {
      key: "days",
      icon: CalendarCheck,
      ratio: Math.min(1, days / MASTERY.days),
      detail: `${Math.min(days, MASTERY.days)}/${MASTERY.days}일`,
    },
    {
      key: "score",
      icon: Sparkle,
      ratio:
        recentScore === null
          ? 0
          : Math.min(1, recentScore / MASTERY.recentScore),
      detail:
        recentScore === null
          ? `최근 점수 없음 (목표 ${MASTERY.recentScore}점)`
          : `최근 점수 ${Math.round(recentScore)}점 (목표 ${
              MASTERY.recentScore
            }점)`,
    },
  ];

  const summaryText = progress?.mastered
    ? "숙달했어요!"
    : goals.map((goal) => goal.detail).join(" · ");

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={`${styles.meter} ${
          progress?.mastered ? styles.mastered : ""
        }`}
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-label={`숙달 진행: ${summaryText}`}
      >
        {progress?.mastered ? (
          <>
            <Star size={18} weight="fill" />
            Mastered
          </>
        ) : (
          goals.map((goal) => {
            const GoalIcon = goal.icon;
            const done = goal.ratio >= 1;

            return (
              <span
                key={goal.key}
                className={`${styles.ring} ${done ? styles.ringDone : ""}`}
                style={
                  {
                    "--fill": `${Math.round(goal.ratio * 100)}%`,
                  } as React.CSSProperties
                }
              >
                <span className={styles.ringInner}>
                  <GoalIcon size={13} weight="bold" />
                </span>
              </span>
            );
          })
        )}
      </button>

      {isOpen && (
        <p className={styles.detail} role="status">
          {summaryText}
        </p>
      )}
    </div>
  );
}
