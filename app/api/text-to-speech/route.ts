import { NextRequest, NextResponse } from "next/server";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

export const runtime = "nodejs";

const AZURE_KEY = process.env.AZURE_SPEECH_KEY;
const AZURE_REGION = process.env.AZURE_SPEECH_REGION;

export async function POST(request: NextRequest) {
  if (!AZURE_KEY || !AZURE_REGION) {
    return NextResponse.json(
      { error: "Azure Speech 설정이 없어요." },
      { status: 500 }
    );
  }

  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "읽을 텍스트가 없어요." }, { status: 400 });
    }

    const audioBuffer = await synthesizeSpeech(text.trim());

    return new NextResponse(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "음성 합성 중 문제가 발생했어요." },
      { status: 500 }
    );
  }
}

function synthesizeSpeech(text: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
      AZURE_KEY!,
      AZURE_REGION!
    );
    speechConfig.speechSynthesisOutputFormat =
      SpeechSDK.SpeechSynthesisOutputFormat.Audio24Khz96KBitRateMonoMp3;

    // audioConfig를 undefined로 두면 서버의 기본 스피커로 재생을 시도하지 않고
    // result.audioData로 오디오 버퍼만 돌려받을 수 있음
    const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, undefined);

    const escapedText = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // rate를 살짝 늦춰서 아이들이 알아듣기 쉽게 조정
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
        <voice name="en-US-AnaNeural">
          <prosody rate="-8%">${escapedText}</prosody>
        </voice>
      </speak>
    `;

    synthesizer.speakSsmlAsync(
      ssml,
      (result) => {
        synthesizer.close();
        if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
          resolve(Buffer.from(result.audioData));
        } else {
          reject(new Error("음성 합성 실패: " + result.errorDetails));
        }
      },
      (error) => {
        synthesizer.close();
        reject(error);
      }
    );
  });
}