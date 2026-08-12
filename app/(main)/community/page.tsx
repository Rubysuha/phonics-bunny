"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CaretLeft,
  MagnifyingGlass,
  UserCircle,
  PencilSimple,
  Camera,
  BookOpen,
  Question,
  Sparkle,
  MapPin,
  Heart,
  ChatCircle,
  Fire,
  Carrot,
} from "@phosphor-icons/react";
import { supabase } from "@/lib/supabase";
import styles from "./community.module.css";
import {
  communityCategories,
  type CommunityCategoryId,
  type CommunityPost,
} from "./data";

type SupabasePost = {
  id: number;
  category: CommunityCategoryId;
  title: string;
  content: string;
  image_url: string | null;
  author: string;
  created_at: string;
};

const tabs = [...communityCategories] as const;

const categoryIcon: Record<CommunityCategoryId, React.ElementType> = {
  "study-proof": Camera,
  "english-tip": BookOpen,
  "question": Question,
  "bunny-proud": Sparkle,
  "local-recommend": MapPin,
};

const categoryColor: Record<CommunityCategoryId, string> = {
  "study-proof": "#c1573c",
  "english-tip": "#8a7a4f",
  "question": "#4f7ea8",
  "bunny-proud": "#8a5fa0",
  "local-recommend": "#4f8a6f",
};

const categoryTint: Record<CommunityCategoryId, string> = {
  "study-proof": "#f7e4dc",
  "english-tip": "#f2efe0",
  "question": "#e6eef4",
  "bunny-proud": "#ece3f0",
  "local-recommend": "#e3ede7",
};

