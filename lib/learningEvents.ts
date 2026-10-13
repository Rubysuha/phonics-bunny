/* 학습 기록(듣기 · 녹음 · 발음 분석)이 새로 저장됐을 때 window 에 보내는 이벤트 */
export const LEARNING_UPDATED_EVENT = "learning-updated";

export function notifyLearningUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(LEARNING_UPDATED_EVENT));
  }
}
