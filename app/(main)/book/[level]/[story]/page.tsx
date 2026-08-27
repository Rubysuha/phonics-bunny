"use client";

import { rewardCoin } from "@/lib/rewardCoin";
import { logEngagement } from "@/lib/logEngagement";
import { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Robot,
  Microphone,
  StopCircle,
  Play,
  Sparkle,
  ArrowLeft,
} from "@phosphor-icons/react";
import ActionButton from "@/components/ActionButton";
import styles from "./detail.module.css";
import { getBookLevel, getBookStory } from "../../data";
import { convertRecordingToWav } from "@/lib/audioToWav";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/Toast";
import { useParams, notFound } from "next/navigation";

type PronunciationResult = {
  score: number;
  feedback: string[];
  recognizedText?: string;
};

export default function BookDetailPage() {
  const params = useParams<{ level: string; story: string }>();
  const level = typeof params?.level === "string" ? params.level : "";
  const story = typeof params?.story === "string" ? params.story : "";

  const currentLevel = useMemo(() => getBookLevel(level), [level]);
  const currentStory = useMemo(() => getBookStory(level, story), [level, story]);

  const storyAudioPath = currentStory
    ? `/audio/book/${level}/${currentStory.slug}.mp3`
    : "";

  const fullStoryText = useMemo(
    () => currentStory?.sentences.join(" ") ?? "",
    [currentStory]
  );

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingBlobRef = useRef<Blob | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [myRecordingUrl, setMyRecordingUrl] = useState("");

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pronunciationResult, setPronunciationResult] =
    useState<PronunciationResult | null>(null);
  const [analysisError, setAnalysisError] = useState("");

  const [countdown, setCountdown] = useState<number | null>(null);

  const { showToast } = useToast();

  if (!currentLevel || !currentStory) {
    notFound();
  }

  const handleListen = async () => {
    try {
      const audio = new Audio(storyAudioPath);

      audio.onended = async () => {
        const result = await rewardCoin({
          contentId: `book-${currentLevel.level}-${currentStory.slug}-listen`,
          contentType: "book",
          title: `${currentStory.title} 듣기`,
        });

        showToast(result.message);

        // 코인 캡과 무관하게 실제 듣기 완료 횟수를 기록 (레벨 판정용)
        logEngagement({
          contentId: `book-${currentLevel.level}-${currentStory.slug}`,
          contentType: "book",
          action: "listen",
        });
      };

      await audio.play();
    } catch (error) {
      console.error(error);
      alert("소리 파일을 찾을 수 없거나 재생할 수 없어.");
    }
  };

  const runCountdown = () => {
    return new Promise<void>((resolve) => {
      let current = 3;
      setCountdown(current);

      const interval = setInterval(() => {
        current -= 1;

        if (current <= 0) {
          clearInterval(interval);
          setCountdown(null);
          resolve();
        } else {
          setCountdown(current);
        }
      }, 1000);
    });
  };

  const handleStartRecording = async () => {
    try {
      if (myRecordingUrl) {
        URL.revokeObjectURL(myRecordingUrl);
        setMyRecordingUrl("");
      }

      setPronunciationResult(null);
      setAnalysisError("");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      await runCountdown();

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: "audio/webm",
        });

        const audioUrl = URL.createObjectURL(blob);
        setMyRecordingUrl(audioUrl);
        recordingBlobRef.current = blob;

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error(error);
      setCountdown(null);
      alert("마이크 권한을 허용해야 녹음할 수 있어.");
    }
  };

  const handleStopRecording = async () => {
    if (!mediaRecorderRef.current) return;

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    mediaRecorderRef.current.stop();
    setIsRecording(false);

    const result = await rewardCoin({
      contentId: `book-${currentLevel.level}-${currentStory.slug}-record`,
      contentType: "book",
      title: `${currentStory.title} 녹음`,
    });

    showToast(result.message);
  };

  const handlePlayMine = async () => {
    if (!myRecordingUrl) {
      alert("먼저 녹음을 해줘.");
      return;
    }

    try {
      const audio = new Audio(myRecordingUrl);

      audio.onended = () => {
        // 코인 보상은 없지만, 내 녹음 듣기 완료 횟수를 레벨 판정용으로 기록
        logEngagement({
          contentId: `book-${currentLevel.level}-${currentStory.slug}`,
          contentType: "book",
          action: "playback",
        });
      };

      await audio.play();
    } catch (error) {
      console.error(error);
      alert("내 녹음을 재생할 수 없어.");
    }
  };

  const handleAnalyzePronunciation = async () => {
    if (!recordingBlobRef.current) {
      alert("먼저 녹음을 해줘.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError("");
    setPronunciationResult(null);

    try {
      const { wavBlob, volumeScore } = await convertRecordingToWav(
        recordingBlobRef.current
      );

      const formData = new FormData();
      formData.append("audio", wavBlob, "recording.wav");
      formData.append("referenceText", fullStoryText);
      formData.append("volumeScore", String(volumeScore));

      const response = await fetch("/api/pronunciation", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        setAnalysisError(data.error ?? "분석에 실패했어요. 다시 시도해줘.");
        return;
      }

      setPronunciationResult({
        score: data.score,
        feedback: data.feedback ?? [],
        recognizedText: data.recognizedText,
      });

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { error: logError } = await supabase.from("pronunciation_logs").insert({
          user_id: user.id,
          content_type: "book",
          content_id: `book-${currentLevel.level}-${currentStory.slug}`,
          word: currentStory.title,
          score: data.score,
          accuracy: data.accuracy,
          completeness: data.completeness,
          volume_score: data.volumeScore,
        });

        if (logError) {
          console.error("발음 기록 저장 실패:", logError);
        }
      }
    } catch (error) {
      console.error(error);
      setAnalysisError("분석 중 문제가 발생했어요. 다시 시도해줘.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return "Excellent! 🌟";
    if (score >= 80) return "Great job! 🎉";
    if (score >= 60) return "Good try! 💪";
    return "Listen and try again!";
  };

  const getScoreTier = (score: number) => {
    if (score >= 90) return "excellent";
    if (score >= 80) return "great";
    if (score >= 60) return "good";
    return "retry";
  };

  const closeResult = () => {
    setPronunciationResult(null);
    setAnalysisError("");
  };

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.inner}>
          <div className={styles.bookBox}>
            <div className={styles.topBar}>
              <div className={styles.levelLabel}>{currentLevel.title}</div>
              <div className={styles.pageLabel}>Reading Book</div>
            </div>

            <div className={styles.contentRow}>
              <div className={styles.imageWrap}>
                <img
                  src={currentStory.image}
                  alt={currentStory.title}
                  className={styles.image}
                  draggable={false}
                />
              </div>

              <div className={styles.storyContent}>
                <h1 className={styles.storyTitle}>{currentStory.title}</h1>

                <div className={styles.sentenceList}>
                  {currentStory.sentences.map((sentence, index) => (
                    <p key={index} className={styles.sentence}>
                      {sentence}
                    </p>
                  ))}
                </div>

                {isRecording && (
                  <div className={styles.recordingBanner}>
                    <span className={styles.recordingDot} />
                    녹음 중이에요... {Math.floor(recordingSeconds / 60)}:
                    {String(recordingSeconds % 60).padStart(2, "0")}
                  </div>
                )}

                <div className={styles.actionRow}>
                  <ActionButton
                    variant="aiListen"
                    icon={<Robot size={20} weight="fill" />}
                    onClick={handleListen}
                  >
                    AI가 읽어주기
                  </ActionButton>

                  {!isRecording ? (
                    <ActionButton
                      variant="record"
                      icon={<Microphone size={20} weight="fill" />}
                      onClick={handleStartRecording}
                      disabled={countdown !== null}
                    >
                      {countdown !== null ? "준비 중..." : "녹음하기"}
                    </ActionButton>
                  ) : (
                    <ActionButton
                      variant="recording"
                      icon={<StopCircle size={20} weight="fill" />}
                      onClick={handleStopRecording}
                    >
                      녹음 중지
                    </ActionButton>
                  )}

                  <ActionButton
                    variant="playback"
                    icon={<Play size={20} weight="fill" />}
                    onClick={handlePlayMine}
                  >
                    내 녹음 듣기
                  </ActionButton>

                  {myRecordingUrl && (
                    <ActionButton
                      variant="analyze"
                      icon={<Sparkle size={20} weight="fill" />}
                      onClick={handleAnalyzePronunciation}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? "분석 중..." : "AI 발음 분석하기"}
                    </ActionButton>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.bottomRow}>
            <ActionButton
              variant="close"
              icon={<ArrowLeft size={20} weight="fill" />}
              href={`/book/${currentLevel.level}`}
            >
              책 목록으로 돌아가기
            </ActionButton>
          </div>
        </div>
      </div>

      {countdown !== null &&
        typeof document !== "undefined" &&
        createPortal(
          <div className={styles.countdownOverlay}>
            <div className={styles.countdownCircle}>
              <span key={countdown} className={styles.countdownNumber}>
                {countdown}
              </span>
            </div>
          </div>,
          document.body
        )}

      {(pronunciationResult || analysisError) &&
        typeof document !== "undefined" &&
        createPortal(
          <div className={styles.resultOverlay} onClick={closeResult}>
            <div
              className={
                pronunciationResult
                  ? `${styles.resultCard} ${
                      styles[getScoreTier(pronunciationResult.score)]
                    }`
                  : styles.resultCard
              }
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className={styles.resultCloseButton}
                onClick={closeResult}
                aria-label="닫기"
              >
                ✕
              </button>

              {analysisError && (
                <p className={styles.resultError}>{analysisError}</p>
              )}

              {pronunciationResult && (
                <>
                  <p className={styles.resultScore}>
                    {pronunciationResult.score}점
                  </p>
                  <p className={styles.resultMessage}>
                    {getScoreMessage(pronunciationResult.score)}
                  </p>

                  <ul className={styles.feedbackList}>
                    {pronunciationResult.feedback.map((line, idx) => (
                      <li key={idx}>{line}</li>
                    ))}
                  </ul>

                  <ActionButton
                    variant="retry"
                    icon={<Robot size={18} weight="fill" />}
                    onClick={closeResult}
                  >
                    다시 도전하기
                  </ActionButton>
                </>
              )}
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}