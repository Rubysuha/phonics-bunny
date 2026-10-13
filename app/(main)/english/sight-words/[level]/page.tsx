"use client";

import { createPageAudio, useStopAudioOnLeave } from "@/lib/pageAudio";
import { rewardCoin } from "@/lib/rewardCoin";
import { logEngagement } from "@/lib/logEngagement";
import { notifyLearningUpdated } from "@/lib/learningEvents";
import MasteryMeter from "@/components/MasteryMeter";
import { useMemo, useRef, useState } from "react";
import { notFound, useParams } from "next/navigation";
import {
  SpeakerHigh,
  Microphone,
  Stop,
  PlayCircle,
  Sparkle,
  FileText,
} from "@phosphor-icons/react";
import RecordCountdown from "@/components/RecordCountdown";
import PronunciationResultModal from "@/components/PronunciationResultModal";
import HelpTooltip from "@/components/HelpTooltip";
import { SCORE_HELP, coinHelp, masteryHelp } from "@/components/helpSections";
import BackButton from "@/components/ui/BackButton";
import PageTitle from "@/components/PageTitle";
import styles from "./level.module.css";
import { sightWordLevels } from "../data";
import { convertRecordingToWav, createSupportedMediaRecorder } from "@/lib/audioToWav";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/Toast";


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
      showToast("소리를 재생할 수 없어요.");
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
      showToast("마이크 권한을 허용해야 녹음할 수 있어요.");
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
      showToast("먼저 녹음을 해 주세요.");
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
      showToast("내 녹음을 재생할 수 없어요.");
    }
  };

  const handleAnalyzePronunciation = async (item: {
    slug: string;
    word: string;
  }) => {
    const blob = recordedBlobs[item.word];

    if (!blob) {
      showToast("먼저 녹음을 해 주세요.");
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
        setAnalysisError(data.error ?? "분석에 실패했어요. 다시 시도해 주세요.");
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
        } else {
          notifyLearningUpdated();
        }
      }
    } catch (error) {
      console.error(error);
      setAnalysisError("분석 중 문제가 발생했어요. 다시 시도해 주세요.");
    } finally {
      setAnalyzingWord("");
    }
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
            title="Sight Words 이렇게 해요"
            sections={[
              {
                heading: "학습 목표",
                items: [
                  "the · said · was처럼 소리 규칙으로 읽기 어려운, 자주 나오는 단어를 통째로 익혀요.",
                  "문장의 대부분을 차지하는 단어들이라, 익숙해질수록 문장을 빠르고 자연스럽게 읽게 돼요.",
                ],
              },
              {
                heading: "진행 방법",
                items: [
                  "카드마다 듣기 → 녹음 → 내 녹음 듣기 → 발음 확인 순서로 연습해요.",
                  "듣기 소리가 AI 음성이라 따로 AI Voice 버튼은 없어요.",
                  SCORE_HELP,
                  "점수가 낮았던 단어는 AI Bunny 대화에 다시 나와서 한 번 더 연습할 수 있어요.",
                  "레벨 전체의 한글 학습 자료가 있으면 화면 아래에서 내려받을 수 있어요.",
                ],
              },
              masteryHelp("단어"),
              coinHelp("단어", 1),
            ]}
          />
        </div>

        <div className={styles.inner}>
          <PageTitle
            eyebrow="SIGHT WORDS"
            title={currentLevel.title}
            subtitle="Listen, repeat, and check your own voice."
          />

          <div className={styles.grid}>
            {currentLevel.words.map((item) => {
              const isRecording = recordingWord === item.word;
              const isCountingDown = countdownWord === item.word;
              const hasRecording = !!recordings[item.word];

              return (
                <div
                  key={item.slug}
                  className={`${styles.card} ${
                    isRecording ? styles.cardRecording : ""
                  }`}
                >
                  <div className={styles.word}>{item.word}</div>

                  <p className={styles.status}>
                    {isRecording
                      ? `Recording... ${Math.floor(recordingSeconds / 60)}:${String(
                          recordingSeconds % 60
                        ).padStart(2, "0")}`
                      : isCountingDown
                        ? "Get ready..."
                        : hasRecording
                          ? "Recording Complete!"
                          : "Tap to Record"}
                  </p>

                  <div className={styles.mastery}>
                    <MasteryMeter contentId={`sight-words-${item.slug}`} />
                  </div>

                  <div className={styles.controls}>
                    <button
                      type="button"
                      className={styles.iconButton}
                      onClick={() =>
                        handleListen(item.audio, item.word, item.slug)
                      }
                      aria-label={`Listen: ${item.word}`}
                    >
                      <SpeakerHigh size={20} />
                    </button>

                    <button
                      type="button"
                      className={`${styles.micButton} ${
                        isRecording ? styles.micButtonActive : ""
                      }`}
                      onClick={
                        isRecording
                          ? handleStopRecording
                          : () => handleStartRecording(item.word)
                      }
                      disabled={!isRecording && countdownValue !== null}
                      aria-label={
                        isRecording
                          ? "Stop Recording"
                          : `Record: ${item.word}`
                      }
                    >
                      {isRecording ? (
                        <Stop size={20} weight="fill" />
                      ) : (
                        <Microphone size={24} />
                      )}
                    </button>

                    <button
                      type="button"
                      className={styles.iconButton}
                      onClick={() => handlePlayMine(item.word, item.slug)}
                      aria-label={`Play my recording: ${item.word}`}
                    >
                      <PlayCircle size={20} />
                    </button>
                  </div>

                  {hasRecording && (
                    <button
                      type="button"
                      className={styles.checkButton}
                      onClick={() => handleAnalyzePronunciation(item)}
                      disabled={analyzingWord === item.word}
                    >
                      <Sparkle size={16} />
                      {analyzingWord === item.word
                        ? "Checking..."
                        : "Check My Pronunciation"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className={styles.footer}>
            <BackButton href="/english/sight-words">
              Sight Words로 돌아가기
            </BackButton>

            {currentLevel.worksheet && (
              <button
                type="button"
                className={styles.textButton}
                onClick={handleDownloadWorksheet}
              >
                <FileText size={19} />
                Download Korean Guide
              </button>
            )}
          </div>
        </div>
      </div>

      <RecordCountdown value={countdownValue} />

      <PronunciationResultModal
        result={pronunciationResult}
        error={analysisError}
        word={resultWord}
        onClose={closeResult}
      />
    </section>
  );
}