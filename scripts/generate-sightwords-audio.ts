// scripts/generate-sightwords-audio.ts
//
// 실행 방법:
//   npx tsx scripts/generate-sightwords-audio.ts
//
// data.ts에 이미 정의된 audio 경로(/audio/sight-words/xxx.mp3)를 그대로 사용해서
// 그 경로에 파일이 없으면 Azure TTS로 생성함.
// (.m4a -> .mp3로 먼저 바꿔둔 다음 실행해줘)

import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { sightWordLevels } from "../app/(main)/english/sight-words/data";

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

function escapeSsml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSsml(word: string) {
  return `<speak version="1.0" xml:lang="en-US">
  <voice xml:lang="en-US" xml:gender="Female" name="${VOICE_NAME}">
    <prosody rate="0.9">${escapeSsml(word)}</prosody>
  </voice>
</speak>`;
}

async function synthesize(word: string): Promise<Buffer> {
  const endpoint = `https://${AZURE_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": AZURE_KEY as string,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
      "User-Agent": "phonics-bunny-sightwords-tts",
    },
    body: buildSsml(word),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Azure TTS 실패 (${response.status}): ${errText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function synthesizeWithRetry(word: string): Promise<Buffer> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await synthesize(word);
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
  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const level of sightWordLevels) {
    for (const item of level.words) {
      const outPath = path.join(process.cwd(), "public", item.audio);
      const outDir = path.dirname(outPath);

      if (fs.existsSync(outPath)) {
        skipped += 1;
        continue;
      }

      fs.mkdirSync(outDir, { recursive: true });

      try {
        console.log(`생성 중: ${level.level}/${item.word}`);

        const audioBuffer = await synthesizeWithRetry(item.word);
        fs.writeFileSync(outPath, audioBuffer);
        created += 1;

        await sleep(REQUEST_DELAY_MS);
      } catch (error) {
        failed += 1;
        console.error(`실패: ${level.level}/${item.word}`, error);
      }
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