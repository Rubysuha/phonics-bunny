// lib/logEngagement.ts
import { supabase } from "@/lib/supabase";

export type EngagementAction = "listen" | "listen_line" | "playback";

// 코인 지급 캡(5번)과 무관하게, 실제 듣기/내 녹음 듣기 횟수를 무제한으로 기록
export async function logEngagement({
  contentId,
  contentType,
  action,
}: {
  contentId: string;
  contentType: string;
  action: EngagementAction;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { error } = await supabase.from("content_engagement_logs").insert({
    user_id: user.id,
    content_id: contentId,
    content_type: contentType,
    action,
  });

  if (error) {
    console.error("참여 기록 저장 실패:", error);
  }
}