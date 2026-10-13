"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowsClockwise,
  BookOpen,
  ChatsCircle,
  ArrowUp,
  CalendarCheck,
  ChartBar,
  ChartLineUp,
  CloudCheck,
  CloudSlash,
  ChatCircleText,
  House,
  Lightbulb,
  ListChecks,
  Microphone,
  Sparkle,
  Target,
  TextAa,
  ThumbsUp,
  Wrench,
} from "@phosphor-icons/react";
import { supabase } from "@/lib/supabase";
import {
  PERIOD_DAYS,
  getPeriodStart,
  type ContentAnalysis,
} from "@/lib/report/aggregate";
import type { CoachPeriod, ReportResponse } from "@/lib/report/generate";
import type { DailyArea, DailyTaskType } from "@/lib/report/daily";
import styles from "./AiReportCard.module.css";

/* 다른 화면에서 이 카드로 바로 이동할 때 쓰는 id */
export const AI_REPORT_ANCHOR = "ai-learning-report";

type OkReport = Extract<ReportResponse, { status: "ok" }>;
type DailyReport = Extract<ReportResponse, { status: "daily" }>;

/* 보조 캐시 (기본 저장소는 Supabase). 저장 형식이 바뀌면 숫자를 올림 */
const CACHE_VERSION = 5;

const cacheKey = (userId: string, period: CoachPeriod, start: string) =>
  `phonics-bunny-ai-report:v${CACHE_VERSION}:${userId}:${period}:${start}`;

type SavedItem = { period: CoachPeriod; start: string; updatedAt: string | null };

/* 평가 종류별로 화면에 쓰는 말 */
const PERIOD_TEXT: Record<
  CoachPeriod,
  { tab: string; label: string; now: string; previous: string; next: string }
> = {
  day: {
    tab: "오늘의 코칭",
    label: "Daily",
    now: "오늘",
    previous: "최근 7일",
    next: "내일",
  },
  week: {
    tab: "주간 분석",
    label: "Weekly",
    now: "이번 주",
    previous: "지난주",
    next: "다음 주",
  },
  month: {
    tab: "월간 분석",
    label: "Monthly",
    now: "이번 달",
    previous: "지난달",
    next: "다음 달",
  },
};

/* 내일 할 일의 영역 이름 */
const AREA_LABEL: Record<DailyArea, string> = {
  phonics: "Phonics",
  book: "Book",
  conversation: "Conversation",
};

/* 내일 할 일의 종류 이름 */
const TASK_LABEL: Record<DailyTaskType, string> = {
  retry: "다시 연습",
  review: "복습",
  new: "새 단어",
  keep: "한 번 더",
};

/* "2026-10-12" → "2026. 10. 12." */
const formatDate = (date: string) => `${date.replaceAll("-", ". ")}.`;

/* 브라우저에 저장된 값이 올바른 리포트 형식인지 */
function isOkReport(value: unknown): value is OkReport {
  const data = value as OkReport | null;

  return (
    !!data &&
    data.status === "ok" &&
    typeof data.report?.summary === "string" &&
    typeof data.report?.analysis?.strength === "string" &&
    typeof data.report?.analysis?.improvement === "string" &&
    typeof data.report?.next_week?.focus === "string" &&
    typeof data.report?.next_week?.reason === "string" &&
    Array.isArray(data.report?.next_week?.words) &&
    typeof data.report?.home_tip === "string" &&
    typeof data.stats === "object" &&
    data.stats !== null
  );
}

/* 브라우저에 저장된 값이 올바른 오늘의 코칭 형식인지 */
function isDailyReport(value: unknown): value is DailyReport {
  const data = value as DailyReport | null;

  return (
    !!data &&
    data.status === "daily" &&
    typeof data.date === "string" &&
    typeof data.comment === "string" &&
    Array.isArray(data.tasks) &&
    data.tasks.every(
      (task) =>
        typeof task?.word === "string" &&
        typeof task?.reason === "string" &&
        typeof task?.href === "string"
    ) &&
    typeof data.stats === "object" &&
    data.stats !== null
  );
}

