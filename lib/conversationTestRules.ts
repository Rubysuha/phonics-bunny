export function getConversationPassScore(
  topic: string
): number {
  return topic === "final"
    ? 11
    : 7;
}

export function getConversationStars(
  score: number,
  topic: string
): number {
  if (topic === "final") {
    if (score === 15) {
      return 3;
    }

    if (score >= 13) {
      return 2;
    }

    if (score >= 11) {
      return 1;
    }

    return 0;
  }

  if (score === 10) {
    return 3;
  }

  if (score >= 8) {
    return 2;
  }

  if (score >= 7) {
    return 1;
  }

  return 0;
}

export function isConversationTopicPassed(
  score: number,
  topic: string
): boolean {
  return score >= getConversationPassScore(topic);
}
