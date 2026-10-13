"use client";

import { useEffect, useRef, useState } from "react";
import { Microphone, Stop } from "@phosphor-icons/react";
import { supabase } from "@/lib/supabase";
import {
  convertRecordingToWav,
  createSupportedMediaRecorder,
} from "@/lib/audioToWav";
import { useToast } from "@/components/Toast";
import styles from "./SentenceRecorder.module.css";

/*
  문장 하나만 따로 녹음해서 발음을 확인하는 작은 버튼
  (Book 이야기 · Conversation 대화의 문장 옆에 놓음)

  화면의 기존 전체 녹음 · 발음 확인과는 따로 동작함.
  결과는 pronunciation_logs 에 content_id 를 "원래id#문장번호" 로 남겨서
  AI Learning Coach 가 어느 문장이 약했는지 볼 수 있게 함.
  (기존 숙달 · 완료 판정은 원래 id 만 보므로 영향을 받지 않음)
*/

/* 문장 하나를 녹음하는 최대 시간 (넘으면 자동으로 멈춤) */
const MAX_RECORD_MS = 12000;

type Props = {
  contentType: "book" | "conversation";

  /* 이야기 · 대화의 id (예: "book-level1-cat", "conversation-greeting-mom") */
  contentId: string;

  /* 그 안에서 몇 번째 문장인지 (0부터) */
  index: number;
  text: string;
};

/* 문장별 기록의 content_id */
export const sentenceContentId = (contentId: string, index: number) =>
  `${contentId}#${index}`;

/*
  이 이야기 · 대화의 문장별 최근 점수
  한 화면에 버튼이 여러 개 있어도 조회는 한 번만 하도록 공유
*/
const scoreCache = new Map<string, Promise<Map<number, number>>>();

function loadLastScores(contentId: string): Promise<Map<number, number>> {
  let cached = scoreCache.get(contentId);

  if (!cached) {
    cached = (async () => {
      const scores = new Map<number, number>();

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return scores;

        const { data } = await supabase
          .from("pronunciation_logs")
          .select("content_id, score, created_at")
          .eq("user_id", user.id)
          .like("content_id", `${contentId}#%`)
          .order("created_at", { ascending: true });

        /* 오래된 것부터 덮어써서 가장 최근 점수가 남음 */
        for (const row of data ?? []) {
          const index = Number(String(row.content_id).split("#")[1]);

          if (Number.isInteger(index) && typeof row.score === "number") {
            scores.set(index, row.score);
          }
        }
      } catch {
        /* 점수를 못 불러와도 녹음은 할 수 있음 */
      }

      return scores;
    })();

    scoreCache.set(contentId, cached);
  }

  return cached;
}

export default function SentenceRecorder({
  contentType,
  contentId,
  index,
  text,
}: Props) {
  const { showToast } = useToast();

  const [state, setState] = useState<"idle" | "recording" | "checking">("idle");
  const [score, setScore] = useState<number | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  /* 지난번에 받은 점수를 보여 줌 */
  useEffect(() => {
    let cancelled = false;

    loadLastScores(contentId).then((scores) => {
      const last = scores.get(index);

      if (!cancelled && last !== undefined) setScore(last);
    });

    return () => {
      cancelled = true;
    };
  }, [contentId, index]);

  /* 화면을 떠나면 마이크를 끔 */
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      if (timerRef.current) clearTimeout(timerRef.current);

      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const check = async (blob: Blob) => {
    try {
      const { wavBlob, volumeScore } = await convertRecordingToWav(blob);

      const formData = new FormData();
      formData.append("audio", wavBlob, "recording.wav");
      formData.append("referenceText", text);
      formData.append("volumeScore", String(volumeScore));

      const response = await fetch("/api/pronunciation", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || data.error || typeof data.score !== "number") {
        showToast(data.error ?? "발음을 확인하지 못했어요. 다시 해 볼까요?");
        return;
      }

      /* 아무 말도 인식되지 않았으면 0점으로 남기지 않고 다시 하도록 안내 */
      if (!data.recognizedText) {
        showToast("목소리를 잘 못 들었어요. 조금 더 크게 말해 볼까요?");
        return;
      }

      if (mountedRef.current) setScore(data.score);

      /* 다음에 이 화면을 열어도 방금 점수가 보이게 함 */
      loadLastScores(contentId).then((scores) => scores.set(index, data.score));

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { error } = await supabase.from("pronunciation_logs").insert({
        user_id: user.id,
        content_type: contentType,
        content_id: sentenceContentId(contentId, index),

        /* 단어가 아니라 문장이므로 비워 둠 (My Page 의 단어 분석에 섞이지 않게) */
        word: "",
        score: data.score,
        accuracy: data.accuracy,
        completeness: data.completeness,
        volume_score: data.volumeScore,
      });

      if (error) {
        console.error("문장 발음 기록 저장 실패:", error.message);
      }
    } catch (error) {
      console.error("문장 발음 확인 실패:", error);
      showToast("발음을 확인하지 못했어요. 다시 해 볼까요?");
    } finally {
      if (mountedRef.current) setState("idle");
    }
  };

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = createSupportedMediaRecorder(stream);
      const chunks: Blob[] = [];

      streamRef.current = stream;
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        if (!mountedRef.current) return;

        setState("checking");
        check(new Blob(chunks, { type: recorder.mimeType || "audio/webm" }));
      };

      recorder.start();
      setState("recording");

      timerRef.current = setTimeout(stop, MAX_RECORD_MS);
    } catch (error) {
      console.error(error);
      showToast("마이크 권한을 허용해야 녹음할 수 있어요.");
    }
  };

  const stop = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
  };

  return (
    <span className={styles.wrap}>
      <button
        type="button"
        className={`${styles.button} ${
          state === "recording" ? styles.recording : ""
        }`}
        onClick={(event) => {
          /* 문장을 누르면 소리가 나는 화면에서 같이 눌리지 않게 함 */
          event.stopPropagation();

          if (state === "recording") stop();
          else if (state === "idle") start();
        }}
        disabled={state === "checking"}
        aria-label={
          state === "recording"
            ? "녹음 멈추고 발음 확인하기"
            : `이 문장만 녹음하기: ${text}`
        }
      >
        {state === "recording" ? (
          <Stop size={14} weight="fill" />
        ) : (
          <Microphone size={16} weight="bold" />
        )}
      </button>

      {state === "checking" ? (
        <span className={styles.checking} role="status">
          ...
        </span>
      ) : (
        score !== null && (
          <span
            className={`${styles.score} ${
              score >= 85 ? styles.high : score >= 70 ? styles.mid : styles.low
            }`}
            aria-label={`이 문장 점수 ${score}점`}
          >
            {score}
          </span>
        )
      )}
    </span>
  );
}
