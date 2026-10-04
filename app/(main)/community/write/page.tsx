"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CaretLeft,
  Carrot,
  MapPin,
  Camera,
  BookOpen,
  Question,
  Sparkle,
} from "@phosphor-icons/react";
import { supabase } from "@/lib/supabase";
import styles from "./write.module.css";
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
import BunnyMark from "../BunnyMark";

type WriteCategoryId = CommunityCategoryId;

const categoryIcon: Record<CommunityCategoryId, React.ElementType> = {
  "study-proof": Camera,
  "english-tip": BookOpen,
  "question": Question,
  "bunny-proud": Sparkle,
  "local-recommend": MapPin,
};

function CommunityWritePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const placeName = searchParams.get("place") || "";
  const placeAddress = searchParams.get("address") || "";
  const queryCategory = searchParams.get("category") as WriteCategoryId | null;

  const writeCategories = communityCategories;

  const getDefaultCategory = (): WriteCategoryId => {
    if (
      queryCategory &&
      writeCategories.some((item) => item.id === queryCategory)
    ) {
      return queryCategory;
    }

    return "study-proof";
  };

  const [category, setCategory] =
    useState<WriteCategoryId>(getDefaultCategory);

  const [title, setTitle] = useState(
    placeName ? `[${placeName}] 궁금한 점이 있어요` : ""
  );

  const [content, setContent] = useState(
    placeName
      ? `장소명: ${placeName}\n주소: ${
          placeAddress || "-"
        }\n\n궁금한 점:\n`
      : ""
  );

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const selectedCategory = writeCategories.find(
    (item) => item.id === category
  );

  const SelectedIcon = categoryIcon[category] ?? BookOpen;
  const selectedColor = categoryColor[category] ?? DEFAULT_CATEGORY_COLOR;
  const selectedTint = categoryTint[category] ?? DEFAULT_CATEGORY_TINT;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    setIsUploading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert("로그인 후 글을 작성할 수 있어요.");
      setIsUploading(false);
      router.push("/login");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("bunny_name, coins")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      alert("사용자 정보를 불러오지 못했어요.");
      console.error(profileError?.message);
      setIsUploading(false);
      return;
    }

    const authorName = profile.bunny_name || "Bunny";
    const currentCoins = profile.coins || 0;

    let imageUrl: string | null = null;

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("community-images")
        .upload(fileName, imageFile);

      if (uploadError) {
        alert(`이미지 업로드에 실패했어요: ${uploadError.message}`);
        console.error(uploadError.message);
        setIsUploading(false);
        return;
      }

      const { data } = supabase.storage
        .from("community-images")
        .getPublicUrl(fileName);

      imageUrl = data.publicUrl;
    }

    const { error: insertError } = await supabase
      .from("community_posts")
      .insert({
        user_id: user.id,
        category,
        title: title.trim(),
        content: content.trim(),
        image_url: imageUrl,
        author: authorName,
        likes: 0,
        comments: [],
      });

    if (insertError) {
      alert("게시글 저장에 실패했어요.");
      console.error(insertError.message);
      setIsUploading(false);
      return;
    }

    const { error: coinError } = await supabase
      .from("profiles")
      .update({
        coins: currentCoins + 3,
      })
      .eq("id", user.id);

    if (coinError) {
      console.error("코인 지급 실패:", coinError.message);
    }

    const { error: logError } = await supabase.from("coin_logs").insert({
      user_id: user.id,
      type: "earn",
      amount: 3,
      reason: "커뮤니티 글쓰기 보상",
    });

    if (logError) {
      console.error("코인 로그 저장 실패:", logError.message);
    }

    alert("게시글이 업로드되었어요! 당근 코인 +3");
    setIsUploading(false);

    if (category === "local-recommend") {
      router.push("/community/local-recommend");
    } else {
      router.push("/community");
    }
  };

  return (
    <section className={styles.page}>
      <button className={styles.backButton} onClick={() => router.back()}>
        <CaretLeft size={20} weight="bold" />
      </button>

      <div className={styles.layout}>
        <aside className={styles.sidePanel}>
          <span className={styles.sideBadge}>COMMUNITY</span>

          <h1>글쓰기</h1>
          <p>학습 경험, 질문, Bunny 자랑을 자유롭게 공유해 보세요.</p>

          <div className={styles.rewardBox}>
            <span>
              <Carrot size={19} weight="bold" />
            </span>
            <div>
              <strong>글쓰기 보상</strong>
              <p>게시글 업로드 시 +3 Coin</p>
            </div>

            <BunnyMark size={34} className={styles.rewardBunny} />
          </div>

          <div className={styles.selectedBox}>
            <span style={{ background: selectedTint, color: selectedColor }}>
              <SelectedIcon size={19} weight="bold" />
            </span>
            <div>
              <strong>{selectedCategory?.title}</strong>
              <p>{selectedCategory?.description}</p>
            </div>
          </div>
        </aside>

        <main className={styles.card}>
          {placeName && (
            <div className={styles.placeInfoBox}>
              <strong>
                <MapPin size={14} weight="bold" />
                선택한 장소
              </strong>
              <p>{placeName}</p>
              <span>{placeAddress || "주소 정보 없음"}</span>
            </div>
          )}

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>카테고리 선택</h2>
              <span>게시글 주제를 골라주세요.</span>
            </div>

            <div className={styles.categoryGrid}>
              {writeCategories.map((item) => {
                const Icon = categoryIcon[item.id] ?? BookOpen;
                const color = categoryColor[item.id] ?? DEFAULT_CATEGORY_COLOR;
                const tint = categoryTint[item.id] ?? DEFAULT_CATEGORY_TINT;

                return (
                  <button
                    key={item.id}
                    className={`${styles.categoryButton} ${
                      category === item.id ? styles.active : ""
                    }`}
                    style={
                      category === item.id
                        ? { background: tint, borderColor: color }
                        : undefined
                    }
                    onClick={() => setCategory(item.id)}
                  >
                    <span style={{ background: tint, color }}>
                      <Icon size={18} weight="bold" />
                    </span>
                    <strong>{item.title}</strong>
                    <em>{item.description}</em>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>게시글 내용</h2>
              <span>제목과 내용을 입력해주세요.</span>
            </div>

            <input
              className={styles.input}
              placeholder="제목을 입력해주세요."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              className={styles.textarea}
              placeholder="내용을 입력해주세요."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>사진 첨부</h2>
              <span>학습 인증이나 Bunny 사진을 올릴 수 있어요.</span>
            </div>

            {!imagePreview ? (
              <label className={styles.imageUploadBox}>
                <Camera size={30} weight="light" />
                <strong>사진 추가하기</strong>
                <em>이미지를 선택하면 미리보기가 보여요.</em>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  hidden
                />
              </label>
            ) : (
              <div className={styles.previewBox}>
                <img src={imagePreview} alt="첨부 이미지" />

                <button
                  type="button"
                  onClick={() => {
                    if (imagePreview) {
                      URL.revokeObjectURL(imagePreview);
                    }

                    setImageFile(null);
                    setImagePreview(null);
                  }}
                >
                  사진 삭제
                </button>
              </div>
            )}
          </div>

          <div className={styles.submitRow}>
            <button
              className={styles.cancelButton}
              onClick={() => router.back()}
              disabled={isUploading}
            >
              취소
            </button>

            <button
              className={styles.submitButton}
              onClick={handleSubmit}
              disabled={isUploading}
            >
              {isUploading ? "업로드 중..." : "업로드 +3 코인"}
            </button>
          </div>
        </main>
      </div>
    </section>
  );
}

export default function CommunityWritePage() {
  return (
    <Suspense fallback={null}>
      <CommunityWritePageInner />
    </Suspense>
  );
}