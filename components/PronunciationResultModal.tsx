"use client";

import { createPortal } from "react-dom";
import { ArrowCounterClockwise, X } from "@phosphor-icons/react";
import styles from "./PronunciationResultModal.module.css";

type Props = {
  result: { score: number; feedback: string[] } | null;
  error: string;
  onClose: () => void;
};

const getMessage = (score: number) => {
  if (score >= 90) return "정말 훌륭해요!";
  if (score >= 80) return "아주 잘했어요!";
  if (score >= 60) return "좋아요, 조금만 더!";
  return "다시 듣고 도전해 봐요!";
};

/* 점수에 따라 켜지는 별 (60 · 80 · 90점) */
const getStars = (score: number) =>
  score >= 90 ? 3 : score >= 80 ? 2 : score >= 60 ? 1 : 0;

/* AI 발음 분석 결과 창 (학습 화면 공통) */
export default function PronunciationResultModal({
  result,
  error,
  onClose,
}: Props) {
  if ((!result && !error) || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.card}
        role="dialog"
        aria-modal="true"
        aria-label="발음 분석 결과"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="닫기"
        >
          <X size={18} weight="bold" />
        </button>

        <p className={styles.eyebrow}>내 발음 점수</p>

        {error && <p className={styles.error}>{error}</p>}

        {result && (
          <>
            <div className={styles.stars} aria-hidden="true">
              {[1, 2, 3].map((star) => (
                <span
                  key={star}
                  className={
                    star <= getStars(result.score)
                      ? styles.starOn
                      : styles.starOff
                  }
                >
                  ★
                </span>
              ))}
            </div>

            <p className={styles.score}>
              {result.score}
              <span>/ 100점</span>
            </p>

            <p className={styles.message}>{getMessage(result.score)}</p>

            {result.feedback.length > 0 && (
              <ul className={styles.feedbackList}>
                {result.feedback.map((line, index) => (
                  <li key={index}>{line}</li>
                ))}
              </ul>
            )}
          </>
        )}

        <button
          type="button"
          className={styles.retryButton}
          onClick={onClose}
        >
          <ArrowCounterClockwise size={19} weight="bold" />
          다시 도전하기
        </button>
      </div>
    </div>,
    document.body
  );
}
