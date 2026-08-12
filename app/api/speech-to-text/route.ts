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
    const text = await recognizeSpeech(audioBuffer);

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

function recognizeSpeech(audioBuffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const speechConfig = sdk.SpeechConfig.fromSubscription(AZURE_KEY!, AZURE_REGION!);
    speechConfig.speechRecognitionLanguage = "en-US";

    // 핵심: 문장 중간에 잠깐 멈춰도 "말 끝남"으로 오판하지 않도록
    // 침묵 허용 시간을 기본값(~0.5~1초)에서 2.5초로 늘림
    speechConfig.setProperty(
      sdk.PropertyId.Speech_SegmentationSilenceTimeoutMs,
      "3500"
    );

    const audioConfig = sdk.AudioConfig.fromWavFileInput(audioBuffer);
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    recognizer.recognizeOnceAsync(
      (result) => {
        recognizer.close();
        if (result.reason === sdk.ResultReason.RecognizedSpeech) {
          resolve(result.text);
        } else {
          resolve("");
        }
      },
      (error) => {
        recognizer.close();
        reject(error);
      }
    );
  });
}