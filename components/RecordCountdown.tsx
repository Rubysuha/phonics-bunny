"use client";

import { createPortal } from "react-dom";
import styles from "./RecordCountdown.module.css";

/*
  녹음 시작 전 3 · 2 · 1 카운트다운
  숫자 둘레의 고리가 1초마다 한 바퀴 줄어들어서 남은 시간이 눈에 보임
*/
export default function RecordCountdown({
  value,
}: {
  value: number | null;
}) {
  if (value === null || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className={styles.overlay} role="status" aria-live="assertive">
      <div className={styles.card}>
        <div className={styles.dial}>
          {/* key 를 바꿔서 숫자가 바뀔 때마다 고리와 숫자 애니메이션을 다시 시작 */}
          <svg
            key={`ring-${value}`}
            className={styles.ring}
            viewBox="0 0 120 120"
            aria-hidden="true"
          >
            <circle className={styles.ringTrack} cx="60" cy="60" r="52" />
            <circle className={styles.ringFill} cx="60" cy="60" r="52" />
          </svg>

          <span key={`num-${value}`} className={styles.number}>
            {value}
          </span>
        </div>

        <p className={styles.label}>Get ready!</p>

        <p className={styles.hint}>곧 녹음이 시작돼요</p>
      </div>
    </div>,
    document.body
  );
}
