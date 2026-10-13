"use client"; // 오류 화면은 Client Component 여야 함

import { Rabbit } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { useEffect } from "react";
import StatusScreen, { statusStyles } from "@/components/StatusScreen";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusScreen
      icon={<Rabbit size={56} weight="fill" />}
      title="앗, 문제가 생겼어요"
      message="잠시 후 다시 시도해 주세요."
    >
      <button
        className={`${statusStyles.button} ${statusStyles.primary}`}
        onClick={() => unstable_retry()}
      >
        다시 시도하기
      </button>

      <Link href="/dashboard" className={statusStyles.button}>
        Home으로 가기
      </Link>
    </StatusScreen>
  );
}
