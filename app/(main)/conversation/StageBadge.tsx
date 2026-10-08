"use client";

import { useEffect, useState } from "react";
import { Check } from "@phosphor-icons/react";
import { supabase } from "@/lib/supabase";

/*
  AI 발음 분석까지 마친 Stage 목록
  (pronunciation_logs 의 content_id 가 "conversation-대화id" 형태)

  한 화면에 배지가 여러 개 있어도 조회는 한 번만 하도록 공유
*/
let donePromise: Promise<Set<string>> | null = null;
let loadedAt = 0;

/* 학습하고 돌아왔을 때 반영되도록 잠깐만 재사용 */
const REUSE_MS = 3000;

function loadDoneStages(): Promise<Set<string>> {
  if (!donePromise || Date.now() - loadedAt > REUSE_MS) {
    loadedAt = Date.now();

    donePromise = (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return new Set<string>();
      }

      const { data, error } = await supabase
        .from("pronunciation_logs")
        .select("content_id")
        .eq("user_id", user.id)
        .eq("content_type", "conversation");

      if (error) {
        console.error("Stage 완료 기록 조회 실패:", error);
        return new Set<string>();
      }

      return new Set((data ?? []).map((row) => row.content_id as string));
    })();
  }

  return donePromise;
}

type Props = {
  dialogueId: string;
  number: number;
  className: string;
  doneClassName: string;
};

/* Stage 번호 동그라미. 발음 분석을 마친 Stage는 체크로 표시 */
export default function StageBadge({
  dialogueId,
  number,
  className,
  doneClassName,
}: Props) {
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadDoneStages().then((done) => {
      if (!cancelled) {
        setIsDone(done.has(`conversation-${dialogueId}`));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [dialogueId]);

  return (
    <span
      className={`${className} ${isDone ? doneClassName : ""}`}
      aria-label={isDone ? `Stage ${number} 완료` : undefined}
    >
      {isDone ? <Check weight="bold" /> : number}
    </span>
  );
}
