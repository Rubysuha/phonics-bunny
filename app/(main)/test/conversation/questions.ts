import {
  conversationCategories,
  type ConversationDialogue,
} from "@/app/(main)/conversation/data";
import { getConversationQuestionCount } from "@/lib/conversationTestRules";
import { createRandom, hashString, shuffle } from "@/lib/seededRandom";
import { type ConversationTopicId } from "./data";

/*
  Conversation Test 문제

  Conversation 학습(6개 월드)의 대화 데이터에서 만듦:
  대화의 한 줄을 빈칸(___)으로 두고, 그 자리에 알맞은 말을 고르는 문제.
  틀린 보기는 다른 월드의 대화에서 가져옴.

  학습 데이터에 대화를 추가하면 문제도 함께 늘어남
*/

export type ConversationQuestion = {
  id: string;

  topic: Exclude<ConversationTopicId, "final">;

  /* 어떤 대화인지 (월드 · 대화 제목) */
  situation: string;

  /*
    실제 대화
    ___가 들어간 부분을 선택지로 완성
  */
  dialogue: string[];

  prompt: string;

  choices: string[];

  answer: string;

  /* 답을 선택한 뒤 보여줄 짧은 설명 */
  explanation: string;

  /* 그림이 필요한 문제에만 */
  image?: string;
};

type World = Exclude<ConversationTopicId, "final">;

type Source = {
  world: World;
  worldTitle: string;
  dialogue: ConversationDialogue;
};

const sources: Source[] = conversationCategories.flatMap((category) =>
  category.dialogues.map((dialogue) => ({
    world: category.slug as World,
    worldTitle: category.title,
    dialogue,
  }))
);

/* 빈칸 앞에 보여 줄 대화 줄 수 */
const CONTEXT_LINES = 2;

/* 보기 수 (정답 포함) */
const CHOICE_COUNT = 3;

const normalize = (text: string) =>
  text.toLowerCase().replace(/[^a-z ]/g, "").trim();

const wordCount = (text: string) => text.trim().split(/\s+/).length;

/*
  틀린 보기: 다른 월드의 대화에서 가져온 말

  "Thank you!" 처럼 어느 대화에나 어울리는 짧은 말은 정답처럼 보일 수 있어서 빼고,
  정답과 시작이 같은 말도 뺌
*/
function pickDistractors(
  source: Source,
  answer: string,
  random: () => number
): string[] {
  const answerStart = normalize(answer).split(" ").slice(0, 2).join(" ");

  const candidates = sources
    .filter((other) => other.world !== source.world)
    .flatMap((other) => other.dialogue.lines.map((line) => line.text))
    .filter(
      (text) =>
        wordCount(text) >= 3 &&
        normalize(text) !== normalize(answer) &&
        !normalize(text).startsWith(answerStart)
    );

  const picked: string[] = [];

  for (const text of shuffle(candidates, random)) {
    if (picked.some((item) => normalize(item) === normalize(text))) continue;

    picked.push(text);

    if (picked.length === CHOICE_COUNT - 1) break;
  }

  return picked;
}

function makeQuestion(
  source: Source,
  index: number,
  random: () => number
): ConversationQuestion {
  const { dialogue } = source;

  /* 첫 줄은 대화를 여는 말이라 빈칸으로 두지 않음 */
  const blankIndex =
    1 + Math.floor(random() * (dialogue.lines.length - 1));

  const answer = dialogue.lines[blankIndex].text;

  const shown = dialogue.lines
    .slice(Math.max(0, blankIndex - CONTEXT_LINES), blankIndex + 1)
    .map((line, lineIndex, lines) =>
      lineIndex === lines.length - 1
        ? `${line.role}: ___`
        : `${line.role}: ${line.text}`
    );

  return {
    id: `${dialogue.id}-${blankIndex}-${index}`,
    topic: source.world,
    situation: `${source.worldTitle} · ${dialogue.title}`,
    dialogue: shown,
    prompt: "Choose the best response.",
    choices: shuffle(
      [answer, ...pickDistractors(source, answer, random)],
      random
    ),
    answer,
    explanation: `이 대화에 알맞은 말은 “${answer}”예요.`,
  };
}

/*
  seed 가 같으면 같은 문제가 나옴.
  화면에서 들어올 때마다(다시 풀 때도) 새 seed 를 넘겨서 매번 다른 문제를 냄
*/
export function getConversationQuestions(
  topic: ConversationTopicId,
  seed = 0
): ConversationQuestion[] {
  const random = createRandom(hashString(`${topic}-${seed}`));
  const count = getConversationQuestionCount(topic);

  let picked: Source[];

  if (topic === "final") {
    /* 여섯 월드에서 고르게: 월드별로 섞어 두고 돌아가며 하나씩 */
    const byWorld = conversationCategories.map((category) =>
      shuffle(
        sources.filter((source) => source.world === category.slug),
        random
      )
    );

    const ordered: Source[] = [];

    for (let round = 0; ordered.length < sources.length; round += 1) {
      for (const worldSources of byWorld) {
        if (round < worldSources.length) ordered.push(worldSources[round]);
      }
    }

    picked = shuffle(ordered.slice(0, count), random);
  } else {
    const worldSources = shuffle(
      sources.filter((source) => source.world === topic),
      random
    );

    /* 대화가 문제 수보다 적으면 처음부터 다시 사용 */
    picked = Array.from(
      { length: count },
      (_, index) => worldSources[index % worldSources.length]
    );
  }

  return picked.map((source, index) => makeQuestion(source, index, random));
}
