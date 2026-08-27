"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChatsCircle, Microphone } from "@phosphor-icons/react";
import { supabase } from "@/lib/supabase";
import { convertRecordingToWav } from "@/lib/audioToWav";
import { getWeakWords } from "@/lib/getWeakWords";
import HelpTooltip from "@/components/HelpTooltip";
import styles from "./ai.module.css";

type ChatMessage = {
  role: "bunny" | "user";
  text: string;
};

const OPENING_LINES = [
  "Hello! What is your name?",
  "Hi there! How are you today?",
  "Hello! What is your favorite animal?",
  "Hi! What did you eat for breakfast?",
  "Hello! Do you have a pet?",
  "Hi! What is your favorite color?",
  "Hello! How old are you?",
  "Hi! What is your favorite food?",
  "Hello! Do you have brothers or sisters?",
  "Hi! What is the weather like today?",
  "Hello! What do you like to play?",
  "Hi! What is your favorite season?",
  "Hello! Do you like drawing?",
  "Hi! What did you do this morning?",
  "Hello! What is your favorite fruit?",
  "Hi! Can you count to ten?",
  "Hello! What is your favorite sport?",
  "Hi! Do you like singing?",
  "Hello! What is your favorite toy?",
  "Hi! What time do you go to bed?",
  "Hello! Do you like reading books?",
  "Hi! What is your favorite subject?",
  "Hello! What animal sound can you make?",
  "Hi! Do you like ice cream?",
  "Hello! What is your best friend's name?",
  "Hi! What do you want to be someday?",
  "Hello! Do you like the beach?",
  "Hi! What is your favorite song?",
  "Hello! What did you dream about last night?",
  "Hi! Do you like rainy days?",
];

