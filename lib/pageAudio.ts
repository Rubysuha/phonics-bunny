"use client";

import { useEffect } from "react";

/*
  학습 화면에서 재생하는 소리를 한곳에 모아 두었다가
  화면을 나가면(닫기 · 뒤로가기 · 다른 메뉴 이동) 모두 멈춤

  사용법
  - 화면 컴포넌트 맨 위에서 useStopAudioOnLeave() 를 한 번 호출
  - new Audio(src) 대신 createPageAudio(src) 사용
*/

const playing = new Set<HTMLAudioElement>();

/* 지금 떠 있는 학습 화면 수 (0 이면 이미 화면을 나간 상태) */
let mountedPages = 0;

export function stopAllPageAudio() {
  playing.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });

  playing.clear();
}

export function createPageAudio(src?: string): HTMLAudioElement {
  const audio = src ? new Audio(src) : new Audio();

  /*
    소리를 준비하는 사이(예: AI 음성을 받아오는 중)에 화면을 나갔다면
    뒤늦게 재생되지 않도록 play 를 막음
  */
  if (mountedPages === 0) {
    audio.play = () => Promise.resolve();

    return audio;
  }

  playing.add(audio);

  audio.addEventListener("ended", () => playing.delete(audio));

  return audio;
}

export function useStopAudioOnLeave() {
  useEffect(() => {
    mountedPages += 1;

    return () => {
      mountedPages -= 1;

      stopAllPageAudio();
    };
  }, []);
}
