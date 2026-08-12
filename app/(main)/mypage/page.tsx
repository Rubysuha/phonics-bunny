"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { bunnySkins } from "../shop/data";
import { getMyPageStats, MyPageStats } from "@/lib/mypageStats";
import styles from "./mypage.module.css";

type Profile = {
  email: string | null;
  created_at: string | null;
  bunny_name: string | null;
  coins: number | null;
  selected_bunny_id: string | null;
};

type CoinLog = {
  id: number;
  created_at: string;
  type: "earn" | "spend" | string | null;
  amount: number | null;
  reason: string | null;
};

type LearningLog = {
  id: number;
  created_at: string;
  category: string | null;
  title: string | null;
  action: string | null;
};

const TREND_LABELS: Record<string, string> = {
  alphabet: "Alphabet",
  "short-vowels": "Short Vowels",
  "short-vowel": "Short Vowels",
  "sight-words": "Sight Words",
  "sight-word": "Sight Words",
  "long-vowels": "Long Vowels",
  "long-vowel": "Long Vowels",
  "blend-sounds": "Blend Sounds",
  blend: "Blend Sounds",
  book: "Book",
  conversation: "Conversation",
};

function getTrendLabel(contentType: string) {
  return TREND_LABELS[contentType] ?? contentType;
}

function TrendChart({ points }: { points: number[] }) {
  const width = 620;
  const height = 170;
  const padding = 10;

  if (points.length === 0) {
    return (
      <div className={styles.trendEmpty}>
        아직 발음 점수 기록이 없어요.
      </div>
    );
  }

  if (points.length === 1) {
    return (
      <div className={styles.trendEmpty}>
        기록을 한 번 더 쌓으면 점수 변화가 표시돼요.
      </div>
    );
  }

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const stepX = chartWidth / (points.length - 1);

  const getX = (index: number) => padding + index * stepX;

  const getY = (score: number) => {
    const safeScore = Math.min(100, Math.max(0, score));

    return (
      height -
      padding -
      (safeScore / 100) * chartHeight
    );
  };

  const coords = points.map(
    (score, index) => `${getX(index)},${getY(score)}`
  );

  return (
    <div className={styles.trendChartWrap}>
      <div className={styles.trendScale}>
        <span>100</span>
        <span>50</span>
        <span>0</span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={styles.trendSvg}
        preserveAspectRatio="none"
        aria-label="발음 점수 변화 그래프"
      >
        {[25, 50, 75].map((value) => {
          const y = getY(value);

          return (
            <line
              key={value}
              x1={padding}
              x2={width - padding}
              y1={y}
              y2={y}
              className={styles.trendGridLine}
            />
          );
        })}

        <polyline
          points={coords.join(" ")}
          className={styles.trendLine}
        />

        {points.map((score, index) => {
          const x = getX(index);
          const y = getY(score);

          return (
            <g key={`${score}-${index}`}>
              <circle
                cx={x}
                cy={y}
                r={7}
                className={styles.trendDotOuter}
              />

              <circle
                cx={x}
                cy={y}
                r={3.5}
                className={styles.trendDot}
              />
            </g>
          );
        })}
      </svg>

      <div className={styles.trendBottomLabel}>
        최근 {points.length}회 기록
      </div>
    </div>
  );
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatSelectedDateLabel(dateKey: string) {
  const date = new Date(dateKey);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isSameDay(date, today)) {
    return "오늘";
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, yesterday)) {
    return "어제";
  }

  return date.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

function buildLogMapByDate<
  T extends { created_at: string }
>(items: T[]) {
  const map = new Map<string, T[]>();

  items.forEach((item) => {
    const key = new Date(
      item.created_at
    ).toDateString();

    const currentItems = map.get(key) ?? [];

    currentItems.push(item);
    map.set(key, currentItems);
  });

  return map;
}

const WEEKDAY_LABELS = [
  "일",
  "월",
  "화",
  "수",
  "목",
  "금",
  "토",
];

