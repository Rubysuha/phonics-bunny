"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Robot,
  Microphone,
  StopCircle,
  Play,
  Sparkle,
  House,
  SpeakerHigh,
} from "@phosphor-icons/react";
import ActionButton from "@/components/ActionButton";
import { rewardCoin } from "@/lib/rewardCoin";
import { logEngagement } from "@/lib/logEngagement";
import { convertRecordingToWav, createSupportedMediaRecorder } from "@/lib/audioToWav";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/Toast";
import { notFound, useParams } from "next/navigation";
import styles from "./detail.module.css";
import { conversationCategories } from "../../data";

type PronunciationResult = {
  score: number;
  feedback: string[];
  recognizedText?: string;
};

export default function ConversationDetailPage() {
  const params = useParams<{ category: string; sentence: string }>();
  const category = typeof params?.category === "string" ? params.category : "";
  const dialogueId = typeof params?.sentence === "string" ? params.sentence : "";

  const currentCategory = useMemo(
    () => conversationCategories.find((v) => v.slug === category),
    [category]
  );

  const item = useMemo(
    () => currentCategory?.dialogues.find((d) => d.id === dialogueId),
    [currentCategory, dialogueId]
  );

  const fullDialogueText = useMemo(
    () => item?.lines.map((line) => line.text).join(" ") ?? "",
    [item]
  );

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingBlobRef = useRef<Blob | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [myRecordingUrl, setMyRecordingUrl] = useState("");
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pronunciationResult, setPronunciationResult] =
    useState<PronunciationResult | null>(null);
  const [analysisError, setAnalysisError] = useState("");

  const [countdown, setCountdown] = useState<number | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    if (activeLineIndex === null) return;

    lineRefs.current[activeLineIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [activeLineIndex]);

  if (!currentCategory || !item) {
    notFound();
  }

  const playOne = (audioPath: string) => {
    return new Promise<void>((resolve, reject) => {
      const audio = new Audio(audioPath);
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error("play failed"));
      audio.play().catch(reject);
    });
  };

  const handlePlayLine = async (index: number) => {
    try {
      setActiveLineIndex(index);
      await playOne(item.lines[index].audio);

      // 개별 줄 다시 듣기도 듣기 횟수에 포함 (단, 전체듣기 완주와는 별도로 집계)
      logEngagement({
        contentId: `conversation-${item.id}`,
        contentType: "conversation",
        action: "listen_line",
      });
    } catch {
      alert("소리 파일을 찾을 수 없거나 재생할 수 없어.");
    } finally {
      setActiveLineIndex(null);
    }
  };

  const handlePlayAll = async () => {
    if (isPlayingAll) return;

    setIsPlayingAll(true);

    try {
      for (let i = 0; i < item.lines.length; i++) {
        setActiveLineIndex(i);
        await playOne(item.lines[i].audio);
      }

      const result = await rewardCoin({
        contentId: `conversation-${item.id}-listen`,
        contentType: "conversation",
        title: `${item.title} AI 듣기`,
      });

      showToast(result.message);

      // 코인 캡과 무관하게 실제 전체듣기 완료 횟수를 기록 (레벨 판정용)
      logEngagement({
        contentId: `conversation-${item.id}`,
        contentType: "conversation",
        action: "listen", // 전체 완주는 반드시 "listen"
      });
    } catch {
      alert("소리 파일을 찾을 수 없거나 재생할 수 없어.");
    } finally {
      setIsPlayingAll(false);
      setActiveLineIndex(null);
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

      const mediaRecorder = createSupportedMediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: mediaRecorder.mimeType || "audio/webm",
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
      contentId: `conversation-${item.id}-record`,
      contentType: "conversation",
      title: `${item.title} 녹음`,
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
          contentId: `conversation-${item.id}`,
          contentType: "conversation",
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
      formData.append("referenceText", fullDialogueText);
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
          content_type: "conversation",
          content_id: `conversation-${item.id}`,
          word: item.title,
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
          <div className={styles.dialogueCard}>
            <div className={styles.headerBar}>
              <span>{currentCategory.title}</span>
              <span>Conversation</span>
            </div>

            <div className={styles.imageWrap}>
              <img src={item.image} alt={item.title} className={styles.image} />
            </div>

            <h2 className={styles.dialogueTitle}>{item.title}</h2>

            <div className={styles.dialogueList}>
              {item.lines.map((line, index) => (
                <div
                  key={index}
                  ref={(el) => {
                    lineRefs.current[index] = el;
                  }}
                  className={`${styles.lineRow} ${
                    activeLineIndex === index ? styles.lineRowActive : ""
                  }`}
                >
                  <span
                    className={`${styles.roleBadge} ${
                      line.gender === "male" ? styles.roleBadgeMale : styles.roleBadgeFemale
                    }`}
                  >
                    {line.role}
                  </span>
                  <p className={styles.lineText}>{line.text}</p>
                  <button
                    className={styles.replayIcon}
                    onClick={() => handlePlayLine(index)}
                    aria-label="이 줄만 다시 듣기"
                  >
                    <SpeakerHigh size={18} weight="fill" />
                  </button>
                </div>
              ))}
            </div>

            {isRecording && (
              <div className={styles.recordingBanner}>
                <span className={styles.recordingDot} />
                녹음 중이에요... {Math.floor(recordingSeconds / 60)}:
                {String(recordingSeconds % 60).padStart(2, "0")}
              </div>
            )}
          </div>

          <div className={styles.actionRow}>
            <ActionButton
              variant="aiListen"
              icon={<Robot size={20} weight="fill" />}
              onClick={handlePlayAll}
              disabled={isPlayingAll}
            >
              {isPlayingAll ? "읽는 중..." : "전체듣기"}
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

            <ActionButton
              variant="close"
              icon={<House size={20} weight="fill" />}
              href={`/conversation/${currentCategory.slug}`}
            >
              닫기
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