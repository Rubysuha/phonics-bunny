import type { HelpSection } from "./HelpTooltip";
import { MASTERY } from "@/lib/learningRules";

/*
  ? 안내에 여러 화면이 함께 쓰는 내용
  (숫자는 lib/learningRules.ts 를 그대로 가져와서 기준을 바꾸면 안내도 같이 바뀜)
*/

/* AI 발음 분석이 있는 화면 공통 */
export const SCORE_HELP =
  "AI 발음 확인 점수는 정확도 70% + 완성도 20% + 목소리 크기 10%로 계산해요.";

/* 숙달 표시(동그라미 세 개 → 별) 설명 */
export function masteryHelp(unit: "단어" | "이야기" | "대화"): HelpSection {
  return {
    heading: "숙달 표시",
    items: [
      `${unit}마다 동그라미 세 개가 있어요. 연습 횟수, 연습한 날 수, 최근 점수를 뜻하고 채울수록 색이 차올라요.`,
      `듣기 · 녹음 · 내 녹음 듣기를 합쳐 ${MASTERY.totalCount}번(그중 발음 확인 ${MASTERY.recordCount}번), 서로 다른 ${MASTERY.days}일, 최근 ${MASTERY.recentRecords}번 평균 ${MASTERY.recentScore}점이 되면 별(Mastered)로 바뀌어요.`,
      `하루에 ${MASTERY.dailyCap}번까지만 세므로, 하루에 몰아서 하기보다 여러 날 나눠서 연습해요.`,
      `숙달한 ${unit}가 늘어나면 AI Bunny의 단계가 올라가요. 동그라미를 누르면 자세한 숫자를 볼 수 있어요.`,
    ],
  };
}

/* 코인 설명 */
export function coinHelp(unit: string, amount: number): HelpSection {
  return {
    heading: "당근 코인",
    items: [
      `듣기와 녹음을 하면 당근 코인을 ${amount}개씩 받아요.`,
      `같은 ${unit}에서는 하루에 듣기 5번 · 녹음 5번까지 받을 수 있어요.`,
      "모은 코인은 Shop에서 토끼와 배경을 사는 데 써요.",
    ],
  };
}
