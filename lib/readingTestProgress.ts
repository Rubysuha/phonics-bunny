import {
  supabase,
} from "@/lib/supabase";

import {
  READING_QUESTION_COUNT,
  getReadingStars,
  getReadingStoryKey,
  isReadingPassed,
} from "@/lib/readingTestRules";

export type ReadingStoryProgress = {
  bestScore: number;

  totalQuestions: number;

  stars: number;

  passed: boolean;
};

export type ReadingProgress = {
  /*
    key: "level1/my-dog"
  */
  stories: Record<
    string,
    ReadingStoryProgress
  >;
};

export type SaveReadingTestResultReturn =
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

const EMPTY_PROGRESS: ReadingProgress = {
  stories: {},
};

/* ─────────────────────────────
   Result Save
───────────────────────────── */

export async function saveReadingTestResult({
  level,
  story,
  score,
  totalQuestions,
}: {
  level: string;

  story: string;

  score: number;

  totalQuestions: number;
}): Promise<SaveReadingTestResultReturn> {
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
    isReadingPassed(
      score
    );

  const stars =
    getReadingStars(
      score
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
          "reading",

        category:
          getReadingStoryKey(
            level,
            story
          ),

        /*
          Reading은 이야기 단위이므로
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
      "Reading 결과 저장 실패:",
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
          `Reading Quiz - ${level}/${story}`,

        action:
          passed
            ? "테스트 통과"
            : "테스트 완료",
      });

  if (
    learningError
  ) {
    console.error(
      "Reading learning log 저장 실패:",
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

   level을 넘기면 그 레벨의 이야기만 불러옴
───────────────────────────── */

const PAGE_SIZE = 1000;

export async function getReadingProgress(
  level?: string
): Promise<ReadingProgress> {
  const {
    data: {
      user,
    },
  } =
    await supabase
      .auth
      .getUser();

  if (!user) {
    return EMPTY_PROGRESS;
  }

  /*
    재도전 기록까지 모두 쌓이므로
    1000개 제한을 넘어도 빠지지 않게
    페이지 단위로 끝까지 조회
  */
  const rows: {
    category: string;
    score: number;
  }[] = [];

  for (
    let from = 0;
    ;
    from += PAGE_SIZE
  ) {
    let query =
      supabase
        .from(
          "test_results"
        )
        .select(
          "category, score"
        )
        .eq(
          "user_id",
          user.id
        )
        .eq(
          "test_type",
          "reading"
        );

    if (level) {
      query =
        query.like(
          "category",
          `${level}/%`
        );
    }

    const {
      data,
      error,
    } =
      await query.range(
        from,
        from + PAGE_SIZE - 1
      );

    if (error) {
      console.error(
        "Reading 진행상황 조회 실패:",
        error
      );

      return EMPTY_PROGRESS;
    }

    rows.push(
      ...(data ?? [])
    );

    if (
      (data?.length ?? 0) <
      PAGE_SIZE
    ) {
      break;
    }
  }

  /*
    이야기별 최고 점수
  */
  const bestScores =
    new Map<
      string,
      number
    >();

  rows.forEach(
    (row) => {
      const previous =
        bestScores.get(
          row.category
        );

      if (
        previous ===
          undefined ||
        row.score >
          previous
      ) {
        bestScores.set(
          row.category,
          row.score
        );
      }
    }
  );

  const stories:
    ReadingProgress["stories"] =
    {};

  bestScores.forEach(
    (
      bestScore,
      key
    ) => {
      stories[key] =
        {
          bestScore:
            Math.min(
              bestScore,
              READING_QUESTION_COUNT
            ),

          totalQuestions:
            READING_QUESTION_COUNT,

          stars:
            getReadingStars(
              bestScore
            ),

          passed:
            isReadingPassed(
              bestScore
            ),
        };
    }
  );

  return {
    stories,
  };
}

/* ─────────────────────────────
   Helpers
───────────────────────────── */

export function getReadingStoryProgress(
  progress: ReadingProgress,
  level: string,
  story: string
): ReadingStoryProgress | undefined {
  return progress.stories[
    getReadingStoryKey(
      level,
      story
    )
  ];
}

/*
  통과한 이야기 수
  level을 넘기면 해당 레벨만 계산
*/
export function countPassedReadingStories(
  progress: ReadingProgress,
  level?: string
): number {
  return Object.entries(
    progress.stories
  ).filter(
    ([
      key,
      item,
    ]) =>
      item.passed &&
      (!level ||
        key.startsWith(
          `${level}/`
        ))
  ).length;
}
