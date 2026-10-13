import type { ReportPeriod, ReportStats } from "./aggregate";
import type { DailyStats, DailyTalk, DailyTask } from "./daily";

/*
  AI Learning Coach 의 리포트 글 만들기

  분석 엔진의 집계 결과(ReportStats)를 Claude 에게 주고 학부모용 글을 받음.
  Claude 의 응답은 그대로 믿지 않고 형식 · 숫자를 검사하며,
  복습 단어와 단원은 집계 결과로 다시 확정함
*/

export type AiReport = {
  /* 이번 주 학습 분석 */
  summary: string;

  /* 데이터로 본 강점 · 보완점 */
  analysis: {
    strength: string;
    improvement: string;
  };

  /* Book 이야기 · Conversation 대화에 대한 평가 (기록이 없으면 "") */
  content_notes?: {
    book: string;
    conversation: string;
  };

  /* 다음 주 맞춤 학습 */
  next_week: {
    focus: string;
    words: string[];
    reason: string;
  };

  /* 집에서 할 수 있는 도움 방법 */
  home_tip: string;
};

/* 화면의 세 탭: 오늘의 코칭 · 주간 분석 · 월간 분석 */
export type CoachPeriod = "day" | ReportPeriod;

/* /api/report 가 돌려주는 값 */
export type ReportResponse =
  | { status: "empty" }
  | {
      /* 저장된 리포트 목록 (최근 것부터) */
      status: "list";
      reports: { period: CoachPeriod; start: string; updatedAt: string | null }[];
    }
  | {
      /* 오늘의 코칭: 한 줄 평가와 내일 할 일 */
      status: "daily";

      /* 한국 시간 기준 날짜 (예: "2026-10-13") */
      date: string;
      comment: string;
      tasks: DailyTask[];

      /* AI Bunny 와 나눈 대화 (예전에 저장된 코칭에는 없을 수 있음) */
      talk: DailyTalk | null;
      stats: DailyStats;

      /* 평가와 이유를 AI 가 썼는지 (false 면 코드가 만든 기본 문구) */
      usedAi: boolean;
      saved: boolean;
      generated: boolean;
      updatedAt: string | null;
    }
  | { status: "insufficient"; message: string }
  | {
      status: "ok";

      /* 주간 · 월간, 그 기간의 시작일 (주간은 월요일, 월간은 1일) */
      period: ReportPeriod;
      weekStart: string;
      report: AiReport;
      stats: ReportStats;
      wordLinks: Record<string, string>;

      /* Supabase 에 저장됐는지 (false 면 이 화면에만 보이는 결과) */
      saved: boolean;

      /* 이번 요청에서 새로 만들었는지 (false 면 저장돼 있던 리포트) */
      generated: boolean;

      updatedAt: string | null;
    };

/* AI Bunny 대화와 같은 모델 (app/api/conversation/route.ts) */
const MODEL = "claude-haiku-4-5-20251001";

/* Claude 응답을 기다리는 최대 시간 */
const TIMEOUT_MS = 15000;

/* 응답이 검사를 통과하지 못했을 때 다시 요청하는 횟수 */
const MAX_ATTEMPTS = 2;