function getMonthGrid(
  year: number,
  month: number
): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const startWeekday = firstDay.getDay();

  const cells: (Date | null)[] = [];

  for (let i = 0; i < startWeekday; i++) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(year, month, day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

function LearningRow({
  log,
}: {
  log: LearningLog;
}) {
  return (
    <div className={styles.sleekRow}>
      <div className={styles.sleekRowMain}>
        <span className={styles.sleekRowTitle}>
          {log.title ?? "학습 활동"}
        </span>

        <span className={styles.sleekRowMeta}>
          <span className={styles.sleekTag}>
            {log.category ?? "learning"}
          </span>

          {log.action ?? "학습함"}
        </span>
      </div>

      <span className={styles.sleekTime}>
        {formatTime(log.created_at)}
      </span>
    </div>
  );
}

function CoinRow({ log }: { log: CoinLog }) {
  const isEarn = log.type === "earn";

  return (
    <div className={styles.sleekRow}>
      <div className={styles.sleekRowMain}>
        <span className={styles.sleekRowTitle}>
          {log.reason ?? "코인 기록"}
        </span>

        <span className={styles.sleekRowMeta}>
          {formatTime(log.created_at)}
        </span>
      </div>

      <span
        className={`${styles.sleekAmount} ${
          isEarn
            ? styles.sleekEarn
            : styles.sleekSpend
        }`}
      >
        {isEarn ? "+" : "-"}
        {log.amount ?? 0}
      </span>
    </div>
  );
}

export default function MyPage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [coinLogs, setCoinLogs] = useState<
    CoinLog[]
  >([]);

  const [learningLogs, setLearningLogs] =
    useState<LearningLog[]>([]);

  const [stats, setStats] =
    useState<MyPageStats | null>(null);

  const [activeTab, setActiveTab] = useState<
    "learning" | "coin"
  >("learning");

  const [selectedTrendType, setSelectedTrendType] =
    useState("");

  const [calendarMonth, setCalendarMonth] =
    useState(() => {
      const date = new Date();

      date.setDate(1);
      date.setHours(0, 0, 0, 0);

      return date;
    });

  const [selectedDateKey, setSelectedDateKey] =
    useState(() => new Date().toDateString());

  const [isEditingName, setIsEditingName] =
    useState(false);

  const [editBunnyName, setEditBunnyName] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchMyPageData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);

      const {
        data: profileData,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select(
          "email, created_at, bunny_name, coins, selected_bunny_id"
        )
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error(
          "프로필 불러오기 실패:",
          profileError
        );
      }

      const {
        data: logsData,
        error: logsError,
      } = await supabase
        .from("coin_logs")
        .select(
          "id, created_at, type, amount, reason"
        )
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (logsError) {
        console.error(
          "코인 기록 불러오기 실패:",
          logsError
        );
      }

      const {
        data: learningData,
        error: learningError,
      } = await supabase
        .from("learning_logs")
        .select(
          "id, created_at, category, title, action"
        )
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (learningError) {
        console.error(
          "학습 기록 불러오기 실패:",
          learningError
        );
      }

      const statsData =
        await getMyPageStats(user.id);

      setProfile(profileData);
      setEditBunnyName(
        profileData?.bunny_name ?? ""
      );

      setCoinLogs(logsData ?? []);
      setLearningLogs(learningData ?? []);
      setStats(statsData);
      setLoading(false);
    };

    fetchMyPageData();
  }, [router]);

  const handleSaveBunnyName = async () => {
    if (!userId) {
      return;
    }

    if (!editBunnyName.trim()) {
      alert("토끼 이름을 입력해 주세요.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        bunny_name: editBunnyName.trim(),
      })
      .eq("id", userId);

    if (error) {
      console.error(
        "토끼 이름 수정 실패:",
        error
      );

      alert("토끼 이름 수정에 실패했어요.");

      setSaving(false);
      return;
    }

    setProfile((previousProfile) =>
      previousProfile
        ? {
            ...previousProfile,
            bunny_name: editBunnyName.trim(),
          }
        : previousProfile
    );

    setSaving(false);
    setIsEditingName(false);
  };

  const handleCancelEditName = () => {
    setEditBunnyName(
      profile?.bunny_name ?? ""
    );

    setIsEditingName(false);
  };

  const goPrevMonth = () => {
    setCalendarMonth((previousMonth) => {
      const nextMonth = new Date(
        previousMonth
      );

      nextMonth.setMonth(
        nextMonth.getMonth() - 1
      );

      return nextMonth;
    });
  };

  const goNextMonth = () => {
    setCalendarMonth((previousMonth) => {
      const nextMonth = new Date(
        previousMonth
      );

      nextMonth.setMonth(
        nextMonth.getMonth() + 1
      );

      return nextMonth;
    });
  };

  const learningByDate = useMemo(
    () => buildLogMapByDate(learningLogs),
    [learningLogs]
  );

  const coinByDate = useMemo(
    () => buildLogMapByDate(coinLogs),
    [coinLogs]
  );

  const activeByDate =
    activeTab === "learning"
      ? learningByDate
      : coinByDate;

  const monthGrid = useMemo(
    () =>
      getMonthGrid(
        calendarMonth.getFullYear(),
        calendarMonth.getMonth()
      ),
    [calendarMonth]
  );

  const selectedItems =
    activeByDate.get(selectedDateKey) ?? [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isCurrentMonth =
    calendarMonth.getFullYear() ===
      today.getFullYear() &&
    calendarMonth.getMonth() ===
      today.getMonth();

  const selectedBunny =
    bunnySkins.find(
      (bunny) =>
        bunny.id ===
        profile?.selected_bunny_id
    ) ??
    bunnySkins.find(
      (bunny) =>
        bunny.id === "basic_bunny"
    );

  const defaultTrendType =
    stats?.sectionTrends?.[0]
      ?.contentType ?? "";

  const currentTrendType =
    selectedTrendType || defaultTrendType;

  const activeTrend =
    stats?.sectionTrends.find(
      (trend) =>
        trend.contentType ===
        currentTrendType
    ) ??
    stats?.sectionTrends?.[0] ??
    null;

  if (loading) {
    return (
      <section className={styles.page}>
        <div className={styles.loadingBox}>
          불러오는 중...
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <button
        type="button"
        className={styles.backButton}
        onClick={() =>
          router.push("/dashboard")
        }
        aria-label="대시보드로 돌아가기"
      >
        ←
      </button>

      <div className={styles.header}>
        <h1>My Page</h1>

        <p>
          나의 학습 현황과 발음 기록을
          확인해요.
        </p>
      </div>

      <div className={styles.topLayout}>
        <div className={styles.profileCard}>
          <div className={styles.bunnyImageBox}>
            {selectedBunny && (
              <img
                src={selectedBunny.image}
                alt={selectedBunny.name}
              />
            )}
          </div>

          <div className={styles.profileInfo}>
            <div className={styles.profileTopRow}>
              <div>
                <div className={styles.label}>
                  Bunny Name
                </div>

                <div
                  className={
                    styles.bunnyNameRow
                  }
                >
                  <h2>
                    {profile?.bunny_name ??
                      "My Bunny"}
                  </h2>

                  {!isEditingName && (
                    <button
                      type="button"
                      className={
                        styles.editIconButton
                      }
                      onClick={() =>
                        setIsEditingName(true)
                      }
                      aria-label="토끼 이름 수정"
                    >
                      ✎
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.coinPill}>
                <span>🥕</span>

                <strong>
                  {profile?.coins ?? 0}
                </strong>
              </div>
            </div>

            {isEditingName && (
              <div
                className={
                  styles.editNameInline
                }
              >
                <input
                  value={editBunnyName}
                  onChange={(event) =>
                    setEditBunnyName(
                      event.target.value
                    )
                  }
                  placeholder="토끼 이름을 입력하세요"
                  autoFocus
                />

                <button
                  type="button"
                  onClick={
                    handleSaveBunnyName
                  }
                  disabled={saving}
                >
                  {saving
                    ? "저장 중"
                    : "저장"}
                </button>

                <button
                  type="button"
                  className={
                    styles.editCancelButton
                  }
                  onClick={
                    handleCancelEditName
                  }
                  disabled={saving}
                >
                  취소
                </button>
              </div>
            )}

            <div
              className={
                styles.profileMetaGrid
              }
            >
              <div
                className={
                  styles.profileMetaItem
                }
              >
                <span>현재 토끼</span>

                <strong>
                  {selectedBunny?.name ??
                    "Basic Bunny"}
                </strong>
              </div>

              <div
                className={
                  styles.profileMetaItem
                }
              >
                <span>가입일</span>

                <strong>
                  {profile?.created_at
                    ? new Date(
                        profile.created_at
                      ).toLocaleDateString(
                        "ko-KR"
                      )
                    : "-"}
                </strong>
              </div>

              <div
                className={`${styles.profileMetaItem} ${styles.emailMetaItem}`}
              >
                <span>이메일</span>

                <strong>
                  {profile?.email ?? "-"}
                </strong>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>
              연속 학습
            </span>

            <div
              className={
                styles.statValueRow
              }
            >
              <strong>
                {stats?.streakDays ?? 0}
              </strong>

              <span>일</span>
            </div>

            <p>꾸준히 학습한 날짜예요.</p>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>
              평균 발음 점수
            </span>

            <div
              className={
                styles.statValueRow
              }
            >
              <strong>
                {stats?.overallAvgScore !=
                null
                  ? stats.overallAvgScore
                  : "-"}
              </strong>

              {stats?.overallAvgScore !=
                null && <span>점</span>}
            </div>

            <p>
              전체 발음 기록의 평균이에요.
            </p>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>
              이번 주 학습
            </span>

            <div
              className={
                styles.statValueRow
              }
            >
              <strong>
                {stats?.weekLearningCount ??
                  0}
              </strong>

              <span>개</span>
            </div>

            <p>
              이번 주 완료한 학습 수예요.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.analysisGrid}>
        <div className={styles.logCard}>
          <div className={styles.logHeader}>
            <div>
              <h2>발음 점수 변화</h2>

              <p>
                최근 분석 결과를 영역별로
                확인해요.
              </p>
            </div>

            {activeTrend && (
              <div
                className={
                  styles.latestScore
                }
              >
                <span>최근 평균</span>

                <strong>
                  {activeTrend.latestAvg}

                  <small>점</small>
                </strong>
              </div>
            )}
          </div>

          {!stats ||
          stats.sectionTrends.length === 0 ? (
            <div className={styles.emptyBox}>
              아직 발음 분석 기록이 없어요.
              <br />
              학습 화면에서 발음을 분석하면
              기록이 쌓여요.
            </div>
          ) : (
            <>
              <div
                className={
                  styles.trendTabRow
                }
              >
                {stats.sectionTrends.map(
                  (trend) => {
                    const isActive =
                      trend.contentType ===
                      currentTrendType;

                    return (
                      <button
                        type="button"
                        key={
                          trend.contentType
                        }
                        className={`${styles.trendTabButton} ${
                          isActive
                            ? styles.trendTabButtonActive
                            : ""
                        }`}
                        onClick={() =>
                          setSelectedTrendType(
                            trend.contentType
                          )
                        }
                      >
                        {getTrendLabel(
                          trend.contentType
                        )}
                      </button>
                    );
                  }
                )}
              </div>

              {activeTrend && (
                <TrendChart
                  points={
                    activeTrend.points
                  }
                />
              )}
            </>
          )}
        </div>

        <div className={styles.logCard}>
          <div className={styles.logHeader}>
            <div>
              <h2>단어 분석</h2>

              <p>
                자주 연습한 단어와 취약
                단어예요.
              </p>
            </div>
          </div>

          <div
            className={
              styles.wordSummaryList
            }
          >
            <div
              className={
                styles.wordSummarySection
              }
            >
              <div
                className={
                  styles.wordSummaryTitle
                }
              >
                <span
                  className={`${styles.summaryDot} ${styles.practiceDot}`}
                />

                가장 많이 연습한 단어
              </div>

              <div className={styles.wordList}>
                {!stats ||
                stats.mostPracticedWords
                  .length === 0 ? (
                  <div
                    className={
                      styles.wordListEmpty
                    }
                  >
                    아직 기록이 없어요.
                  </div>
                ) : (
                  stats.mostPracticedWords.map(
                    (item, index) => (
                      <div
                        key={item.word}
                        className={
                          styles.wordListItem
                        }
                      >
                        <div>
                          <span
                            className={
                              styles.wordListNumber
                            }
                          >
                            {index + 1}
                          </span>

                          <strong>
                            {item.word}
                          </strong>
                        </div>

                        <span>
                          {item.count}회
                        </span>
                      </div>
                    )
                  )
                )}
              </div>
            </div>

            <div
              className={styles.wordDivider}
            />

            <div
              className={
                styles.wordSummarySection
              }
            >
              <div
                className={
                  styles.wordSummaryTitle
                }
              >
                <span
                  className={`${styles.summaryDot} ${styles.weakDot}`}
                />

                집중 연습이 필요한 단어
              </div>

              <div className={styles.wordList}>
                {!stats ||
                stats.weakWords.length ===
                  0 ? (
                  <div
                    className={
                      styles.wordListEmpty
                    }
                  >
                    취약 단어가 없어요.
                  </div>
                ) : (
                  stats.weakWords.map(
                    (item, index) => (
                      <div
                        key={item.word}
                        className={
                          styles.wordListItem
                        }
                      >
                        <div>
                          <span
                            className={
                              styles.wordListNumber
                            }
                          >
                            {index + 1}
                          </span>

                          <strong>
                            {item.word}
                          </strong>
                        </div>

                        <span
                          className={
                            styles.weakScore
                          }
                        >
                          {item.avgScore}점
                        </span>
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`${styles.logCard} ${styles.activityCard}`}
      >
        <div className={styles.tabRowSleek}>
          <button
            type="button"
            className={`${styles.tabButtonSleek} ${
              activeTab === "learning"
                ? styles.tabButtonSleekActive
                : ""
            }`}
            onClick={() =>
              setActiveTab("learning")
            }
          >
            학습 기록

            <span>
              {learningLogs.length}
            </span>
          </button>

          <button
            type="button"
            className={`${styles.tabButtonSleek} ${
              activeTab === "coin"
                ? styles.tabButtonSleekActive
                : ""
            }`}
            onClick={() =>
              setActiveTab("coin")
            }
          >
            코인 기록

            <span>{coinLogs.length}</span>
          </button>
        </div>

        <div
          className={styles.activityLayout}
        >
          <div
            className={styles.calendarSide}
          >
            <div
              className={styles.calendarHeader}
            >
              <button
                type="button"
                className={
                  styles.calendarNavButton
                }
                onClick={goPrevMonth}
                aria-label="이전 달"
              >
                ‹
              </button>

              <span>
                {calendarMonth.getFullYear()}
                년{" "}
                {calendarMonth.getMonth() +
                  1}
                월
              </span>

              <button
                type="button"
                className={
                  styles.calendarNavButton
                }
                onClick={goNextMonth}
                disabled={isCurrentMonth}
                aria-label="다음 달"
              >
                ›
              </button>
            </div>

            <div
              className={
                styles.calendarWeekdays
              }
            >
              {WEEKDAY_LABELS.map(
                (label) => (
                  <span key={label}>
                    {label}
                  </span>
                )
              )}
            </div>

            <div
              className={
                styles.calendarGrid
              }
            >
              {monthGrid.map(
                (date, index) => {
                  if (!date) {
                    return (
                      <span
                        key={`empty-${index}`}
                        className={
                          styles.calendarCellEmpty
                        }
                      />
                    );
                  }

                  const key =
                    date.toDateString();

                  const count =
                    activeByDate.get(key)
                      ?.length ?? 0;

                  const isToday =
                    isSameDay(date, today);

                  const isSelected =
                    key === selectedDateKey;

                  const isFuture =
                    date.getTime() >
                    today.getTime();

                  return (
                    <button
                      type="button"
                      key={key}
                      className={`${styles.calendarCell} ${
                        isToday
                          ? styles.calendarCellToday
                          : ""
                      } ${
                        isSelected
                          ? styles.calendarCellSelected
                          : ""
                      }`}
                      onClick={() =>
                        setSelectedDateKey(
                          key
                        )
                      }
                      disabled={isFuture}
                      aria-label={`${
                        date.getMonth() + 1
                      }월 ${date.getDate()}일`}
                    >
                      <span
                        className={
                          styles.calendarCellDay
                        }
                      >
                        {date.getDate()}
                      </span>

                      {count > 0 && (
                        <span
                          className={
                            styles.calendarCellCount
                          }
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                }
              )}
            </div>

            <div
              className={
                styles.calendarHelp
              }
            >
              숫자는 해당 날짜의 기록 수예요.
            </div>
          </div>

          <div className={styles.recordSide}>
            <div
              className={
                styles.calendarSelectedHeader
              }
            >
              <div>
                <span>선택한 날짜</span>

                <strong>
                  {formatSelectedDateLabel(
                    selectedDateKey
                  )}
                </strong>
              </div>

              <span
                className={
                  styles.recordCount
                }
              >
                {selectedItems.length}건
              </span>
            </div>

            {selectedItems.length === 0 ? (
              <div
                className={
                  styles.recordEmpty
                }
              >
                <strong>
                  이 날짜에는 기록이 없어요.
                </strong>

                <span>
                  학습을 완료하면 기록이 이곳에
                  표시돼요.
                </span>
              </div>
            ) : (
              <div className={styles.sleekList}>
                {selectedItems.map(
                  (log: any) =>
                    activeTab ===
                    "learning" ? (
                      <LearningRow
                        key={log.id}
                        log={log}
                      />
                    ) : (
                      <CoinRow
                        key={log.id}
                        log={log}
                      />
                    )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}