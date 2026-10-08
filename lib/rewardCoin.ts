import { supabase } from "@/lib/supabase";

export type RewardType =
  | "alphabet"
  | "short-vowels"
  | "long-vowels"
  | "blend-sounds"
  | "sight-words"
  | "conversation"
  | "book";

const REWARD_AMOUNT: Record<RewardType, number> = {
  alphabet: 1,
  "short-vowels": 1,
  "long-vowels": 1,
  "blend-sounds": 1,
  "sight-words": 1,
  conversation: 2,
  book: 3,
};

const DAILY_LIMIT = 100;
const CONTENT_LIMIT = 5;

export async function rewardCoin({
  contentId,
  contentType,
  title,
}: {
  contentId: string;
  contentType: RewardType;
  title: string;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "로그인이 필요해요.",
    };
  }

  const rewardAmount = REWARD_AMOUNT[contentType];

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: todayLogs, error: todayError } = await supabase
    .from("coin_logs")
    .select("amount")
    .eq("user_id", user.id)
    .eq("type", "earn")
    .gte("created_at", todayStart.toISOString());

  if (todayError) {
    console.error("오늘 코인 기록 확인 실패:", todayError);

    return {
      success: false,
      message: "오늘 코인 기록을 확인하지 못했어요.",
    };
  }

  const todayEarned =
    todayLogs?.reduce((sum, log) => sum + (log.amount ?? 0), 0) ?? 0;

  if (todayEarned >= DAILY_LIMIT) {
    return {
      success: false,
      message: "오늘 받을 수 있는 코인을 모두 받았어요.",
    };
  }

  const availableAmount = Math.min(
    rewardAmount,
    DAILY_LIMIT - todayEarned
  );

  const { data: rewardData, error: rewardError } = await supabase
    .from("learning_rewards")
    .select("reward_count, last_rewarded_at")
    .eq("user_id", user.id)
    .eq("content_id", contentId)
    .maybeSingle();

  if (rewardError) {
    console.error("학습 보상 기록 확인 실패:", rewardError);

    return {
      success: false,
      message: "학습 보상 기록을 확인하지 못했어요.",
    };
  }

  const isNewDay =
    !rewardData?.last_rewarded_at ||
    new Date(rewardData.last_rewarded_at) < todayStart;

  const currentCount = isNewDay ? 0 : rewardData?.reward_count ?? 0;

  if (currentCount >= CONTENT_LIMIT) {
    return {
      success: false,
      message: "이 학습은 코인을 5번까지 받았어요.",
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("coins")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("프로필 불러오기 실패:", profileError);

    return {
      success: false,
      message: "프로필 정보를 불러오지 못했어요.",
    };
  }

  const newCoin = (profile?.coins ?? 0) + availableAmount;

  const { error: coinUpdateError } = await supabase
    .from("profiles")
    .update({
      coins: newCoin,
    })
    .eq("id", user.id);

  if (coinUpdateError) {
    console.error("코인 지급 실패:", coinUpdateError);

    return {
      success: false,
      message: "코인 지급에 실패했어요.",
    };
  }

  if (rewardData) {
    const { error: updateRewardError } = await supabase
      .from("learning_rewards")
      .update({
        reward_count: isNewDay ? 1 : currentCount + 1,
        last_rewarded_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("content_id", contentId);

    if (updateRewardError) {
      console.error("보상 횟수 업데이트 실패:", updateRewardError);
    }
  } else {
    const { error: insertRewardError } = await supabase
      .from("learning_rewards")
      .insert({
        user_id: user.id,
        content_id: contentId,
        content_type: contentType,
        reward_count: 1,
        /* 첫 보상에도 시각을 남겨야 같은 날 횟수가 정확히 이어짐 */
        last_rewarded_at: new Date().toISOString(),
      });

    if (insertRewardError) {
      console.error("보상 기록 생성 실패:", insertRewardError);
    }
  }

  const { error: coinLogError } = await supabase.from("coin_logs").insert({
    user_id: user.id,
    type: "earn",
    amount: availableAmount,
    reason: `${title} 학습 완료`,
  });

  if (coinLogError) {
    console.error("코인 기록 저장 실패:", coinLogError);
  }

  const { error: learningLogError } = await supabase
    .from("learning_logs")
    .insert({
      user_id: user.id,
      category: contentType,
      title,
      action: "학습 완료",
    });

  if (learningLogError) {
    console.error("학습 기록 저장 실패:", learningLogError);
  }

  if (typeof window !== "undefined") {
  window.dispatchEvent(new Event("coin-updated"));
  }

  return {
    success: true,
    message: `🥕 ${availableAmount}코인을 받았어요!`,
  };
}