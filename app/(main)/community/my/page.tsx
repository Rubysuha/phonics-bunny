"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  PencilSimple,
  Coins,
  ChatCircle,
  Trash,
} from "@phosphor-icons/react";
import { supabase } from "@/lib/supabase";
import styles from "./my.module.css";

type MyPost = {
  id: number;
  title: string;
  content: string;
  category: string;
  image_url: string | null;
  created_at: string;
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

type Profile = {
  bunny_name: string | null;
  coins: number | null;
};

export default function CommunityMyPage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<MyPost[]>([]);
  const [comments, setComments] = useState<MyComment[]>([]);
  const [likes, setLikes] = useState<MyLike[]>([]);
  const [activeTab, setActiveTab] = useState<"posts" | "comments" | "likes">(
    "posts"
  );
  const [loading, setLoading] = useState(true);

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
      .select("bunny_name, coins")
      .eq("id", user.id)
      .single();

    const { data: postData, error: postError } = await supabase
      .from("community_posts")
      .select("id, title, content, category, image_url, created_at")
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

    setProfile(profileData);
    setPosts(postData || []);
    setComments(commentData || []);
    setLikes(likeData || []);
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

  if (loading) {
    return (
      <section className={styles.page}>
        <div className={styles.loadingBox}>마이페이지를 불러오는 중이에요...</div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <button className={styles.backButton} onClick={() => router.push("/community")}>
        ←
      </button>

      <header className={styles.header}>
        <div>
          <span>Community My Page</span>
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
          <div className={styles.avatar}>
            <User size={26} weight="bold" />
          </div>
          <div>
            <span>Bunny Name</span>
            <strong>{profile?.bunny_name || "Bunny"}</strong>
            <p>
              <Coins size={14} weight="bold" />
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
            onClick={() => setActiveTab("posts")}
          >
            내가 쓴 글
          </button>

          <button
            className={activeTab === "comments" ? styles.activeTab : ""}
            onClick={() => setActiveTab("comments")}
          >
            내가 쓴 댓글
          </button>

          <button
            className={activeTab === "likes" ? styles.activeTab : ""}
            onClick={() => setActiveTab("likes")}
          >
            좋아요 누른 글
          </button>

          <span>총 활동 {totalActivity}개</span>
        </div>

        {activeTab === "posts" && (
          <div className={styles.list}>
            {posts.length === 0 ? (
              <div className={styles.emptyBox}>아직 작성한 글이 없어요.</div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className={styles.postItem}>
                  <button
                    className={styles.itemMain}
                    onClick={() => router.push(`/community/post/${post.id}`)}
                  >
                    <div className={styles.thumb}>
                      {post.image_url ? (
                        <img src={post.image_url} alt={post.title} />
                      ) : (
                        <ChatCircle size={22} weight="light" />
                      )}
                    </div>

                    <div>
                      <strong>{post.title}</strong>
                      <p>{post.content}</p>
                      <small>
                        {new Date(post.created_at).toLocaleString("ko-KR")}
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
              ))
            )}
          </div>
        )}

        {activeTab === "comments" && (
          <div className={styles.list}>
            {comments.length === 0 ? (
              <div className={styles.emptyBox}>아직 작성한 댓글이 없어요.</div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className={styles.simpleItem}>
                  <button
                    onClick={() =>
                      router.push(`/community/post/${comment.post_id}`)
                    }
                  >
                    <strong>{comment.content}</strong>
                    <small>
                      {new Date(comment.created_at).toLocaleString("ko-KR")}
                    </small>
                  </button>

                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    <Trash size={13} weight="bold" />
                    삭제
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "likes" && (
          <div className={styles.list}>
            {likes.length === 0 ? (
              <div className={styles.emptyBox}>좋아요 누른 글이 없어요.</div>
            ) : (
              likes.map((like) => (
                <div key={like.id} className={styles.simpleItem}>
                  <button
                    onClick={() => router.push(`/community/post/${like.post_id}`)}
                  >
                    <strong>좋아요 누른 게시글</strong>
                    <small>
                      {new Date(like.created_at).toLocaleString("ko-KR")}
                    </small>
                  </button>

                  <button
                    className={styles.deleteButton}
                    onClick={() => handleCancelLike(like.id)}
                  >
                    <Trash size={13} weight="bold" />
                    취소
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
}