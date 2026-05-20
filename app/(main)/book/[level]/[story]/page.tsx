"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import styles from "./detail.module.css";
import { getBookLevel, getBookStory } from "../../data";

export default function BookDetailPage() {
  const params = useParams<{ level: string; story: string }>();
  const level = typeof params?.level === "string" ? params.level : "";
  const story = typeof params?.story === "string" ? params.story : "";

  const currentLevel = useMemo(() => getBookLevel(level), [level]);
  const currentStory = useMemo(() => getBookStory(level, story), [level, story]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const [isRecording, setIsRecording] = useState(false);
  const [myRecordingUrl, setMyRecordingUrl] = useState("");

  if (!currentLevel || !currentStory) {
    notFound();
  }

  const handleStartRecording = async () => {
    try {
      if (myRecordingUrl) {
        URL.revokeObjectURL(myRecordingUrl);
        setMyRecordingUrl("");
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
        setMyRecordingUrl(audioUrl);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error(error);
      alert("마이크 권한을 허용해야 녹음할 수 있어.");
    }
  };

  const handleStopRecording = () => {
    if (!mediaRecorderRef.current) return;

    mediaRecorderRef.current.stop();
    setIsRecording(false);
    alert("녹음이 끝났어. 이제 '내 녹음 듣기'로 바로 재생할 수 있어.");
  };

  const handlePlayMine = async () => {
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

                <div className={styles.actionRow}>
                  {!isRecording ? (
                    <button
                      className={styles.recordButton}
                      onClick={handleStartRecording}
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
                    onClick={handlePlayMine}
                  >
                    ▶ 내 녹음 듣기
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.bottomRow}>
            <Link
              href={`/book/${currentLevel.level}`}
              className={styles.closeButton}
            >
              ← 책 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}