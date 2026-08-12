// scripts/generate-book-audio.ts
//
// 실행 방법:
//   npx tsx scripts/generate-book-audio.ts
//
// 필요한 패키지: npm install -D tsx dotenv  (이미 설치했으면 다시 안 해도 됨)
// .env.local 에 AZURE_SPEECH_KEY, AZURE_SPEECH_REGION 이 있어야 함 (기존 발음 분석과 동일한 키/리전 재사용)
//
// 이미 생성된 mp3는 건너뛰므로, 429(요청 제한) 실패가 있었다면
// 그냥 다시 실행하면 실패한 것만 재시도함.

import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { bookLevels } from "../app/(main)/book/data";

dotenv.config({ path: ".env.local" });

const AZURE_KEY = process.env.AZURE_SPEECH_KEY;
const AZURE_REGION = process.env.AZURE_SPEECH_REGION;

// 왜 en-US-AnaNeural인가: Azure 뉴럴 보이스 중 유일하게 "아동 화자용"으로
// 설계된 보이스라서, 파닉스 동화 읽기 톤에 가장 잘 맞음
const VOICE_NAME = "en-US-AnaNeural";

const REQUEST_DELAY_MS = 800; // 요청 사이 기본 딜레이 (429 계속 나면 늘리기)
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

function buildSsml(sentences: string[]) {
  // 문장 사이에 살짝 쉬는 구간을 넣어서 아이가 따라 읽기 편하게 함
  const body = sentences
    .map((s) => `<s>${escapeSsml(s)}</s><break time="450ms"/>`)
    .join("");

  return `<speak version="1.0" xml:lang="en-US">
  <voice xml:lang="en-US" xml:gender="Female" name="${VOICE_NAME}">
    <prosody rate="0.92">${body}</prosody>
  </voice>
</speak>`;
}

async function synthesize(sentences: string[]): Promise<Buffer> {
  const endpoint = `https://${AZURE_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": AZURE_KEY as string,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
      "User-Agent": "phonics-bunny-book-tts",
    },
    body: buildSsml(sentences),
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

async function synthesizeWithRetry(sentences: string[]): Promise<Buffer> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await synthesize(sentences);
    } catch (error) {
      lastError = error;

      const isRateLimit =
        error instanceof Error && error.message.includes("429");

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

  for (const level of bookLevels) {
    for (const story of level.stories) {
      const outDir = path.join(
        process.cwd(),
        "public",
        "audio",
        "book",
        level.level
      );
      const outPath = path.join(outDir, `${story.slug}.mp3`);

      if (fs.existsSync(outPath)) {
        skipped += 1;
        continue;
      }

      fs.mkdirSync(outDir, { recursive: true });

      try {
        console.log(`생성 중: ${level.level}/${story.slug}`);

        const audioBuffer = await synthesizeWithRetry(story.sentences);
        fs.writeFileSync(outPath, audioBuffer);
        created += 1;

        await sleep(REQUEST_DELAY_MS);
      } catch (error) {
        failed += 1;
        console.error(`실패: ${level.level}/${story.slug}`, error);
      }
    }
  }

  console.log(
    `완료! 생성 ${created}개, 이미 있어서 건너뜀 ${skipped}개, 실패 ${failed}개`
  );

  if (failed > 0) {
    console.log("실패한 항목이 있으면 스크립트를 다시 실행해줘 (성공한 건 건너뛰고 실패한 것만 재시도돼).");
  }
}

main();