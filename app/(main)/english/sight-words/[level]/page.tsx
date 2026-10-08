"use client";

import { createPageAudio, useStopAudioOnLeave } from "@/lib/pageAudio";
import { rewardCoin } from "@/lib/rewardCoin";
import { logEngagement } from "@/lib/logEngagement";
import { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { notFound, useParams } from "next/navigation";
import {
  SpeakerHigh,
  Microphone,
  StopCircle,
  Play,
  Sparkle,
  FileText,
  ArrowLeft,
} from "@phosphor-icons/react";
import ActionButton from "@/components/ActionButton";
import HelpTooltip from "@/components/HelpTooltip";
import styles from "./level.module.css";
import { sightWordLevels } from "../data";
import { convertRecordingToWav, createSupportedMediaRecorder } from "@/lib/audioToWav";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/Toast";

const cardColors = ["yellow", "pink", "blue", "mint", "purple", "cream"];

type PronunciationResult = {
  score: number;
  feedback: string[];
  recognizedText?: string;
};

export default function SightWordLevelPage() {
  const params = useParams<{ level: string }>();
  const levelParam = typeof params?.level === "string" ? params.level : "";

  const currentLevel = useMemo(
    () => sightWordLevels.find((item) => item.level === levelParam),
    [levelParam]
  );

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* 이 화면을 나가면 재생 중인 소리를 모두 멈춤 */
  useStopAudioOnLeave();

  const [recordingWord, setRecordingWord] = useState("");
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordings, setRecordings] = useState<Record<string, string>>({});
  const [recordedBlobs, setRecordedBlobs] = useState<Record<string, Blob>>({});

  const [analyzingWord, setAnalyzingWord] = useState("");
  const [pronunciationResult, setPronunciationResult] =
    useState<PronunciationResult | null>(null);
  const [analysisError, setAnalysisError] = useState("");
  const [resultWord, setResultWord] = useState("");

  const [countdownWord, setCountdownWord] = useState("");
  const [countdownValue, setCountdownValue] = useState<number | null>(null);

  const { showToast } = useToast();

  if (!currentLevel) {
    notFound();
  }

  const handleListen = async (audioPath: string, word: string, slug: string) => {
    try {
      const audio = createPageAudio(audioPath);

      audio.onended = async () => {
        const result = await rewardCoin({
          contentId: `sight-words-${word.toLowerCase()}-listen`,
          contentType: "sight-words",
          title: `${word} 듣기`,
        });

        showToast(result.message);

        logEngagement({
          contentId: `sight-words-${slug}`,
          contentType: "sight-words",
          action: "listen",
        });
      };

      await audio.play();
    } catch (error) {
      console.error(error);
      alert("소리 파일을 찾을 수 없거나 재생할 수 없어.");
    }
  };

  const runCountdown = (word: string) => {
    return new Promise<void>((resolve) => {
      let current = 3;
      setCountdownWord(word);
      setCountdownValue(current);

      const interval = setInterval(() => {
        current -= 1;

        if (current <= 0) {
          clearInterval(interval);
          setCountdownWord("");
          setCountdownValue(null);
          resolve();
        } else {
          setCountdownValue(current);
        }
      }, 1000);
    });
  };

  const handleStartRecording = async (word: string) => {
    try {
      const previousUrl = recordings[word];

      if (previousUrl) {
        URL.revokeObjectURL(previousUrl);
      }

      setPronunciationResult(null);
      setAnalysisError("");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      await runCountdown(word);

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

        setRecordings((prev) => ({
          ...prev,
          [word]: audioUrl,
        }));

        setRecordedBlobs((prev) => ({
          ...prev,
          [word]: blob,
        }));

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setRecordingWord(word);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error(error);
      setCountdownWord("");
      setCountdownValue(null);
      alert("마이크 권한을 허용해야 녹음할 수 있어.");
    }
  };

  const handleStopRecording = async () => {
    if (!mediaRecorderRef.current) return;

    const word = recordingWord;

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    mediaRecorderRef.current.stop();
    setRecordingWord("");

    const result = await rewardCoin({
      contentId: `sight-words-${word.toLowerCase()}-record`,
      contentType: "sight-words",
      title: `${word} 녹음`,
    });

    showToast(result.message);
  };

  const handlePlayMine = async (word: string, slug: string) => {
    const myRecordingUrl = recordings[word];

    if (!myRecordingUrl) {
      alert("먼저 녹음을 해줘.");
      return;
    }

    try {
      const audio = createPageAudio(myRecordingUrl);

      audio.onended = () => {
        logEngagement({
          contentId: `sight-words-${slug}`,
          contentType: "sight-words",
          action: "playback",
        });
      };

      await audio.play();
    } catch (error) {
      console.error(error);
      alert("내 녹음을 재생할 수 없어.");
    }
  };

  const handleAnalyzePronunciation = async (item: {
    slug: string;
    word: string;
  }) => {
    const blob = recordedBlobs[item.word];

    if (!blob) {
      alert("먼저 녹음을 해줘.");
      return;
    }

    setAnalyzingWord(item.word);
    setAnalysisError("");
    setPronunciationResult(null);
    setResultWord(item.word);

    try {
      const { wavBlob, volumeScore } = await convertRecordingToWav(blob);

      const formData = new FormData();
      formData.append("audio", wavBlob, "recording.wav");
      formData.append("referenceText", item.word);
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
          content_type: "sight-words",
          content_id: `sight-words-${item.slug}`,
          word: item.word,
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
      setAnalyzingWord("");
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
    setResultWord("");
  };

  const handleDownloadWorksheet = () => {
    const link = document.createElement("a");
    link.href = currentLevel.worksheet;
    link.download = `${currentLevel.title}.hwp`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.helpWrap}>
          <HelpTooltip
            title="이렇게 진행돼요"
            sections={[
              {
                heading: "학습 목표",
                items: [
                  "the, said, was처럼 소리 규칙을 따르지 않아 파닉스로 풀어 읽기 어려운 고빈도 단어를 통째로 외워요.",
                  "실제 문장의 대부분을 차지하는 단어들이라, 여기서 익숙해질수록 문장을 읽는 속도와 유창성이 늘어요.",
                ],
              },
              {
                heading: "진행 방법",
                items: [
                  "듣기 버튼의 소리는 이미 AI 음성으로 만들어져 있어서, 다른 섹션과 달리 별도의 AI 읽기 버튼은 없어요.",
                  "카드별로 듣기 → 녹음 → 내 녹음 듣기 → AI 발음 분석하기 순서로 진행돼요.",
                  "AI 발음 분석은 정확도 70% + 완성도 20% + 목소리 크기 10%를 합산해서 점수를 매겨요.",
                  "여기서 발음 정확도가 낮았던 단어는 AI Bunny 대화에서 자동으로 다시 등장해요.",
                  "레벨 전체 한글 학습 자료도 내려받을 수 있어요.",
                  "소리 듣기와 녹음은 각각 코인으로 이어지고, 같은 단어에서 듣기 5번·녹음 5번까지 따로 받을 수 있어요.",
                ],
              },
            ]}
          />
        </div>

        <div className={styles.inner}>
          <h1 className={styles.title}>{currentLevel.title}</h1>

          <p className={styles.subtitle}>
            자주 쓰는 단어를 듣고, 따라 말하고, 내 목소리로 확인해 보세요.
          </p>

          <div className={styles.grid}>
            {currentLevel.words.map((item, index) => {
              const isRecording = recordingWord === item.word;
              const isCountingDown = countdownWord === item.word;
              const color = cardColors[index % cardColors.length];

              return (
                <div
                  key={item.slug}
                  className={`${styles.card} ${styles[color]}`}
                >
                  <div className={styles.word}>{item.word}</div>

                  {isRecording && (
                    <div className={styles.recordingBadge}>
                      <span className={styles.recordingDot} />
                      {Math.floor(recordingSeconds / 60)}:
                      {String(recordingSeconds % 60).padStart(2, "0")}
                    </div>
                  )}

                  <div className={styles.buttonGroup}>
                    <ActionButton
                      variant="listen"
                      size="sm"
                      icon={<SpeakerHigh size={16} weight="fill" />}
                      onClick={() => handleListen(item.audio, item.word, item.slug)}
                    >
                      듣기
                    </ActionButton>

                    {!isRecording ? (
                      <ActionButton
                        variant="record"
                        size="sm"
                        icon={<Microphone size={16} weight="fill" />}
                        onClick={() => handleStartRecording(item.word)}
                        disabled={countdownValue !== null}
                      >
                        {isCountingDown ? "준비 중..." : "녹음"}
                      </ActionButton>
                    ) : (
                      <ActionButton
                        variant="recording"
                        size="sm"
                        icon={<StopCircle size={16} weight="fill" />}
                        onClick={handleStopRecording}
                      >
                        중지
                      </ActionButton>
                    )}

                    <ActionButton
                      variant="playback"
                      size="sm"
                      icon={<Play size={16} weight="fill" />}
                      onClick={() => handlePlayMine(item.word, item.slug)}
                    >
                      재생
                    </ActionButton>

                    {recordings[item.word] && (
                      <ActionButton
                        variant="analyze"
                        size="sm"
                        icon={<Sparkle size={16} weight="fill" />}
                        onClick={() => handleAnalyzePronunciation(item)}
                        disabled={analyzingWord === item.word}
                      >
                        {analyzingWord === item.word ? "분석 중..." : "AI 분석"}
                      </ActionButton>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.bottomRow}>
            <ActionButton
              variant="close"
              icon={<ArrowLeft size={20} weight="fill" />}
              href="/english/sight-words"
            >
              Sight Words로 돌아가기
            </ActionButton>

            <ActionButton
              variant="download"
              icon={<FileText size={20} weight="fill" />}
              onClick={handleDownloadWorksheet}
            >
              한글 자료 받기
            </ActionButton>
          </div>
        </div>
      </div>

      {countdownValue !== null &&
        typeof document !== "undefined" &&
        createPortal(
          <div className={styles.countdownOverlay}>
            <div className={styles.countdownCircle}>
              <span key={countdownValue} className={styles.countdownNumber}>
                {countdownValue}
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

              {resultWord && (
                <p className={styles.resultWordLabel}>{resultWord}</p>
              )}

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
                    icon={<SpeakerHigh size={16} weight="fill" />}
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