export default function AiConversationPage() {
  const router = useRouter();

  const [hasStarted, setHasStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const random = OPENING_LINES[Math.floor(Math.random() * OPENING_LINES.length)];
    return [{ role: "bunny", text: random }];
  });
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [statusText, setStatusText] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const bunnyAudioRef = useRef<HTMLAudioElement | null>(null);

  // 페이지 진입 시 마이크를 미리 한 번만 열어둠
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        streamRef.current = stream;
      })
      .catch((error) => {
        console.error("마이크 사전 준비 실패:", error);
      });

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      bunnyAudioRef.current?.pause();
    };
  }, []);

  // 메시지가 추가될 때마다 맨 아래로 자동 스크롤
  useEffect(() => {
    const el = messageListRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, isProcessing]);

  const playBunnyVoice = async (text: string) => {
    try {
      setIsSpeaking(true);

      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("TTS 요청 실패");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      bunnyAudioRef.current = audio;

      await new Promise<void>((resolve) => {
        audio.onended = () => resolve();
        audio.onerror = () => resolve();
        audio.play().catch(() => resolve());
      });

      URL.revokeObjectURL(audioUrl);
    } catch (error) {
      console.error("바니 목소리 재생 실패:", error);
    } finally {
      setIsSpeaking(false);
    }
  };

  // 두 시작 버튼 공통: 클릭 제스처 안에서 오디오 자동재생 잠금을 미리 풀어둠
  const unlockAutoplay = () => {
    const unlockAudio = new Audio();
    unlockAudio.play().catch(() => {
      // 잠금 해제용 재생이라 에러는 무시해도 됨
    });
  };

  // "바니가 먼저 인사해요" 클릭 핸들러
  const handleStartConversation = () => {
    unlockAutoplay();
    setHasStarted(true);
    playBunnyVoice(messages[0].text);
  };

  // "내가 먼저 말할게요" 클릭 핸들러: 바니의 인사말을 건너뛰고
  // 대화 기록을 비운 채로 바로 사용자가 녹음을 시작할 수 있게 함
  const handleStartAsUser = () => {
    unlockAutoplay();
    setMessages([]);
    setHasStarted(true);
  };

  const handleStartRecording = async () => {
    try {
      let stream = streamRef.current;

      if (!stream) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
      }

      const recorder = new MediaRecorder(stream);
      recordedChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        handleProcessRecording();
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error(error);
      alert("마이크 권한을 확인해줘.");
    }
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleExitConversation = () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
    }
    bunnyAudioRef.current?.pause();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    router.push("/conversation");
  };

  const handleProcessRecording = async () => {
    setIsProcessing(true);
    setStatusText("듣고 있어요...");

    try {
      const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
      const { wavBlob } = await convertRecordingToWav(blob);

      const formData = new FormData();
      formData.append("audio", wavBlob, "recording.wav");

      const sttResponse = await fetch("/api/speech-to-text", {
        method: "POST",
        body: formData,
      });
      const sttData = await sttResponse.json();

      if (!sttResponse.ok || !sttData.text) {
        setStatusText(sttData.error ?? "잘 못 들었어요. 다시 말해볼까요?");
        setIsProcessing(false);
        return;
      }

      const userText: string = sttData.text;
      const nextMessages: ChatMessage[] = [
        ...messages,
        { role: "user", text: userText },
      ];
      setMessages(nextMessages);
      setStatusText("생각하는 중...");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      let weakWords: string[] = [];
      let studiedTypes: string[] = [];
      let level: "beginner" | "elementary" | "intermediate" | "advanced" = "beginner";

      if (user) {
        const summary = await getWeakWords(user.id);
        weakWords = summary.weakWords;
        studiedTypes = summary.studiedTypes;
        level = summary.level;
      }

      const history = messages.map((m) => ({
        role: m.role === "bunny" ? ("assistant" as const) : ("user" as const),
        content: m.text,
      }));

      const convResponse = await fetch("/api/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history,
          weakWords,
          studiedTypes,
          level,
        }),
      });
      const convData = await convResponse.json();

      if (!convResponse.ok || !convData.reply) {
        setStatusText(convData.error ?? "응답 생성에 실패했어요.");
        setIsProcessing(false);
        return;
      }

      setMessages([...nextMessages, { role: "bunny", text: convData.reply }]);
      setStatusText("");

      await playBunnyVoice(convData.reply);
    } catch (error) {
      console.error(error);
      setStatusText("문제가 발생했어요. 다시 시도해줘.");
    } finally {
      setIsProcessing(false);
    }
  };

  const micDisabled = isProcessing || isSpeaking;

  const bunnyStatus = isProcessing
    ? statusText || "듣고 있어요..."
    : isSpeaking
    ? "말하고 있어요..."
    : "짧고 쉬운 영어로 대화해요";

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.inner}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>AI Bunny</h1>
              <p className={styles.subtitle}>AI 토끼와 영어로 대화해요.</p>
            </div>

            <div className={styles.headerActions}>
              <HelpTooltip
                title="이렇게 진행돼요"
                sections={[
                  {
                    heading: "학습 목표",
                    items: [
                      "정답이 정해져 있지 않은 자유 회화예요. 듣고 바로 반응하는 영어 감각을 길러요.",
                      "다른 학습에서 발음 정확도가 낮았던 단어를 대화 중 자연스럽게 다시 등장시켜 복습해요.",
                    ],
                  },
                  {
                    heading: "난이도는 이렇게 정해져요",
                    items: [
                      "Book과 Conversation Practice를 충분히 반복 학습하면 AI Bunny가 쓰는 문장이 자동으로 조금씩 길어지고 풍부해져요.",
                      "왕초보 → 초급 → 중급 → 고급 순으로 올라가며, 짧은 단어 위주 대화에서 점점 더 자연스러운 문장으로 발전해요.",
                      "단순히 화면을 넘기는 게 아니라, 듣고·녹음하고·점수를 확인하는 과정을 충실히 반복해야 다음 단계로 올라가요.",
                      "레벨은 아이의 실제 학습 상태에 맞춰 매 대화마다 자동으로 다시 계산돼요.",
                    ],
                  },
                  {
                    heading: "진행 방법",
                    items: [
                      "Speak를 누르면 마이크가 켜지고, Stop을 누르면 녹음이 종료되며 AI가 답변을 생성해요.",
                      "대화를 시작할 때마다 30가지 주제 중 하나가 무작위로 선택돼요.",
                      "바니가 먼저 인사하게 할 수도 있고, 내가 먼저 말을 걸며 시작할 수도 있어요.",
                      "이 대화는 발음을 채점하지 않아요. 편하게 말하는 연습에 집중해요.",
                      "대화를 마치고 싶으면 대화 종료 버튼을 눌러요.",
                    ],
                  },
                ]}
              />

              <Link href="/conversation" className={styles.backButton}>
                ← Back
              </Link>
            </div>
          </div>

          {!hasStarted ? (
            <div className={styles.chatLayout}>
              <div className={styles.startScreen}>
                <div className={styles.startIcon}>
                  <ChatsCircle size={40} weight="fill" />
                </div>
                <h2 className={styles.startTitle}>Bunny Teacher와 대화할 준비 됐나요?</h2>
                <p className={styles.startDesc}>
                  바니가 먼저 인사하게 할까요, 내가 먼저 말을 걸어볼까요?
                </p>
                <div className={styles.startButtonRow}>
                  <button className={styles.startButton} onClick={handleStartConversation}>
                    바니가 먼저 인사해요
                  </button>
                  <button className={styles.startButtonOutline} onClick={handleStartAsUser}>
                    <Microphone size={18} weight="fill" />
                    내가 먼저 말할게요
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.chatLayout}>
              <div className={styles.bunnyBar}>
                <div
                  className={`${styles.bunnyAvatar} ${
                    isSpeaking ? styles.bunnyAvatarSpeaking : ""
                  }`}
                >
                  <img src="/shop/bunny.png" alt="AI Bunny" />
                </div>
                <div className={styles.bunnyBarText}>
                  <h2>Bunny Teacher</h2>
                  <p className={styles.statusRow}>
                    <span
                      className={`${styles.statusDot} ${
                        isProcessing || isSpeaking ? styles.statusDotActive : ""
                      }`}
                    />
                    {bunnyStatus}
                  </p>
                </div>

                {isSpeaking && (
                  <div className={styles.soundWave} aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </div>
                )}
              </div>

              <div className={styles.messageList} ref={messageListRef}>
                {messages.length === 0 && (
                  <div className={styles.emptyHint}>
                    Speak를 눌러서 먼저 영어로 말을 걸어보세요!
                  </div>
                )}

                {messages.map((m, i) =>
                  m.role === "bunny" ? (
                    <div key={i} className={styles.bunnyRow}>
                      <div className={styles.rowAvatar}>
                        <img src="/shop/bunny.png" alt="" />
                      </div>
                      <div className={styles.bunnyMessage}>{m.text}</div>
                    </div>
                  ) : (
                    <div key={i} className={styles.userRow}>
                      <div className={styles.userMessage}>{m.text}</div>
                    </div>
                  )
                )}

                {isProcessing && !statusText.includes("실패") && (
                  <div className={styles.bunnyRow}>
                    <div className={styles.rowAvatar}>
                      <img src="/shop/bunny.png" alt="" />
                    </div>
                    <div className={styles.typingBubble}>
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.voiceBox}>
                <button
                  className={styles.exitButton}
                  onClick={handleExitConversation}
                >
                  대화 종료
                </button>

                <button
                  className={`${styles.micButton} ${
                    isRecording ? styles.micButtonRecording : ""
                  }`}
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  disabled={micDisabled}
                >
                  {isRecording && <span className={styles.micPulseRing} />}
                  <span className={styles.micButtonLabel}>
                    {isRecording ? "● Stop" : "🎤 Speak"}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}