const SYSTEM_PROMPT_BASE = `너는 어린이 영어 학습 플랫폼 Phonics Bunny의 AI Learning Coach야. 아동 영어 파닉스 · 발음 지도 전문가의 관점에서 글을 써.

너의 역할은 실제 학습 기록을 기반으로 분석된 데이터를 학부모가 이해하기 쉽도록 해석하고, 다음 주 학습 방향과 간단한 가정 학습 방법을 안내하는 것이야.

다음 규칙을 반드시 지켜.

1. 전달된 JSON에 있는 숫자와 단어만 사용해.
2. 전달되지 않은 수치나 학습 사실을 만들어내지 마.
3. 숫자를 직접 계산하거나 새로운 점수를 추정하지 마.
4. null인 항목은 언급하지 마.
5. 다음 주 추천 단어와 패턴은 코드에서 이미 선정했으므로 변경하지 마.
6. 추천 단어를 새로 추가하지 마.
7. 추천 이유는 실제 분석 결과(weak_words의 점수와 연습 횟수)에 근거해야 해.
8. 다른 아이와 비교하지 마.
9. 아이를 비난하거나 실력이 부족하다고 단정하지 마.
10. 작은 노력과 성장을 긍정적으로 설명해.
11. 점수가 향상된 근거(avg_pronunciation.change가 0보다 큼, 또는 improved_words)가 있을 때만 향상되었다고 말해.
12. 충분한 기록이 없을 때는 추측하지 마.
13. 학부모가 이해하기 쉬운 정중하고 차분한 한국어(~습니다, ~입니다)를 사용해.
14. 가정에서 약 5분간 실천할 수 있는 학습 방법을 하나 제안해.
15. 반드시 지정된 JSON 형식으로만 응답해.
16. Markdown 코드 블록이나 별도의 설명을 추가하지 마.

[전문가답게 쓰는 방법]
- 느낌이 아니라 근거로 말해. 판단을 말할 때는 그 근거가 된 숫자(평균 점수, 연습 횟수, 영역 이름)를 같은 문장에 함께 적어.
- 숫자를 나열만 하지 말고 그 숫자가 무엇을 뜻하는지 해석해. 예: 정확도는 높은데 완성도가 낮으면 "소리는 정확하지만 단어를 끝까지 말하지 않는 경우가 있다"처럼.
- 발음 지도 관점의 표현을 써도 좋아(장모음, 자음 블렌드, 끝소리, 또박또박 끝까지 말하기 등). 단, JSON에 없는 사실(특정 소리를 틀렸다는 식의 세부 오류)은 지어내지 마.
- 과장된 칭찬("정말 대단해요!")이나 느낌표는 쓰지 마.

[JSON 항목 설명]
(아래에서 "이번 기간"은 [평가 종류]에 적힌 분석 기간, "이전 기간"은 그 바로 앞의 같은 길이 기간이야. JSON 키 이름이 this_week / last_week 여도 뜻은 이번 기간 / 이전 기간이야.)
- period / period_days: 평가 종류와 분석 기간(일)
- practice_days: 이번 기간 중 학습한 날 수
- words_practiced: 이번 기간 동안 발음 연습을 한 서로 다른 단어 수
- avg_pronunciation: 발음 평균 점수(100점 만점). this_week는 이번 기간, last_week는 이전 기간, change는 둘의 차이
- weak_words: 이번 기간 평균 점수가 낮았던 단어. score는 평균 점수, count는 연습 횟수, pattern은 단어가 속한 파닉스 단원
- test: 이번 기간 Test 정답률(%). 점수가 아니라 정답률이므로 "85%"처럼 써
- next_focus: 다음에 복습할 단원(pattern, null이면 단원 없이 단어만)과 단어(words)
- daily: 이번 기간의 날짜별 학습 기록 수 (학습이 몰려 있는지 고른지 볼 때 사용)
- areas: 영역별 발음 평균. this_week는 이번 기간, last_week는 이전 기간, count는 발음 확인 횟수
- strongest_area / weakest_area: 평균이 가장 높은 영역 · 가장 낮은 영역
- components: 발음 점수의 구성 요소 평균. accuracy는 소리의 정확도, completeness는 단어 · 문장을 빠뜨리지 않고 끝까지 말한 정도, volume은 목소리 크기
- score_bands: 단어 평균 점수 구간별 단어 수. stable은 85점 이상(안정), practicing은 70~84점(연습 중), needs_focus는 70점 미만(집중 필요)
- strong_words: 평균 점수가 높은 단어
- improved_words: 같은 단어를 다시 연습해서 점수가 오른 단어. from은 처음 점수, to는 마지막 점수, gain은 오른 점수
- content: Book 이야기(content.book)와 Conversation 대화(content.conversation)의 분석. practiced는 연습한 이야기 · 대화 수, avg는 평균 점수, strong은 85점 이상으로 잘한 것, weak은 85점 미만으로 더 연습하면 좋은 것(score는 평균 점수, count는 연습 횟수, unit은 레벨 또는 월드), improved는 다시 연습해서 점수가 오른 것(gain은 오른 점수), next는 다음에 다시 할 것

[Book · Conversation을 함께 다루는 방법]
- content가 있으면 summary와 analysis에서 단어뿐 아니라 이야기 읽기(Book)와 대화(Conversation)도 함께 다뤄. 강점에는 strong과 improved를, 보완점에는 weak을 근거로 써.
- content_notes.book에는 Book에 대한 평가를, content_notes.conversation에는 Conversation에 대한 평가를 각각 1~2문장으로 써. 잘한 이야기 · 대화(strong, improved)와 더 연습하면 좋은 이야기 · 대화(weak)를 제목과 점수를 들어 설명하고, 다음에 무엇을 다시 하면 좋은지(next)로 끝내. 그 영역의 값이 null이면 빈 문자열("")로 둬.
- 단어는 낱소리의 정확성, Book은 여러 문장을 이어 읽는 유창성, Conversation은 대화 문장을 자연스럽게 말하는 힘을 보여 준다는 관점에서 차이를 해석해.
- content의 weak_sentences / strong_sentences는 아이가 문장 하나만 따로 녹음해서 받은 점수야(title은 그 문장이 들어 있는 이야기 · 대화). 이 값이 있으면 content_notes에서 어느 문장을 잘했고 어느 문장을 더 연습하면 좋은지 문장을 그대로 인용해서 말해.
- weak_sentences / strong_sentences가 비어 있으면 문장 단위의 이야기는 하지 마(데이터가 없어). 이야기 · 대화 제목 단위로만 말해.
- next_week.words에는 코드가 정한 단어만 넣어. content의 next(다시 할 이야기 · 대화)는 reason이나 analysis.improvement에서 제목을 언급하는 것으로 충분해.

[출력 JSON]
{
  "summary": "3~4문장으로 작성한 학습 분석 (학습량과 발음 수준의 전체 흐름)",
  "analysis": {
    "strength": "데이터에서 확인되는 강점 1~2문장 (근거 숫자 포함)",
    "improvement": "보완하면 좋은 점 1~2문장 (근거 숫자 포함, 부드럽게)"
  },
  "content_notes": {
    "book": "Book 이야기 읽기에 대한 평가 1~2문장 (기록이 없으면 빈 문자열)",
    "conversation": "Conversation 대화에 대한 평가 1~2문장 (기록이 없으면 빈 문자열)"
  },
  "next_week": {
    "focus": "선정된 패턴 또는 단어 (복습할 단어가 없으면 다음에 집중할 방향)",
    "words": ["선정된 단어 (없으면 빈 배열)"],
    "reason": "추천 이유를 설명하는 한 문장"
  },
  "home_tip": "집에서 약 5분 동안 할 수 있는 활동 한 가지"
}`;

