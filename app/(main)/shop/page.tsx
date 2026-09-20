"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Backpack,
  Crown,
  Briefcase,
  House,
  Sword,
  Sparkle,
  Shuffle,
  ArrowCounterClockwise,
  Eye,
} from "@phosphor-icons/react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/Toast";
import styles from "./shop.module.css";

import {
  categories,
  bunnySkins,
  backgroundSkins,
  type BunnySkin,
  type BackgroundSkin,
  type CategoryId,
} from "./data";

type ShopTab = "bunny" | "background";

const categoryEnglish: Record<CategoryId, string> = {
  student: "Student",
  royal: "Royal",
  job: "Job",
  family: "Family",
  battle: "Battle",
  fantasy: "Fantasy",
};

// 왼쪽 카테고리 버튼 아이콘 (이모지 대신 Phosphor 아이콘 사용)
const categoryIcon: Record<CategoryId, React.ElementType> = {
  student: Backpack,
  royal: Crown,
  job: Briefcase,
  family: House,
  battle: Sword,
  fantasy: Sparkle,
};

function ShopPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { showToast } = useToast();

  const reactionTimerRef = useRef<number | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [coin, setCoin] = useState(0);

  const [activeCategory, setActiveCategory] = useState<CategoryId>("student");
  const [activeTab, setActiveTab] = useState<ShopTab>("bunny");

  const [ownedBunnies, setOwnedBunnies] = useState<string[]>(["basic_bunny"]);
  const [selectedBunnyId, setSelectedBunnyId] = useState("basic_bunny");
  const [previewBunnyId, setPreviewBunnyId] = useState("basic_bunny");

  const [ownedBackgrounds, setOwnedBackgrounds] = useState<string[]>([
    "default_bg",
  ]);
  const [selectedBackgroundId, setSelectedBackgroundId] =
    useState("default_bg");
  const [previewBackgroundId, setPreviewBackgroundId] =
    useState("default_bg");

  const [isLoading, setIsLoading] = useState(true);

  /* =========================
     BUNNY SHOWCASE
  ========================= */

  const [isShowcaseOpen, setIsShowcaseOpen] = useState(false);
  const [isBunnyReacting, setIsBunnyReacting] = useState(false);

  /* =========================
     QUERY CATEGORY
  ========================= */

  useEffect(() => {
    const categoryParam = searchParams.get("category");

    if (!categoryParam) return;

    const isValid = categories.some(
      (category) => category.id === categoryParam
    );

    if (isValid) {
      setActiveCategory(categoryParam as CategoryId);
    }
  }, [searchParams]);

  /* =========================
     PROFILE
  ========================= */

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        showToast("로그인이 필요해요!");

        setTimeout(() => {
          router.push("/login");
        }, 1000);

        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("profiles")
        .select(
          `
          coins,
          selected_bunny_id,
          owned_bunny_ids,
          selected_background_id,
          owned_background_ids
          `
        )
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("프로필 불러오기 실패:", error);

        setIsLoading(false);
        return;
      }

      const currentBunny = data?.selected_bunny_id ?? "basic_bunny";
      const currentBackground = data?.selected_background_id ?? "default_bg";

      setCoin(data?.coins ?? 0);

      setOwnedBunnies(data?.owned_bunny_ids ?? ["basic_bunny"]);

      setSelectedBunnyId(currentBunny);
      setPreviewBunnyId(currentBunny);

      setOwnedBackgrounds(data?.owned_background_ids ?? ["default_bg"]);

      setSelectedBackgroundId(currentBackground);
      setPreviewBackgroundId(currentBackground);

      setIsLoading(false);
    };

    fetchProfile();
  }, [router, showToast]);

  /* =========================
     SHOWCASE ESC CLOSE
  ========================= */

  useEffect(() => {
    if (!isShowcaseOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsShowcaseOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isShowcaseOpen]);

  /* =========================
     TIMER CLEANUP
  ========================= */

  useEffect(() => {
    return () => {
      if (reactionTimerRef.current !== null) {
        window.clearTimeout(reactionTimerRef.current);
      }
    };
  }, []);

  /* =========================
     DATA
  ========================= */

  const activeCategoryData =
    categories.find((category) => category.id === activeCategory) ??
    categories[0];

  const bunnyOptions = useMemo(() => {
    return bunnySkins.filter(
      (bunny) =>
        bunny.category === activeCategory || bunny.id === "basic_bunny"
    );
  }, [activeCategory]);

  const backgroundOptions = useMemo(() => {
    return backgroundSkins.filter(
      (background) =>
        background.category === activeCategory ||
        background.id === "default_bg"
    );
  }, [activeCategory]);

  const previewBunny =
    bunnySkins.find((bunny) => bunny.id === previewBunnyId) ??
    bunnySkins.find((bunny) => bunny.id === selectedBunnyId) ??
    bunnySkins[0];

  const previewBackground =
    backgroundSkins.find((background) => background.id === previewBackgroundId) ??
    backgroundSkins.find((background) => background.id === selectedBackgroundId) ??
    backgroundSkins[0];

  /* =========================
     COLLECTION
  ========================= */

  const bunnyCollectionCount = ownedBunnies.filter((id) =>
    bunnySkins.some((bunny) => bunny.id === id)
  ).length;

  const backgroundCollectionCount = ownedBackgrounds.filter((id) =>
    backgroundSkins.some((background) => background.id === id)
  ).length;

  const totalCollection = bunnySkins.length + backgroundSkins.length;
  const ownedCollection = bunnyCollectionCount + backgroundCollectionCount;

  const collectionPercent =
    totalCollection > 0
      ? Math.round((ownedCollection / totalCollection) * 100)
      : 0;

  /* =========================
     RARITY SHOWCASE CLASS
  ========================= */

  const showcaseRarityClass =
    previewBunny.rarity === "Legendary"
      ? styles.showcaseLegendary
      : previewBunny.rarity === "Epic"
      ? styles.showcaseEpic
      : previewBunny.rarity === "Rare"
      ? styles.showcaseRare
      : styles.showcaseCommon;

  /* =========================
     UTIL
  ========================= */

  const emitCoinUpdated = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("coin-updated"));
    }
  };

  /* =========================
     CATEGORY
  ========================= */

  const handleCategoryChange = (categoryId: CategoryId) => {
    setActiveCategory(categoryId);

    const firstBunny = bunnySkins.find(
      (bunny) => bunny.category === categoryId && bunny.id !== "basic_bunny"
    );

    if (firstBunny) {
      setPreviewBunnyId(firstBunny.id);
    }
  };

  /* =========================
     BUY BUNNY
  ========================= */

  const handleBuyBunny = async (bunny: BunnySkin) => {
    if (!userId) {
      showToast("로그인이 필요해요!");
      return;
    }

    if (ownedBunnies.includes(bunny.id)) {
      return;
    }

    if (coin < bunny.price) {
      showToast("🥕 당근 코인이 부족해요!");
      return;
    }

    const newCoin = coin - bunny.price;
    const newOwnedBunnies = [...ownedBunnies, bunny.id];

    const { error } = await supabase
      .from("profiles")
      .update({
        coins: newCoin,
        owned_bunny_ids: newOwnedBunnies,
      })
      .eq("id", userId);

    if (error) {
      console.error(error);
      showToast("구매 중 오류가 발생했어요.");
      return;
    }

    const { error: logError } = await supabase.from("coin_logs").insert({
      user_id: userId,
      type: "spend",
      amount: bunny.price,
      reason: `${bunny.name} 구매`,
    });

    if (logError) {
      console.error("코인 기록 저장 실패:", logError);
    }

    setCoin(newCoin);
    setOwnedBunnies(newOwnedBunnies);
    setPreviewBunnyId(bunny.id);

    emitCoinUpdated();

    showToast(`🐰 ${bunny.name} 구매 완료!`);
  };

  /* =========================
     SELECT BUNNY
  ========================= */

  const handleSelectBunny = async (bunny: BunnySkin) => {
    if (!userId) {
      showToast("로그인이 필요해요!");
      return;
    }

    if (!ownedBunnies.includes(bunny.id)) {
      showToast("먼저 구매해야 선택할 수 있어요!");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        selected_bunny_id: bunny.id,
      })
      .eq("id", userId);

    if (error) {
      console.error(error);
      showToast("토끼 선택 중 오류가 발생했어요.");
      return;
    }

    setSelectedBunnyId(bunny.id);
    setPreviewBunnyId(bunny.id);

    showToast(`🐰 ${bunny.name} 선택 완료!`);
  };

  /* =========================
     BUY BACKGROUND
  ========================= */

  const handleBuyBackground = async (background: BackgroundSkin) => {
    if (!userId) {
      showToast("로그인이 필요해요!");
      return;
    }

    if (ownedBackgrounds.includes(background.id)) {
      return;
    }

    if (coin < background.price) {
      showToast("🥕 당근 코인이 부족해요!");
      return;
    }

    const newCoin = coin - background.price;
    const newOwnedBackgrounds = [...ownedBackgrounds, background.id];

    const { error } = await supabase
      .from("profiles")
      .update({
        coins: newCoin,
        owned_background_ids: newOwnedBackgrounds,
      })
      .eq("id", userId);

    if (error) {
      console.error(error);
      showToast("구매 중 오류가 발생했어요.");
      return;
    }

    const { error: logError } = await supabase.from("coin_logs").insert({
      user_id: userId,
      type: "spend",
      amount: background.price,
      reason: `${background.name} 구매`,
    });

    if (logError) {
      console.error("코인 기록 저장 실패:", logError);
    }

    setCoin(newCoin);
    setOwnedBackgrounds(newOwnedBackgrounds);
    setPreviewBackgroundId(background.id);

    emitCoinUpdated();

    showToast(`🖼️ ${background.name} 구매 완료!`);
  };

  /* =========================
     SELECT BACKGROUND
  ========================= */

  const handleSelectBackground = async (background: BackgroundSkin) => {
    if (!userId) {
      showToast("로그인이 필요해요!");
      return;
    }

    if (!ownedBackgrounds.includes(background.id)) {
      showToast("먼저 구매해야 적용할 수 있어요!");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        selected_background_id: background.id,
      })
      .eq("id", userId);

    if (error) {
      console.error(error);
      showToast("배경 적용 중 오류가 발생했어요.");
      return;
    }

    setSelectedBackgroundId(background.id);
    setPreviewBackgroundId(background.id);

    showToast(`🖼️ ${background.name} 적용 완료!`);
  };

  /* =========================
     RANDOM
  ========================= */

  const handleRandomPreview = () => {
    if (activeTab === "bunny") {
      if (bunnyOptions.length === 0) {
        return;
      }

      const randomIndex = Math.floor(Math.random() * bunnyOptions.length);
      setPreviewBunnyId(bunnyOptions[randomIndex].id);

      return;
    }

    if (backgroundOptions.length === 0) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * backgroundOptions.length);
    setPreviewBackgroundId(backgroundOptions[randomIndex].id);
  };

  /* =========================
     RESET
  ========================= */

  const handleResetPreview = () => {
    setPreviewBunnyId(selectedBunnyId);
    setPreviewBackgroundId(selectedBackgroundId);
  };

  /* =========================
     SHOWCASE
  ========================= */

  const handleOpenShowcase = () => {
    // TODO: 원인 확인 후 진단 로그 제거
    console.log("[bunny] showcase open", {
      userAgent: navigator.userAgent,
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches,
      touchPoints: navigator.maxTouchPoints,
    });

    setIsBunnyReacting(false);
    setIsShowcaseOpen(true);
  };

  const triggerBunnyReaction = (source: string) => {
    console.log("[bunny] reaction", source);

    if (reactionTimerRef.current !== null) {
      window.clearTimeout(reactionTimerRef.current);
    }

    setIsBunnyReacting(false);

    window.requestAnimationFrame(() => {
      setIsBunnyReacting(true);
    });

    reactionTimerRef.current = window.setTimeout(() => {
      setIsBunnyReacting(false);
    }, 700);
  };

  // 마우스/터치/펜은 pointerdown으로 통일
  const handleBunnyPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    triggerBunnyReaction(`pointer:${event.pointerType}`);
  };

  // 키보드(Enter/Space)·보조기기 활성화는 detail === 0인 click으로 들어온다
  const handleBunnyClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (event.detail !== 0) return;

    triggerBunnyReaction("keyboard");
  };

  /* =========================
     LOADING
  ========================= */

  if (isLoading) {
    return (
      <section className={styles.page}>
        <div className={styles.loadingBox}>
          Bunny Closet을 준비하고 있어요...
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <div className={styles.pageInner}>
        {/* =====================
            SHOP BACKGROUND
        ===================== */}

        <img
          src={previewBackground.image}
          alt="Shop Background"
          className={styles.bg}
        />

        <div className={styles.darkOverlay} />

        {/* =====================
            TOP
        ===================== */}

        <button
          className={styles.backButton}
          onClick={() => router.push("/dashboard")}
          aria-label="뒤로가기"
        >
          ←
        </button>

        <div className={styles.titleBox}>
          <h1>
            Bunny <span>Closet</span>
          </h1>

          <p>코인을 모아 특별한 Bunny를 만나보세요!</p>
        </div>

        <div className={styles.coinBox}>
          <span className={styles.coinIcon}>🥕</span>
          <strong>{coin}</strong>
          <span className={styles.coinLabel}>Coin</span>
        </div>

        {/* =====================
            SIDEBAR
            (category list + collection card,
            grouped so they can never overlap)
        ===================== */}

        <div className={styles.sidebar}>
          <aside className={styles.categoryBox}>
            {categories.map((category) => {
              const isActive = activeCategory === category.id;
              const Icon = categoryIcon[category.id];

              return (
                <button
                  key={category.id}
                  className={`${styles.categoryButton} ${
                    isActive ? styles.categoryButtonActive : ""
                  }`}
                  onClick={() => handleCategoryChange(category.id)}
                >
                  <span className={styles.categoryIcon}>
                    <Icon size={19} weight="fill" />
                  </span>

                  <span className={styles.categoryText}>
                    <strong>{category.label}</strong>
                    <small>{categoryEnglish[category.id]}</small>
                  </span>
                </button>
              );
            })}
          </aside>

          <div className={styles.collectionBox}>
            <div className={styles.collectionHeader}>
              <span>My Collection</span>
              <strong>{collectionPercent}%</strong>
            </div>

            <div className={styles.collectionDivider} />

            <div className={styles.collectionRow}>
              <span>Bunny</span>

              <strong>
                {bunnyCollectionCount}
                <small> / {bunnySkins.length}</small>
              </strong>
            </div>

            <div className={styles.collectionRow}>
              <span>Background</span>

              <strong>
                {backgroundCollectionCount}
                <small> / {backgroundSkins.length}</small>
              </strong>
            </div>

            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{ width: `${collectionPercent}%` }}
              />
            </div>

            <div className={styles.progressCaption}>Collection Progress</div>
          </div>
        </div>

        {/* =====================
            BUNNY STAGE
        ===================== */}

        <div className={styles.stageArea}>
          <button
            className={`${styles.sideArrow} ${styles.leftArrow}`}
            onClick={() => {
              if (bunnyOptions.length === 0) {
                return;
              }

              const currentIndex = bunnyOptions.findIndex(
                (bunny) => bunny.id === previewBunnyId
              );

              const nextIndex =
                currentIndex <= 0 ? bunnyOptions.length - 1 : currentIndex - 1;

              setPreviewBunnyId(bunnyOptions[nextIndex].id);
            }}
            aria-label="이전 토끼"
          >
            ‹
          </button>

          <div className={styles.bunnyStage}>
            <img
              src={previewBunny.image}
              alt={previewBunny.name}
              className={styles.bunny}
            />

            {selectedBunnyId === previewBunny.id && (
              <div className={styles.selectedBubble}>MY BUNNY</div>
            )}
          </div>

          <button
            className={`${styles.sideArrow} ${styles.rightArrow}`}
            onClick={() => {
              if (bunnyOptions.length === 0) {
                return;
              }

              const currentIndex = bunnyOptions.findIndex(
                (bunny) => bunny.id === previewBunnyId
              );

              const nextIndex =
                currentIndex === bunnyOptions.length - 1
                  ? 0
                  : currentIndex + 1;

              setPreviewBunnyId(bunnyOptions[nextIndex].id);
            }}
            aria-label="다음 토끼"
          >
            ›
          </button>

          <div className={styles.bunnyInfo}>
            <strong>{previewBunny.name}</strong>
            <span>{previewBunny.rarity}</span>
          </div>

          <div className={styles.previewControls}>
            <button
              className={styles.randomButton}
              onClick={handleRandomPreview}
            >
              <Shuffle size={17} weight="bold" />
              <span>랜덤 보기</span>
            </button>

            <button
              className={styles.resetButton}
              onClick={handleResetPreview}
            >
              <ArrowCounterClockwise size={17} weight="bold" />
              <span>원래대로</span>
            </button>

            <button
              className={styles.showcaseButton}
              onClick={handleOpenShowcase}
            >
              <Eye size={17} weight="bold" />
              <span>토끼 보기</span>
            </button>
          </div>
        </div>

        {/* =====================
            SHOP PANEL
        ===================== */}

        <section className={styles.shopPanel}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.panelEyebrow}>
                {categoryEnglish[activeCategory]}
              </span>

              <h2>{activeCategoryData.label}</h2>
            </div>

            <span className={styles.panelCount}>
              {activeTab === "bunny"
                ? `${bunnyOptions.length} Bunny`
                : `${backgroundOptions.length} Background`}
            </span>
          </div>

          <div className={styles.shopTabs}>
            <button
              className={`${styles.shopTab} ${
                activeTab === "bunny" ? styles.shopTabActive : ""
              }`}
              onClick={() => setActiveTab("bunny")}
            >
              Bunny
            </button>

            <button
              className={`${styles.shopTab} ${
                activeTab === "background" ? styles.shopTabActive : ""
              }`}
              onClick={() => setActiveTab("background")}
            >
              Background
            </button>
          </div>

          {/* ===================
              BUNNY ITEMS
          =================== */}

          {activeTab === "bunny" && (
            <div className={styles.itemGrid}>
              {bunnyOptions.map((bunny) => {
                const isOwned = ownedBunnies.includes(bunny.id);
                const isSelected = selectedBunnyId === bunny.id;
                const isPreview = previewBunnyId === bunny.id;

                return (
                  <div
                    key={bunny.id}
                    className={`${styles.itemCard} ${
                      isSelected ? styles.selectedCard : ""
                    } ${isPreview ? styles.previewCard : ""}`}
                    onClick={() => setPreviewBunnyId(bunny.id)}
                  >
                    {isSelected && (
                      <span className={styles.checkBadge}>✓</span>
                    )}

                    {isOwned && (
                      <span className={styles.ownedBadge}>OWNED</span>
                    )}

                    <div className={styles.rarity} data-rarity={bunny.rarity}>
                      {bunny.rarity}
                    </div>

                    <div className={styles.itemImageBox}>
                      <img src={bunny.image} alt={bunny.name} />
                    </div>

                    <h3>{bunny.name}</h3>

                    <div className={styles.price}>🥕 {bunny.price}</div>

                    {!isOwned ? (
                      <button
                        className={styles.buyButton}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleBuyBunny(bunny);
                        }}
                      >
                        구매하기
                      </button>
                    ) : (
                      <button
                        className={
                          isSelected ? styles.selectedButton : styles.selectButton
                        }
                        onClick={(event) => {
                          event.stopPropagation();
                          handleSelectBunny(bunny);
                        }}
                        disabled={isSelected}
                      >
                        {isSelected ? "선택중" : "선택하기"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ===================
              BACKGROUNDS
          =================== */}

          {activeTab === "background" && (
            <div className={styles.backgroundGrid}>
              {backgroundOptions.map((background) => {
                const isOwned = ownedBackgrounds.includes(background.id);
                const isSelected = selectedBackgroundId === background.id;
                const isPreview = previewBackgroundId === background.id;

                return (
                  <div
                    key={background.id}
                    className={`${styles.backgroundCard} ${
                      isSelected ? styles.selectedCard : ""
                    } ${isPreview ? styles.previewCard : ""}`}
                    onClick={() => setPreviewBackgroundId(background.id)}
                  >
                    {isSelected && (
                      <span className={styles.checkBadge}>✓</span>
                    )}

                    {isOwned && (
                      <span className={styles.ownedBadge}>OWNED</span>
                    )}

                    <div className={styles.backgroundImageBox}>
                      <img src={background.image} alt={background.name} />
                    </div>

                    <h3>{background.name}</h3>
                    <p>{background.description}</p>

                    <div className={styles.price}>🥕 {background.price}</div>

                    {!isOwned ? (
                      <button
                        className={styles.buyButton}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleBuyBackground(background);
                        }}
                      >
                        구매하기
                      </button>
                    ) : (
                      <button
                        className={
                          isSelected ? styles.selectedButton : styles.selectButton
                        }
                        onClick={(event) => {
                          event.stopPropagation();
                          handleSelectBackground(background);
                        }}
                        disabled={isSelected}
                      >
                        {isSelected ? "적용중" : "적용하기"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* =====================
            BUNNY SHOWCASE
        ===================== */}

        {isShowcaseOpen && (
          <div className={`${styles.showcaseOverlay} ${showcaseRarityClass}`}>
            <img
              src={previewBackground.image}
              alt={previewBackground.name}
              className={styles.showcaseBackground}
            />

            <div className={styles.showcaseShade} />
            <div className={styles.showcaseLight} />
            <div className={styles.showcaseAura} />
            <div className={styles.showcaseRing} />
            <div className={styles.showcaseRays} />

            <div className={styles.particles} aria-hidden="true">
              <span className={styles.particle1} />
              <span className={styles.particle2} />
              <span className={styles.particle3} />
              <span className={styles.particle4} />
              <span className={styles.particle5} />
              <span className={styles.particle6} />
              <span className={styles.particle7} />
              <span className={styles.particle8} />
              <span className={styles.particle9} />
              <span className={styles.particle10} />
              <span className={styles.particle11} />
              <span className={styles.particle12} />
            </div>

            <button
              className={styles.showcaseClose}
              onClick={() => setIsShowcaseOpen(false)}
              aria-label="토끼 보기 닫기"
            >
              ×
            </button>

            <div className={styles.showcaseCharacterArea}>
              <div className={styles.showcaseGroundShadow} />

              <button
                type="button"
                className={styles.showcaseBunnyButton}
                onPointerDown={handleBunnyPointerDown}
                onClick={handleBunnyClick}
                aria-label={`${previewBunny.name} 반응 보기`}
              >
                <img
                  src={previewBunny.image}
                  alt={previewBunny.name}
                  draggable={false}
                  className={`${styles.showcaseBunnyImage} ${
                    isBunnyReacting ? styles.showcaseBunnyReacting : ""
                  }`}
                />
              </button>
            </div>

            <div className={styles.showcaseInfo}>
              <div className={styles.showcaseRarity}>{previewBunny.rarity}</div>
              <h2>{previewBunny.name}</h2>
              <div className={styles.showcaseLine} />
              <p>캐릭터를 눌러보세요</p>
            </div>

            <div className={styles.showcaseCornerText}>PHONICS BUNNY</div>
          </div>
        )}
      </div>
    </section>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={null}>
      <ShopPageInner />
    </Suspense>
  );
}