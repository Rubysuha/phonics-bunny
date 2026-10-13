import {
  GREETING_TIMEOUT_MS,
  LEVEL_GREETINGS,
  WEAK_WORD_GREETINGS,
  isGreetingWithinLevel,
  type LearningLevel,
} from "@/lib/learningRules";

/*
  AI Bunny 첫 인사 만들기 (규칙 · 문장 목록은 lib/learningRules.ts)
*/

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/*
  2순위: 단계별 고정 인사 (API 호출 없음)

  약한 단어가 있으면 그 단어를 넣은 템플릿을 씀.
  약한 항목이 문장(Book · Conversation)이면 단어 수 규칙을 지킬 수 없으므로
  한 단어로 된 것만 사용
*/
export function buildTemplateGreeting(
  level: LearningLevel,
  weakWords: string[]
): string {
  const weakWord = weakWords.find((item) => /^[A-Za-z]+$/.test(item));

  if (weakWord) {
    const text = pick(WEAK_WORD_GREETINGS[level]).replace(
      "{word}",
      weakWord.toLowerCase()
    );

    if (isGreetingWithinLevel(text, level)) {
      return text;
    }
  }

  return pick(LEVEL_GREETINGS[level]);
}

/*
  1순위: AI 가 만든 인사

  제한 시간 안에 오고, 비어 있지 않고, 단계의 단어 수 규칙을 지킬 때만 문장을 돌려줌.
  그 밖의 모든 경우(시간 초과 · 네트워크 오류 · 규칙 위반 · 취소)는 null
  → 부르는 쪽은 null 이면 아무것도 바꾸지 않으면 됨
*/
export async function requestAiGreeting({
  level,
  knownWords,
  weakWords,
  signal,
  endpoint = "/api/conversation",
}: {
  level: LearningLevel;
  knownWords: string[];
  weakWords: string[];

  /* 화면을 떠날 때 요청을 취소하려고 넘김 */
  signal?: AbortSignal;
  endpoint?: string;
}): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GREETING_TIMEOUT_MS);

  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        greeting: true,
        level,
        knownWords,
        weakWords,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const text = typeof data?.reply === "string" ? data.reply.trim() : "";

    return text && isGreetingWithinLevel(text, level) ? text : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
  }
}
