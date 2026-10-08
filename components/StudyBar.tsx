"use client";

import Link from "next/link";
import {
  Microphone,
  PlayCircle,
  Sparkle,
  Stop,
} from "@phosphor-icons/react";
import styles from "./StudyBar.module.css";

type Props = {
  listenIcon: React.ReactNode;
  listenLabel: string;
  onListen: () => void;
  listenDisabled?: boolean;

  isRecording: boolean;
  recordingSeconds: number;
  countdown: number | null;
  onStartRecording: () => void;
  onStopRecording: () => void;

  onPlayMine: () => void;
  hasRecording: boolean;

  isAnalyzing: boolean;
  onAnalyze: () => void;

  backIcon: React.ReactNode;
  backLabel: string;
  backHref: string;
};

/*
  문장 학습 화면 아래에 놓는 얇은 조작 바
  [듣기]  (마이크) 상태  [내 녹음 듣기] [발음 확인]  |  돌아가기
*/
export default function StudyBar({
  listenIcon,
  listenLabel,
  onListen,
  listenDisabled = false,
  isRecording,
  recordingSeconds,
  countdown,
  onStartRecording,
  onStopRecording,
  onPlayMine,
  hasRecording,
  isAnalyzing,
  onAnalyze,
  backIcon,
  backLabel,
  backHref,
}: Props) {
  const isPreparing = countdown !== null;

  const time = `${Math.floor(recordingSeconds / 60)}:${String(
    recordingSeconds % 60
  ).padStart(2, "0")}`;

  const status = isRecording
    ? "Recording..."
    : isPreparing
      ? "Get ready..."
      : hasRecording
        ? "Recording Complete!"
        : "Tap to Record";

  const hint = isRecording
    ? `Stop Recording · ${time}`
    : hasRecording && !isPreparing
      ? "Record Again"
      : "Listen and repeat!";

  return (
    <div className={styles.bar}>
      <button
        type="button"
        className={styles.pill}
        onClick={onListen}
        disabled={listenDisabled}
      >
        {listenIcon}
        {listenLabel}
      </button>

      <div className={styles.record}>
        <button
          type="button"
          className={`${styles.mic} ${isRecording ? styles.micActive : ""}`}
          onClick={isRecording ? onStopRecording : onStartRecording}
          disabled={!isRecording && isPreparing}
          aria-label={
            isRecording
              ? "Stop Recording"
              : hasRecording
                ? "Record Again"
                : "Tap to Record"
          }
        >
          {isRecording ? (
            <Stop size={22} weight="fill" />
          ) : (
            <Microphone size={26} />
          )}
        </button>

        <div className={styles.recordText}>
          <strong aria-live="polite">{status}</strong>
          <span>{hint}</span>
        </div>
      </div>

      <button type="button" className={styles.pill} onClick={onPlayMine}>
        <PlayCircle size={20} />
        Play My Recording
      </button>

      {hasRecording && (
        <button
          type="button"
          className={`${styles.pill} ${styles.pillAccent}`}
          onClick={onAnalyze}
          disabled={isAnalyzing}
        >
          <Sparkle size={20} />
          {isAnalyzing ? "Checking..." : "Check My Pronunciation"}
        </button>
      )}

      <Link href={backHref} className={styles.back}>
        {backIcon}
        {backLabel}
      </Link>
    </div>
  );
}
