"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import styles from "./detail.module.css";
import { alphabetItems } from "../data";

export default function AlphabetDetailPage() {
  const params = useParams<{ letter: string }>();
  const letter = typeof params?.letter === "string" ? params.letter : "";

  const item = useMemo(
    () => alphabetItems.find((v) => v.letter === letter),
    [letter]
  );

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const [isRecording, setIsRecording] = useState(false);
  const [myRecordingUrl, setMyRecordingUrl] = useState("");

  if (!item) {
    notFound();
  }

  const upper = item.upper;
  const lower = item.lower;

  const handleListen = async () => {
    try {
      const audio = new Audio(item.audio);
      await audio.play();
    } catch (error) {
      console.error(error);
      alert("소리 파일을 찾을 수 없거나 재생할 수 없어.");
    }
  };

  const handleStartRecording = async () => {
    try {
      // 이전 녹음 URL 정리
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
        <div className={styles.inner}>
          <div className={styles.centerPanel}>
            <div className={styles.imageOnlyWrap}>
              <Image
                src={item.image}
                alt={item.word}
                fill
                className={styles.wordImage}
                priority
              />
            </div>
          </div>

          <p className={styles.sentence}>
            Capital {upper}
            <br />
            lowercase {lower}
          </p>

          <div className={styles.actionRow}>
            <button className={styles.listenButton} onClick={handleListen}>
              🔊 소리 재생
            </button>

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

          <div className={styles.bottomRow}>
            <button
              className={styles.downloadButton}
              onClick={handleDownloadWorksheet}
            >
              📄 한글 자료 받기
            </button>

            <Link href="/english/alphabet" className={styles.closeButton}>
              🏠 닫기
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}