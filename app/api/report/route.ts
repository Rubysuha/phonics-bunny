import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  aggregateReport,
  getPeriodStart,
  type ReportPeriod,
  type ReportStats,
} from "@/lib/report/aggregate";
import {
  generateReport,
  type CoachPeriod,
  type ReportResponse,
} from "@/lib/report/generate";
import {
  buildDailyPlan,
  writeDailyPlan,
  type DailyStats,
  type DailyTalk,
  type DailyTask,
} from "@/lib/report/daily";

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

/* 집계 + AI 글 작성(검사에 걸리면 한 번 더)까지 기다릴 수 있게 실행 시간을 넉넉히 둠 */
export const maxDuration = 60;

/*
  AI Learning Coach API

  학습 기록 수집 → 집계 → 취약 단어 · 복습 대상 선정 → Claude 리포트 → Supabase 저장

  요청 body
  - period : "day"(오늘의 코칭) | "week"(주간 분석, 기본) | "month"(월간 분석)
  - mode
    - "list"       : 저장된 리포트 목록 (지난 리포트를 골라 볼 때 사용)
    - "load"       : 저장된 리포트만 불러옴 (집계 · AI 호출 없음). start 를 주면 그 기간의 리포트
    - "create"     : 이번 기간에 저장된 리포트가 있으면 그것을, 없으면 새로 만듦
    - "regenerate" : 저장된 것이 있어도 새로 만들어서 덮어씀

  로그인 정보는 브라우저에만 있으므로 화면이 로그인 토큰을 Authorization 헤더로 보냄.
  서버는 그 토큰으로 확인한 사용자 ID 만 쓰고(화면이 보낸 user_id 는 받지 않음),
  그 사용자 권한으로만 DB 를 읽고 씀
*/

type Mode = "list" | "load" | "create" | "regenerate";

const INSUFFICIENT_MESSAGE =
  "아직 학습 기록이 부족해요. 몇 번 더 학습하면 리포트를 만들어 드릴게요!";

const AI_ERROR_MESSAGE =
  "AI 리포트를 생성하지 못했어요. 잠시 후 다시 시도해 주세요.";

const TABLE = "ai_learning_reports";

/* 기간의 시작일은 week_start 칸에 넣음 (오늘의 코칭은 그날, 주간은 월요일, 월간은 그 달 1일) */
type SavedRow = {
  summary: string;
  next_focus: {
    focus: string;
    words: string[];
    reason: string;
    wordLinks?: Record<string, string>;

    /* 강점 · 보완점 (AI 가 쓴 글이라 next_focus JSON 에 함께 보관) */
    analysis?: { strength: string; improvement: string };
    content_notes?: { book: string; conversation: string };
  };
  home_tip: string;
  stats: ReportStats;
  updated_at: string | null;
};

/* 오늘의 코칭은 같은 테이블에 이렇게 넣음: summary = 한 줄 평가, next_focus = 내일 할 일 */
type SavedDailyRow = {
  summary: string;
  next_focus: { tasks: DailyTask[]; usedAi: boolean; talk?: DailyTalk };
  home_tip: string;
  stats: DailyStats;
  updated_at: string | null;
};

/*
  저장소의 상태
  - "ready"   : period_type 칸까지 있음 (주간 · 월간 모두 저장 가능)
  - "legacy"  : period_type 칸이 없는 처음 구조 (주간만 저장 가능)
  - "offline" : 테이블을 쓸 수 없음 (저장하지 않고 화면에만 보여 줌)
*/
type Store = "ready" | "legacy" | "offline";

const isMissingColumn = (error: { code?: string; message?: string }) =>
  error.code === "42703" || /period_type/.test(error.message ?? "");

async function loadSaved<Row = SavedRow>(
  client: SupabaseClient,
  userId: string,
  period: CoachPeriod,
  start: string
): Promise<{ row: Row | null; store: Store }> {
  const columns = "summary, next_focus, home_tip, stats, updated_at";

  const { data, error } = await client
    .from(TABLE)
    .select(columns)
    .eq("user_id", userId)
    .eq("period_type", period)
    .eq("week_start", start)
    .maybeSingle();

  if (!error) {
    return { row: (data as Row | null) ?? null, store: "ready" };
  }

  if (!isMissingColumn(error)) {
    console.error("저장된 AI 리포트 조회 실패:", error.message);

    return { row: null, store: "offline" };
  }

  /* period_type 칸이 없는 처음 구조: 주간 리포트만 저장돼 있음 */
  if (period !== "week") {
    return { row: null, store: "legacy" };
  }

  const legacy = await client
    .from(TABLE)
    .select(columns)
    .eq("user_id", userId)
    .eq("week_start", start)
    .maybeSingle();

  if (legacy.error) {
    console.error("저장된 AI 리포트 조회 실패:", legacy.error.message);

    return { row: null, store: "offline" };
  }

  return { row: (legacy.data as Row | null) ?? null, store: "legacy" };
}

