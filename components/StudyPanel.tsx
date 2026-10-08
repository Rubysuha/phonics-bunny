"use client";

import Link from "next/link";
import {
  FileText,
  Headphones,
  Microphone,
  PlayCircle,
  SpeakerHigh,
  Sparkle,
  Stop,
  X,
} from "@phosphor-icons/react";
import StudyFrame from "./StudyFrame";
import styles from "./StudyPanel.module.css";

type Props = {
  /* 왼쪽에 크게 보여줄 그림 */
  imageSrc: string;
  imageAlt: string;

  /* 그림 아래에 크게 보여줄 단어 · 글자 */
  title: React.ReactNode;

  onListen: () => void;
  onListenAI: () => void;

  isRecording: boolean;
  recordingSeconds: number;
  countdown: number | null;
  onStartRecording: () => void;
  onStopRecording: () => void;

  onPlayMine: () => void;

  /* 녹음해 둔 내 목소리가 있는지 */
  hasRecording?: boolean;

  /* AI 발음 분석이 있는 화면에서만 넘김 */
  canAnalyze?: boolean;
  isAnalyzing?: boolean;
  onAnalyze?: () => void;

  onDownload: () => void;
  backHref: string;
};

/*
  단어 학습 화면: 왼쪽에 그림, 오른쪽에 듣기 · 녹음 패널
  (버튼이 하는 일은 각 페이지의 기존 함수를 그대로 사용)
*/
export default function StudyPanel({
  imageSrc,
  imageAlt,
  title,
  onListen,
  onListenAI,
  isRecording,
  recordingSeconds,
  countdown,
  onStartRecording,
  onStopRecording,
  onPlayMine,
  hasRecording = false,
  canAnalyze = false,
  isAnalyzing = false,
  onAnalyze,
  onDownload,
  backHref,
}: Props) {
  const isPreparing = countdown !== null;

  const time = `${Math.floor(recordingSeconds / 60)}:${String(
    recordingSeconds % 60
  ).padStart(2, "0")}`;

  /* 녹음 버튼 아래 안내 (상태에 따라 바뀜) */
  const recordLabel = isRecording
    ? "Recording..."
    : isPreparing
      ? "Get ready..."
      : hasRecording
        ? "Recording Complete!"
        : "Tap to Record";

  const recordHint = isRecording
    ? `Stop Recording · ${time}`
    : hasRecording && !isPreparing
      ? "Record Again"
      : "Listen and repeat!";

  return (
    <StudyFrame imageSrc={imageSrc} imageAlt={imageAlt} caption={title}>
      <p className={styles.eyebrow}>LISTEN &amp; SPEAK</p>

      <div className={styles.listenRow}>
        <button
          type="button"
          className={styles.pill}
          onClick={onListen}
        >
          <SpeakerHigh size={20} />
          Listen
        </button>

        <button
          type="button"
          className={styles.pill}
          onClick={onListenAI}
        >
          <Headphones size={20} />
          AI Voice
        </button>
      </div>

      <button
        type="button"
        className={`${styles.recordButton} ${
          isRecording ? styles.recordButtonActive : ""
        }`}
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
          <Stop size={32} weight="fill" />
        ) : (
          <Microphone size={38} />
        )}
      </button>

      <p className={styles.recordLabel} aria-live="polite">
        {recordLabel}
      </p>

      <p className={styles.recordHint}>{recordHint}</p>

      <button
        type="button"
        className={styles.wideButton}
        onClick={onPlayMine}
      >
        <PlayCircle size={20} />
        Play My Recording
      </button>

      {canAnalyze && onAnalyze && (
        <button
          type="button"
          className={`${styles.wideButton} ${styles.analyzeButton}`}
          onClick={onAnalyze}
          disabled={isAnalyzing}
        >
          <Sparkle size={20} />
          {isAnalyzing ? "Checking..." : "Check My Pronunciation"}
        </button>
      )}

      <div className={styles.footer}>
        <button
          type="button"
          className={styles.textButton}
          onClick={onDownload}
        >
          <FileText size={20} />
          Download Korean Guide
        </button>

        <Link href={backHref} className={styles.textButton}>
          <X size={20} />
          Close
        </Link>
      </div>
    </StudyFrame>
  );
}