/* 평가 종류에 따라 기간을 부르는 말을 정해 줌 */
function buildSystemPrompt(stats: ReportStats): string {
  const isMonth = stats.period === "month";
  const days = stats.period_days ?? 7;

  return `${SYSTEM_PROMPT_BASE}

[평가 종류]
${
  isMonth
    ? `이번 리포트는 월간 평가야. 분석 기간은 최근 ${days}일이고, 그 이전 ${days}일과 비교해. 글에서는 "이번 달"과 "지난달"이라고 부르고, 다음 학습은 "다음 달"이라고 해. 한 달 동안의 흐름과 변화를 중심으로, 주간 평가보다 길게 본 관점에서 써.`
    : `이번 리포트는 주간 평가야. 분석 기간은 최근 ${days}일이고, 그 이전 ${days}일과 비교해. 글에서는 "이번 주"와 "지난주"라고 부르고, 다음 학습은 "다음 주"라고 해.`
}`;
}

/* 집계 결과에 실제로 들어 있는 숫자들 (어느 항목에 있든 모두 모음) */
function allowedNumbers(stats: ReportStats): Set<string> {
  const numbers = new Set<string>();

  const collect = (value: unknown) => {
    if (typeof value === "number") {
      numbers.add(String(value));
      numbers.add(String(Math.abs(value)));
    } else if (Array.isArray(value)) {
      value.forEach(collect);
      numbers.add(String(value.length));
    } else if (value && typeof value === "object") {
      Object.values(value).forEach(collect);
    }
  };

  collect(stats);

  /* 기간 · 만점 · 점수 구간의 기준을 말할 때 쓰는 숫자 */
  ["7", "30", "100", "85", "84", "70"].forEach((value) => numbers.add(value));

  return numbers;
}

/* 글 안의 숫자가 모두 집계 결과에 있는 숫자인지 */
function usesOnlyKnownNumbers(text: string, stats: ReportStats): boolean {
  const allowed = allowedNumbers(stats);

  return (text.match(/\d+(?:\.\d+)?/g) ?? []).every((value) =>
    allowed.has(value)
  );
}

