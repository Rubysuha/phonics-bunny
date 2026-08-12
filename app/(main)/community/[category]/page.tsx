"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import styles from "./category.module.css";
import {
  communityCategories,
  defaultPosts,
  type CommunityCategoryId,
  type CommunityPost,
} from "../data";

type SupabasePost = {
  id: number;
  user_id: string | null;
  category: CommunityCategoryId;
  title: string;
  content: string;
  image_url: string | null;
  author: string;
  likes: number;
  comments: string[] | null;
  created_at: string;
};

export default function CommunityCategoryPage() {
  const router = useRouter();
  const params = useParams();

  const categoryId = params.category as CommunityCategoryId;

  const category = communityCategories.find((item) => item.id === categoryId);

  const [posts, setPosts] = useState<CommunityPost[]>(defaultPosts);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("community_posts")
        .select("*")
        .eq("category", categoryId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error.message);
        setPosts(defaultPosts);
        setIsLoading(false);
        return;
      }

      const supabasePosts: CommunityPost[] = (data as SupabasePost[]).map(
        (post) => ({
          id: String(post.id),
          category: post.category,
          title: post.title,
          content: post.content,
          image: post.image_url || undefined,
          author: post.author || "Lucy",
          date: new Date(post.created_at).toLocaleDateString("ko-KR"),
          likes: post.likes || 0,
          comments: post.comments || [],
        })
      );

      setPosts([...supabasePosts, ...defaultPosts]);
      setIsLoading(false);
    };

    fetchPosts();
  }, [categoryId]);

  const filteredPosts = posts.filter((post) => post.category === categoryId);

  if (!category) {
    return (
      <section className={styles.page}>
        <button
          className={styles.backButton}
          onClick={() => router.push("/community")}
        >
          ←
        </button>

        <div className={styles.emptyBox}>없는 게시판이에요.</div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <button
          className={styles.backButton}
          onClick={() => router.push("/community")}
        >
          ←
        </button>

        <div className={`${styles.categoryHero} ${styles[category.color]}`}>
          <span>{category.icon}</span>
          <h1>{category.title}</h1>
          <p>{category.description}</p>

          <button
            className={styles.writeButton}
            onClick={() =>
              router.push(`/community/write?category=${category.id}`)
            }
          >
            ✏️ 이 게시판에 글쓰기
          </button>
        </div>
      </div>

      <div className={styles.postList}>
        {isLoading ? (
          <div className={styles.emptyBox}>게시글을 불러오는 중이에요...</div>
        ) : filteredPosts.length === 0 ? (
          <div className={styles.emptyBox}>아직 게시글이 없어요.</div>
        ) : (
          filteredPosts.map((post) => (
            <button
              key={post.id}
              className={styles.postCard}
              onClick={() => router.push(`/community/post/${post.id}`)}
            >
              {post.image && (
                <div className={styles.postImageBox}>
                  <img src={post.image} alt={post.title} />
                </div>
              )}

              <div className={styles.postTop}>
                <span>{post.author}</span>
                <small>{post.date}</small>
              </div>

              <h2>{post.title}</h2>
              <p>{post.content}</p>

              <div className={styles.postBottom}>
                <span>♡ {post.likes}</span>
                <span>댓글 {post.comments.length}</span>
              </div>
            </button>
          ))
        )}
      </div>
    </section>
  );
}