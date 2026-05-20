"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import styles from "./level.module.css";
import { sightWordLevels } from "../data";

export default function SightWordLevelPage() {
  const params = useParams<{ level: string }>();
  const levelParam = typeof params?.level === "string" ? params.level : "";

  const currentLevel = useMemo(
    () => sightWordLevels.find((item) => item.level === levelParam),
    [levelParam]
  );

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const [recordingWord, setRecordingWord] = useState("");
  const [recordings, setRecordings] = useState<Record<string, string>>({});

  if (!currentLevel) {
    notFound();
  }

  const handleListen = async (audioPath: string) => {
    try {
      const audio = new Audio(audioPath);
      await audio.play();
    } catch (error) {
      console.error(error);
      alert("소리 파일을 찾을 수 없거나 재생할 수 없어.");
    }
  };

  const handleStartRecording = async (word: string) => {
    try {
      const previousUrl = recordings[word];
      if (previousUrl) {
        URL.revokeObjectURL(previousUrl);
        setRecordings((prev) => {
          const next = { ...prev };
          delete next[word];
          return next;
        });
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

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

        setRecordings((prev) => ({
          ...prev,
          [word]: audioUrl,
        }));

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setRecordingWord(word);
    } catch (error) {
      console.error(error);
      alert("마이크 권한을 허용해야 녹음할 수 있어.");
    }
  };

  const handleStopRecording = () => {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    setRecordingWord("");
    alert("녹음이 끝났어. 이제 '내 녹음 듣기'로 바로 재생할 수 있어.");
  };

  const handlePlayMine = async (word: string) => {
    const myRecordingUrl = recordings[word];

    if (!myRecordingUrl) {
      alert("먼저 녹음을 해줘.");
      return;
    }

    try {
      const audio = new Audio(myRecordingUrl);
      await audio.play();
    } catch (error) {
      console.error(error);
      alert("내 녹음을 재생할 수 없어.");
    }
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
        <div className={styles.inner}>
          <h1 className={styles.title}>{currentLevel.title}</h1>
          <p className={styles.subtitle}>
            단어 카드를 보고 바로 듣고, 녹음하고, 재생해 보세요.
          </p>

          <div className={styles.grid}>
            {currentLevel.words.map((item) => {
              const isRecording = recordingWord === item.word;

              return (
                <div key={item.slug} className={styles.card}>
                  <div className={styles.word}>{item.word}</div>

                  <div className={styles.buttonGroup}>
                    <button
                      className={styles.listenButton}
                      onClick={() => handleListen(item.audio)}
                    >
                      🔊 듣기
                    </button>

                    {!isRecording ? (
                      <button
                        className={styles.recordButton}
                        onClick={() => handleStartRecording(item.word)}
                      >
                        🎤 녹음하기
                      </button>
                    ) : (
                      <button
                        className={styles.recordingButton}
                        onClick={handleStopRecording}
                      >
                        ⏹ 녹음 중지
                      </button>
                    )}

                    <button
                      className={styles.playMineButton}
                      onClick={() => handlePlayMine(item.word)}
                    >
                      ▶ 내 녹음 듣기
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.bottomRow}>
            <Link href="/english" className={styles.backButton}>
              ← English로 돌아가기
            </Link>

            <button
              className={styles.downloadButton}
              onClick={handleDownloadWorksheet}
            >
              📄 한글 자료 받기
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}