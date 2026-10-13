import { supabase } from "@/lib/supabase";
import { TEST_COIN } from "@/lib/learningRules";

/*
  Test 코인

  - 새로 딴 별에만 지급 (이미 딴 별은 다시 풀어도 코인이 없음)
  - 한 영역의 Stage 를 모두 통과하면 보너스 한 번
  - 한 번만 받는 보상이라 학습 코인의 하루 한도(lib/rewardCoin.ts)와는 별개
    → coin_logs 의 reason 을 TEST_COIN_REASON_PREFIX 로 시작하게 남겨서 한도 계산에서 뺌
*/

export const TEST_COIN_REASON_PREFIX = "Test ";

export type TestCoinResult = {
  /* 이번에 새로 딴 별 개수 */
  newStars: number;

  /* 새 별로 받은 코인 */
  starCoins: number;

  /* 영역 전체 통과 보너스 (받지 않았으면 0) */
  bonusCoins: number;
};

export const NO_TEST_COIN: TestCoinResult = {
  newStars: 0,
  starCoins: 0,
  bonusCoins: 0,
};

type Bonus = {
  /* 영역을 구분하는 이름 (예: "Phonics alphabet") — 한 번만 주려고 기록에 남김 */
  name: string;

  /* 이 영역의 Stage 를 모두 통과했는지 */
  isComplete: () => Promise<boolean>;
};

export async function rewardTestCoins({
  userId,
  title,
  previousStars,
  stars,
  coinPerStar,
  bonus,
}: {
  userId: string;

  /* 코인 기록에 남길 이름 (예: "Phonics alphabet Stage 2") */
  title: string;

  /* 이번 결과를 저장하기 전의 최고 별 개수 · 이번에 받은 별 개수 */
  previousStars: number;
  stars: number;

  coinPerStar: number;
  bonus?: Bonus;
}): Promise<TestCoinResult> {
  const newStars = Math.max(0, stars - previousStars);
  const starCoins = newStars * coinPerStar;

  let bonusCoins = 0;
  const bonusReason = bonus
    ? `${TEST_COIN_REASON_PREFIX}${bonus.name} 전체 통과 보너스`
    : "";

  if (bonus && (await bonus.isComplete())) {
    /* 이미 받은 보너스인지 확인 */
    const { data: given, error } = await supabase
      .from("coin_logs")
      .select("id")
      .eq("user_id", userId)
      .eq("reason", bonusReason)
      .limit(1);

    if (error) {
      console.error("Test 보너스 기록 확인 실패:", error);
    } else if (!given || given.length === 0) {
      bonusCoins = TEST_COIN.areaBonus;
    }
  }

  const total = starCoins + bonusCoins;

  if (total === 0) {
    return { newStars, starCoins: 0, bonusCoins: 0 };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("coins")
    .eq("id", userId)
    .single();

  if (profileError) {
    console.error("프로필 불러오기 실패:", profileError);

    return { newStars, starCoins: 0, bonusCoins: 0 };
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ coins: (profile?.coins ?? 0) + total })
    .eq("id", userId);

  if (updateError) {
    console.error("Test 코인 지급 실패:", updateError);

    return { newStars, starCoins: 0, bonusCoins: 0 };
  }

  const logs = [];

  if (starCoins > 0) {
    logs.push({
      user_id: userId,
      type: "earn",
      amount: starCoins,
      reason: `${TEST_COIN_REASON_PREFIX}${title} 새 별 ${newStars}개`,
    });
  }

  if (bonusCoins > 0) {
    logs.push({
      user_id: userId,
      type: "earn",
      amount: bonusCoins,
      reason: bonusReason,
    });
  }

  const { error: logError } = await supabase.from("coin_logs").insert(logs);

  if (logError) {
    console.error("코인 기록 저장 실패:", logError);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("coin-updated"));
  }

  return { newStars, starCoins, bonusCoins };
}
