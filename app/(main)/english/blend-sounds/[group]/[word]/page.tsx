"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import styles from "./detail.module.css";
import { blendItems } from "../../data";

export default function BlendDetailPage() {
  const params = useParams<{ group: string; word: string }>();
  const group = typeof params?.group === "string" ? params.group : "";
  const word = typeof params?.word === "string" ? params.word : "";

  const currentGroup = useMemo(
    () => blendItems.find((v) => v.group === group),
    [group]
  );

  const item = useMemo(
    () => currentGroup?.words.find((w) => w.slug === word),
    [currentGroup, word]
  );

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const [isRecording, setIsRecording] = useState(false);
  const [myRecordingUrl, setMyRecordingUrl] = useState("");

  if (!currentGroup || !item) {
    notFound();
  }

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

        const fileUrl = URL.createObjectURL(blob);
        setMyRecordingUrl(fileUrl);

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
    link.download = "";
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

          <p className={styles.sentence}>{item.word}</p>

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

            <Link
              href={`/english/blend-sounds/${currentGroup.group}`}
              className={styles.closeButton}
            >
              🏠 닫기
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}