"use client";

import { rewardCoin } from "@/lib/rewardCoin";
import { logEngagement } from "@/lib/logEngagement";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  CaretLeft,
  CaretRight,
  Headphones,
} from "@phosphor-icons/react";
import { Nunito } from "next/font/google";
import StudyBar from "@/components/StudyBar";
import PronunciationResultModal from "@/components/PronunciationResultModal";
import styles from "./detail.module.css";
import { getBookLevel, getBookStory } from "../../data";
import { convertRecordingToWav, createSupportedMediaRecorder } from "@/lib/audioToWav";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/Toast";
import { useParams, notFound } from "next/navigation";

/* 그림책 글씨: 둥글고 읽기 쉬운 Nunito (이 화면에서만 사용) */
const bookFont = Nunito({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

type PronunciationResult = {
  score: number;
  feedback: string[];
  recognizedText?: string;
};

export default function BookDetailPage() {
  const params = useParams<{ level: string; story: string }>();
  const level = typeof params?.level === "string" ? params.level : "";
  const story = typeof params?.story === "string" ? params.story : "";

  const currentLevel = useMemo(() => getBookLevel(level), [level]);
  const currentStory = useMemo(() => getBookStory(level, story), [level, story]);

  const storyAudioPath = currentStory
    ? `/audio/book/${level}/${currentStory.slug}.mp3`
    : "";

  const fullStoryText = useMemo(
    () => currentStory?.sentences.join(" ") ?? "",
    [currentStory]
  );

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

  /* 그림책의 지금 페이지 (긴 이야기는 여러 페이지로 나눠서 보여줌) */
  const [pageIndex, setPageIndex] = useState(0);

  const { showToast } = useToast();

  if (!currentLevel || !currentStory) {
    notFound();
  }

  /*
    한 페이지에 문장 3개씩
    (4문장 이하의 짧은 이야기는 한 페이지에 모두)
  */
  const SENTENCES_PER_PAGE = 3;

  const pageCount =
    currentStory.sentences.length <= 4
      ? 1
      : Math.ceil(currentStory.sentences.length / SENTENCES_PER_PAGE);

  const pageSentences =
    pageCount === 1
      ? currentStory.sentences
      : currentStory.sentences.slice(
          pageIndex * SENTENCES_PER_PAGE,
          (pageIndex + 1) * SENTENCES_PER_PAGE
        );

  /*
    글씨 크기를 페이지에 맞춤
    글 영역에 넘치지 않는 가장 큰 크기를 찾아서, 여백이 조금 남도록 살짝 줄임
    (문장이 짧으면 크게, 길면 작게)
  */
  const bookTextRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = bookTextRef.current;

    if (!el) return;

    const fit = () => {
      /* 좁은 화면은 그림 아래로 글이 길게 이어지므로 CSS 기본 크기 사용 */
      if (window.innerWidth <= 800) {
        el.style.fontSize = "";
        return;
      }

      let low = 18;
      let high = 76;

      for (let i = 0; i < 8; i += 1) {
        const mid = (low + high) / 2;

        el.style.fontSize = `${mid}px`;

        if (el.scrollHeight <= el.clientHeight) {
          low = mid;
        } else {
          high = mid;
        }
      }

      el.style.fontSize = `${Math.floor(low * 0.93)}px`;
    };

    fit();

    const observer = new ResizeObserver(fit);

    observer.observe(el);

    return () => observer.disconnect();
  }, [pageIndex, story]);

  const handleListen = async () => {
    try {
      const audio = new Audio(storyAudioPath);

      audio.onended = async () => {
        const result = await rewardCoin({
          contentId: `book-${currentLevel.level}-${currentStory.slug}-listen`,
          contentType: "book",
          title: `${currentStory.title} 듣기`,
        });

        showToast(result.message);

        // 코인 캡과 무관하게 실제 듣기 완료 횟수를 기록 (레벨 판정용)
        logEngagement({
          contentId: `book-${currentLevel.level}-${currentStory.slug}`,
          contentType: "book",
          action: "listen",
        });
      };

      await audio.play();
    } catch (error) {
      console.error(error);
      alert("소리 파일을 찾을 수 없거나 재생할 수 없어.");
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
      contentId: `book-${currentLevel.level}-${currentStory.slug}-record`,
      contentType: "book",
      title: `${currentStory.title} 녹음`,
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
        // 코인 보상은 없지만, 내 녹음 듣기 완료 횟수를 레벨 판정용으로 기록
        logEngagement({
          contentId: `book-${currentLevel.level}-${currentStory.slug}`,
          contentType: "book",
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
      formData.append("referenceText", fullStoryText);
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
          content_type: "book",
          content_id: `book-${currentLevel.level}-${currentStory.slug}`,
          word: currentStory.title,
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
        <div className={styles.reader}>
          {/* 펼친 그림책: 왼쪽 페이지는 그림, 오른쪽 페이지는 글 */}
          <div className={`${styles.book} ${bookFont.className}`}>
            <div className={styles.pageLeft}>
              <img
                src={currentStory.image}
                alt={currentStory.title}
                className={styles.bookImage}
                draggable={false}
              />
            </div>

            <div className={styles.pageRight}>
              <p className={styles.bookEyebrow}>
                {currentLevel.title}
                {"  ·  "}
                READ &amp; SPEAK
              </p>

              <h1 className={styles.bookTitle}>{currentStory.title}</h1>

              <div className={styles.bookText} ref={bookTextRef}>
                {pageSentences.map((sentence, index) => (
                  <p key={`${pageIndex}-${index}`}>{sentence}</p>
                ))}
              </div>

              {pageCount > 1 && (
                <div className={styles.pager}>
                  <button
                    type="button"
                    className={styles.pagerButton}
                    onClick={() => setPageIndex((prev) => prev - 1)}
                    disabled={pageIndex === 0}
                    aria-label="Previous page"
                  >
                    <CaretLeft size={20} weight="bold" />
                  </button>

                  <span className={styles.pagerDots}>
                    {Array.from({ length: pageCount }).map((_, index) => (
                      <span
                        key={index}
                        className={
                          index === pageIndex
                            ? styles.pagerDotOn
                            : styles.pagerDot
                        }
                      />
                    ))}
                  </span>

                  <button
                    type="button"
                    className={styles.pagerButton}
                    onClick={() => setPageIndex((prev) => prev + 1)}
                    disabled={pageIndex === pageCount - 1}
                    aria-label="Next page"
                  >
                    <CaretRight size={20} weight="bold" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <StudyBar
            listenIcon={<Headphones size={20} />}
            listenLabel="AI Voice"
            onListen={handleListen}
            isRecording={isRecording}
            recordingSeconds={recordingSeconds}
            countdown={countdown}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            onPlayMine={handlePlayMine}
            hasRecording={!!myRecordingUrl}
            isAnalyzing={isAnalyzing}
            onAnalyze={handleAnalyzePronunciation}
            backIcon={<ArrowLeft size={19} />}
            backLabel="Book List"
            backHref={`/book/${currentLevel.level}`}
          />
        </div>
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