/* 저장된 리포트 목록 (최근 것부터) */
async function listSaved(client: SupabaseClient, userId: string) {
  const full = await client
    .from(TABLE)
    .select("period_type, week_start, updated_at")
    .eq("user_id", userId)
    .order("week_start", { ascending: false })
    .limit(60);

  if (!full.error) {
    return (full.data ?? []).map((row) => ({
      period: (["day", "month"].includes(row.period_type)
        ? row.period_type
        : "week") as CoachPeriod,
      start: row.week_start as string,
      updatedAt: (row.updated_at as string | null) ?? null,
    }));
  }

  if (!isMissingColumn(full.error)) {
    console.error("AI 리포트 목록 조회 실패:", full.error.message);

    return [];
  }

  const legacy = await client
    .from(TABLE)
    .select("week_start, updated_at")
    .eq("user_id", userId)
    .order("week_start", { ascending: false })
    .limit(60);

  return (legacy.data ?? []).map((row) => ({
    period: "week" as CoachPeriod,
    start: row.week_start as string,
    updatedAt: (row.updated_at as string | null) ?? null,
  }));
}

function toResponse(
  period: ReportPeriod,
  start: string,
  row: SavedRow,
  generated: boolean,
  saved: boolean
): ReportResponse {
  return {
    status: "ok",
    period,
    weekStart: start,
    report: {
      summary: row.summary,
      analysis: row.next_focus.analysis ?? { strength: "", improvement: "" },
      content_notes: row.next_focus.content_notes,
      next_week: {
        focus: row.next_focus.focus,
        words: row.next_focus.words,
        reason: row.next_focus.reason,
      },
      home_tip: row.home_tip,
    },
    stats: row.stats,
    wordLinks: row.next_focus.wordLinks ?? {},
    saved,
    generated,
    updatedAt: row.updated_at,
  };
}

/*
  오늘의 코칭
  할 일은 코드가 고르고(buildDailyPlan), AI 는 평가와 이유만 씀(writeDailyPlan).
  AI 가 실패해도 기본 문구로 할 일은 항상 돌려줌
*/
async function handleDaily(
  client: SupabaseClient,
  userId: string,
  mode: Exclude<Mode, "list">,
  requestedDate: string | null
) {
  const today = getPeriodStart("day");
  const date = mode === "load" && requestedDate ? requestedDate : today;

  const existing = await loadSaved<SavedDailyRow>(client, userId, "day", date);

  const respond = (
    row: SavedDailyRow,
    generated: boolean,
    saved: boolean
  ): ReportResponse => ({
    status: "daily",
    date,
    comment: row.summary,
    tasks: row.next_focus.tasks ?? [],
    talk: row.next_focus.talk ?? null,
    stats: row.stats,
    usedAi: Boolean(row.next_focus.usedAi),
    saved,
    generated,
    updatedAt: row.updated_at,
  });

  if (mode !== "regenerate" && existing.row) {
    return NextResponse.json(respond(existing.row, false, true));
  }

  if (mode === "load") {
    return NextResponse.json({ status: "empty" } satisfies ReportResponse);
  }

  let plan: Awaited<ReturnType<typeof writeDailyPlan>>;

  try {
    plan = await writeDailyPlan(
      await buildDailyPlan(client, userId),
      ANTHROPIC_KEY
    );
  } catch (error) {
    console.error(
      "학습 기록 조회 실패:",
      error instanceof Error ? error.message : error
    );

    return NextResponse.json(
      { error: "학습 기록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요." },
      { status: 500 }
    );
  }

  const row: SavedDailyRow = {
    summary: plan.comment,
    next_focus: { tasks: plan.tasks, usedAi: plan.usedAi, talk: plan.talk },
    home_tip: "",
    stats: plan.stats,
    updated_at: new Date().toISOString(),
  };

  let saved = false;

  /* 오늘의 코칭은 period_type 칸이 있어야 저장할 수 있음 */
  if (existing.store === "ready") {
    const { error: saveError } = await client
      .from(TABLE)
      .upsert(
        { user_id: userId, period_type: "day", week_start: today, ...row },
        { onConflict: "user_id,period_type,week_start" }
      );

    if (saveError) {
      console.error("오늘의 코칭 저장 실패:", saveError.message);
    } else {
      saved = true;
    }
  }

  return NextResponse.json(respond(row, true, saved));
}