export default function CommunityPage() {
  const router = useRouter();

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [activeCategory, setActiveCategory] =
    useState<CommunityCategoryId | "all">("all");
  const [sort, setSort] = useState<"latest" | "popular">("latest");
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCommunityData = async () => {
      setIsLoading(true);

      const { data: postData, error: postError } = await supabase
        .from("community_posts")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: likeData } = await supabase
        .from("community_likes")
        .select("post_id");

      const { data: commentData } = await supabase
        .from("community_comments")
        .select("post_id");

      if (postError) {
        console.error(postError.message);
        setIsLoading(false);
        return;
      }

      const mappedPosts: CommunityPost[] = ((postData as SupabasePost[]) || [])
        .map((post) => {
          const likeCount =
            likeData?.filter((like) => like.post_id === post.id).length || 0;

          const commentCount =
            commentData?.filter((comment) => comment.post_id === post.id)
              .length || 0;

          return {
            id: String(post.id),
            category: post.category,
            title: post.title,
            content: post.content,
            image: post.image_url || undefined,
            author: post.author?.includes("@")
              ? "학부모"
              : post.author || "학부모",
            date: new Date(post.created_at).toLocaleDateString("ko-KR"),
            likes: likeCount,
            comments: Array(commentCount).fill(""),
          };
        });

      setPosts(mappedPosts);
      setIsLoading(false);
    };

    fetchCommunityData();
  }, []);

  const filteredPosts = useMemo(() => {
    let base =
      activeCategory === "all"
        ? posts
        : posts.filter((post) => post.category === activeCategory);

    if (keyword.trim()) {
      const q = keyword.trim().toLowerCase();
      base = base.filter(
        (post) =>
          post.title.toLowerCase().includes(q) ||
          post.content.toLowerCase().includes(q)
      );
    }

    if (sort === "popular") {
      return [...base].sort((a, b) => b.likes - a.likes);
    }

    return base;
  }, [posts, activeCategory, sort, keyword]);

  const popularPosts = [...posts]
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 5);

  const getCategoryName = (categoryId: string) => {
    const category = communityCategories.find((item) => item.id === categoryId);
    return category?.title || "커뮤니티";
  };

  return (
    <section className={styles.page}>
      <button
        className={styles.backButton}
        onClick={() => router.push("/dashboard")}
      >
        <CaretLeft size={20} weight="bold" />
      </button>

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>PARENT COMMUNITY</span>
            <h1>Community</h1>
            <p>학부모가 학습 경험과 정보를 함께 나누는 공간이에요.</p>
          </div>

          <div className={styles.headerButtons}>
            <button
              className={styles.myPageButton}
              onClick={() => router.push("/community/my")}
            >
              <UserCircle size={17} weight="bold" />
              마이페이지
            </button>

            <button
              className={styles.writeButton}
              onClick={() => router.push("/community/write")}
            >
              <PencilSimple size={17} weight="bold" />
              글쓰기
            </button>
          </div>
        </header>

        <div className={styles.searchBox}>
          <MagnifyingGlass size={17} weight="bold" />
          <input
            type="text"
            placeholder="제목이나 내용으로 검색해보세요"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <div className={styles.controlRow}>
          <div className={styles.tabBox}>
            <button
              className={`${styles.tabButton} ${
                activeCategory === "all" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveCategory("all")}
            >
              전체
            </button>

            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`${styles.tabButton} ${
                  activeCategory === tab.id ? styles.activeTab : ""
                }`}
                onClick={() => {
                  if (tab.id === "local-recommend") {
                    router.push("/community/local-recommend");
                    return;
                  }
                  setActiveCategory(tab.id);
                }}
              >
                {tab.title}
              </button>
            ))}
          </div>

          <div className={styles.sortBox}>
            <button
              className={`${styles.sortButton} ${
                sort === "latest" ? styles.sortButtonActive : ""
              }`}
              onClick={() => setSort("latest")}
            >
              최신순
            </button>
            <button
              className={`${styles.sortButton} ${
                sort === "popular" ? styles.sortButtonActive : ""
              }`}
              onClick={() => setSort("popular")}
            >
              인기순
            </button>
          </div>
        </div>

        <p className={styles.countLine}>{filteredPosts.length}개의 게시글</p>

        <div className={styles.feedGrid}>
          {isLoading ? (
            <div className={styles.emptyBox}>게시글을 불러오는 중이에요...</div>
          ) : filteredPosts.length === 0 ? (
            <div className={styles.emptyBox}>아직 게시글이 없어요.</div>
          ) : (
            filteredPosts.map((post) => {
              const Icon = categoryIcon[post.category] ?? BookOpen;
              const color = categoryColor[post.category] ?? "#c1573c";
              const tint = categoryTint[post.category] ?? "#f3ede2";

              return (
                <button
                  key={post.id}
                  className={styles.feedCard}
                  onClick={() => router.push(`/community/post/${post.id}`)}
                >
                  <div
                    className={styles.feedImage}
                    style={{ background: post.image ? undefined : tint }}
                  >
                    {post.image ? (
                      <img src={post.image} alt={post.title} />
                    ) : (
                      <Icon size={28} weight="light" color={color} />
                    )}
                  </div>

                  <div className={styles.feedBody}>
                    <span className={styles.feedCategory} style={{ color }}>
                      <Icon size={12} weight="bold" />
                      {getCategoryName(post.category)}
                    </span>

                    <h2>{post.title}</h2>
                    <p>{post.content}</p>

                    <div className={styles.feedFooter}>
                      <span className={styles.feedAuthor}>
                        {post.author} · {post.date}
                      </span>
                      <span className={styles.feedStats}>
                        <span>
                          <Heart size={12} weight="bold" />
                          {post.likes}
                        </span>
                        <span>
                          <ChatCircle size={12} weight="bold" />
                          {post.comments.length}
                        </span>
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </main>

      <aside className={styles.rightPanel}>
        <section className={styles.sideCard}>
          <div className={styles.sideCardHeader}>
            <h2>
              <Fire size={15} weight="fill" color="#c1573c" />
              인기 글
            </h2>
          </div>

          {popularPosts.length === 0 ? (
            <p className={styles.smallEmpty}>아직 인기 게시글이 없어요.</p>
          ) : (
            popularPosts.map((post, index) => (
              <button
                key={post.id}
                className={styles.popularItem}
                onClick={() => router.push(`/community/post/${post.id}`)}
              >
                <strong>{index + 1}</strong>
                <div>
                  <span>{post.title}</span>
                  <em>♥ {post.likes}</em>
                </div>
              </button>
            ))
          )}
        </section>

        <button
          className={styles.noticeCard}
          onClick={() => router.push("/community/local-recommend")}
        >
          <div className={styles.noticeIcon}>
            <MapPin size={17} weight="bold" />
          </div>
          <div>
            <strong>우리 동네 영어 추천</strong>
            <span>학원 · 영어유치원 정보 나누기</span>
          </div>
        </button>

        <section className={styles.rewardCard}>
          <div>
            <h2>Community Reward</h2>
            <p>글쓰기 +3 · 댓글 +1 · 좋아요 +1</p>
          </div>
          <div className={styles.rewardIcon}>
            <Carrot size={17} weight="fill" />
          </div>
        </section>
      </aside>
    </section>
  );
}