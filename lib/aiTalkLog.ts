import { supabase } from "@/lib/supabase";

/*
  AI Bunny 와 나눈 대화 저장 (ai_conversation_logs)

  AI Learning Coach 가 "아이가 어떤 문장으로 말했는지"를 보여 주고
  다음에 써 볼 문장을 추천하려고 남김.
  저장하지 못해도(테이블이 없거나 네트워크 문제) 대화에는 영향을 주지 않도록
  오류를 밖으로 내보내지 않고, 기다리지도 않음
*/
export function saveAiTalk(childText: string, bunnyText: string) {
  void (async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const now = Date.now();

      const { error } = await supabase.from("ai_conversation_logs").insert([
        {
          user_id: user.id,
          role: "child",
          text: childText.slice(0, 500),
          created_at: new Date(now).toISOString(),
        },
        {
          user_id: user.id,
          role: "bunny",
          text: bunnyText.slice(0, 500),

          /* 아이의 말 바로 뒤에 오도록 조금 뒤 시각으로 */
          created_at: new Date(now + 1).toISOString(),
        },
      ]);

      if (error) {
        console.error("AI 대화 저장 실패:", error.message);
      }
    } catch (error) {
      console.error("AI 대화 저장 실패:", error);
    }
  })();
}