export async function POST(request: NextRequest) {
  try {
    /* 1–2. 로그인 확인 · 사용자 ID */
    const token = (request.headers.get("authorization") ?? "").replace(
      /^Bearer\s+/i,
      ""
    );

    if (!token) {
      return NextResponse.json(
        { error: "로그인이 필요해요." },
        { status: 401 }
      );
    }

    /* 이 요청을 보낸 사용자 권한으로만 동작하는 클라이언트 */
    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await client.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: "로그인이 필요해요." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));

    const mode: Mode = ["list", "load", "regenerate"].includes(body?.mode)
      ? body.mode
      : "create";

    if (mode === "list") {
      return NextResponse.json({
        status: "list",
        reports: await listSaved(client, user.id),
      } satisfies ReportResponse);
    }

    /* 지난 리포트를 볼 때만 날짜를 받음 (형식이 맞을 때만) */
    const requestedStart =
      typeof body?.start === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.start)
        ? (body.start as string)
        : null;

    if (body?.period === "day") {
      return handleDaily(client, user.id, mode, requestedStart);
    }

    const period: ReportPeriod = body?.period === "month" ? "month" : "week";

    const currentStart = getPeriodStart(period);

    const start =
      mode === "load" && requestedStart ? requestedStart : currentStart;

    /* 6. 저장된 리포트가 있으면 다시 만들지 않고 그대로 돌려줌 */
    const existing = await loadSaved(client, user.id, period, start);

    if (mode !== "regenerate" && existing.row) {
      return NextResponse.json(
        toResponse(period, start, existing.row, false, true)
      );
    }

    if (mode === "load") {
      return NextResponse.json({ status: "empty" } satisfies ReportResponse);
    }

    /* 3–5. 학습 기록 조회 · 집계 (조회에 실패하면 "기록 부족"이 아니라 오류로 처리) */
    let aggregate: Awaited<ReturnType<typeof aggregateReport>>;

    try {
      aggregate = await aggregateReport(client, user.id, new Date(), period);
    } catch (error) {
      console.error(
        "학습 기록 조회 실패:",
        error instanceof Error ? error.message : error
      );

      return NextResponse.json(
        { error: "학습 기록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요." },
        { status: 500 }
      );
    }

    const { stats, wordLinks } = aggregate;

    if (stats.insufficient) {
      return NextResponse.json({
        status: "insufficient",
        message: INSUFFICIENT_MESSAGE,
      } satisfies ReportResponse);
    }

    /* 7–9. Claude 리포트 (형식 · 숫자 · 추천 단어 검사는 generateReport 안에서) */
    if (!ANTHROPIC_KEY) {
      return NextResponse.json({ error: AI_ERROR_MESSAGE }, { status: 500 });
    }

    const report = await generateReport(stats, ANTHROPIC_KEY);

    if (!report) {
      return NextResponse.json({ error: AI_ERROR_MESSAGE }, { status: 502 });
    }

    /* 10. Supabase 저장 (같은 사용자 · 같은 기간은 하나만: 있으면 덮어씀) */
    const row: SavedRow = {
      summary: report.summary,
      next_focus: {
        ...report.next_week,
        wordLinks,
        analysis: report.analysis,
        content_notes: report.content_notes,
      },
      home_tip: report.home_tip,
      stats,
      updated_at: new Date().toISOString(),
    };

    let saved = false;

    if (existing.store === "ready") {
      const { error: saveError } = await client.from(TABLE).upsert(
        {
          user_id: user.id,
          period_type: period,
          week_start: currentStart,
          ...row,
        },
        { onConflict: "user_id,period_type,week_start" }
      );

      if (saveError) {
        console.error("AI 리포트 저장 실패:", saveError.message);
      } else {
        saved = true;
      }
    } else if (existing.store === "legacy" && period === "week") {
      const { error: saveError } = await client
        .from(TABLE)
        .upsert(
          { user_id: user.id, week_start: currentStart, ...row },
          { onConflict: "user_id,week_start" }
        );

      if (saveError) {
        console.error("AI 리포트 저장 실패:", saveError.message);
      } else {
        saved = true;
      }
    }

    /* 11. 저장에 실패해도 만든 리포트는 보여 주되, 저장되지 않았다고 알려 줌 */
    return NextResponse.json(
      toResponse(period, currentStart, row, true, saved)
    );
  } catch (error) {
    console.error(
      "AI 리포트 route 실패:",
      error instanceof Error ? error.message : error
    );

    return NextResponse.json({ error: AI_ERROR_MESSAGE }, { status: 500 });
  }
}
