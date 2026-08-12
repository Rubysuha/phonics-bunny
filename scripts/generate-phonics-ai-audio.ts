// scripts/generate-phonics-ai-audio.ts
//
// 실행: npx tsx scripts/generate-phonics-ai-audio.ts
//
// alphabet / short-vowels / long-vowels / blend-sounds 4개 섹션의
// "AI가 읽어주기" 버튼용 오디오를 한 번에 생성함.
// 기존 audio 필드(수하 목소리)는 전혀 건드리지 않고,
// 새 경로(-ai 폴더)에만 파일을 만듦.

import fs from "fs";
import path from "path";
import dotenv from "dotenv";

import { alphabetItems } from "../app/(main)/english/alphabet/data";
import { shortVowelItems } from "../app/(main)/english/short-vowels/data";
import { longVowelItems } from "../app/(main)/english/long-vowels/data";
import { blendItems } from "../app/(main)/english/blend-sounds/data";

dotenv.config({ path: ".env.local" });

const AZURE_KEY = process.env.AZURE_SPEECH_KEY;
const AZURE_REGION = process.env.AZURE_SPEECH_REGION;
const VOICE_NAME = "en-US-AnaNeural";

const REQUEST_DELAY_MS = 800;
const MAX_RETRIES = 3;

if (!AZURE_KEY || !AZURE_REGION) {
  console.error("AZURE_SPEECH_KEY / AZURE_SPEECH_REGION 환경변수가 없어요.");
  process.exit(1);
}

type Task = {
  label: string;
  text: string;
  outPath: string;
};

function collectTasks(): Task[] {
  const tasks: Task[] = [];

  // 알파벳: item.sentence = 'This is the letter A, pronounced as "a".'
  for (const item of alphabetItems) {
    tasks.push({
      label: `alphabet/${item.letter}`,
      text: item.sentence,
      outPath: path.join("public", "audio", "alphabet-ai", `${item.letter}.mp3`),
    });
  }

  // 숏보울
  for (const group of shortVowelItems) {
    for (const item of group.words) {
      tasks.push({
        label: `short-vowels/${item.slug}`,
        text: item.sentence,
        outPath: path.join("public", "audio", "short-vowels-ai", `${item.slug}.mp3`),
      });
    }
  }

  // 롱보울
  for (const group of longVowelItems) {
    for (const item of group.words) {
      tasks.push({
        label: `long-vowels/${item.slug}`,
        text: item.sentence,
        outPath: path.join("public", "audio", "long-vowels-ai", `${item.slug}.mp3`),
      });
    }
  }

  // 블렌드
  for (const group of blendItems) {
    for (const item of group.words) {
      tasks.push({
        label: `blend-sounds/${item.slug}`,
        text: item.sentence,
        outPath: path.join("public", "audio", "blend-sounds-ai", `${item.slug}.mp3`),
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

function buildSsml(text: string) {
  return `<speak version="1.0" xml:lang="en-US">
  <voice xml:lang="en-US" xml:gender="Female" name="${VOICE_NAME}">
    <prosody rate="0.92">${escapeSsml(text)}</prosody>
  </voice>
</speak>`;
}

async function synthesize(text: string): Promise<Buffer> {
  const endpoint = `https://${AZURE_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": AZURE_KEY as string,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
      "User-Agent": "phonics-bunny-ai-audio",
    },
    body: buildSsml(text),
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

async function synthesizeWithRetry(text: string): Promise<Buffer> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await synthesize(text);
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
      console.log(`생성 중: ${task.label}`);
      const buffer = await synthesizeWithRetry(task.text);
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