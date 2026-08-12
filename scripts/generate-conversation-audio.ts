// scripts/generate-conversation-audio.ts
//
// 실행: npx tsx scripts/generate-conversation-audio.ts
//
// conversation의 각 대화 줄(line)마다 "역할(role)"을 기준으로 목소리를 다르게 매핑함.
// 같은 성별이어도 어른/아이/노년 역할에 따라 다른 보이스를 씀.
// Boy/Brother는 피치를 살짝 올려서 더 어리게 들리도록 처리함.

import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { conversationCategories } from "../app/(main)/conversation/data";

dotenv.config({ path: ".env.local" });

const AZURE_KEY = process.env.AZURE_SPEECH_KEY;
const AZURE_REGION = process.env.AZURE_SPEECH_REGION;

// 역할 이름 기준 목소리 매핑 (있으면 이걸 우선 사용)
const ROLE_VOICE_MAP: Record<string, string> = {
  Mom: "en-US-JennyNeural",
  Teacher: "en-US-JennyNeural",
  Dad: "en-US-GuyNeural",
  Waiter: "en-US-GuyNeural",
  Grandma: "en-US-NancyNeural",
  Grandpa: "en-US-RogerNeural",
  Girl: "en-US-AnaNeural",
  Sister: "en-US-AnaNeural",
  Boy: "en-US-AndrewNeural",
  Brother: "en-US-AndrewNeural",
};

// 매핑에 없는 역할이 나오면 성별 기준으로 대체
const FALLBACK_VOICE_BY_GENDER = {
  female: "en-US-JennyNeural",
  male: "en-US-GuyNeural",
} as const;

// 이 역할들은 피치를 살짝 올려서 더 어리게 들리도록 함
const PITCH_BOOST_ROLES = new Set(["Boy", "Brother"]);

function getVoiceName(role: string, gender: "male" | "female") {
  return ROLE_VOICE_MAP[role] ?? FALLBACK_VOICE_BY_GENDER[gender];
}

const REQUEST_DELAY_MS = 800;
const MAX_RETRIES = 3;

if (!AZURE_KEY || !AZURE_REGION) {
  console.error("AZURE_SPEECH_KEY / AZURE_SPEECH_REGION 환경변수가 없어요.");
  process.exit(1);
}

type Task = {
  label: string;
  text: string;
  voiceName: string;
  gender: "male" | "female";
  boostPitch: boolean;
  outPath: string;
};

function collectTasks(): Task[] {
  const tasks: Task[] = [];

  for (const category of conversationCategories) {
    for (const dialogue of category.dialogues) {
      dialogue.lines.forEach((line, index) => {
        tasks.push({
          label: `${dialogue.id}-${index} (${line.role})`,
          text: line.text,
          voiceName: getVoiceName(line.role, line.gender),
          gender: line.gender,
          boostPitch: PITCH_BOOST_ROLES.has(line.role),
          outPath: path.join("public", "audio", "conversation", `${dialogue.id}-${index}.mp3`),
        });
      });
    }
  }

  return tasks;
}

function escapeSsml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSsml(
  text: string,
  voiceName: string,
  gender: "male" | "female",
  boostPitch: boolean
) {
  const xmlGender = gender === "male" ? "Male" : "Female";
  const pitchAttr = boostPitch ? ` pitch="+25%"` : "";

  return `<speak version="1.0" xml:lang="en-US">
  <voice xml:lang="en-US" xml:gender="${xmlGender}" name="${voiceName}">
    <prosody rate="0.92"${pitchAttr}>${escapeSsml(text)}</prosody>
  </voice>
</speak>`;
}

async function synthesize(
  text: string,
  voiceName: string,
  gender: "male" | "female",
  boostPitch: boolean
): Promise<Buffer> {
  const endpoint = `https://${AZURE_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": AZURE_KEY as string,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
      "User-Agent": "phonics-bunny-conversation-tts",
    },
    body: buildSsml(text, voiceName, gender, boostPitch),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Azure TTS 실패 (${response.status}): ${errText}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function synthesizeWithRetry(
  text: string,
  voiceName: string,
  gender: "male" | "female",
  boostPitch: boolean
): Promise<Buffer> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await synthesize(text, voiceName, gender, boostPitch);
    } catch (error) {
      lastError = error;
      const isRateLimit = error instanceof Error && error.message.includes("429");

      if (!isRateLimit || attempt >= MAX_RETRIES) {
        throw error;
      }

      const waitMs = 3000 * attempt;
      console.log(`  429 재시도 대기 중... (${attempt}/${MAX_RETRIES}, ${waitMs}ms 대기)`);
      await sleep(waitMs);
    }
  }

  throw lastError;
}

async function main() {
  const tasks = collectTasks();

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const task of tasks) {
    const outPath = path.join(process.cwd(), task.outPath);
    const outDir = path.dirname(outPath);

    if (fs.existsSync(outPath)) {
      skipped += 1;
      continue;
    }

    fs.mkdirSync(outDir, { recursive: true });

    try {
      console.log(`생성 중: ${task.label} → ${task.voiceName}${task.boostPitch ? " (피치+15%)" : ""}`);
      const buffer = await synthesizeWithRetry(
        task.text,
        task.voiceName,
        task.gender,
        task.boostPitch
      );
      fs.writeFileSync(outPath, buffer);
      created += 1;

      await sleep(REQUEST_DELAY_MS);
    } catch (error) {
      failed += 1;
      console.error(`실패: ${task.label}`, error);
    }
  }

  console.log(
    `완료! 생성 ${created}개, 이미 있어서 건너뜀 ${skipped}개, 실패 ${failed}개`
  );

  if (failed > 0) {
    console.log("실패한 항목이 있으면 스크립트를 다시 실행해줘.");
  }
}

main();