"use client";

import { rewardCoin } from "@/lib/rewardCoin";
import { logEngagement } from "@/lib/logEngagement";
import { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { notFound, useParams } from "next/navigation";
import StudyPanel from "@/components/StudyPanel";
import PronunciationResultModal from "@/components/PronunciationResultModal";
import styles from "./detail.module.css";
import { shortVowelItems } from "../../data";
import { convertRecordingToWav, createSupportedMediaRecorder } from "@/lib/audioToWav";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/Toast";

type PronunciationResult = {
  score: number;
  feedback: string[];
  recognizedText?: string;
};

export default function ShortVowelDetailPage() {
  const params = useParams<{ vowel: string; word: string }>();
  const vowel = typeof params?.vowel === "string" ? params.vowel : "";
  const word = typeof params?.word === "string" ? params.word : "";

  const currentVowel = useMemo(
    () => shortVowelItems.find((v) => v.vowel === vowel),
    [vowel]
  );

  const item = useMemo(
    () => currentVowel?.words.find((w) => w.slug === word),
    [currentVowel, word]
  );

  // data.ts는 건드리지 않고, book 때와 같은 규칙으로 AI 음성 경로를 계산
  const aiAudioPath = item ? `/audio/short-vowels-ai/${item.slug}.mp3` : "";

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

  if (!currentVowel || !item) {
    notFound();
  }

  const handleListen = async () => {
    try {
      const audio = new Audio(item.audio);

      audio.onended = async () => {
        const result = await rewardCoin({
          contentId: `short-vowels-${item.slug}-listen`,
          contentType: "short-vowels",
          title: `${item.word} 듣기`,
        });

        showToast(result.message);

        logEngagement({
          contentId: `short-vowels-${item.slug}`,
          contentType: "short-vowels",
          action: "listen",
        });
      };

      await audio.play();
    } catch (error) {
      console.error(error);
      alert("소리 파일을 찾을 수 없거나 재생할 수 없어.");
    }
  };

  const handleListenAI = async () => {
    try {
      const audio = new Audio(aiAudioPath);

      audio.onended = async () => {
        const result = await rewardCoin({
          contentId: `short-vowels-${item.slug}-listen`,
          contentType: "short-vowels",
          title: `${item.word} AI 듣기`,
        });

        showToast(result.message);

        logEngagement({
          contentId: `short-vowels-${item.slug}`,
          contentType: "short-vowels",
          action: "listen",
        });
      };

      await audio.play();
    } catch (error) {
      console.error(error);
      alert("AI 소리 파일을 찾을 수 없거나 재생할 수 없어.");
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
      contentId: `short-vowels-${item.slug}-record`,
      contentType: "short-vowels",
      title: `${item.word} 녹음`,
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
        logEngagement({
          contentId: `short-vowels-${item.slug}`,
          contentType: "short-vowels",
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
          content_type: "short-vowels",
          content_id: `short-vowels-${item.slug}`,
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
      setIsAnalyzing(false);
    }
  };

  const closeResult = () => {
    setPronunciationResult(null);
    setAnalysisError("");
  };

  const handleDownloadWorksheet = () => {
    const link = document.createElement("a");
    link.href = item.worksheet;
    link.download = "";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <StudyPanel
          imageSrc={item.image}
          imageAlt={item.word}
          title={item.word}
          onListen={handleListen}
          onListenAI={handleListenAI}
          isRecording={isRecording}
          recordingSeconds={recordingSeconds}
          countdown={countdown}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
          onPlayMine={handlePlayMine}
          hasRecording={!!myRecordingUrl}
          canAnalyze={!!myRecordingUrl}
          isAnalyzing={isAnalyzing}
          onAnalyze={handleAnalyzePronunciation}
          onDownload={handleDownloadWorksheet}
          backHref={`/english/short-vowels/${currentVowel.vowel}`}
        />
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

      <PronunciationResultModal
        result={pronunciationResult}
        error={analysisError}
        onClose={closeResult}
      />
    </section>
  );
}