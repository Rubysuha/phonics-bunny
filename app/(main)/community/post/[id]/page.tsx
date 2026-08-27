"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useParams, useRouter } from "next/navigation";
import {
  CaretLeft,
  Heart,
  ChatCircle,
  ListBullets,
  Camera,
  BookOpen,
  Question,
  Sparkle,
  MapPin,
  ShieldCheck,
  Lock,
  HandHeart,
  X,
} from "@phosphor-icons/react";
import { supabase } from "@/lib/supabase";
import styles from "../post.module.css";
import { defaultPosts, communityCategories, type CommunityPost } from "../../data";

type Comment = {
  id: number;
  post_id: number;
  user_id: string;
  content: string;
  author: string;
  created_at: string;
  avatarUrl?: string;
};

type SupabasePost = {
  id: number;
  user_id: string | null;
  category: CommunityPost["category"];
  title: string;
  content: string;
  image_url: string | null;
  author: string;
  likes: number;
  comments: string[] | null;
  created_at: string;
};

type RelatedPost = {
  id: string;
  title: string;
  date: string;
  image?: string;
};

type RankPost = {
  id: string;
  title: string;
  likes: number;
};

const categoryIcon: Record<string, React.ElementType> = {
  "study-proof": Camera,
  "english-tip": BookOpen,
  "question": Question,
  "bunny-proud": Sparkle,
  "local-recommend": MapPin,
};

const categoryColor: Record<string, string> = {
  "study-proof": "#c1573c",
  "english-tip": "#8a7a4f",
  "question": "#4f7ea8",
  "bunny-proud": "#8a5fa0",
  "local-recommend": "#4f8a6f",
};

const categoryTint: Record<string, string> = {
  "study-proof": "#f7e4dc",
  "english-tip": "#f2efe0",
  "question": "#e6eef4",
  "bunny-proud": "#ece3f0",
  "local-recommend": "#e3ede7",
};

const avatarColors = ["#c1573c", "#4f7ea8", "#8a5fa0", "#4f8a6f", "#8a7a4f"];

const colorForName = (name: string) => {
  const sum = name.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return avatarColors[sum % avatarColors.length];
};

