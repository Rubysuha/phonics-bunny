"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CaretLeft,
  CaretRight,
  User,
  PencilSimple,
  Coins,
  ChatCircle,
  Trash,
  MagnifyingGlass,
  Camera,
  X,
  BookOpen,
  Question,
  Sparkle,
  MapPin,
  Heart,
  ListBullets,
  CalendarBlank,
} from "@phosphor-icons/react";
import { supabase } from "@/lib/supabase";
import styles from "./my.module.css";
import {
  communityCategories,
  type CommunityCategoryId,
} from "../data";
import {
  categoryColor,
  categoryTint,
  DEFAULT_CATEGORY_COLOR,
  DEFAULT_CATEGORY_TINT,
} from "../categoryTheme";

type MyPost = {
  id: number;
  title: string;
  content: string;
  category: CommunityCategoryId;
  image_url: string | null;
  created_at: string;
  likes: number;
};

type MyComment = {
  id: number;
  post_id: number;
  content: string;
  created_at: string;
};

type MyLike = {
  id: number;
  post_id: number;
  created_at: string;
};

type RelatedPost = {
  title: string;
  content: string;
  image_url: string | null;
  category: CommunityCategoryId;
};

type Profile = {
  bunny_name: string | null;
  coins: number | null;
  avatar_url: string | null;
};

