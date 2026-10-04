"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CaretLeft,
  PencilSimple,
  Heart,
  ChatCircle,
  Camera,
  BookOpen,
  Question,
  Sparkle,
  MapPin,
} from "@phosphor-icons/react";
import { supabase } from "@/lib/supabase";
import styles from "./category.module.css";
import {
  communityCategories,
  defaultPosts,
  type CommunityCategoryId,
  type CommunityPost,
} from "../data";
import {
  categoryColor,
  categoryTint,
  DEFAULT_CATEGORY_COLOR,
  DEFAULT_CATEGORY_TINT,
} from "../categoryTheme";
import BunnyMark from "../BunnyMark";

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

const categoryIcon: Record<CommunityCategoryId, React.ElementType> = {
  "study-proof": Camera,
  "english-tip": BookOpen,
  "question": Question,
  "bunny-proud": Sparkle,
  "local-recommend": MapPin,
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
          <CaretLeft size={20} weight="bold" />
        </button>

        <div className={styles.inner}>
          <div className={styles.emptyBox}>없는 게시판이에요.</div>
        </div>
      </section>
    );
  }

  const Icon = categoryIcon[category.id] ?? BookOpen;
  const color = categoryColor[category.id] ?? DEFAULT_CATEGORY_COLOR;
  const tint = categoryTint[category.id] ?? DEFAULT_CATEGORY_TINT;

  return (
    <section className={styles.page}>
      <button
        className={styles.backButton}
        onClick={() => router.push("/community")}
      >
        <CaretLeft size={20} weight="bold" />
      </button>

      <div className={styles.inner}>
        <div className={styles.categoryCard}>
          <div className={styles.categoryInfo}>
            <div
              className={styles.categoryIcon}
              style={{ background: tint }}
            >
              <Icon size={24} weight="bold" color={color} />
            </div>

            <div className={styles.categoryText}>
              <span className={styles.eyebrow} style={{ color }}>
                COMMUNITY
              </span>
              <h1>{category.title}</h1>
              <p>{category.description}</p>
            </div>
          </div>

          <div className={styles.headerRight}>
            <span className={styles.countLine}>
              {filteredPosts.length}개의 게시글
            </span>

            <button
              className={styles.writeButton}
              onClick={() =>
                router.push(`/community/write?category=${category.id}`)
              }
            >
              <PencilSimple size={16} weight="bold" />
              글쓰기
            </button>
          </div>
        </div>

        <div className={styles.postList}>
          {isLoading ? (
            <div className={styles.emptyBox}>게시글을 불러오는 중이에요...</div>
          ) : filteredPosts.length === 0 ? (
            <div className={styles.emptyBox}>
              <BunnyMark size={46} />
              아직 게시글이 없어요.
            </div>
          ) : (
            filteredPosts.map((post) => (
              <button
                key={post.id}
                className={styles.postCard}
                onClick={() => router.push(`/community/post/${post.id}`)}
              >
                <div
                  className={styles.postImage}
                  style={{ background: post.image ? undefined : tint }}
                >
                  {post.image ? (
                    <img src={post.image} alt={post.title} />
                  ) : (
                    <Icon size={30} weight="light" color={color} />
                  )}
                </div>

                <div className={styles.postBody}>
                  <span
                    className={styles.postCategory}
                    style={{ color, background: tint }}
                  >
                    {category.title}
                  </span>

                  <h2>{post.title}</h2>
                  <p>{post.content}</p>

                  <div className={styles.postFooter}>
                    <span className={styles.postAuthor}>
                      {post.author} · {post.date}
                    </span>

                    <span className={styles.postStats}>
                      <span>
                        <ChatCircle size={15} weight="regular" />
                        {post.comments.length}
                      </span>
                      <span>
                        <Heart size={15} weight="regular" />
                        {post.likes}
                      </span>
                    </span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </section>
  );
}