import {
  supabase,
} from "@/lib/supabase";

import {
  getConversationStars,
  isConversationTopicPassed,
} from "@/lib/conversationTestRules";

import {
  type ConversationTopicId,
} from "@/app/(main)/test/conversation/data";

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
    };

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
    data: {
      user,
    },
  } =
    await supabase
      .auth
      .getUser();

  if (!user) {
    return {
      success: false,

      passed: false,

      stars: 0,

      message:
        "로그인이 필요합니다.",
    };
  }

  const passed =
    isConversationTopicPassed(
      score,
      topic
    );

  const stars =
    getConversationStars(
      score,
      topic
    );

  const {
    error,
  } =
    await supabase
      .from(
        "test_results"
      )
      .insert({
        user_id:
          user.id,

        test_type:
          "conversation",

        category:
          topic,

        /*
          Conversation은
          Stage 방식이 아니라 Topic 방식이므로
          stage는 1로 고정
        */
        stage:
          1,

        score,

        total_questions:
          totalQuestions,

        passed,

        stars,
      });

  if (error) {
    console.error(
      "Conversation 결과 저장 실패:",
      error
    );

    return {
      success: false,

      passed: false,

      stars: 0,

      message:
        "테스트 결과 저장에 실패했습니다.",
    };
  }

  /*
    My Page의 학습 기록에도 추가
  */
  const {
    error:
      learningError,
  } =
    await supabase
      .from(
        "learning_logs"
      )
      .insert({
        user_id:
          user.id,

        category:
          "test",

        title:
          `Conversation Quiz - ${topic}`,

        action:
          passed
            ? "테스트 통과"
            : "테스트 완료",
      });

  if (
    learningError
  ) {
    console.error(
      "Conversation learning log 저장 실패:",
      learningError
    );
  }

  return {
    success: true,

    passed,

    stars,
  };
}

/* ─────────────────────────────
   Progress Load
───────────────────────────── */

export async function getConversationProgress():
  Promise<ConversationProgress> {
  const {
    data: {
      user,
    },
  } =
    await supabase
      .auth
      .getUser();

  if (!user) {
    return {
      topics: [],

      finalUnlocked:
        false,
    };
  }

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "test_results"
      )
      .select(
        `
        category,
        score,
        total_questions,
        passed,
        stars
        `
      )
      .eq(
        "user_id",
        user.id
      )
      .eq(
        "test_type",
        "conversation"
      );

  if (error) {
    console.error(
      "Conversation 진행상황 조회 실패:",
      error
    );

    return {
      topics: [],

      finalUnlocked:
        false,
    };
  }

  const rows =
    data ?? [];

  const topicIds:
    ConversationTopicId[] = [
      "greetings",
      "school",
      "family",
      "food",
      "friends",
      "final",
    ];

  const topics:
    ConversationTopicProgress[] =
    [];

  topicIds.forEach(
    (topic) => {
      const topicRows =
        rows.filter(
          (row) =>
            row.category ===
            topic
        );

      if (
        topicRows.length ===
        0
      ) {
        return;
      }

      const best =
        [...topicRows]
          .sort(
            (
              a,
              b
            ) =>
              b.score -
              a.score
          )[0];

      const passed =
        topicRows.some(
          (row) =>
            isConversationTopicPassed(
              row.score,
              topic
            )
        );

      const stars =
        getConversationStars(
          best.score,
          topic
        );

      topics.push({
        topic,

        bestScore:
          best.score,

        totalQuestions:
          best.total_questions,

        stars,

        passed,
      });
    }
  );

  /*
    Final Challenge는
    앞의 5개 Topic을
    모두 통과해야 열림
  */

  const normalTopics:
    ConversationTopicId[] = [
      "greetings",
      "school",
      "family",
      "food",
      "friends",
    ];

  const finalUnlocked =
    normalTopics.every(
      (topic) =>
        topics.some(
          (progress) =>
            progress.topic ===
              topic &&
            progress.passed
        )
    );

  return {
    topics,

    finalUnlocked,
  };
}