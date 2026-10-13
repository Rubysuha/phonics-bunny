import { supabase } from "@/lib/supabase";
import {
  getConversationQuestionCount,
  getConversationStars,
  isConversationTopicPassed,
} from "@/lib/conversationTestRules";
import {
  conversationTopics,
  type ConversationTopicId,
} from "@/app/(main)/test/conversation/data";
import { TEST_COIN } from "@/lib/learningRules";
import {
  NO_TEST_COIN,
  rewardTestCoins,
  type TestCoinResult,
} from "@/lib/testReward";

export type ConversationTopicProgress = {
  topic: ConversationTopicId;
  bestScore: number;
  totalQuestions: number;
  stars: number;
  passed: boolean;
};

export type ConversationProgress = {
  topics: ConversationTopicProgress[];
  finalUnlocked: boolean;
};

export type SaveConversationTestResultReturn =
  | {
      success: false;
      passed: false;
      stars: 0;
      message: string;
    }
  | {
      success: true;
      passed: boolean;
      stars: number;
      coins: TestCoinResult;
    };

/* ─────────────────────────────
   Progress
───────────────────────────── */

type ResultRow = {
  category: string;
  score: number;
};

/* 저장된 결과로 Topic 별 최고 기록을 현재 기준으로 계산 */
function buildProgress(rows: ResultRow[]): ConversationProgress {
  const topics: ConversationTopicProgress[] = [];

  for (const { id: topic } of conversationTopics) {
    const topicRows = rows.filter((row) => row.category === topic);

    if (topicRows.length === 0) {
      continue;
    }

    const totalQuestions = getConversationQuestionCount(topic);

    const bestScore = Math.min(
      Math.max(...topicRows.map((row) => row.score)),
      totalQuestions
    );

    topics.push({
      topic,
      bestScore,
      totalQuestions,
      stars: getConversationStars(bestScore, topic),
      passed: isConversationTopicPassed(bestScore, topic),
    });
  }

  /* Final Challenge 는 다른 Topic 을 모두 통과해야 열림 */
  const finalUnlocked = conversationTopics
    .filter((topic) => !topic.isFinal)
    .every((topic) =>
      topics.some(
        (progress) => progress.topic === topic.id && progress.passed
      )
    );

  return { topics, finalUnlocked };
}

async function loadRows(userId: string): Promise<ResultRow[] | null> {
  const { data, error } = await supabase
    .from("test_results")
    .select("category, score")
    .eq("user_id", userId)
    .eq("test_type", "conversation");

  if (error) {
    console.error("Conversation 진행상황 조회 실패:", error);

    return null;
  }

  return data ?? [];
}

export async function getConversationProgress(): Promise<ConversationProgress> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { topics: [], finalUnlocked: false };
  }

  return buildProgress((await loadRows(user.id)) ?? []);
}

/* ─────────────────────────────
   Result Save
───────────────────────────── */

export async function saveConversationTestResult({
  topic,
  score,
  totalQuestions,
}: {
  topic: ConversationTopicId;
  score: number;
  totalQuestions: number;
}): Promise<SaveConversationTestResultReturn> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      passed: false,
      stars: 0,
      message: "로그인이 필요해요.",
    };
  }

  const passed = isConversationTopicPassed(score, topic);
  const stars = getConversationStars(score, topic);

  /* 새로 딴 별을 알기 위해 저장하기 전의 기록을 먼저 확인 */
  const previousRows = await loadRows(user.id);

  const previousStars =
    buildProgress(previousRows ?? []).topics.find(
      (item) => item.topic === topic
    )?.stars ?? 0;

  const { error } = await supabase.from("test_results").insert({
    user_id: user.id,
    test_type: "conversation",
    category: topic,

    /* Conversation 은 Stage 방식이 아니라 Topic 방식이므로 stage 는 1로 고정 */
    stage: 1,
    score,
    total_questions: totalQuestions,
    passed,
    stars,
  });

  if (error) {
    console.error("Conversation 결과 저장 실패:", error);

    return {
      success: false,
      passed: false,
      stars: 0,
      message: "테스트 결과를 저장하지 못했어요.",
    };
  }

  /* My Page 의 학습 기록에도 추가 */
  const { error: learningError } = await supabase
    .from("learning_logs")
    .insert({
      user_id: user.id,
      category: "test",
      title: `Conversation Quiz - ${topic}`,
      action: passed ? "테스트 통과" : "테스트 완료",
    });

  if (learningError) {
    console.error("Conversation learning log 저장 실패:", learningError);
  }

  /* 코인: 기록을 확인하지 못했으면 잘못 주지 않도록 건너뜀 */
  const coins = previousRows
    ? await rewardTestCoins({
        userId: user.id,
        title: `Conversation ${topic}`,
        previousStars,
        stars,
        coinPerStar:
          topic === "final"
            ? TEST_COIN.reviewPerStar
            : TEST_COIN.stagePerStar,
        bonus: {
          name: "Conversation",
          isComplete: async () => {
            const progress = buildProgress([
              ...previousRows,
              { category: topic, score },
            ]);

            return (
              progress.topics.filter((item) => item.passed).length ===
              conversationTopics.length
            );
          },
        },
      })
    : NO_TEST_COIN;

  return {
    success: true,
    passed,
    stars,
    coins,
  };
}
