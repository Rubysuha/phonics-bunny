"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  BookOpen,
  CaretRight,
  ChatCircleDots,
  Confetti,
  Flower,
  Notebook,
  Plant,
  Star,
  Tree,
  X,
  type Icon,
} from "@phosphor-icons/react";
import type { LearningSummary } from "@/lib/learningProgress";
import {
  AREAS,
  AREA_LABEL,
  AREA_UNIT,
  LEVELS,
  LEVEL_CHANGE_NOTE,
  LEVEL_LABEL,
  type LearningArea,
  type LearningLevel,
} from "@/lib/learningRules";
import styles from "./LevelCard.module.css";

/* 단계가 오를수록 자라는 모습: 새싹 → 꽃 → 나무 → 별 */
export const LEVEL_ICON: Record<LearningLevel, Icon> = {
  beginner: Plant,
  elementary: Flower,
  intermediate: Tree,
  advanced: Star,
};

const AREA_ICON: Record<LearningArea, Icon> = {
  phonics: Notebook,
  book: BookOpen,
  conversation: ChatCircleDots,
};

/* 마지막으로 본 단계 (단계가 올랐을 때 축하 화면을 한 번만 보여 주려고 기기에 저장) */
const SEEN_LEVEL_KEY = "phonics-bunny-seen-level";

type Props = {
  summary: LearningSummary;

  /* 다른 버튼들과 한 줄에 놓을 때 (아래 여백 없음) */
  inline?: boolean;
};

