// 저장 위치: lib/audioToWav.ts
// 녹음된 webm Blob을 Azure Speech가 요구하는 16kHz mono WAV로 변환하고,
// 같은 오디오 데이터에서 목소리 크기(볼륨) 점수(0~10)도 함께 계산합니다.

export type ConvertedRecording = {
  wavBlob: Blob;
  volumeScore: number; // 0 ~ 10점
};

export async function convertRecordingToWav(
  sourceBlob: Blob
): Promise<ConvertedRecording> {
  const arrayBuffer = await sourceBlob.arrayBuffer();

  const AudioContextClass =
    window.AudioContext || (window as any).webkitAudioContext;
  const audioContext = new AudioContextClass();

  const decoded = await audioContext.decodeAudioData(arrayBuffer.slice(0));

  const targetSampleRate = 16000;
  const offlineContext = new OfflineAudioContext(
    1,
    Math.ceil(decoded.duration * targetSampleRate),
    targetSampleRate
  );

  const source = offlineContext.createBufferSource();
  source.buffer = decoded;
  source.connect(offlineContext.destination);
  source.start(0);

  const renderedBuffer = await offlineContext.startRendering();
  const channelData = renderedBuffer.getChannelData(0);

  const volumeScore = calculateVolumeScore(channelData);
  const wavBlob = encodeWav(channelData, targetSampleRate);

  await audioContext.close();

  return { wavBlob, volumeScore };
}

// RMS(평균 음량)를 기준으로 0~10점 매핑.
// MIN_RMS / MAX_RMS는 실제 아이들 목소리로 테스트해보면서 조정하면 돼.
function calculateVolumeScore(samples: Float32Array): number {
  let sumSquares = 0;
  for (let i = 0; i < samples.length; i++) {
    sumSquares += samples[i] * samples[i];
  }
  const rms = Math.sqrt(sumSquares / samples.length);

  const MIN_RMS = 0.01; // 이 이하면 "너무 작은 목소리" → 0점
  const MAX_RMS = 0.2; // 이 이상이면 "충분히 큰 목소리" → 10점

  if (rms <= MIN_RMS) return 0;
  if (rms >= MAX_RMS) return 10;

  return Math.round(((rms - MIN_RMS) / (MAX_RMS - MIN_RMS)) * 10);
}

// Float32 PCM 샘플을 16bit PCM WAV 파일 형식으로 직접 인코딩
function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([buffer], { type: "audio/wav" });
}