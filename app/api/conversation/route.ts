// app/api/conversation/route.ts
import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(request: NextRequest) {
  if (!ANTHROPIC_KEY) {
    return NextResponse.json(
      { error: "서버에 Claude API 키가 설정되어 있지 않아요." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const message: string = body.message;
    const history: ChatMessage[] = body.history ?? [];
    const weakWords: string[] = body.weakWords ?? [];
    const studiedTypes: string[] = body.studiedTypes ?? [];

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "메시지가 비어있어요." }, { status: 400 });
    }

    const levelHint =
      studiedTypes.length === 0
        ? "이 아이는 아직 학습 기록이 거의 없는 왕초보야. 아주 쉬운 단어와 짧은 문장만 사용해."
        : `이 아이는 지금까지 ${studiedTypes.join(", ")} 영역을 공부했어.`;

    const weakWordHint =
      weakWords.length > 0
        ? `이 아이가 특히 어려워하는 단어는 [${weakWords.join(
            ", "
          )}]이야. 자연스러운 타이밍에 이 단어들을 대화 속에 등장시켜서 다시 연습할 기회를 줘. 억지로 끼워넣지 말고, 대화 흐름에 맞을 때만.`
        : "";

    const systemPrompt = `너는 "AI Bunny"라는 이름의 다정한 토끼 캐릭터야. 초등학생 이하의 한국 아이들에게 영어 회화를 가르치는 역할을 해.

규칙:
- 항상 짧고 쉬운 영어 문장만 사용해 (초급자 수준, 5~8단어 이내)
- 매 응답 끝에는 아이가 대답하기 쉬운 짧은 질문을 하나 던져서 대화를 이어가
- 아이가 문법이나 발음을 틀려도 지적하지 말고, 자연스럽게 맞는 표현으로 다시 말해주면서 넘어가
- 아이의 말이 이해가 안 되면 짧고 쉬운 말로 다시 물어봐
- 절대 무섭거나 슬프거나 폭력적인 주제를 꺼내지 마. 항상 밝고 긍정적인 주제(가족, 음식, 동물, 학교, 취미)로 대화해
- 응답은 영어 문장 1~2개로 짧게 유지해

${levelHint}
${weakWordHint}`;

    const messages = [
      ...history,
      { role: "user" as const, content: message },
    ];

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Claude API error:", response.status, errText);
      return NextResponse.json(
        { error: "AI 응답 생성에 실패했어요." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const reply = data?.content?.find((c: any) => c.type === "text")?.text ?? "";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "대화 처리 중 문제가 발생했어요." },
      { status: 500 }
    );
  }
}