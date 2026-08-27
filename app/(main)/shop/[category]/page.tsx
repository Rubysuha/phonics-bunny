"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase";
import styles from "./category.module.css";
import {
  categories,
  bunnySkins,
  backgroundSkins,
  type BunnySkin,
  type BackgroundSkin,
  type CategoryId,
} from "../data";
import { useToast } from "@/components/Toast";

type Celebration = {
  type: "bunny" | "background";
  name: string;
  image: string;
};

export default function ShopCategoryPage() {
  const router = useRouter();
  const params = useParams();

  const categoryId = params.category as CategoryId;
  const category = categories.find((item) => item.id === categoryId);

  const [userId, setUserId] = useState<string | null>(null);
  const [coin, setCoin] = useState<number>(0);
  const [ownedBunnies, setOwnedBunnies] = useState<string[]>(["basic_bunny"]);
  const [selectedBunnyId, setSelectedBunnyId] = useState<string>("basic_bunny");
  const [ownedBackgrounds, setOwnedBackgrounds] = useState<string[]>([
    "default_bg",
  ]);
  const [selectedBackgroundId, setSelectedBackgroundId] =
    useState<string>("default_bg");
  const [backgroundImage, setBackgroundImage] = useState<string>(
    "/shop/closet-bg.png"
  );

  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        showToast("로그인이 필요해요!");
        setTimeout(() => {
          router.push("/login");
        }, 1200);
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "coins, selected_bunny_id, owned_bunny_ids, selected_background_id, owned_background_ids"
        )
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("프로필 불러오기 실패:", error);
        return;
      }

      setCoin(data?.coins ?? 0);
      setSelectedBunnyId(data?.selected_bunny_id ?? "basic_bunny");
      setOwnedBunnies(data?.owned_bunny_ids ?? ["basic_bunny"]);
      setOwnedBackgrounds(data?.owned_background_ids ?? ["default_bg"]);

      const currentBgId = data?.selected_background_id ?? "default_bg";
      setSelectedBackgroundId(currentBgId);

      const selectedBg = backgroundSkins.find((bg) => bg.id === currentBgId);

      if (selectedBg) {
        setBackgroundImage(selectedBg.image);
      }
    };

    fetchProfile();
  }, [router]);

  const showCelebration = (item: Celebration) => {
    setCelebration(item);
    setTimeout(() => {
      setCelebration((current) =>
        current && current.name === item.name ? null : current
      );
    }, 1800);
  };

  // 기본 토끼는 항상 맨 앞에, 그 카테고리 전용 토끼들이 뒤에 이어짐
  const defaultBunny = bunnySkins.find((bunny) => bunny.id === "basic_bunny");
  const themedBunnies = bunnySkins.filter(
    (bunny) => bunny.category === categoryId && bunny.id !== "basic_bunny"
  );
  const bunnyOptions = defaultBunny
    ? [defaultBunny, ...themedBunnies]
    : themedBunnies;

  // 기본 배경도 항상 맨 앞에, 그 카테고리 전용 배경이 뒤에 이어짐
  const defaultBackground = backgroundSkins.find(
    (bg) => bg.id === "default_bg"
  );
  const themedBackground = backgroundSkins.find(
    (bg) => bg.category === categoryId && bg.id !== "default_bg"
  );
  const backgroundOptions = [defaultBackground, themedBackground].filter(
    (bg): bg is BackgroundSkin => Boolean(bg)
  );

  const handleBuy = async (bunny: BunnySkin) => {
    if (!userId) {
      showToast("로그인이 필요해요!");
      return;
    }

    if (ownedBunnies.includes(bunny.id)) return;

    if (coin < bunny.price) {
      showToast("🥕 당근 코인이 부족해요!");
      return;
    }

    const newCoin = coin - bunny.price;
    const newOwnedBunnies = [...ownedBunnies, bunny.id];

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        coins: newCoin,
        owned_bunny_ids: newOwnedBunnies,
      })
      .eq("id", userId);

    if (profileError) {
      showToast("구매 중 오류가 발생했어요.");
      console.error(profileError);
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

    showCelebration({ type: "bunny", name: bunny.name, image: bunny.image });
  };

  const handleSelect = async (bunny: BunnySkin) => {
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
      showToast("선택 저장 중 오류가 발생했어요.");
      console.error(error);
      return;
    }

    setSelectedBunnyId(bunny.id);
    showToast(`${bunny.name} 착용 완료!`);
  };

  const handleBuyBackground = async (bg: BackgroundSkin) => {
    if (!userId) {
      showToast("로그인이 필요해요!");
      return;
    }

    if (ownedBackgrounds.includes(bg.id)) return;

    if (coin < bg.price) {
      showToast("🥕 당근 코인이 부족해요!");
      return;
    }

    const newCoin = coin - bg.price;
    const newOwnedBackgrounds = [...ownedBackgrounds, bg.id];

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        coins: newCoin,
        owned_background_ids: newOwnedBackgrounds,
      })
      .eq("id", userId);

    if (profileError) {
      showToast("구매 중 오류가 발생했어요.");
      console.error(profileError);
      return;
    }

    const { error: logError } = await supabase.from("coin_logs").insert({
      user_id: userId,
      type: "spend",
      amount: bg.price,
      reason: `${bg.name} 구매`,
    });

    if (logError) {
      console.error("코인 기록 저장 실패:", logError);
    }

    setCoin(newCoin);
    setOwnedBackgrounds(newOwnedBackgrounds);

    showCelebration({ type: "background", name: bg.name, image: bg.image });
  };

  const handleSelectBackground = async (bg: BackgroundSkin) => {
    if (!userId) {
      showToast("로그인이 필요해요!");
      return;
    }

    if (!ownedBackgrounds.includes(bg.id)) {
      showToast("먼저 구매해야 선택할 수 있어요!");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        selected_background_id: bg.id,
      })
      .eq("id", userId);

    if (error) {
      showToast("선택 저장 중 오류가 발생했어요.");
      console.error(error);
      return;
    }

    setSelectedBackgroundId(bg.id);
    setBackgroundImage(bg.image);
    showToast(`${bg.name} 적용 완료!`);
  };

  if (!category) {
    return (
      <section className={styles.page}>
        <div className={styles.errorBox}>
          <h1>없는 카테고리예요.</h1>
          <button onClick={() => router.push("/shop")}>돌아가기</button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <div className={styles.pageInner}>
        <img src={backgroundImage} alt="closet" className={styles.bg} />

        <button
          className={styles.backButton}
          onClick={() => router.push("/shop")}
        >
          ←
        </button>

        <div className={styles.header}>
          <h1>
            {category.icon} {category.label} Bunny
          </h1>
          <p>마음에 드는 토끼와 배경을 구매하고 선택해 보세요.</p>
        </div>

        <div className={styles.coinBox}>
          <span>🥕</span>
          <strong>{coin}</strong>
          <span>Coin</span>
        </div>

        <div className={styles.grid}>
          {backgroundOptions.map((bg) => (
            <div
              key={bg.id}
              className={`${styles.card} ${
                selectedBackgroundId === bg.id ? styles.selectedCard : ""
              }`}
            >
              <div className={styles.rarity}>Background</div>

              <div className={styles.imageBox}>
                <img src={bg.image} alt={bg.name} />
              </div>

              <h2>{bg.name}</h2>
              <p>{bg.description}</p>

              <div className={styles.price}>🥕 {bg.price} Coin</div>

              {!ownedBackgrounds.includes(bg.id) ? (
                <button
                  className={styles.buyButton}
                  onClick={() => handleBuyBackground(bg)}
                >
                  구매하기
                </button>
              ) : (
                <button
                  className={styles.selectButton}
                  onClick={() => handleSelectBackground(bg)}
                >
                  {selectedBackgroundId === bg.id ? "적용중" : "적용하기"}
                </button>
              )}
            </div>
          ))}

          {bunnyOptions.map((bunny) => {
            const isOwned = ownedBunnies.includes(bunny.id);
            const isSelected = selectedBunnyId === bunny.id;

            return (
              <div
                key={bunny.id}
                className={`${styles.card} ${
                  isSelected ? styles.selectedCard : ""
                }`}
              >
                <div className={styles.rarity}>{bunny.rarity}</div>

                <div className={styles.imageBox}>
                  <img src={bunny.image} alt={bunny.name} />
                </div>

                <h2>{bunny.name}</h2>
                <p>{bunny.description}</p>

                <div className={styles.price}>🥕 {bunny.price} Coin</div>

                {!isOwned ? (
                  <button
                    className={styles.buyButton}
                    onClick={() => handleBuy(bunny)}
                  >
                    구매하기
                  </button>
                ) : (
                  <button
                    className={styles.selectButton}
                    onClick={() => handleSelect(bunny)}
                  >
                    {isSelected ? "선택중" : "선택하기"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {isMounted &&
        celebration &&
        createPortal(
          <div
            className={styles.celebrateOverlay}
            onClick={() => setCelebration(null)}
          >
            <div className={styles.celebrateCard}>
              <div className={styles.celebrateBadge}>🎉</div>

              <img
                src={celebration.image}
                alt={celebration.name}
                className={styles.celebrateImage}
              />

              <p className={styles.celebrateLabel}>
                New {celebration.type === "bunny" ? "Bunny" : "Background"}!
              </p>
              <h2 className={styles.celebrateName}>{celebration.name}</h2>
              <p className={styles.celebrateSub}>Added to your collection!</p>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}