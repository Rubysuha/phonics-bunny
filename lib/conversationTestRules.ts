import { TEST } from "@/lib/learningRules";
import { getPassScore, getStars } from "@/lib/phonicsTestRules";

/*
  Conversation Test
  월드(topic) 하나 = 10문제, Final = 20문제
  통과 · 별 기준은 Phonics Test 와 같음 (lib/learningRules.ts)
*/

export function getConversationQuestionCount(
  topic: string
): number {
  return topic === "final"
    ? TEST.reviewQuestionCount
    : TEST.questionCount;
}

export function getConversationPassScore(
  topic: string
): number {
  return getPassScore(getConversationQuestionCount(topic));
}

export function getConversationStars(
  score: number,
  topic: string
): number {
  return getStars(score, topic === "final");
}

export function isConversationTopicPassed(
  score: number,
  topic: string
): boolean {
  return score >= getConversationPassScore(topic);
}
