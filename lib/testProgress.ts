import {
  supabase,
} from "@/lib/supabase";

import {
  PHONICS_STAGE_COUNT,
  getPhonicsPassScore,
  getPhonicsQuestionCount,
  getPhonicsStars,
  isPhonicsStagePassed,
  type PhonicsTestCategoryId,
} from "@/lib/phonicsTestRules";

export type StageProgress = {
  stage: number;

  bestScore: number;

  totalQuestions:
    number;

  stars: number;

  passed: boolean;
};

export type CategoryProgress = {
  stages:
    StageProgress[];

  unlockedStages:
    number[];
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
    };

/* ─────────────────────────────
   Result Save
───────────────────────────── */

export async function savePhonicsTestResult({
  category,
  stage,
  score,
  totalQuestions,
}: {
  category:
    PhonicsTestCategoryId;

  stage:
    number;

  score:
    number;

  totalQuestions:
    number;
}): Promise<SavePhonicsTestResultReturn> {
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
      success:
        false,

      passed:
        false,

      stars:
        0,

      message:
        "로그인이 필요합니다.",
    };
  }

  const passed =
    isPhonicsStagePassed(
      score,
      stage
    );

  const stars =
    getPhonicsStars(
      score,
      stage
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
          "phonics",

        category,

        stage,

        score,

        total_questions:
          totalQuestions,

        passed,

        stars,
      });

  if (error) {
    console.error(
      "테스트 결과 저장 실패:",
      error
    );

    return {
      success:
        false,

      passed:
        false,

      stars:
        0,

      message:
        "테스트 결과를 저장하지 못했습니다.",
    };
  }

  /* ───────────────────────────
     Learning Log
  ─────────────────────────── */

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
          `Phonics ${category} Stage ${stage}`,

        action:
          passed
            ? "테스트 통과"
            : "테스트 완료",
      });

  if (
    learningError
  ) {
    console.error(
      "테스트 학습 기록 저장 실패:",
      learningError
    );
  }

  return {
    success:
      true,

    passed,

    stars,

    passScore:
      getPhonicsPassScore(
        stage
      ),

    totalQuestions:
      getPhonicsQuestionCount(
        stage
      ),
  };
}

/* ─────────────────────────────
   Progress
───────────────────────────── */

export async function getPhonicsCategoryProgress(
  category:
    PhonicsTestCategoryId
): Promise<CategoryProgress> {
  const {
    data: {
      user,
    },
  } =
    await supabase
      .auth
      .getUser();

  /*
    로그인 전에는
    Stage 1만 열림
  */
  if (!user) {
    return {
      stages: [],

      unlockedStages:
        [1],
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
        stage,
        score,
        total_questions,
        stars,
        passed
        `
      )
      .eq(
        "user_id",
        user.id
      )
      .eq(
        "test_type",
        "phonics"
      )
      .eq(
        "category",
        category
      );

  if (error) {
    console.error(
      "테스트 진행상황 조회 실패:",
      error
    );

    return {
      stages: [],

      unlockedStages:
        [1],
    };
  }

  const rows =
    data ?? [];

  const stages:
    StageProgress[] =
    [];

  for (
    let stage = 1;
    stage <= PHONICS_STAGE_COUNT;
    stage += 1
  ) {
    const stageRows =
      rows.filter(
        (row) =>
          row.stage ===
          stage
      );

    if (
      stageRows.length ===
      0
    ) {
      continue;
    }

    /*
      최고점 결과
    */
    const best =
      [...stageRows]
        .sort(
          (
            a,
            b
          ) =>
            b.score -
            a.score
        )[0];

    /*
      과거에 저장된 5문제 데이터가
      혹시 있어도 현재 규칙의
      문제 수를 화면 기준으로 사용
    */
    const currentTotal =
      getPhonicsQuestionCount(
        stage
      );

    const bestScore =
      Math.min(
        best.score,
        currentTotal
      );

    /*
      현재 기준으로 다시
      별 / 통과 여부 계산
    */
    const stars =
      getPhonicsStars(
        bestScore,
        stage
      );

    const passed =
      stageRows.some(
        (row) =>
          isPhonicsStagePassed(
            row.score,
            stage
          )
      );

    stages.push({
      stage,

      bestScore,

      totalQuestions:
        currentTotal,

      stars,

      passed,
    });
  }

  /* ───────────────────────────
     Unlock
  ─────────────────────────── */

  const unlockedStages:
    number[] =
    [1];

  for (
    let stage = 2;
    stage <= PHONICS_STAGE_COUNT;
    stage += 1
  ) {
    const previous =
      stages.find(
        (item) =>
          item.stage ===
          stage - 1
      );

    if (
      previous?.passed
    ) {
      unlockedStages.push(
        stage
      );
    } else {
      break;
    }
  }

  return {
    stages,

    unlockedStages,
  };
}