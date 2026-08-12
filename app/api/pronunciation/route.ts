// 저장 위치: app/api/pronunciation/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

export const runtime = "nodejs";

const AZURE_KEY = process.env.AZURE_SPEECH_KEY;
const AZURE_REGION = process.env.AZURE_SPEECH_REGION;

type AzureWord = {
  Word: string;
  AccuracyScore?: number;
  ErrorType?: string;
};

type UtteranceResult = {
  displayText: string;
  accuracy: number;
  completeness: number;
  words: AzureWord[];
  wordCount: number;
};

// WAV 파일(44바이트 헤더 + PCM)에서 헤더를 떼고 순수 PCM 데이터만 추출
function extractPcmFromWav(wavBuffer: Buffer): Buffer {
  // 표준 WAV 헤더는 44바이트. data 청크가 다르게 시작하는 경우를 대비해 탐색.
  const dataIndex = wavBuffer.indexOf(Buffer.from("data"));
  if (dataIndex === -1) return wavBuffer.subarray(44);
  return wavBuffer.subarray(dataIndex + 8);
}

function runContinuousRecognition(
  pcmBuffer: Buffer,
  referenceText: string
): Promise<UtteranceResult[]> {
  return new Promise((resolve, reject) => {
    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
      AZURE_KEY as string,
      AZURE_REGION as string
    );
    speechConfig.speechRecognitionLanguage = "en-US";

    const format = SpeechSDK.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1);
    const pushStream = SpeechSDK.AudioInputStream.createPushStream(format);

    const arrayBuffer = new ArrayBuffer(pcmBuffer.byteLength);
    new Uint8Array(arrayBuffer).set(pcmBuffer);
    pushStream.write(arrayBuffer);
    pushStream.close();

    const audioConfig = SpeechSDK.AudioConfig.fromStreamInput(pushStream);
    const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

    const pronunciationConfig = new SpeechSDK.PronunciationAssessmentConfig(
      referenceText,
      SpeechSDK.PronunciationAssessmentGradingSystem.HundredMark,
      SpeechSDK.PronunciationAssessmentGranularity.Phoneme,
      true
    );
    pronunciationConfig.applyTo(recognizer);

    const results: UtteranceResult[] = [];
    let settled = false;

    const finish = (err?: unknown) => {
      if (settled) return;
      settled = true;
      recognizer.close();
      if (err) reject(err);
      else resolve(results);
    };

    recognizer.recognized = (_sender, event) => {
      if (event.result.reason !== SpeechSDK.ResultReason.RecognizedSpeech) return;

      const raw = event.result.properties.getProperty(
        SpeechSDK.PropertyId.SpeechServiceResponse_JsonResult
      );

      if (!raw) return;

      try {
        const parsed = JSON.parse(raw);
        const best = parsed?.NBest?.[0];
        if (!best) return;

        const words: AzureWord[] = best.Words ?? [];

        results.push({
          displayText: best.Display ?? event.result.text ?? "",
          accuracy: best.PronunciationAssessment?.AccuracyScore ?? best.AccuracyScore ?? 0,
          completeness:
            best.PronunciationAssessment?.CompletenessScore ?? best.CompletenessScore ?? 0,
          words,
          wordCount: words.length || 1,
        });
      } catch (parseErr) {
        console.error("발음 결과 파싱 실패:", parseErr);
      }
    };

    recognizer.canceled = (_sender, event) => {
      if (event.reason === SpeechSDK.CancellationReason.Error) {
        finish(new Error(event.errorDetails));
      } else {
        finish();
      }
    };

    recognizer.sessionStopped = () => {
      finish();
    };

    recognizer.startContinuousRecognitionAsync(
      () => {},
      (err) => finish(err)
    );
  });
}

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
    const referenceText = formData.get("referenceText") as string | null;
    const volumeScoreRaw = formData.get("volumeScore") as string | null;

    if (!audioFile || !referenceText) {
      return NextResponse.json(
        { error: "오디오 또는 목표 문장이 없어요." },
        { status: 400 }
      );
    }

    const volumeScore = volumeScoreRaw ? Number(volumeScoreRaw) : 0;
    const wavBuffer = Buffer.from(await audioFile.arrayBuffer());
    const pcmBuffer = extractPcmFromWav(wavBuffer);

    const utterances = await runContinuousRecognition(pcmBuffer, referenceText);

    if (utterances.length === 0) {
      return NextResponse.json({
        score: 0,
        recognizedText: "",
        feedback: ["목소리를 잘 못 들었어요. 마이크에 조금 더 가까이서 또박또박 말해볼까요?"],
      });
    }

    // 문장(발화)마다 단어 수로 가중 평균 — 긴 발화가 점수에 더 크게 반영되도록
    const totalWords = utterances.reduce((sum, u) => sum + u.wordCount, 0);

    const accuracy =
      utterances.reduce((sum, u) => sum + u.accuracy * u.wordCount, 0) / totalWords;

    const completeness =
      utterances.reduce((sum, u) => sum + u.completeness * u.wordCount, 0) / totalWords;

    const finalScore = Math.round(accuracy * 0.7 + completeness * 0.2 + volumeScore * 1);

    const allWords = utterances.flatMap((u) => u.words);
    const feedback = buildFeedback(allWords);
    const recognizedText = utterances.map((u) => u.displayText).join(" ");

    return NextResponse.json({
      score: Math.min(100, Math.max(0, finalScore)),
      accuracy: Math.round(accuracy),
      completeness: Math.round(completeness),
      volumeScore,
      recognizedText,
      feedback,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "발음 분석 중 문제가 발생했어요." },
      { status: 500 }
    );
  }
}

function buildFeedback(words: AzureWord[]): string[] {
  if (words.length === 0) return [];

  const messages: string[] = [];

  words.forEach((w) => {
    const acc = w.AccuracyScore ?? 100;
    const errorType = w.ErrorType;

    if (errorType === "Omission") {
      messages.push(`"${w.Word}" 소리가 빠졌어요. 다시 한번 발음해볼까요?`);
    } else if (errorType === "Mispronunciation" || acc < 60) {
      messages.push(`"${w.Word}" 발음을 조금 더 또렷하게 말해보세요.`);
    }
  });

  const uniqueMessages = Array.from(new Set(messages));

  if (uniqueMessages.length === 0) {
    uniqueMessages.push("발음이 아주 정확해요!");
  }

  return uniqueMessages;
}