"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import styles from "./detail.module.css";
import { conversationCategories } from "../../data";

export default function ConversationDetailPage() {
  const params = useParams<{ category: string; sentence: string }>();
  const category = typeof params?.category === "string" ? params.category : "";
  const sentenceId = typeof params?.sentence === "string" ? params.sentence : "";

  const currentCategory = useMemo(
    () => conversationCategories.find((v) => v.slug === category),
    [category]
  );

  const item = useMemo(
    () => currentCategory?.sentences.find((s) => s.id === sentenceId),
    [currentCategory, sentenceId]
  );

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  if (!currentCategory || !item) {
    notFound();
  }

  const handleStartRecording = async () => {
    try {
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
        const audioBlob = new Blob(recordedChunksRef.current, {
          type: "audio/webm",
        });

        console.log("Conversation recorded audio blob:", audioBlob);

        stream.getTracks().forEach((track) => track.stop());

        alert("녹음이 완료되었어.");
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
  };

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.inner}>
          <div className={styles.centerPanel}>
            <div className={styles.imageOnlyWrap}>
              <Image
                src={item.image}
                alt={item.sentence}
                fill
                className={styles.wordImage}
                priority
              />
            </div>
          </div>

          <p className={styles.sentence}>{item.sentence}</p>

          <div className={styles.infoBox}>
            <div className={styles.infoTitle}>Pattern</div>
            <div className={styles.infoText}>{item.pattern}</div>
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
          </div>

          <div className={styles.bottomRow}>
            <Link
              href={`/conversation/${currentCategory.slug}`}
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