"use client";

import RecordCountdown from "@/components/RecordCountdown";
import { createPageAudio, useStopAudioOnLeave } from "@/lib/pageAudio";
import { rewardCoin } from "@/lib/rewardCoin";
import { useMemo, useRef, useState } from "react";
import { notFound, useParams } from "next/navigation";
import StudyPanel from "@/components/StudyPanel";
import styles from "./detail.module.css";
import { alphabetItems } from "../data";
import { useToast } from "@/components/Toast";
import { createSupportedMediaRecorder } from "@/lib/audioToWav";

export default function AlphabetDetailPage() {
  const params = useParams<{ letter: string }>();
  const letter = typeof params?.letter === "string" ? params.letter : "";

  const item = useMemo(
    () => alphabetItems.find((v) => v.letter === letter),
    [letter]
  );

  const aiAudioPath = item ? `/audio/alphabet-ai/${item.letter}.mp3` : "";

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* 이 화면을 나가면 재생 중인 소리를 모두 멈춤 */
  useStopAudioOnLeave();

  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [myRecordingUrl, setMyRecordingUrl] = useState("");

  const [countdown, setCountdown] = useState<number | null>(null);

  const { showToast } = useToast();

  if (!item) {
    notFound();
  }

  const upper = item.upper;
  const lower = item.lower;

  const handleListen = async () => {
    try {
      const audio = createPageAudio(item.audio);

      audio.onended = async () => {
        const result = await rewardCoin({
          contentId: `alphabet-${item.letter}-listen`,
          contentType: "alphabet",
          title: `${item.upper}${item.lower} 듣기`,
        });

        showToast(result.message);
      };

      await audio.play();
    } catch (error) {
      console.error(error);
      alert("소리 파일을 찾을 수 없거나 재생할 수 없어.");
    }
  };

  const handleListenAI = async () => {
    try {
      const audio = createPageAudio(aiAudioPath);

      audio.onended = async () => {
        const result = await rewardCoin({
          contentId: `alphabet-${item.letter}-listen`,
          contentType: "alphabet",
          title: `${item.upper}${item.lower} AI 듣기`,
        });

        showToast(result.message);
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
      contentId: `alphabet-${item.letter}-record`,
      contentType: "alphabet",
      title: `${item.upper}${item.lower} 녹음`,
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
      await audio.play();
    } catch (error) {
      console.error(error);
      alert("내 녹음을 재생할 수 없어.");
    }
  };

  const handleDownloadWorksheet = () => {
    const link = document.createElement("a");
    link.href = item.worksheet;
    link.download = `${item.upper}${item.lower}.hwp`;
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
          title={
            <>
              Capital {upper}
              <br />
              lowercase {lower}
            </>
          }
          onListen={handleListen}
          onListenAI={handleListenAI}
          isRecording={isRecording}
          recordingSeconds={recordingSeconds}
          countdown={countdown}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
          onPlayMine={handlePlayMine}
          hasRecording={!!myRecordingUrl}
          onDownload={handleDownloadWorksheet}
          backHref="/english/alphabet"
        />
      </div>

      <RecordCountdown value={countdown} />
    </section>
  );
}