export default function CommunityPostPage() {
  const router = useRouter();
  const params = useParams();

  const postId = params.id as string;
  const numericPostId = Number(postId);

  const [post, setPost] = useState<CommunityPost | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");

  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [rankPosts, setRankPosts] = useState<RankPost[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isImageOpen, setIsImageOpen] = useState(false);

  const fetchComments = async () => {
    if (Number.isNaN(numericPostId)) return;

    const { data, error } = await supabase
      .from("community_comments")
      .select("*")
      .eq("post_id", numericPostId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("댓글 불러오기 실패:", error.message);
      return;
    }

    const rows = (data || []) as Comment[];
    const uniqueUserIds = Array.from(
      new Set(rows.map((item) => item.user_id).filter(Boolean))
    );

    let avatarMap: Record<string, string | null> = {};

    if (uniqueUserIds.length > 0) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, avatar_url")
        .in("id", uniqueUserIds);

      avatarMap = (profilesData || []).reduce(
        (
          acc: Record<string, string | null>,
          item: { id: string; avatar_url: string | null }
        ) => {
          acc[item.id] = item.avatar_url;
          return acc;
        },
        {}
      );
    }

    setComments(
      rows.map((item) => ({
        ...item,
        avatarUrl: avatarMap[item.user_id] || undefined,
      }))
    );
  };

  const fetchLikes = async (userId: string | null) => {
    if (Number.isNaN(numericPostId)) return;

    const { data, error } = await supabase
      .from("community_likes")
      .select("*")
      .eq("post_id", numericPostId);

    if (error) {
      console.error("좋아요 불러오기 실패:", error.message);
      return;
    }

    setLikeCount(data?.length || 0);

    if (userId) {
      setIsLiked(data?.some((like) => like.user_id === userId) || false);
    }
  };

  const fetchRelated = async (category: string) => {
    if (Number.isNaN(numericPostId)) return;

    const { data, error } = await supabase
      .from("community_posts")
      .select("id, title, image_url, created_at")
      .eq("category", category)
      .neq("id", numericPostId)
      .order("created_at", { ascending: false })
      .limit(4);

    if (error) {
      console.error("관련 글 불러오기 실패:", error.message);
      return;
    }

    setRelatedPosts(
      (data || []).map(
        (item: {
          id: number;
          title: string;
          image_url: string | null;
          created_at: string;
        }) => ({
          id: String(item.id),
          title: item.title,
          image: item.image_url || undefined,
          date: new Date(item.created_at).toLocaleDateString("ko-KR"),
        })
      )
    );
  };

  const fetchRanking = async () => {
    const { data: postData } = await supabase
      .from("community_posts")
      .select("id, title");

    const { data: likeData } = await supabase
      .from("community_likes")
      .select("post_id");

    if (!postData) return;

    const ranked = postData
      .map((item: { id: number; title: string }) => ({
        id: String(item.id),
        title: item.title,
        likes:
          likeData?.filter(
            (like: { post_id: number }) => like.post_id === item.id
          ).length || 0,
      }))
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 4);

    setRankPosts(ranked);
  };

  const fetchPost = async () => {
    setIsLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const userId = user?.id || null;
    setCurrentUserId(userId);

    if (Number.isNaN(numericPostId)) {
      const found = defaultPosts.find((item) => item.id === postId);
      setPost(found || null);
      setLikeCount(found?.likes || 0);
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("community_posts")
      .select("*")
      .eq("id", numericPostId)
      .single();

    if (error || !data) {
      const found = defaultPosts.find((item) => item.id === postId);
      setPost(found || null);
      setLikeCount(found?.likes || 0);
      setIsLoading(false);
      return;
    }

    const item = data as SupabasePost;

    let authorAvatarUrl: string | undefined;

    if (item.user_id) {
      const { data: authorProfile } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", item.user_id)
        .single();

      authorAvatarUrl = authorProfile?.avatar_url || undefined;
    }

    setPost({
      id: String(item.id),
      category: item.category,
      title: item.title,
      content: item.content,
      image: item.image_url || undefined,
      author: item.author?.includes("@") ? "학부모" : item.author || "학부모",
      avatarUrl: authorAvatarUrl,
      date: new Date(item.created_at).toLocaleDateString("ko-KR"),
      likes: item.likes || 0,
      comments: item.comments || [],
    });

    await fetchComments();
    await fetchLikes(userId);
    await fetchRelated(item.category);
    await fetchRanking();

    setIsLoading(false);
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const handleLike = async () => {
    if (!currentUserId) {
      alert("로그인 후 좋아요를 누를 수 있어요.");
      router.push("/login");
      return;
    }

    if (Number.isNaN(numericPostId)) return;

    if (isLiked) {
      const { error } = await supabase
        .from("community_likes")
        .delete()
        .eq("post_id", numericPostId)
        .eq("user_id", currentUserId);

      if (error) {
        console.error("좋아요 취소 실패:", error.message);
        return;
      }

      setIsLiked(false);
      setLikeCount((prev) => prev - 1);
    } else {
      const { error } = await supabase.from("community_likes").insert({
        post_id: numericPostId,
        user_id: currentUserId,
      });

      if (error) {
        console.error("좋아요 등록 실패:", error.message);
        return;
      }

      setIsLiked(true);
      setLikeCount((prev) => prev + 1);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      alert("댓글을 입력해주세요.");
      return;
    }

    if (!currentUserId) {
      alert("로그인 후 댓글을 작성할 수 있어요.");
      router.push("/login");
      return;
    }

    if (Number.isNaN(numericPostId)) return;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("bunny_name")
      .eq("id", currentUserId)
      .single();

    if (profileError) {
      console.error("프로필 불러오기 실패:", profileError.message);
    }

    const authorName = profile?.bunny_name || "Bunny";

    const { error } = await supabase.from("community_comments").insert({
      post_id: numericPostId,
      user_id: currentUserId,
      content: commentText.trim(),
      author: authorName,
    });

    if (error) {
      alert("댓글 등록에 실패했어요.");
      console.error("댓글 등록 실패:", error.message);
      return;
    }

    setCommentText("");
    fetchComments();
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!currentUserId) return;

    const { error } = await supabase
      .from("community_comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", currentUserId);

    if (error) {
      alert("댓글 삭제에 실패했어요.");
      console.error("댓글 삭제 실패:", error.message);
      return;
    }

    setComments((prev) => prev.filter((comment) => comment.id !== commentId));
  };

  if (isLoading) {
    return (
      <section className={styles.page}>
        <main className={styles.main}>
          <div className={styles.card}>
            <div className={styles.body}>불러오는 중이에요...</div>
          </div>
        </main>
      </section>
    );
  }

  if (!post) {
    return (
      <section className={styles.page}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <CaretLeft size={18} weight="bold" />
        </button>

        <main className={styles.main}>
          <div className={styles.card}>
            <div className={styles.body}>게시글을 찾을 수 없어요.</div>
          </div>
        </main>
      </section>
    );
  }

  const Icon = categoryIcon[post.category] ?? BookOpen;
  const color = categoryColor[post.category] ?? "#c1573c";
  const tint = categoryTint[post.category] ?? "#f2efe8";
  const categoryTitle =
    communityCategories.find((item) => item.id === post.category)?.title ??
    "커뮤니티";

  return (
    <section className={styles.page}>
      <button className={styles.backButton} onClick={() => router.back()}>
        <CaretLeft size={18} weight="bold" />
      </button>

      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.body}>
            <div className={styles.categoryRow}>
              <span
                className={styles.category}
                style={{ background: tint, color }}
              >
                <Icon size={12} weight="bold" />
                {categoryTitle}
              </span>

              <span className={styles.topStats}>
                <span>
                  <Heart size={12} weight="bold" />
                  {likeCount}
                </span>
                <span>
                  <ChatCircle size={12} weight="bold" />
                  {comments.length}
                </span>
              </span>
            </div>

            <h1>{post.title}</h1>

            <div className={styles.info}>
              <div
                className={styles.authorAvatar}
                style={post.avatarUrl ? undefined : { background: colorForName(post.author) }}
              >
                {post.avatarUrl ? (
                  <img
                    src={post.avatarUrl}
                    alt={post.author}
                    className={styles.avatarImg}
                  />
                ) : (
                  post.author.charAt(0)
                )}
              </div>
              <strong>{post.author}</strong>
              <span>· {post.date}</span>
            </div>

            {post.image && (
              <div
                className={styles.imageBox}
                onClick={() => setIsImageOpen(true)}
              >
                <img src={post.image} alt={post.title} />
              </div>
            )}

            <p className={styles.content}>{post.content}</p>
          </div>

          <div className={styles.bottom}>
            <button
              className={`${styles.likeButton} ${
                isLiked ? styles.likeButtonActive : ""
              }`}
              onClick={handleLike}
            >
              <Heart size={14} weight={isLiked ? "fill" : "bold"} />
              {likeCount}
            </button>

            <span className={styles.commentCount}>댓글 {comments.length}</span>
          </div>
        </div>

        <div className={styles.commentArea}>
          <h2>댓글 {comments.length}</h2>

          <div className={styles.commentInputBox}>
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="따뜻한 댓글을 남겨주세요 :)"
            />
            <button onClick={handleAddComment}>등록</button>
          </div>

          <div className={styles.commentList}>
            {comments.length === 0 ? (
              <p className={styles.emptyComment}>아직 댓글이 없어요.</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className={styles.commentCard}>
                  <div
                    className={styles.commentAvatar}
                    style={comment.avatarUrl ? undefined : { background: colorForName(comment.author) }}
                  >
                    {comment.avatarUrl ? (
                      <img
                        src={comment.avatarUrl}
                        alt={comment.author}
                        className={styles.avatarImg}
                      />
                    ) : (
                      comment.author.charAt(0)
                    )}
                  </div>

                  <div className={styles.commentBody}>
                    <div className={styles.commentTop}>
                      <strong>{comment.author}</strong>
                      <small>
                        {new Date(comment.created_at).toLocaleString("ko-KR")}
                      </small>
                    </div>
                    <p>{comment.content}</p>
                  </div>

                  {comment.user_id === currentUserId && (
                    <button onClick={() => handleDeleteComment(comment.id)}>
                      삭제
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <aside className={styles.rightPanel}>
        <button
          className={`${styles.sideCard} ${styles.listButton}`}
          onClick={() => router.push("/community")}
        >
          <ListBullets size={15} weight="bold" />
          커뮤니티 목록으로
        </button>

        <section className={styles.sideCard}>
          <h2>{categoryTitle}의 다른 글</h2>

          {relatedPosts.length === 0 ? (
            <p className={styles.smallEmpty}>다른 글이 없어요.</p>
          ) : (
            relatedPosts.map((item) => (
              <button
                key={item.id}
                className={styles.relatedItem}
                onClick={() => router.push(`/community/post/${item.id}`)}
              >
                <div className={styles.relatedThumb}>
                  {item.image ? (
                    <img src={item.image} alt={item.title} />
                  ) : (
                    <Icon size={14} weight="light" color={color} />
                  )}
                </div>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.date}</span>
                </div>
              </button>
            ))
          )}
        </section>

        <section className={styles.sideCard}>
          <h2>인기 글</h2>

          {rankPosts.length === 0 ? (
            <p className={styles.smallEmpty}>아직 인기 글이 없어요.</p>
          ) : (
            rankPosts.map((item, index) => (
              <button
                key={item.id}
                className={styles.rankItem}
                onClick={() => router.push(`/community/post/${item.id}`)}
              >
                <strong>{index + 1}</strong>
                <span>{item.title}</span>
              </button>
            ))
          )}
        </section>

        <section className={styles.sideCard}>
          <h2>커뮤니티 이용 안내</h2>

          <div className={styles.guideRow}>
            <div className={styles.guideIcon}>
              <HandHeart size={14} weight="bold" />
            </div>
            <div>
              <strong>서로 존중하는 따뜻한 대화</strong>
              <span>비방·욕설·상업적 홍보는 금지되어 있어요.</span>
            </div>
          </div>

          <div className={styles.guideRow}>
            <div className={styles.guideIcon}>
              <Lock size={14} weight="bold" />
            </div>
            <div>
              <strong>개인정보 보호</strong>
              <span>아이의 이름, 학교 등 정보 노출에 주의해주세요.</span>
            </div>
          </div>

          <div className={styles.guideRow}>
            <div className={styles.guideIcon}>
              <ShieldCheck size={14} weight="bold" />
            </div>
            <div>
              <strong>유익한 정보 나눔</strong>
              <span>경험과 노하우를 공유하면 더 큰 도움이 돼요.</span>
            </div>
          </div>
        </section>
      </aside>

      {isImageOpen &&
        post.image &&
        createPortal(
          <div
            className={styles.lightboxOverlay}
            onClick={() => setIsImageOpen(false)}
          >
            <button
              className={styles.lightboxClose}
              onClick={(e) => {
                e.stopPropagation();
                setIsImageOpen(false);
              }}
            >
              <X size={18} weight="bold" />
            </button>

            <img
              src={post.image}
              alt={post.title}
              className={styles.lightboxImage}
              onClick={(e) => e.stopPropagation()}
            />
          </div>,
          document.body
        )}
    </section>
  );
}