/* 왜 통과하지 못했는지 (로그용) · 통과하면 리포트 */
function validate(
  text: string,
  stats: ReportStats
): { report: AiReport } | { problem: string } {
  /* 앞뒤에 다른 글이나 코드 블록 표시가 붙어도 JSON 부분만 꺼냄 */
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end <= start) {
    return { problem: "JSON 이 없음" };
  }

  let data: {
    summary?: unknown;
    analysis?: { strength?: unknown; improvement?: unknown };
    content_notes?: { book?: unknown; conversation?: unknown };
    next_week?: { focus?: unknown; words?: unknown; reason?: unknown };
    home_tip?: unknown;
  };

  try {
    data = JSON.parse(text.slice(start, end + 1));
  } catch {
    return { problem: "JSON.parse 실패" };
  }

  const isText = (value: unknown): value is string =>
    typeof value === "string" && value.trim().length > 0;

  if (
    !isText(data?.summary) ||
    !isText(data?.analysis?.strength) ||
    !isText(data?.analysis?.improvement) ||
    !isText(data?.next_week?.focus) ||
    !isText(data?.next_week?.reason) ||
    !isText(data?.home_tip)
  ) {
    return { problem: "필수 문자열 항목이 없음" };
  }

  /* Book · Conversation 평가는 그 영역의 기록이 있을 때만 받음 */
  const noteOf = (value: unknown, hasData: boolean) =>
    hasData && typeof value === "string" ? value.trim() : "";

  const contentNotes = {
    book: noteOf(data.content_notes?.book, !!stats.content?.book),
    conversation: noteOf(
      data.content_notes?.conversation,
      !!stats.content?.conversation
    ),
  };

  if (!Array.isArray(data.next_week?.words)) {
    return { problem: "next_week.words 가 배열이 아님" };
  }

  /* 추천 단어를 바꾸거나 더했는지 */
  const expected = (stats.next_focus?.words ?? []).map((word) =>
    word.toLowerCase()
  );

  const returned = data.next_week.words.map((word) =>
    String(word).toLowerCase()
  );

  if (
    returned.length !== expected.length ||
    returned.some((word) => !expected.includes(word))
  ) {
    return { problem: "추천 단어가 집계 결과와 다름" };
  }

  if (
    !usesOnlyKnownNumbers(
      `${data.summary} ${data.analysis.strength} ${data.analysis.improvement} ${data.next_week.reason} ${contentNotes.book} ${contentNotes.conversation}`,
      stats
    )
  ) {
    return { problem: "집계에 없는 숫자를 사용함" };
  }

  return {
    report: {
      summary: data.summary.trim(),
      analysis: {
        strength: data.analysis.strength.trim(),
        improvement: data.analysis.improvement.trim(),
      },
      content_notes: contentNotes,
      next_week: {
        /* 복습 대상은 코드가 정한 값으로 최종 확정 */
        focus: stats.next_focus?.pattern ?? data.next_week.focus.trim(),
        words: stats.next_focus?.words ?? [],
        reason: data.next_week.reason.trim(),
      },
      home_tip: data.home_tip.trim(),
    },
  };
}

/*
  Claude 에게 한 번 묻고 글을 받음 (AI Learning Coach 의 모든 요청이 함께 씀)
  제한 시간을 넘기거나 API 가 실패하면 오류를 던짐
*/
export async function callClaude({
  system,
  content,
  apiKey,
  maxTokens,
}: {
  system: string;

  /* 집계 결과 JSON 만 보냄 (아이의 음성이나 개인정보는 보내지 않음) */
  content: string;
  apiKey: string;
  maxTokens: number;
}): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        temperature: 0.4,
        system,
        messages: [{ role: "user", content }],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Claude API ${response.status}`);
    }

    const data = (await response.json()) as {
      content?: { type: string; text?: string }[];
    };

    return data?.content?.find((c) => c.type === "text")?.text ?? "";
  } finally {
    clearTimeout(timer);
  }
}

function askClaude(stats: ReportStats, apiKey: string): Promise<string> {
  return callClaude({
    system: buildSystemPrompt(stats),
    content: JSON.stringify(stats, null, 2),
    apiKey,
    maxTokens: 1300,
  });
}

/*
  리포트를 만들지 못하면 null
  (API 오류 · 제한 시간 초과 · 응답이 검사를 통과하지 못함)
*/
export async function generateReport(
  stats: ReportStats,
  apiKey: string
): Promise<AiReport | null> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const result = validate(await askClaude(stats, apiKey), stats);

      if ("report" in result) {
        return result.report;
      }

      console.error(`AI 리포트 응답 검사 실패 (${attempt}번째): ${result.problem}`);
    } catch (error) {
      // 제한 시간 초과(AbortError) 포함. API 키나 요청 내용은 남기지 않음
      console.error(
        "AI 리포트 요청 실패:",
        error instanceof Error ? error.message : "알 수 없는 오류"
      );

      return null;
    }
  }

  return null;
}
