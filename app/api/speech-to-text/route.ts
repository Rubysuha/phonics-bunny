import { NextRequest, NextResponse } from "next/server";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";

const AZURE_KEY = process.env.AZURE_SPEECH_KEY;
const AZURE_REGION = process.env.AZURE_SPEECH_REGION;

export async function POST(request: NextRequest) {
  if (!AZURE_KEY || !AZURE_REGION) {
    return NextResponse.json(
      { error: "서버에 Azure Speech 키가 설정되어 있지 않아요." },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: "오디오가 없어요." }, { status: 400 });
    }

    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    const text = await recognizeChildSpeech(audioBuffer);

    if (!text) {
      return NextResponse.json({
        text: "",
        error: "목소리를 잘 못 들었어요. 다시 말해볼까요?",
      });
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "음성 인식 중 문제가 발생했어요." },
      { status: 500 }
    );
  }
}

/*
  영어로 말하다가 한국어로 말해도 알아듣기

  기존 영어 인식(recognizeSpeech)은 그대로 돌리고, 한국어 · 영어 자동 감지를 함께 돌림.
  - 자동 감지가 영어라고 하거나 실패하면 → 기존 영어 인식 결과 (예전과 같은 동작)
  - 자동 감지가 한국어라고 해도 영어 인식이 충분히 또렷하면 → 영어 결과
    (짧은 영어를 한국어로 잘못 판단하는 경우를 막음)
  - 그 밖에는 → 한국어 결과
*/

/* 영어 인식 신뢰도가 이 값 이상이면 한국어로 감지돼도 영어로 봄 */
const CLEAR_ENGLISH_CONFIDENCE = 0.5;

/* 자동 감지를 기다리는 최대 시간 (넘으면 기존 영어 인식 결과만 씀) */
const AUTO_DETECT_TIMEOUT_MS = 6000;

async function recognizeChildSpeech(audioBuffer: Buffer): Promise<string> {
  const [english, detected] = await Promise.all([
    recognizeEnglish(audioBuffer),

    /* 자동 감지가 실패하거나 늦어도 기존 영어 인식에는 영향이 없게 함 */
    Promise.race([
      recognizeAutoDetect(audioBuffer),
      new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), AUTO_DETECT_TIMEOUT_MS)
      ),
    ]).catch((error) => {
      console.error("언어 자동 감지 실패:", error);
      return null;
    }),
  ]);

  const isKorean =
    detected !== null &&
    detected.language.startsWith("ko") &&
    /[가-힣]/.test(detected.text);

  if (!isKorean) {
    return english.text;
  }

  if (english.text && english.confidence >= CLEAR_ENGLISH_CONFIDENCE) {
    return english.text;
  }

  return detected.text;
}

function createSpeechConfig() {
  const speechConfig = sdk.SpeechConfig.fromSubscription(AZURE_KEY!, AZURE_REGION!);

  // 핵심: 문장 중간에 잠깐 멈춰도 "말 끝남"으로 오판하지 않도록 침묵 허용 시간을 늘림
  speechConfig.setProperty(
    sdk.PropertyId.Speech_SegmentationSilenceTimeoutMs,
    "3500"
  );

  /* 인식 신뢰도를 함께 받음 */
  speechConfig.outputFormat = sdk.OutputFormat.Detailed;

  return speechConfig;
}

function readConfidence(result: sdk.SpeechRecognitionResult): number {
  try {
    return JSON.parse(result.json)?.NBest?.[0]?.Confidence ?? 0;
  } catch {
    return 0;
  }
}

/* 기존과 같은 영어 인식 + 신뢰도 */
function recognizeEnglish(
  audioBuffer: Buffer
): Promise<{ text: string; confidence: number }> {
  return new Promise((resolve, reject) => {
    const speechConfig = createSpeechConfig();
    speechConfig.speechRecognitionLanguage = "en-US";

    const audioConfig = sdk.AudioConfig.fromWavFileInput(audioBuffer);
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    recognizer.recognizeOnceAsync(
      (result) => {
        recognizer.close();

        if (result.reason === sdk.ResultReason.RecognizedSpeech) {
          resolve({ text: result.text, confidence: readConfidence(result) });
        } else {
          resolve({ text: "", confidence: 0 });
        }
      },
      (error) => {
        recognizer.close();
        reject(error);
      }
    );
  });
}

/* 한국어 · 영어 자동 감지 인식 */
function recognizeAutoDetect(
  audioBuffer: Buffer
): Promise<{ text: string; language: string }> {
  return new Promise((resolve, reject) => {
    const audioConfig = sdk.AudioConfig.fromWavFileInput(audioBuffer);

    const recognizer = sdk.SpeechRecognizer.FromConfig(
      createSpeechConfig(),
      sdk.AutoDetectSourceLanguageConfig.fromLanguages(["en-US", "ko-KR"]),
      audioConfig
    );

    recognizer.recognizeOnceAsync(
      (result) => {
        recognizer.close();

        if (result.reason === sdk.ResultReason.RecognizedSpeech) {
          resolve({
            text: result.text,
            language:
              sdk.AutoDetectSourceLanguageResult.fromResult(result).language ??
              "",
          });
        } else {
          resolve({ text: "", language: "" });
        }
      },
      (error) => {
        recognizer.close();
        reject(error);
      }
    );
  });
}
