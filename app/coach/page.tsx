import { IBM_Plex_Sans_KR } from "next/font/google";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/ssr";
import AiReportCard from "@/components/AiReportCard";
import styles from "./coach.module.css";

/*
  리포트 화면 전용 글꼴: 숫자와 한글이 또렷한 IBM Plex Sans KR
  (이 화면에만 적용하고 다른 화면의 글꼴은 그대로 둠)
*/
const reportFont = IBM_Plex_Sans_KR({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "AI Learning Coach | Phonics Bunny",
};

/*
  AI Learning Coach 화면

  학습 화면들과 따로 떨어진 독립 화면 (상단 바 · 메뉴 없이 화면 전체를 씀).
  Home 의 플로팅 버튼으로 들어오고, 왼쪽 위 버튼으로 Home 에 돌아감
*/
export default function CoachPage() {
  return (
    <div className={`${styles.page} ${reportFont.className}`}>
      <div className={styles.frame}>
        <div className={styles.scroll}>
          <div className={styles.inner}>
            <div className={styles.topRow}>
              <Link
                href="/dashboard"
                className={styles.backButton}
                aria-label="Home으로 돌아가기"
              >
                <ArrowLeft size={22} weight="bold" />
              </Link>

              <div>
                <p className={styles.eyebrow}>FOR PARENTS</p>
                <h1 className={styles.title}>AI Learning Coach</h1>
                <p className={styles.subtitle}>
                  아이의 실제 학습 기록을 분석해서 오늘 · 주간 · 월간 학습을
                  정리하고, 다음에 무엇을 하면 좋을지 알려 드려요.
                </p>
              </div>
            </div>

            <AiReportCard />
          </div>
        </div>
      </div>
    </div>
  );
}