const categoryIcon: Record<CommunityCategoryId, React.ElementType> = {
  "study-proof": Camera,
  "english-tip": BookOpen,
  "question": Question,
  "bunny-proud": Sparkle,
  "local-recommend": MapPin,
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

// date-key helpers built from LOCAL date parts only, so we never get an
// off-by-one from converting to ISO/UTC (KST is always ahead of UTC)
const dateKeyFromDate = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const dateKeyFromString = (dateStr: string) => dateKeyFromDate(new Date(dateStr));

type CalendarCell = { day: number; key: string; year: number; month: number };

export default function CommunityMyPage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [posts, setPosts] = useState<MyPost[]>([]);
  const [comments, setComments] = useState<MyComment[]>([]);
  const [likes, setLikes] = useState<MyLike[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<Record<number, RelatedPost>>({});
  const [activeTab, setActiveTab] = useState<"posts" | "comments" | "likes">(
    "posts"
  );
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CommunityCategoryId | "all">("all");

  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const selectedDateKey = useMemo(() => dateKeyFromDate(selectedDate), [selectedDate]);
  const todayKey = useMemo(() => dateKeyFromDate(new Date()), []);

  // reset search/category (not the calendar) when switching tabs
  const handleTabClick = (tab: "posts" | "comments" | "likes") => {
    setActiveTab(tab);
    setKeyword("");
    setCategoryFilter("all");
  };

  const totalActivity = useMemo(
    () => posts.length + comments.length + likes.length,
    [posts, comments, likes]
  );

  const fetchMyData = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setUserId(user.id);

    const { data: profileData } = await supabase
      .from("profiles")
      .select("bunny_name, coins, avatar_url")
      .eq("id", user.id)
      .single();

    const { data: postData, error: postError } = await supabase
      .from("community_posts")
      .select("id, title, content, category, image_url, created_at, likes")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const { data: commentData, error: commentError } = await supabase
      .from("community_comments")
      .select("id, post_id, content, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const { data: likeData, error: likeError } = await supabase
      .from("community_likes")
      .select("id, post_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (postError) console.error("내 글 불러오기 실패:", postError.message);
    if (commentError) console.error("내 댓글 불러오기 실패:", commentError.message);
    if (likeError) console.error("좋아요 불러오기 실패:", likeError.message);

    const myPosts = (postData as MyPost[]) || [];
    const myComments = (commentData as MyComment[]) || [];
    const myLikes = (likeData as MyLike[]) || [];

    // fetch the actual post info for every comment/like so the list can show
    // a real title/thumbnail instead of a generic placeholder
    const neededPostIds = Array.from(
      new Set([
        ...myComments.map((c) => c.post_id),
        ...myLikes.map((l) => l.post_id),
      ])
    );

    if (neededPostIds.length > 0) {
      const { data: relatedData, error: relatedError } = await supabase
        .from("community_posts")
        .select("id, title, content, image_url, category")
        .in("id", neededPostIds);

      if (relatedError) {
        console.error("연관 게시글 불러오기 실패:", relatedError.message);
      } else {
        const map: Record<number, RelatedPost> = {};
        (relatedData || []).forEach((post: {
          id: number;
          title: string;
          content: string;
          image_url: string | null;
          category: CommunityCategoryId;
        }) => {
          map[post.id] = {
            title: post.title,
            content: post.content,
            image_url: post.image_url,
            category: post.category,
          };
        });
        setRelatedPosts(map);
      }
    }

    setProfile(profileData);
    setPosts(myPosts);
    setComments(myComments);
    setLikes(myLikes);
    setLoading(false);
  };

  useEffect(() => {
    fetchMyData();
  }, []);

  const handleDeletePost = async (postId: number) => {
    if (!userId) return;

    const ok = confirm(
      "정말 이 게시글을 삭제할까요?\n삭제된 게시글은 복구할 수 없어요."
    );

    if (!ok) return;

    await supabase.from("community_likes").delete().eq("post_id", postId);
    await supabase.from("community_comments").delete().eq("post_id", postId);

    const { error } = await supabase
      .from("community_posts")
      .delete()
      .eq("id", postId)
      .eq("user_id", userId);

    if (error) {
      alert("게시글 삭제에 실패했어요.");
      console.error(error.message);
      return;
    }

    setPosts((prev) => prev.filter((post) => post.id !== postId));
    alert("게시글이 삭제되었어요.");
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!userId) return;

    const ok = confirm("댓글을 삭제할까요?");
    if (!ok) return;

    const { error } = await supabase
      .from("community_comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", userId);

    if (error) {
      alert("댓글 삭제에 실패했어요.");
      console.error(error.message);
      return;
    }

    setComments((prev) => prev.filter((comment) => comment.id !== commentId));
  };

  const handleCancelLike = async (likeId: number) => {
    if (!userId) return;

    const { error } = await supabase
      .from("community_likes")
      .delete()
      .eq("id", likeId)
      .eq("user_id", userId);

    if (error) {
      alert("좋아요 취소에 실패했어요.");
      console.error(error.message);
      return;
    }

    setLikes((prev) => prev.filter((like) => like.id !== likeId));
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file || !userId) return;

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드할 수 있어요.");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      alert("3MB 이하 이미지만 업로드할 수 있어요.");
      return;
    }

    setAvatarUploading(true);

    // 이전 아바타 파일들 먼저 정리 (안 지우면 업로드할 때마다 orphan 파일이 쌓여요)
    const { data: existingFiles } = await supabase.storage
      .from("avatars")
      .list(userId);

    const oldPaths = (existingFiles || []).map((item) => `${userId}/${item.name}`);

    if (oldPaths.length > 0) {
      await supabase.storage.from("avatars").remove(oldPaths);
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      alert(`프로필 사진 업로드에 실패했어요: ${uploadError.message}`);
      console.error(uploadError.message);
      setAvatarUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
    const avatarUrl = data.publicUrl;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", userId);

    if (updateError) {
      alert("프로필 사진 저장에 실패했어요.");
      console.error(updateError.message);
      setAvatarUploading(false);
      return;
    }

    setProfile((prev) => (prev ? { ...prev, avatar_url: avatarUrl } : prev));
    setAvatarUploading(false);
  };

  const handleAvatarDelete = async () => {
    if (!userId || !profile?.avatar_url) return;

    const ok = confirm("프로필 사진을 삭제할까요?");
    if (!ok) return;

    setAvatarUploading(true);

    const { data: existingFiles } = await supabase.storage
      .from("avatars")
      .list(userId);

    const avatarPaths = (existingFiles || []).map(
      (item) => `${userId}/${item.name}`
    );

    if (avatarPaths.length > 0) {
      await supabase.storage.from("avatars").remove(avatarPaths);
    }

    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: null })
      .eq("id", userId);

    if (error) {
      alert("프로필 사진 삭제에 실패했어요.");
      console.error(error.message);
      setAvatarUploading(false);
      return;
    }

    setProfile((prev) => (prev ? { ...prev, avatar_url: null } : prev));
    setAvatarUploading(false);
  };

  const q = keyword.trim().toLowerCase();

  // search + category filter only — order is already "latest first" from the query
  const searchFilteredPosts = useMemo(() => {
    let base = posts;

    if (categoryFilter !== "all") {
      base = base.filter((post) => post.category === categoryFilter);
    }

    if (q) {
      base = base.filter(
        (post) =>
          post.title.toLowerCase().includes(q) ||
          post.content.toLowerCase().includes(q)
      );
    }

    return base;
  }, [posts, categoryFilter, q]);

  const searchFilteredComments = useMemo(() => {
    let base = comments;

    if (categoryFilter !== "all") {
      base = base.filter(
        (c) => relatedPosts[c.post_id]?.category === categoryFilter
      );
    }

    if (q) {
      base = base.filter((c) => {
        const related = relatedPosts[c.post_id];
        return (
          c.content.toLowerCase().includes(q) ||
          related?.title.toLowerCase().includes(q)
        );
      });
    }

    return base;
  }, [comments, categoryFilter, q, relatedPosts]);

  const searchFilteredLikes = useMemo(() => {
    let base = likes;

    if (categoryFilter !== "all") {
      base = base.filter(
        (l) => relatedPosts[l.post_id]?.category === categoryFilter
      );
    }

    if (q) {
      base = base.filter((l) => {
        const related = relatedPosts[l.post_id];
        return (
          related?.title.toLowerCase().includes(q) ||
          related?.content.toLowerCase().includes(q)
        );
      });
    }

    return base;
  }, [likes, categoryFilter, q, relatedPosts]);

  // current tab's search/category-filtered set, before any calendar-day narrowing
  const activeSearchFiltered: { created_at: string }[] =
    activeTab === "posts"
      ? searchFilteredPosts
      : activeTab === "comments"
      ? searchFilteredComments
      : searchFilteredLikes;

  // day -> count map, used to render the calendar badges
  const dayCounts = useMemo(() => {
    const map: Record<string, number> = {};
    activeSearchFiltered.forEach((item) => {
      const key = dateKeyFromString(item.created_at);
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [activeSearchFiltered]);

  const applyDayFilter = <T extends { created_at: string }>(items: T[]): T[] => {
    if (viewMode !== "calendar") return items;
    return items.filter((item) => dateKeyFromString(item.created_at) === selectedDateKey);
  };

  const filteredPosts = applyDayFilter(searchFilteredPosts);
  const filteredComments = applyDayFilter(searchFilteredComments);
  const filteredLikes = applyDayFilter(searchFilteredLikes);

  const monthCells = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const leadingEmpty = firstDay.getDay();

    const cells: (CalendarCell | null)[] = [];

    for (let i = 0; i < leadingEmpty; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({ day, key: `${year}-${month}-${day}`, year, month });
    }

    return cells;
  }, [calendarMonth]);

  const goToday = () => {
    const now = new Date();
    setCalendarMonth(now);
    setSelectedDate(now);
  };

  const goPrevMonth = () =>
    setCalendarMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );

  const goNextMonth = () =>
    setCalendarMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );

  if (loading) {
    return (
      <section className={styles.page}>
        <div className={styles.loadingBox}>마이페이지를 불러오는 중이에요...</div>
      </section>
    );
  }

  const currentCount =
    activeTab === "posts"
      ? filteredPosts.length
      : activeTab === "comments"
      ? filteredComments.length
      : filteredLikes.length;

  const totalCount =
    activeTab === "posts"
      ? posts.length
      : activeTab === "comments"
      ? comments.length
      : likes.length;

  const dayPanelLabel = selectedDate.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  // the item list markup, shared between "list" mode (full width) and the
  // calendar mode's day panel (filteredX already narrows to the selected day there)
  const listContent =
    activeTab === "posts" ? (
      <div className={styles.list}>
        {filteredPosts.length === 0 ? (
          <div className={styles.emptyBox}>
            {viewMode === "calendar"
              ? "이 날엔 활동이 없어요."
              : posts.length === 0
              ? "아직 작성한 글이 없어요."
              : "조건에 맞는 글이 없어요."}
          </div>
        ) : (
          filteredPosts.map((post) => {
            const Icon = categoryIcon[post.category] ?? BookOpen;
            const color = categoryColor[post.category] ?? DEFAULT_CATEGORY_COLOR;
            const tint = categoryTint[post.category] ?? DEFAULT_CATEGORY_TINT;

            return (
              <div key={post.id} className={styles.postItem}>
                <button
                  className={styles.itemMain}
                  onClick={() => router.push(`/community/post/${post.id}`)}
                >
                  <div
                    className={styles.thumb}
                    style={{ background: post.image_url ? undefined : tint }}
                  >
                    {post.image_url ? (
                      <img src={post.image_url} alt={post.title} />
                    ) : (
                      <Icon size={24} weight="light" color={color} />
                    )}
                  </div>

                  <div>
                    <span className={styles.categoryTag} style={{ color }}>
                      <Icon size={11} weight="bold" />
                    </span>
                    <strong>{post.title}</strong>
                    <p>{post.content}</p>
                    <small>
                      {new Date(post.created_at).toLocaleString("ko-KR")}
                      {" · "}
                      <Heart size={10} weight="bold" style={{ verticalAlign: -1 }} />{" "}
                      {post.likes}
                    </small>
                  </div>
                </button>

                <button
                  className={styles.deleteButton}
                  onClick={() => handleDeletePost(post.id)}
                >
                  <Trash size={13} weight="bold" />
                  삭제
                </button>
              </div>
            );
          })
        )}
      </div>
    ) : activeTab === "comments" ? (
      <div className={styles.list}>
        {filteredComments.length === 0 ? (
          <div className={styles.emptyBox}>
            {viewMode === "calendar"
              ? "이 날엔 활동이 없어요."
              : comments.length === 0
              ? "아직 작성한 댓글이 없어요."
              : "조건에 맞는 댓글이 없어요."}
          </div>
        ) : (
          filteredComments.map((comment) => {
            const related = relatedPosts[comment.post_id];
            const cat = related?.category;
            const Icon = cat ? categoryIcon[cat] ?? BookOpen : ChatCircle;
            const color = cat ? categoryColor[cat] ?? DEFAULT_CATEGORY_COLOR : "#8796a4";
            const tint = cat ? categoryTint[cat] ?? DEFAULT_CATEGORY_TINT : DEFAULT_CATEGORY_TINT;

            return (
              <div key={comment.id} className={styles.postItem}>
                <button
                  className={styles.itemMain}
                  onClick={() =>
                    router.push(`/community/post/${comment.post_id}`)
                  }
                >
                  <div
                    className={styles.thumb}
                    style={{ background: related?.image_url ? undefined : tint }}
                  >
                    {related?.image_url ? (
                      <img src={related.image_url} alt={related.title} />
                    ) : (
                      <Icon size={24} weight="light" color={color} />
                    )}
                  </div>

                  <div>
                    <strong>{related?.title || "삭제된 게시글"}</strong>
                    <span className={styles.contextLine}>
                      내 댓글: {comment.content}
                    </span>
                    <small>
                      {new Date(comment.created_at).toLocaleString("ko-KR")}
                    </small>
                  </div>
                </button>

                <button
                  className={styles.deleteButton}
                  onClick={() => handleDeleteComment(comment.id)}
                >
                  <Trash size={13} weight="bold" />
                  삭제
                </button>
              </div>
            );
          })
        )}
      </div>
    ) : (
      <div className={styles.list}>
        {filteredLikes.length === 0 ? (
          <div className={styles.emptyBox}>
            {viewMode === "calendar"
              ? "이 날엔 활동이 없어요."
              : likes.length === 0
              ? "좋아요 누른 글이 없어요."
              : "조건에 맞는 글이 없어요."}
          </div>
        ) : (
          filteredLikes.map((like) => {
            const related = relatedPosts[like.post_id];
            const cat = related?.category;
            const Icon = cat ? categoryIcon[cat] ?? BookOpen : Heart;
            const color = cat ? categoryColor[cat] ?? DEFAULT_CATEGORY_COLOR : "#ff6652";
            const tint = cat ? categoryTint[cat] ?? DEFAULT_CATEGORY_TINT : "#fff0ed";

            return (
              <div key={like.id} className={styles.postItem}>
                <button
                  className={styles.itemMain}
                  onClick={() => router.push(`/community/post/${like.post_id}`)}
                >
                  <div
                    className={styles.thumb}
                    style={{ background: related?.image_url ? undefined : tint }}
                  >
                    {related?.image_url ? (
                      <img src={related.image_url} alt={related.title} />
                    ) : (
                      <Icon size={24} weight="light" color={color} />
                    )}
                  </div>

                  <div>
                    <strong>{related?.title || "삭제된 게시글"}</strong>
                    <p>{related?.content || ""}</p>
                    <small>
                      {new Date(like.created_at).toLocaleString("ko-KR")}
                    </small>
                  </div>
                </button>

                <button
                  className={styles.deleteButton}
                  onClick={() => handleCancelLike(like.id)}
                >
                  <Trash size={13} weight="bold" />
                  취소
                </button>
              </div>
            );
          })
        )}
      </div>
    );

  return (
    <section className={styles.page}>
      <button className={styles.backButton} onClick={() => router.push("/community")}>
        <CaretLeft size={20} weight="bold" />
      </button>

      <header className={styles.header}>
        <div>
          <span>COMMUNITY MY PAGE</span>
          <h1>마이페이지</h1>
          <p>내가 작성한 글, 댓글, 좋아요 활동을 관리해요.</p>
        </div>

        <button onClick={() => router.push("/community/write")}>
          <PencilSimple size={15} weight="bold" />
          글쓰기
        </button>
      </header>

      <div className={styles.profileBar}>
        <div className={styles.profileInfo}>
          <div className={styles.avatarWrapper}>
            <label className={styles.avatar}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="프로필 사진" />
              ) : (
                <User size={22} weight="bold" />
              )}

              <div
                className={`${styles.avatarOverlay} ${
                  avatarUploading ? styles.avatarOverlayActive : ""
                }`}
              >
                <Camera size={17} weight="bold" />
              </div>

              <input
                type="file"
                accept="image/*"
                className={styles.avatarInput}
                onChange={handleAvatarChange}
                disabled={avatarUploading}
              />
            </label>

            {profile?.avatar_url && (
              <button
                type="button"
                className={styles.avatarRemoveButton}
                onClick={handleAvatarDelete}
                disabled={avatarUploading}
                aria-label="프로필 사진 삭제"
              >
                <X size={11} weight="bold" />
              </button>
            )}
          </div>

          <div>
            <span>BUNNY NAME</span>
            <strong>{profile?.bunny_name || "Bunny"}</strong>
            <p>
              <Coins size={13} weight="bold" />
              {profile?.coins ?? 0} Coin
            </p>
          </div>
        </div>

        <div className={styles.statRow}>
          <div className={styles.statItem}>
            <strong>{posts.length}</strong>
            <span>작성 글</span>
          </div>

          <div className={styles.statItem}>
            <strong>{comments.length}</strong>
            <span>댓글</span>
          </div>

          <div className={styles.statItem}>
            <strong>{likes.length}</strong>
            <span>좋아요</span>
          </div>
        </div>
      </div>

      <div className={styles.contentCard}>
        <div className={styles.tabRow}>
          <button
            className={activeTab === "posts" ? styles.activeTab : ""}
            onClick={() => handleTabClick("posts")}
          >
            내가 쓴 글
          </button>

          <button
            className={activeTab === "comments" ? styles.activeTab : ""}
            onClick={() => handleTabClick("comments")}
          >
            내가 쓴 댓글
          </button>

          <button
            className={activeTab === "likes" ? styles.activeTab : ""}
            onClick={() => handleTabClick("likes")}
          >
            좋아요 누른 글
          </button>

          <span>총 활동 {totalActivity}개</span>
        </div>

        <div className={styles.controlBar}>
          <div className={styles.searchBox}>
            <MagnifyingGlass size={15} weight="bold" />
            <input
              type="text"
              placeholder={
                activeTab === "posts"
                  ? "제목이나 내용으로 검색"
                  : activeTab === "comments"
                  ? "댓글 내용이나 게시글 제목으로 검색"
                  : "게시글 제목이나 내용으로 검색"
              }
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <select
            className={styles.categorySelect}
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value as CommunityCategoryId | "all")
            }
          >
            <option value="all">전체 카테고리</option>
            {communityCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>

          <div className={styles.viewBox}>
            <button
              className={viewMode === "list" ? styles.viewBoxActive : ""}
              onClick={() => setViewMode("list")}
            >
              <ListBullets size={13} weight="bold" />
              리스트
            </button>
            <button
              className={viewMode === "calendar" ? styles.viewBoxActive : ""}
              onClick={() => setViewMode("calendar")}
            >
              <CalendarBlank size={13} weight="bold" />
              달력
            </button>
          </div>
        </div>

        {viewMode === "list" && (keyword || categoryFilter !== "all") && (
          <p className={styles.resultLine}>
            {totalCount}개 중 {currentCount}개 표시 중
          </p>
        )}

        {viewMode === "calendar" ? (
          <div className={styles.calendarSplit}>
            <div className={styles.calendarBox}>
              <div className={styles.calendarHeader}>
                <span className={styles.calendarMonthLabel}>
                  {calendarMonth.getFullYear()}년 {calendarMonth.getMonth() + 1}월
                </span>

                <div className={styles.calendarNavGroup}>
                  <button className={styles.calendarTodayButton} onClick={goToday}>
                    오늘
                  </button>
                  <button className={styles.calendarNavButton} onClick={goPrevMonth}>
                    <CaretLeft size={13} weight="bold" />
                  </button>
                  <button className={styles.calendarNavButton} onClick={goNextMonth}>
                    <CaretRight size={13} weight="bold" />
                  </button>
                </div>
              </div>

              <div className={styles.calendarWeekdays}>
                {WEEKDAYS.map((w) => (
                  <span key={w}>{w}</span>
                ))}
              </div>

              <div className={styles.calendarGrid}>
                {monthCells.map((cell, idx) => {
                  if (cell === null) {
                    return (
                      <div key={`empty-${idx}`} className={styles.calendarCellEmpty} />
                    );
                  }

                  const weekdayIdx = idx % 7;
                  const isWeekend = weekdayIdx === 0 || weekdayIdx === 6;
                  const count = dayCounts[cell.key] || 0;

                  return (
                    <button
                      key={cell.key}
                      className={[
                        styles.calendarCell,
                        isWeekend ? styles.calendarCellWeekend : "",
                        count > 0 ? styles.calendarCellHasActivity : "",
                        cell.key === todayKey ? styles.calendarCellToday : "",
                        cell.key === selectedDateKey ? styles.calendarCellSelected : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() =>
                        setSelectedDate(new Date(cell.year, cell.month, cell.day))
                      }
                    >
                      {cell.day}
                      {count > 0 && (
                        <span className={styles.calendarCellCount}>{count}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.dayPanel}>
              <div className={styles.dayPanelHeader}>
                <strong>{dayPanelLabel}</strong>
                <span>{currentCount}개의 활동</span>
              </div>

              <div className={styles.dayPanelList}>{listContent}</div>
            </div>
          </div>
        ) : (
          listContent
        )}
      </div>
    </section>
  );
}