/*
  AI Bunny 단계 카드
  - 카드: 지금 단계 · 다음 단계까지 진행 막대 · 가장 많이 남은 영역
  - 누르면: 세 영역의 단계와 숙달 개수 (부모용 상세)
  - 단계가 오르면: 축하 화면
*/
export default function LevelCard({ summary, inline }: Props) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [celebrateLevel, setCelebrateLevel] = useState<LearningLevel | null>(
    null
  );

  const LevelIcon = LEVEL_ICON[summary.level];

  /* 지난번에 본 단계보다 올랐으면 축하 화면 */
  useEffect(() => {
    try {
      const seen = window.localStorage.getItem(SEEN_LEVEL_KEY);
      const seenIndex = seen ? LEVELS.indexOf(seen as LearningLevel) : -1;

      window.localStorage.setItem(SEEN_LEVEL_KEY, summary.level);

      if (seen && LEVELS.indexOf(summary.level) > seenIndex) {
        /* 저장된 값을 읽은 뒤에만 알 수 있어서 여기서 상태를 바꿈 */
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCelebrateLevel(summary.level);
      }
    } catch {
      /* 저장소를 쓸 수 없는 환경이면 축하 화면만 생략 */
    }
  }, [summary.level]);

  useEffect(() => {
    if (!isDetailOpen && !celebrateLevel) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDetailOpen(false);
        setCelebrateLevel(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isDetailOpen, celebrateLevel]);

  /* 카드에 보여 줄 한 줄 안내 */
  let hint: string;

  if (!summary.bottleneck) {
    hint = "가장 높은 단계예요!";
  } else if (summary.remaining === 0) {
    hint =
      summary.waitDays > 0
        ? `${summary.waitDays}일 뒤에 다음 단계로 올라가요!`
        : "곧 다음 단계로 올라가요!";
  } else {
    hint = `다음 단계까지 ${AREA_LABEL[summary.bottleneck]} ${
      AREA_UNIT[summary.bottleneck]
    } ${summary.remaining}개 더!`;
  }

  const CelebrateIcon = celebrateLevel ? LEVEL_ICON[celebrateLevel] : null;

  return (
    <>
      <button
        type="button"
        className={`${styles.card} ${inline ? styles.inline : ""}`}
        onClick={() => setIsDetailOpen(true)}
        aria-label={`내 단계 ${LEVEL_LABEL[summary.level]}. ${hint} 자세히 보기`}
      >
        <span className={`${styles.levelIcon} ${styles[summary.level]}`}>
          <LevelIcon size={24} weight="fill" />
        </span>

        <span className={styles.cardBody}>
          <span className={styles.cardTop}>
            <span className={styles.eyebrow}>MY LEVEL</span>
            <strong className={styles.levelName}>
              {LEVEL_LABEL[summary.level]}
            </strong>
            <span className={styles.hint}>{hint}</span>
          </span>

          <span className={styles.bar} aria-hidden="true">
            <span
              className={styles.barFill}
              style={{ width: `${Math.round(summary.progress * 100)}%` }}
            />
          </span>
        </span>

        <CaretRight className={styles.caret} size={18} weight="bold" />
      </button>

      {isDetailOpen &&
        createPortal(
          <div
            className={styles.overlay}
            onClick={() => setIsDetailOpen(false)}
          >
            <div
              className={styles.dialog}
              role="dialog"
              aria-modal="true"
              aria-label="내 단계 자세히 보기"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setIsDetailOpen(false)}
                aria-label="닫기"
              >
                <X size={18} weight="bold" />
              </button>

              <p className={styles.dialogEyebrow}>MY LEVEL</p>

              <h2 className={styles.dialogTitle}>
                <span className={`${styles.levelIcon} ${styles[summary.level]}`}>
                  <LevelIcon size={24} weight="fill" />
                </span>
                {LEVEL_LABEL[summary.level]}
              </h2>

              <p className={styles.dialogNote}>
                {LEVEL_CHANGE_NOTE[summary.level]}
              </p>

              {/* 단계 순서 */}
              <ol className={styles.steps}>
                {LEVELS.map((level, index) => {
                  const StepIcon = LEVEL_ICON[level];
                  const reached = index <= LEVELS.indexOf(summary.level);

                  return (
                    <li
                      key={level}
                      className={`${styles.step} ${
                        reached ? styles.stepReached : ""
                      }`}
                    >
                      <span className={styles.stepIcon}>
                        <StepIcon size={18} weight="fill" />
                      </span>
                      {LEVEL_LABEL[level]}
                    </li>
                  );
                })}
              </ol>

              {/* 영역별 단계 · 숙달 개수 */}
              <ul className={styles.areas}>
                {AREAS.map((area) => {
                  const info = summary.areas[area];
                  const AreaIcon = AREA_ICON[area];

                  const goal = info.nextCount ?? info.total;
                  const ratio = Math.min(1, info.mastered / goal);

                  return (
                    <li
                      key={area}
                      className={`${styles.area} ${
                        area === summary.bottleneck ? styles.areaFocus : ""
                      }`}
                    >
                      <span className={styles.areaIcon}>
                        <AreaIcon size={22} weight="duotone" />
                      </span>

                      <div className={styles.areaBody}>
                        <div className={styles.areaTop}>
                          <strong>{AREA_LABEL[area]}</strong>

                          <span className={styles.areaLevel}>
                            {LEVEL_LABEL[info.level]}
                          </span>

                          <span className={styles.areaCount}>
                            {info.mastered} / {goal}
                          </span>
                        </div>

                        <span className={styles.bar} aria-hidden="true">
                          <span
                            className={styles.barFill}
                            style={{ width: `${Math.round(ratio * 100)}%` }}
                          />
                        </span>

                        <p className={styles.areaHint}>
                          {info.nextCount === null
                            ? `${AREA_UNIT[area]} ${info.mastered}개를 숙달했어요.`
                            : `다음 단계까지 ${AREA_UNIT[area]} ${Math.max(
                                0,
                                info.nextCount - info.mastered
                              )}개 남았어요.`}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <p className={styles.footnote}>
                세 영역 중 가장 낮은 단계가 AI Bunny 단계가 돼요. 단어 ·
                이야기 · 대화를 여러 날에 걸쳐 듣고 말해서 높은 점수를 받으면
                숙달로 세어요.
              </p>
            </div>
          </div>,
          document.body
        )}

      {celebrateLevel &&
        CelebrateIcon &&
        createPortal(
          <div
            className={styles.overlay}
            onClick={() => setCelebrateLevel(null)}
          >
            <div
              className={`${styles.dialog} ${styles.celebrate}`}
              role="dialog"
              aria-modal="true"
              aria-label="단계가 올랐어요"
              onClick={(event) => event.stopPropagation()}
            >
              <span className={styles.confetti}>
                <Confetti size={30} weight="fill" />
              </span>

              <span
                className={`${styles.levelIcon} ${styles.celebrateIcon} ${styles[celebrateLevel]}`}
              >
                <CelebrateIcon size={52} weight="fill" />
              </span>

              <p className={styles.dialogEyebrow}>LEVEL UP</p>

              <h2 className={styles.celebrateTitle}>
                {LEVEL_LABEL[celebrateLevel]} 단계가 되었어요!
              </h2>

              <p className={styles.celebrateNote}>
                AI Bunny가 이제 이렇게 말해요
                <strong>{LEVEL_CHANGE_NOTE[celebrateLevel]}</strong>
              </p>

              <button
                type="button"
                className={styles.okButton}
                onClick={() => setCelebrateLevel(null)}
              >
                좋아요
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