function readCache(
  userId: string,
  period: CoachPeriod,
  start: string
): OkReport | DailyReport | null {
  try {
    const raw = window.localStorage.getItem(cacheKey(userId, period, start));
    const data = raw ? JSON.parse(raw) : null;

    if (period === "day") {
      return isDailyReport(data) ? data : null;
    }

    return isOkReport(data) ? data : null;
  } catch {
    return null;
  }
}

function writeCache(userId: string, report: OkReport | DailyReport) {
  try {
    window.localStorage.setItem(
      report.status === "daily"
        ? cacheKey(userId, "day", report.date)
        : cacheKey(userId, report.period ?? "week", report.weekStart),
      JSON.stringify(report)
    );
  } catch {
    /* 저장하지 못해도 화면에는 그대로 보여 줌 */
  }
}

const NETWORK_ERROR = "네트워크 연결을 확인한 후 다시 시도해 주세요.";
const AI_ERROR = "AI 리포트를 생성하지 못했어요. 잠시 후 다시 시도해 주세요.";

/* 분석 과정 (화면 아래에 순서대로 보여 줌) */
const PIPELINE = [
  "학습 기록 수집",
  "데이터 집계",
  "취약 단어 분석",
  "복습 대상 선정",
  "AI 리포트 작성",
  "저장",
];

