import { supabase } from "@/lib/supabase";
import {
  getPhonicsPassScore,
  getPhonicsQuestionCount,
  getPhonicsStageCount,
  getPhonicsStars,
  isFinalPhonicsStage,
  isPhonicsStagePassed,
  type PhonicsTestCategoryId,
} from "@/lib/phonicsTestRules";
import { TEST_COIN } from "@/lib/learningRules";
import {
  NO_TEST_COIN,
  rewardTestCoins,
  type TestCoinResult,
} from "@/lib/testReward";

export type StageProgress = {
  stage: number;
  bestScore: number;
  totalQuestions: number;
  stars: number;
  passed: boolean;
};

export type CategoryProgress = {
  stages: StageProgress[];
  unlockedStages: number[];
};

export type SavePhonicsTestResultReturn =
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
      passScore: number;
      totalQuestions: number;
      coins: TestCoinResult;
    };

/* ─────────────────────────────
   Progress
───────────────────────────── */

type ResultRow = {
  stage: number;
  score: number;
};

/* 저장된 결과로 Stage 별 최고 기록을 현재 기준으로 계산 */
function buildProgress(
  category: PhonicsTestCategoryId,
  rows: ResultRow[]
): CategoryProgress {
  const stageCount = getPhonicsStageCount(category);
  const stages: StageProgress[] = [];

  for (let stage = 1; stage <= stageCount; stage += 1) {
    const stageRows = rows.filter((row) => row.stage === stage);

    if (stageRows.length === 0) {
      continue;
    }

    const totalQuestions = getPhonicsQuestionCount(category, stage);

    const bestScore = Math.min(
      Math.max(...stageRows.map((row) => row.score)),
      totalQuestions
    );

    stages.push({
      stage,
      bestScore,
      totalQuestions,
      stars: getPhonicsStars(bestScore, category, stage),
      passed: isPhonicsStagePassed(bestScore, category, stage),
    });
  }

  /* 앞 Stage 를 통과해야 다음 Stage 가 열림 */
  const unlockedStages: number[] = [1];

  for (let stage = 2; stage <= stageCount; stage += 1) {
    const previous = stages.find((item) => item.stage === stage - 1);

    if (previous?.passed) {
      unlockedStages.push(stage);
    } else {
      break;
    }
  }

  return { stages, unlockedStages };
}

async function loadRows(
  userId: string,
  category: PhonicsTestCategoryId
): Promise<ResultRow[] | null> {
  const { data, error } = await supabase
    .from("test_results")
    .select("stage, score")
    .eq("user_id", userId)
    .eq("test_type", "phonics")
    .eq("category", category);

  if (error) {
    console.error("테스트 진행상황 조회 실패:", error);

    return null;
  }

  return data ?? [];
}

export async function getPhonicsCategoryProgress(
  category: PhonicsTestCategoryId
): Promise<CategoryProgress> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  /* 로그인 전에는 Stage 1만 열림 */
  if (!user) {
    return { stages: [], unlockedStages: [1] };
  }

  const rows = await loadRows(user.id, category);

  if (!rows) {
    return { stages: [], unlockedStages: [1] };
  }

  return buildProgress(category, rows);
}

/* ─────────────────────────────
   Result Save
───────────────────────────── */

export async function savePhonicsTestResult({
  category,
  stage,
  score,
  totalQuestions,
}: {
  category: PhonicsTestCategoryId;
  stage: number;
  score: number;
  totalQuestions: number;
}): Promise<SavePhonicsTestResultReturn> {
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

  const passed = isPhonicsStagePassed(score, category, stage);
  const stars = getPhonicsStars(score, category, stage);

  /* 새로 딴 별을 알기 위해 저장하기 전의 기록을 먼저 확인 */
  const previousRows = await loadRows(user.id, category);

  const previousStars =
    buildProgress(category, previousRows ?? []).stages.find(
      (item) => item.stage === stage
    )?.stars ?? 0;

  const { error } = await supabase.from("test_results").insert({
    user_id: user.id,
    test_type: "phonics",
    category,
    stage,
    score,
    total_questions: totalQuestions,
    passed,
    stars,
  });

  if (error) {
    console.error("테스트 결과 저장 실패:", error);

    return {
      success: false,
      passed: false,
      stars: 0,
      message: "테스트 결과를 저장하지 못했어요.",
    };
  }

  const { error: learningError } = await supabase
    .from("learning_logs")
    .insert({
      user_id: user.id,
      category: "test",
      title: `Phonics ${category} Stage ${stage}`,
      action: passed ? "테스트 통과" : "테스트 완료",
    });

  if (learningError) {
    console.error("테스트 학습 기록 저장 실패:", learningError);
  }

  /* 코인: 기록을 확인하지 못했으면 잘못 주지 않도록 건너뜀 */
  const coins = previousRows
    ? await rewardTestCoins({
        userId: user.id,
        title: `Phonics ${category} Stage ${stage}`,
        previousStars,
        stars,
        coinPerStar: isFinalPhonicsStage(category, stage)
          ? TEST_COIN.reviewPerStar
          : TEST_COIN.stagePerStar,
        bonus: {
          name: `Phonics ${category}`,
          isComplete: async () => {
            const progress = buildProgress(category, [
              ...previousRows,
              { stage, score },
            ]);

            return (
              progress.stages.filter((item) => item.passed).length ===
              getPhonicsStageCount(category)
            );
          },
        },
      })
    : NO_TEST_COIN;

  return {
    success: true,
    passed,
    stars,
    passScore: getPhonicsPassScore(category, stage),
    totalQuestions: getPhonicsQuestionCount(category, stage),
    coins,
  };
}
