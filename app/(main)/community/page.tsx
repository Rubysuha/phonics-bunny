"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CaretLeft,
  CaretRight,
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
  Info,
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
  question: Question,
  "bunny-proud": Sparkle,
  "local-recommend": MapPin,
};

const categoryColor: Record<CommunityCategoryId, string> = {
  "study-proof": "#ff6b57",
  "english-tip": "#d49a2a",
  question: "#3576b8",
  "bunny-proud": "#d65496",
  "local-recommend": "#2f8b78",
};

const categoryTint: Record<CommunityCategoryId, string> = {
  "study-proof": "#fff0ed",
  "english-tip": "#fff6df",
  question: "#eaf4ff",
  "bunny-proud": "#fff0f7",
  "local-recommend": "#eaf7f4",
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

      const mappedPosts: CommunityPost[] = (
        (postData as SupabasePost[]) || []
      ).map((post) => {
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
      return [...base].sort(
        (a, b) =>
          b.likes +
          b.comments.length -
          (a.likes + a.comments.length)
      );
    }

    return base;
  }, [posts, activeCategory, sort, keyword]);

  const popularPosts = [...posts]
    .sort(
      (a, b) =>
        b.likes +
        b.comments.length -
        (a.likes + a.comments.length)
    )
    .slice(0, 5);

  const getCategoryName = (categoryId: string) => {
    const category = communityCategories.find(
      (item) => item.id === categoryId
    );

    return category?.title || "커뮤니티";
  };

  return (
    <section className={styles.page}>
      <button
        className={styles.backButton}
        onClick={() => router.push("/dashboard")}
        aria-label="뒤로가기"
      >
        <CaretLeft size={21} weight="bold" />
      </button>

      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerCopy}>
            <span className={styles.eyebrow}>PARENT COMMUNITY</span>

            <h1>부모 커뮤니티</h1>

            <p>
              아이의 영어 학습 경험과 정보를 함께 나누는 공간이에요.
              <br />
              서로의 경험이 더 나은 학습 환경을 만들어줍니다.
            </p>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.headerButtons}>
              <button
                className={styles.myPageButton}
                onClick={() => router.push("/community/my")}
              >
                <UserCircle size={18} weight="bold" />
                마이페이지
              </button>

              <button
                className={styles.writeButton}
                onClick={() => router.push("/community/write")}
              >
                <PencilSimple size={18} weight="bold" />
                글쓰기
              </button>
            </div>

            <div className={styles.bunnyArea}>
              <div className={styles.bunnyMessage}>
                함께 이야기해요!
              </div>

              <div className={styles.bunnyIllustration}>
                <div className={styles.bunnyEarLeft} />
                <div className={styles.bunnyEarRight} />

                <div className={styles.bunnyHead}>
                  <span className={styles.bunnyEyeLeft} />
                  <span className={styles.bunnyEyeRight} />
                  <span className={styles.bunnyNose} />
                  <span className={styles.bunnyMouthLeft} />
                  <span className={styles.bunnyMouthRight} />
                </div>

                <div className={styles.bunnyBody} />

                <div className={styles.bookStack}>
                  <span />
                  <span />
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className={styles.contentPanel}>
          <div className={styles.searchRow}>
            <div className={styles.searchBox}>
              <MagnifyingGlass size={19} weight="bold" />

              <input
                type="text"
                placeholder="궁금한 내용을 검색해보세요."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>

            <button className={styles.searchButton}>
              검색
            </button>
          </div>

          <div className={styles.controlRow}>
            <div className={styles.tabBox}>
              <button
                className={`${styles.tabButton} ${
                  activeCategory === "all"
                    ? styles.activeTab
                    : ""
                }`}
                onClick={() => setActiveCategory("all")}
              >
                전체
              </button>

              {tabs.map((tab) => {
                const Icon =
                  categoryIcon[tab.id] ?? BookOpen;

                return (
                  <button
                    key={tab.id}
                    className={`${styles.tabButton} ${
                      activeCategory === tab.id
                        ? styles.activeTab
                        : ""
                    }`}
                    onClick={() => {
                      if (tab.id === "local-recommend") {
                        router.push(
                          "/community/local-recommend"
                        );
                        return;
                      }

                      setActiveCategory(tab.id);
                    }}
                  >
                    <Icon size={15} weight="bold" />
                    {tab.title}
                  </button>
                );
              })}
            </div>

            <div className={styles.sortBox}>
              <button
                className={`${styles.sortButton} ${
                  sort === "latest"
                    ? styles.sortButtonActive
                    : ""
                }`}
                onClick={() => setSort("latest")}
              >
                최신순
              </button>

              <button
                className={`${styles.sortButton} ${
                  sort === "popular"
                    ? styles.sortButtonActive
                    : ""
                }`}
                onClick={() => setSort("popular")}
              >
                인기순
              </button>
            </div>
          </div>

          <p className={styles.countLine}>
            {filteredPosts.length}개의 게시글
          </p>

          <div className={styles.feedGrid}>
            {isLoading ? (
              <div className={styles.emptyBox}>
                게시글을 불러오는 중이에요...
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className={styles.emptyBox}>
                아직 게시글이 없어요.
              </div>
            ) : (
              filteredPosts.map((post) => {
                const Icon =
                  categoryIcon[post.category] ?? BookOpen;

                const color =
                  categoryColor[post.category] ?? "#3576b8";

                const tint =
                  categoryTint[post.category] ?? "#eef4fa";

                return (
                  <button
                    key={post.id}
                    className={styles.feedCard}
                    onClick={() =>
                      router.push(
                        `/community/post/${post.id}`
                      )
                    }
                  >
                    <div
                      className={styles.feedImage}
                      style={{
                        background: post.image
                          ? undefined
                          : tint,
                      }}
                    >
                      {post.image ? (
                        <img
                          src={post.image}
                          alt={post.title}
                        />
                      ) : (
                        <Icon
                          size={30}
                          weight="light"
                          color={color}
                        />
                      )}
                    </div>

                    <div className={styles.feedBody}>
                      <span
                        className={styles.feedCategory}
                        style={{
                          color,
                          background: tint,
                        }}
                      >
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
                            <ChatCircle
                              size={15}
                              weight="regular"
                            />
                            {post.comments.length}
                          </span>

                          <span>
                            <Heart
                              size={15}
                              weight="regular"
                            />
                            {post.likes}
                          </span>
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>
      </main>

      <aside className={styles.rightPanel}>
        <section className={styles.sideCard}>
          <div className={styles.sideCardHeader}>
            <h2>
              <span className={styles.fireCircle}>
                <Fire size={16} weight="fill" />
              </span>
              인기 글
            </h2>
          </div>

          <div className={styles.popularList}>
            {popularPosts.length === 0 ? (
              <p className={styles.smallEmpty}>
                아직 인기 게시글이 없어요.
              </p>
            ) : (
              popularPosts.map((post, index) => (
                <button
                  key={post.id}
                  className={styles.popularItem}
                  onClick={() =>
                    router.push(
                      `/community/post/${post.id}`
                    )
                  }
                >
                  <strong>{index + 1}</strong>

                  <div>
                    <span>{post.title}</span>

                    <em>
                      <ChatCircle
                        size={12}
                        weight="regular"
                      />
                      {post.comments.length}

                      <Heart
                        size={12}
                        weight="regular"
                      />
                      {post.likes}
                    </em>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        <button className={styles.guideCard}>
          <div className={styles.guideBunny}>
            <div className={styles.miniEarLeft} />
            <div className={styles.miniEarRight} />

            <div className={styles.miniHead}>
              <span />
              <span />
            </div>
          </div>

          <div>
            <strong>처음이신가요?</strong>
            <span>
              커뮤니티 이용 가이드를 확인해보세요.
            </span>
          </div>

          <CaretRight
            size={17}
            weight="bold"
            className={styles.guideArrow}
          />
        </button>

        <button
          className={styles.localCard}
          onClick={() =>
            router.push("/community/local-recommend")
          }
        >
          <div className={styles.localIcon}>
            <MapPin size={21} weight="fill" />
          </div>

          <div className={styles.localText}>
            <strong>우리 동네 영어 추천</strong>

            <span>
              학원 · 영어유치원 정보를
              <br />
              함께 나눠보세요.
            </span>
          </div>

          <CaretRight
            size={17}
            weight="bold"
            className={styles.localArrow}
          />
        </button>

        <section className={styles.rewardCard}>
          <div className={styles.rewardHeader}>
            <div className={styles.rewardTitle}>
              <span className={styles.rewardTitleIcon}>
                <Carrot size={16} weight="fill" />
              </span>

              <div>
                <h2>Community Reward</h2>
                <p>
                  활동하고 당근 코인을 받아보세요.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.rewardItems}>
            <div>
              <span className={styles.rewardActionIcon}>
                <PencilSimple
                  size={17}
                  weight="bold"
                />
              </span>
              <p>글쓰기</p>
              <strong>+3</strong>
            </div>

            <div>
              <span className={styles.rewardActionIcon}>
                <ChatCircle
                  size={17}
                  weight="bold"
                />
              </span>
              <p>댓글</p>
              <strong>+1</strong>
            </div>

            <div>
              <span className={styles.rewardActionIcon}>
                <Heart size={17} weight="fill" />
              </span>
              <p>좋아요</p>
              <strong>+1</strong>
            </div>
          </div>
        </section>

        <div className={styles.communityNote}>
          <Info size={16} weight="bold" />
          <span>
            서로 존중하는 대화를 나눠주세요.
          </span>
        </div>
      </aside>
    </section>
  );
}