/*
  AI Learning Coach 리포트 카드

  버튼을 누르면 서버가 최근 학습 기록을 집계해서 복습 대상을 정하고,
  AI 가 그 결과를 학부모용 글로 풀어 줌. 결과는 Supabase 에 주 단위로 저장되고,
  이 기기에도 보조로 저장해서 같은 주에는 바로 보여 줌.
  이 카드에서 문제가 생겨도 다른 화면에는 영향을 주지 않음
*/
export default function AiReportCard() {
  /* undefined = 확인 중, null = 로그인하지 않음 */
  const [userId, setUserId] = useState<string | null | undefined>(undefined);

  /* 오늘의 코칭 · 주간 분석 · 월간 분석 */
  const [period, setPeriod] = useState<CoachPeriod>("day");

  /* 보고 있는 리포트의 기간 시작일 (null 이면 이번 주 · 이번 달) */
  const [selectedStart, setSelectedStart] = useState<string | null>(null);

  /* 저장된 리포트 목록 (지난 리포트를 골라 볼 때 사용) */
  const [history, setHistory] = useState<SavedItem[]>([]);

  const [report, setReport] = useState<OkReport | null>(null);
  const [daily, setDaily] = useState<DailyReport | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cardRef = useRef<HTMLElement>(null);

  /* 서버에 요청. 네트워크 오류와 서버 오류를 구분해서 안내 */
  const request = useCallback(
    async (body: {
      mode: "list" | "load" | "create" | "regenerate";
      period?: CoachPeriod;
      start?: string;
    }): Promise<ReportResponse | { error: string }> => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        return { error: "로그인이 필요해요." };
      }

      let response: Response;

      try {
        response = await fetch("/api/report", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(body),
        });
      } catch {
        return { error: NETWORK_ERROR };
      }

      try {
        const data = await response.json();

        return response.ok ? data : { error: data?.error ?? AI_ERROR };
      } catch {
        return { error: AI_ERROR };
      }
    },
    []
  );

  /* 로그인한 사용자가 누구인지 (바뀌면 이전 사용자의 내용이 남지 않게 비움) */
  useEffect(() => {
    let cancelled = false;

    const showUser = (nextUserId: string | null) => {
      if (cancelled) return;

      setUserId(nextUserId);
      setReport(null);
      setDaily(null);
      setHistory([]);
      setSelectedStart(null);
      setNotice(null);
      setError(null);
    };

    supabase.auth
      .getUser()
      .then(({ data }) => showUser(data.user?.id ?? null))
      .catch(() => showUser(null));

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT" || event === "SIGNED_IN") {
          showUser(session?.user.id ?? null);
        }
      }
    );

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  /* 저장된 리포트 목록 */
  const loadHistory = useCallback(async () => {
    const data = await request({ mode: "list" });

    if (!("error" in data) && data.status === "list") {
      setHistory(data.reports);
    }
  }, [request]);

  /*
    보고 있는 리포트 불러오기 (사용자 · 평가 종류 · 고른 기간이 바뀔 때마다)
    1) 이 기기에 저장해 둔 리포트를 바로 보여 주고
    2) Supabase 에 저장된 리포트를 불러와서 맞춤
  */
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    const start = selectedStart ?? getPeriodStart(period);

    /* 고른 기간이 바뀌면 그 기간의 리포트로 바로 바꿔 보여 줌 */
    const cached = readCache(userId, period, start);

    setReport(cached?.status === "ok" ? cached : null);
    setDaily(cached?.status === "daily" ? cached : null);
    setNotice(null);
    setError(null);

    request({ mode: "load", period, start }).then((data) => {
      if (cancelled || "error" in data) return;

      if (data.status === "ok") {
        setReport(data);
        writeCache(userId, data);
      } else if (data.status === "daily") {
        setDaily(data);
        writeCache(userId, data);
      }
    });

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [userId, period, selectedStart, request, loadHistory]);

  /* 주소에 #ai-learning-report 가 있으면 이 카드가 보이게 내려감 */
  useEffect(() => {
    if (window.location.hash === `#${AI_REPORT_ANCHOR}`) {
      cardRef.current?.scrollIntoView({ block: "start" });
    }
  }, []);

  const handleCreate = async (mode: "create" | "regenerate") => {
    if (isLoading || !userId) return;

    setIsLoading(true);
    setError(null);
    setNotice(null);

    try {
      const data = await request({ mode, period });

      if ("error" in data) {
        setError(data.error);
      } else if (data.status === "insufficient") {
        setNotice(data.message);
      } else if (data.status === "ok") {
        setReport(data);
        writeCache(userId, data);
        loadHistory();
      } else if (data.status === "daily") {
        setDaily(data);
        writeCache(userId, data);
        loadHistory();
      }
    } catch (caught) {
      console.error("AI 리포트 요청 실패:", caught);
      setError(AI_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const text = PERIOD_TEXT[period];
  const days = period === "day" ? 1 : PERIOD_DAYS[period];

  /* 이번 주 · 이번 달이 아닌 지난 리포트를 보고 있는지 */
  const currentStart = getPeriodStart(period);
  const isPast = selectedStart !== null && selectedStart !== currentStart;

  /* 이 평가 종류로 저장된 리포트의 기간들 (이번 기간은 항상 맨 위에) */
  const savedStarts = history
    .filter((item) => item.period === period && item.start !== currentStart)
    .map((item) => item.start);

  const stats = report?.stats;
  const pronunciation = stats?.avg_pronunciation;

  /* 일별 막대의 높이 기준 (가장 많이 학습한 날) */
  const maxDaily = Math.max(1, ...(stats?.daily ?? []).map((day) => day.count));

  const components: [string, number][] = [];

  if (stats?.components) {
    const { accuracy, completeness, volume } = stats.components;

    if (accuracy !== null) components.push(["정확도", accuracy]);
    if (completeness !== null) components.push(["완성도", completeness]);
    if (volume !== null) components.push(["목소리 크기", volume]);
  }

  const bands = stats?.score_bands
    ? ([
        ["안정", stats.score_bands.stable, styles.bandStable],
        ["연습 중", stats.score_bands.practicing, styles.bandPracticing],
        ["집중 필요", stats.score_bands.needs_focus, styles.bandFocus],
      ] as const)
    : [];

  /* Book · Conversation 분석 (기록이 있는 영역만) */
  const contentAreas: [
    "book" | "conversation",
    string,
    string,
    ContentAnalysis,
  ][] = [];

  if (stats?.content?.book) {
    contentAreas.push(["book", "Book", "이야기", stats.content.book]);
  }

  if (stats?.content?.conversation) {
    contentAreas.push([
      "conversation",
      "Conversation",
      "대화",
      stats.content.conversation,
    ]);
  }

  const tests = stats?.test
    ? (
        [
          ["Phonics", stats.test.phonics],
          ["Conversation", stats.test.conversation],
          ["Reading", stats.test.reading],
        ] as const
      ).filter(([, value]) => value !== null)
    : [];

  return (
    <section
      ref={cardRef}
      id={AI_REPORT_ANCHOR}
      className={styles.card}
      aria-busy={isLoading}
    >
      <div className={styles.header}>
        <span className={styles.headerIcon}>
          <Sparkle size={24} weight="fill" />
        </span>

        <div className={styles.headerText}>
          <h2>AI Learning Coach</h2>
          <p>{text.label} AI Learning Report</p>
        </div>

        {(period === "day" ? daily : report) && !isPast && (
          <button
            type="button"
            className={styles.retryButton}
            onClick={() => handleCreate("regenerate")}
            disabled={isLoading}
          >
            <ArrowsClockwise size={16} weight="bold" />
            다시 생성
          </button>
        )}
      </div>

      {userId && (
        <div className={styles.toolbar}>
          <div className={styles.tabs} role="tablist" aria-label="평가 종류">
            {(Object.keys(PERIOD_TEXT) as CoachPeriod[]).map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={period === item}
                className={`${styles.tab} ${
                  period === item ? styles.tabActive : ""
                }`}
                onClick={() => {
                  setPeriod(item);
                  setSelectedStart(null);
                }}
                disabled={isLoading}
              >
                {PERIOD_TEXT[item].tab}
              </button>
            ))}
          </div>

          <label className={styles.history}>
            <span>리포트 선택</span>

            <select
              value={selectedStart ?? currentStart}
              onChange={(event) =>
                setSelectedStart(
                  event.target.value === currentStart
                    ? null
                    : event.target.value
                )
              }
              disabled={isLoading}
            >
              <option value={currentStart}>
                {text.now} ({formatDate(currentStart)}
                {period === "day" ? "" : "~"})
              </option>

              {savedStarts.map((start) => (
                <option key={start} value={start}>
                  {formatDate(start)}
                  {period === "day" ? "" : "~"} 저장된 리포트
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {userId === undefined ? null : userId === null ? (
        <div className={styles.start}>
          <p className={styles.startText}>
            로그인하면 아이의 학습 기록으로 리포트를 만들어 드려요.
          </p>

          <Link href="/login" className={styles.createButton}>
            로그인하기
          </Link>
        </div>
      ) : isLoading ? (
        <p className={styles.loading} role="status">
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
          학습 기록을 분석하고 있어요...
        </p>
      ) : period === "day" && daily ? (
        <div className={styles.body}>
          {/* 오늘의 숫자 (코드가 계산) */}
          <ul className={styles.stats}>
            <li>
              <TextAa size={20} weight="fill" />
              <span>오늘 연습한 단어</span>
              <strong>
                {daily.stats.words_today}
                <small>개</small>
              </strong>
              <em>발음 확인 {daily.stats.records_today}번</em>
            </li>

            <li>
              <BookOpen size={20} weight="fill" />
              <span>이야기 · 대화</span>
              <strong>
                {(daily.stats.stories_today ?? 0) +
                  (daily.stats.dialogues_today ?? 0)}
                <small>개</small>
              </strong>
              <em>
                Book {daily.stats.stories_today ?? 0} · Conversation{" "}
                {daily.stats.dialogues_today ?? 0}
              </em>
            </li>

            {daily.talk?.available && (
              <li>
                <ChatsCircle size={20} weight="fill" />
                <span>AI Bunny와 말한 횟수</span>
                <strong>
                  {daily.talk.count_today}
                  <small>번</small>
                </strong>
              </li>
            )}

            {daily.stats.avg_today !== null && (
              <li>
                <Microphone size={20} weight="fill" />
                <span>오늘 발음 평균</span>
                <strong>
                  {daily.stats.avg_today}
                  <small>점</small>
                </strong>
                {daily.stats.avg_recent !== null && (
                  <em>
                    최근 7일 {daily.stats.avg_recent}점
                    {daily.stats.change !== null &&
                      daily.stats.change !== 0 &&
                      ` (${daily.stats.change > 0 ? "+" : ""}${
                        daily.stats.change
                      })`}
                  </em>
                )}
              </li>
            )}
          </ul>

          <div className={`${styles.block} ${styles.wide}`}>
            <h3>
              <ChatCircleText size={18} weight="fill" />
              오늘의 평가
            </h3>

            <p className={styles.summary}>{daily.comment}</p>
          </div>

          <div className={`${styles.block} ${styles.wide}`}>
            <h3>
              <ListChecks size={18} weight="fill" />
              내일 할 일
            </h3>

            {daily.tasks.length > 0 ? (
              <ol className={styles.tasks}>
                {daily.tasks.map((task, index) => (
                  <li key={task.href} className={styles.task}>
                    <span className={styles.taskNumber}>{index + 1}</span>

                    <div className={styles.taskBody}>
                      <div className={styles.taskTop}>
                        <strong>{task.word}</strong>

                        <span
                          className={`${styles.taskType} ${
                            styles[`type-${task.type}`]
                          }`}
                        >
                          {TASK_LABEL[task.type]}
                        </span>

                        <em>
                          {task.area === "phonics" && "Phonics · "}
                          {task.area === "conversation" && "Conversation · "}
                          {task.pattern}
                          {task.score !== null &&
                            ` · 평균 ${task.score}점 · ${task.count}번 확인`}
                        </em>
                      </div>

                      <p className={styles.note}>{task.reason}</p>
                    </div>

                    <Link href={task.href} className={styles.taskLink}>
                      연습하기
                      <ArrowRight size={15} weight="bold" />
                    </Link>
                  </li>
                ))}
              </ol>
            ) : (
              <p className={styles.note}>
                학습 데이터의 모든 단어를 연습했습니다. 주간 분석에서 복습할
                단어를 확인해 보세요.
              </p>
            )}
          </div>

          {/* AI Bunny 대화: 아이가 한 말 → 다음에 써 볼 문장 */}
          {daily.talk && (
            <div className={`${styles.block} ${styles.wide}`}>
              <h3>
                <ChatsCircle size={18} weight="fill" />
                AI Bunny 대화
              </h3>

              {daily.talk.comment && (
                <p className={styles.note}>{daily.talk.comment}</p>
              )}

              <div className={styles.talk}>
                <div>
                  <h4>
                    {daily.talk.sentences.length > 0 && !daily.talk.from_today
                      ? "최근 7일 동안 아이가 한 말"
                      : "오늘 아이가 한 말"}
                  </h4>

                  {daily.talk.sentences.length > 0 ? (
                    <ul className={styles.said}>
                      {daily.talk.sentences.map((sentence, index) => (
                        <li key={`${sentence}-${index}`}>{sentence}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.talkEmpty}>
                      {daily.talk.available
                        ? "아직 AI Bunny와 나눈 대화가 없습니다."
                        : "대화 기록을 아직 저장할 수 없어 보여 드릴 수 없습니다."}
                    </p>
                  )}
                </div>

                <div>
                  <h4>다음에 써 볼 문장</h4>

                  <ul className={styles.nextSentences}>
                    {daily.talk.next.map((item) => (
                      <li key={item.sentence}>
                        <strong>{item.sentence}</strong>
                        <span>{item.tip}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/conversation/ai" className={styles.taskLink}>
                    AI Bunny와 대화하기
                    <ArrowRight size={15} weight="bold" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          <p
            className={`${styles.saveState} ${
              daily.saved ? "" : styles.saveStateOff
            }`}
          >
            {daily.saved ? (
              <>
                <CloudCheck size={16} weight="fill" />
                {formatDate(daily.date)} 오늘의 코칭으로 저장됐어요. 언제든 다시
                볼 수 있어요.
              </>
            ) : (
              <>
                <CloudSlash size={16} weight="fill" />
                서버에 저장하지 못했어요. 지금 이 기기에서만 볼 수 있어요.
              </>
            )}
            {!daily.usedAi &&
              " AI 글을 불러오지 못해 기록을 바탕으로 한 기본 안내를 보여 드려요."}
          </p>
        </div>
      ) : period !== "day" && report && stats ? (
        <div className={styles.body}>
          {/* 코드가 집계한 숫자 */}
          <ul className={styles.stats}>
            {stats.practice_days !== null && (
              <li>
                <CalendarCheck size={20} weight="fill" />
                <span>학습한 날</span>
                <strong>
                  {stats.practice_days}
                  <small>/ {stats.period_days ?? days}일</small>
                </strong>
              </li>
            )}

            {stats.words_practiced !== null && (
              <li>
                <TextAa size={20} weight="fill" />
                <span>연습한 단어</span>
                <strong>
                  {stats.words_practiced}
                  <small>개</small>
                </strong>
              </li>
            )}

            {pronunciation?.this_week != null && (
              <li>
                <Microphone size={20} weight="fill" />
                <span>발음 평균</span>
                <strong>
                  {pronunciation.this_week}
                  <small>점</small>
                </strong>
                {pronunciation.last_week !== null && (
                  <em>
                    {text.previous} {pronunciation.last_week}점
                    {pronunciation.change !== null &&
                      pronunciation.change !== 0 &&
                      ` (${pronunciation.change > 0 ? "+" : ""}${
                        pronunciation.change
                      })`}
                  </em>
                )}
              </li>
            )}

            {tests.length > 0 && (
              <li>
                <ChartLineUp size={20} weight="fill" />
                <span>Test 정답률</span>
                <em className={styles.testList}>
                  {tests.map(([label, value]) => (
                    <b key={label}>
                      {label} {value}%
                    </b>
                  ))}
                </em>
              </li>
            )}
          </ul>

          {/* 학습 데이터 분석: 모두 코드가 계산한 값 */}
          <div className={`${styles.block} ${styles.wide}`}>
            <h3>
              <ChartBar size={18} weight="fill" />
              학습 데이터 분석
            </h3>

            <div className={styles.charts}>
              {stats.daily && (
                <div className={styles.chart}>
                  <h4>최근 {stats.daily.length}일 학습 활동</h4>

                  <ol
                    className={`${styles.days} ${
                      stats.daily.length > 10 ? styles.daysDense : ""
                    }`}
                    style={
                      {
                        "--day-count": stats.daily.length,
                      } as React.CSSProperties
                    }
                  >
                    {stats.daily.map((day) => (
                      <li key={day.date}>
                        <b>{day.count > 0 ? day.count : ""}</b>
                        <i
                          style={{
                            height: `${Math.round(
                              (day.count / maxDaily) * 100
                            )}%`,
                          }}
                        />
                        <span>{day.date.replace("-", "/")}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {stats.areas && (
                <div className={styles.chart}>
                  <h4>영역별 발음 평균</h4>

                  <ul className={styles.meters}>
                    {stats.areas.map((item) => (
                      <li key={item.area}>
                        <span>{item.area}</span>
                        <i>
                          <u style={{ width: `${item.this_week}%` }} />
                        </i>
                        <b>{item.this_week}</b>
                        <em>
                          {item.last_week !== null
                            ? `${text.previous} ${item.last_week}점 · `
                            : ""}
                          {item.count}번 확인
                        </em>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {components.length > 0 && (
                <div className={styles.chart}>
                  <h4>발음 구성 요소</h4>

                  <ul className={styles.meters}>
                    {components.map(([label, value]) => (
                      <li key={label}>
                        <span>{label}</span>
                        <i>
                          <u style={{ width: `${value}%` }} />
                        </i>
                        <b>{value}</b>
                      </li>
                    ))}
                  </ul>

                  {bands.length > 0 && (
                    <>
                      <h4 className={styles.subHeading}>단어 수준 분포</h4>

                      <div className={styles.bandBar}>
                        {bands
                          .filter(([, count]) => count > 0)
                          .map(([label, count, className]) => (
                            <i
                              key={label}
                              className={className}
                              style={{ flexGrow: count }}
                            />
                          ))}
                      </div>

                      <ul className={styles.bandLegend}>
                        {bands.map(([label, count, className]) => (
                          <li key={label}>
                            <i className={className} />
                            {label} {count}개
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Book 이야기 · Conversation 대화: 잘한 것 · 더 연습할 것 */}
          {contentAreas.length > 0 && (
            <div className={`${styles.block} ${styles.wide}`}>
              <h3>
                <BookOpen size={18} weight="fill" />
                Book · Conversation 분석
              </h3>

              <div className={styles.contentAreas}>
                {contentAreas.map(([area, label, unitName, detail]) => (
                  <div key={area} className={styles.contentArea}>
                    <div className={styles.contentHead}>
                      <strong>{label}</strong>
                      <span>
                        {unitName} {detail.practiced}개 · 평균 {detail.avg}점
                      </span>
                    </div>

                    {report.report.content_notes?.[area] && (
                      <p className={styles.contentNote}>
                        {report.report.content_notes[area]}
                      </p>
                    )}

                    {detail.strong.length > 0 && (
                      <>
                        <h4 className={styles.goodText}>잘한 {unitName}</h4>

                        <ul className={styles.evidence}>
                          {detail.strong.map((item) => (
                            <li key={item.title}>
                              <b>{item.title}</b>
                              <span>
                                {item.unit} · 평균 {item.score}점
                              </span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    {detail.weak.length > 0 && (
                      <>
                        <h4>더 연습하면 좋은 {unitName}</h4>

                        <ul className={styles.evidence}>
                          {detail.weak.map((item) => {
                            const href = report.wordLinks[`${area}:${item.title}`];

                            return (
                              <li key={item.title}>
                                {href ? (
                                  <Link href={href} className={styles.itemLink}>
                                    {item.title}
                                    <ArrowRight size={13} weight="bold" />
                                  </Link>
                                ) : (
                                  <b>{item.title}</b>
                                )}
                                <span>
                                  {item.unit} · 평균 {item.score}점 ·{" "}
                                  {item.count}번 연습
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </>
                    )}

                    {(detail.weak_sentences?.length ?? 0) > 0 && (
                      <>
                        <h4>더 연습하면 좋은 문장</h4>

                        <ul className={styles.sentences}>
                          {detail.weak_sentences!.map((item) => (
                            <li key={`${item.title}-${item.sentence}`}>
                              <b>{item.sentence}</b>
                              <span>
                                {item.title} · 평균 {item.score}점 ·{" "}
                                {item.count}번 녹음
                              </span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    {(detail.strong_sentences?.length ?? 0) > 0 && (
                      <>
                        <h4 className={styles.goodText}>잘 말한 문장</h4>

                        <ul className={styles.sentences}>
                          {detail.strong_sentences!.map((item) => (
                            <li key={`${item.title}-${item.sentence}`}>
                              <b>{item.sentence}</b>
                              <span>
                                {item.title} · 평균 {item.score}점
                              </span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    {detail.improved.length > 0 && (
                      <>
                        <h4 className={styles.goodText}>
                          다시 연습해서 오른 {unitName}
                        </h4>

                        <ul className={styles.evidence}>
                          {detail.improved.map((item) => (
                            <li key={item.title}>
                              <b>{item.title}</b>
                              <span className={styles.up}>
                                {item.from}점
                                <ArrowUp size={13} weight="bold" />
                                {item.to}점
                              </span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={`${styles.block} ${styles.wide}`}>
            <h3>
              <Sparkle size={18} weight="fill" />
              {text.now} 학습 분석
            </h3>

            <p className={styles.summary}>{report.report.summary}</p>
          </div>

          {report.report.analysis.strength && (
            <div className={styles.block}>
              <h3 className={styles.good}>
                <ThumbsUp size={18} weight="fill" />
                강점
              </h3>

              <p className={styles.note}>{report.report.analysis.strength}</p>

              {stats.improved_words && (
                <ul className={styles.evidence}>
                  {stats.improved_words.map((item) => (
                    <li key={item.word}>
                      <b>{item.word}</b>
                      <span className={styles.up}>
                        {item.from}점
                        <ArrowUp size={13} weight="bold" />
                        {item.to}점
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {report.report.analysis.improvement && (
            <div className={styles.block}>
              <h3>
                <Wrench size={18} weight="fill" />
                보완하면 좋은 점
              </h3>

              <p className={styles.note}>
                {report.report.analysis.improvement}
              </p>
            </div>
          )}

          <div className={styles.block}>
            <h3>
              <Target size={18} weight="fill" />
              {text.next} 맞춤 학습
            </h3>

            <p className={styles.focus}>{report.report.next_week.focus}</p>

            {report.report.next_week.words.length > 0 && (
              <ul className={styles.chips}>
                {report.report.next_week.words.map((word) => {
                  const href = report.wordLinks[word];

                  return (
                    <li key={word}>
                      {href ? (
                        <Link href={href} className={styles.chip}>
                          {word}
                        </Link>
                      ) : (
                        <span className={styles.chip}>{word}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            {/* 왜 이 단어인지: 집계한 평균 점수와 연습 횟수 */}
            {stats.weak_words && (
              <ul className={styles.evidence}>
                {stats.weak_words.map((item) => (
                  <li key={item.word}>
                    <b>{item.word}</b>
                    <span>
                      평균 {item.score}점 · {item.count}번 연습
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {/* 함께 다시 할 이야기 · 대화 */}
            {contentAreas.some(([, , , detail]) => detail.next) && (
              <ul className={styles.evidence}>
                {contentAreas.map(([area, label, , detail]) => {
                  if (!detail.next) return null;

                  const href = report.wordLinks[`${area}:${detail.next}`];

                  return (
                    <li key={area}>
                      {href ? (
                        <Link href={href} className={styles.itemLink}>
                          {detail.next}
                          <ArrowRight size={13} weight="bold" />
                        </Link>
                      ) : (
                        <b>{detail.next}</b>
                      )}
                      <span>{label} · 다시 연습</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className={styles.column}>
            <div className={styles.block}>
              <h3>
                <Lightbulb size={18} weight="fill" />
                추천 이유
              </h3>

              <p className={styles.note}>{report.report.next_week.reason}</p>
            </div>

            <div className={styles.block}>
              <h3>
                <House size={18} weight="fill" />
                Home Learning Tip
              </h3>

              <p className={styles.note}>{report.report.home_tip}</p>
            </div>
          </div>

          <p
            className={`${styles.saveState} ${
              report.saved ? "" : styles.saveStateOff
            }`}
          >
            {report.saved ? (
              <>
                <CloudCheck size={16} weight="fill" />
                {formatDate(report.weekStart)} 시작 {text.tab} 리포트로
                저장됐어요.
                언제든 다시 볼 수 있어요.
              </>
            ) : (
              <>
                <CloudSlash size={16} weight="fill" />
                리포트를 서버에 저장하지 못했어요. 지금 이 기기에서만 볼 수
                있어요.
              </>
            )}
          </p>
        </div>
      ) : (
        <div className={styles.start}>
          <p className={styles.startText}>
            {isPast
              ? "이 기간의 리포트를 불러오지 못했어요."
              : (notice ??
                (period === "day"
                  ? "오늘의 학습 기록과 AI Bunny 대화를 보고, 내일 무엇을 하고 어떤 문장으로 말하면 좋을지 알려 드려요."
                  : `최근 ${days}일의 학습 기록을 분석해서 ${text.next}에 복습할 단어를 추천해 드려요.`))}
          </p>

          {!isPast && (
            <button
              type="button"
              className={styles.createButton}
              onClick={() => handleCreate("create")}
            >
              <Sparkle size={18} weight="fill" />
              {period === "day" ? "오늘의 코칭 받기" : `${text.tab} 리포트 생성`}
            </button>
          )}
        </div>
      )}

      {error && !isLoading && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <ol className={styles.pipeline} aria-label="분석 과정">
        {PIPELINE.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </section>
  );
}
