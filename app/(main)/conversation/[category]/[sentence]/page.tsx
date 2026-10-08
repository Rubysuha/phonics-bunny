"use client";

import RecordCountdown from "@/components/RecordCountdown";
import { createPageAudio, useStopAudioOnLeave } from "@/lib/pageAudio";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  SpeakerHigh,
  Headphones,
  X,
} from "@phosphor-icons/react";
import { Nunito } from "next/font/google";
import StudyBar from "@/components/StudyBar";
import PronunciationResultModal from "@/components/PronunciationResultModal";
import { rewardCoin } from "@/lib/rewardCoin";
import { logEngagement } from "@/lib/logEngagement";
import { convertRecordingToWav, createSupportedMediaRecorder } from "@/lib/audioToWav";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/Toast";
import { notFound, useParams } from "next/navigation";
import styles from "./detail.module.css";
import { conversationCategories } from "../../data";

/* Book 과 같은 둥근 읽기용 글꼴 (이 화면에서만 사용) */
const talkFont = Nunito({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

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

  /* 이 화면을 나가면 재생 중인 소리를 모두 멈춤 */
  useStopAudioOnLeave();

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

  /* 대화에 나오는 사람들 (처음 말한 순서) */
  const roleOrder = Array.from(
    new Set(item.lines.map((line) => line.role))
  );

  const playOne = (audioPath: string) => {
    return new Promise<void>((resolve, reject) => {
      const audio = createPageAudio(audioPath);
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
      const audio = createPageAudio(myRecordingUrl);

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

  const closeResult = () => {
    setPronunciationResult(null);
    setAnalysisError("");
  };

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={`${styles.talk} ${talkFont.className}`}>
          <div className={styles.stage}>
            {/* 왼쪽: 장면 그림 */}
            <div className={styles.scene}>
              <img
                src={item.image}
                alt={item.title}
                className={styles.sceneImage}
                draggable={false}
              />
            </div>

            {/* 오른쪽: 말풍선 대화 (말풍선을 누르면 그 줄을 들려줌) */}
            <div className={styles.chat}>
              <p className={styles.chatEyebrow}>
                {currentCategory.title}
                {"  ·  "}
                LISTEN &amp; SPEAK
              </p>

              <h1 className={styles.chatTitle}>{item.title}</h1>

              <div className={styles.bubbles}>
                {item.lines.map((line, index) => {
                  /* 처음 말한 사람은 왼쪽, 다음 사람은 오른쪽 … 번갈아 배치 */
                  const isRight = roleOrder.indexOf(line.role) % 2 === 1;

                  return (
                    <div
                      key={index}
                      ref={(el) => {
                        lineRefs.current[index] = el;
                      }}
                      className={`${styles.turn} ${
                        isRight ? styles.turnRight : ""
                      }`}
                    >
                      <span className={styles.who}>{line.role}</span>

                      <button
                        type="button"
                        className={`${styles.bubble} ${
                          activeLineIndex === index
                            ? styles.bubbleActive
                            : ""
                        }`}
                        onClick={() => handlePlayLine(index)}
                        aria-label={`Listen: ${line.text}`}
                      >
                        <span>{line.text}</span>

                        <SpeakerHigh size={18} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <StudyBar
            listenIcon={<Headphones size={20} />}
            listenLabel={isPlayingAll ? "Playing..." : "Listen All"}
            onListen={handlePlayAll}
            listenDisabled={isPlayingAll}
            isRecording={isRecording}
            recordingSeconds={recordingSeconds}
            countdown={countdown}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            onPlayMine={handlePlayMine}
            hasRecording={!!myRecordingUrl}
            isAnalyzing={isAnalyzing}
            onAnalyze={handleAnalyzePronunciation}
            backIcon={<X size={19} />}
            backLabel="Close"
            backHref={`/conversation/${currentCategory.slug}`}
          />
        </div>
      </div>

      <RecordCountdown value={countdown} />

      <PronunciationResultModal
        result={pronunciationResult}
        error={analysisError}
        onClose={closeResult}
      />
    </section>
  );
}