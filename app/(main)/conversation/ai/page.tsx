"use client";

import { createPageAudio, useStopAudioOnLeave } from "@/lib/pageAudio";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChatsCircle,
  Microphone,
  Sparkle,
  Star,
  SpeakerHigh,
} from "@phosphor-icons/react";

import { supabase } from "@/lib/supabase";
import {
  convertRecordingToWav,
  createSupportedMediaRecorder,
} from "@/lib/audioToWav";
import {
  loadMyLearningSummary,
  type LearningSummary,
} from "@/lib/learningProgress";
import {
  LEVEL_UP_COOLDOWN_DAYS,
  type LearningLevel,
} from "@/lib/learningRules";
import { sightWordLevels } from "@/app/(main)/english/sight-words/data";
import LevelCard from "@/components/LevelCard";
import HelpTooltip from "@/components/HelpTooltip";

import styles from "./ai.module.css";
import { useToast } from "@/components/Toast";

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
  const { showToast } = useToast();

  const router = useRouter();

  /* 이 화면을 나가면 재생 중인 소리를 모두 멈춤 */
  useStopAudioOnLeave();

  const [hasStarted, setHasStarted] = useState(false);

  /* 학습 단계 (단계 카드 · AI Bunny 말 속도에 사용) */
  const [summary, setSummary] =
    useState<LearningSummary | null>(null);

  const levelRef =
    useRef<LearningLevel>("beginner");

  useEffect(() => {
    let cancelled = false;

    loadMyLearningSummary().then((loaded) => {
      if (cancelled || !loaded) return;

      levelRef.current = loaded.level;
      setSummary(loaded);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const random =
      OPENING_LINES[
        Math.floor(
          Math.random() *
            OPENING_LINES.length
        )
      ];

    return [
      {
        role: "bunny",
        text: random,
      },
    ];
  });

  const [isRecording, setIsRecording] =
    useState(false);

  const [isProcessing, setIsProcessing] =
    useState(false);

  const [isSpeaking, setIsSpeaking] =
    useState(false);

  const [statusText, setStatusText] =
    useState("");

  const mediaRecorderRef =
    useRef<MediaRecorder | null>(null);

  const recordedChunksRef =
    useRef<Blob[]>([]);

  const streamRef =
    useRef<MediaStream | null>(null);

  const messageListRef =
    useRef<HTMLDivElement | null>(null);

  const bunnyAudioRef =
    useRef<HTMLAudioElement | null>(null);

  /* ─────────────────────────────
     Mic prepare
  ───────────────────────────── */

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
      })
      .then((stream) => {
        streamRef.current =
          stream;
      })
      .catch((error) => {
        console.error(
          "마이크 사전 준비 실패:",
          error
        );
      });

    return () => {
      streamRef.current
        ?.getTracks()
        .forEach(
          (track) =>
            track.stop()
        );

      streamRef.current =
        null;

      bunnyAudioRef.current?.pause();
    };
  }, []);

  /* ─────────────────────────────
     Auto scroll
  ───────────────────────────── */

  useEffect(() => {
    const el =
      messageListRef.current;

    if (el) {
      el.scrollTop =
        el.scrollHeight;
    }
  }, [
    messages,
    isProcessing,
  ]);

  /* ─────────────────────────────
     Bunny voice
  ───────────────────────────── */

  const playBunnyVoice =
    async (
      text: string
    ) => {
      try {
        setIsSpeaking(
          true
        );

        const response =
          await fetch(
            "/api/text-to-speech",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  text,
                  level:
                    levelRef.current,
                }),
            }
          );

        if (
          !response.ok
        ) {
          throw new Error(
            "TTS 요청 실패"
          );
        }

        const audioBlob =
          await response.blob();

        const audioUrl =
          URL.createObjectURL(
            audioBlob
          );

        const audio =
          createPageAudio(
            audioUrl
          );

        bunnyAudioRef.current =
          audio;

        await new Promise<void>(
          (resolve) => {
            audio.onended =
              () =>
                resolve();

            audio.onerror =
              () =>
                resolve();

            audio
              .play()
              .catch(
                () =>
                  resolve()
              );
          }
        );

        URL.revokeObjectURL(
          audioUrl
        );
      } catch (error) {
        console.error(
          "바니 목소리 재생 실패:",
          error
        );
      } finally {
        setIsSpeaking(
          false
        );
      }
    };

  /* ─────────────────────────────
     Start
  ───────────────────────────── */

  const unlockAutoplay =
    () => {
      const unlockAudio =
        createPageAudio();

      unlockAudio
        .play()
        .catch(() => {});
    };

  const handleStartConversation =
    () => {
      unlockAutoplay();

      setHasStarted(
        true
      );

      playBunnyVoice(
        messages[0].text
      );
    };

  const handleStartAsUser =
    () => {
      unlockAutoplay();

      setMessages([]);

      setHasStarted(
        true
      );
    };

  /* ─────────────────────────────
     Recording
  ───────────────────────────── */

  const handleStartRecording =
    async () => {
      try {
        let stream =
          streamRef.current;

        if (!stream) {
          stream =
            await navigator.mediaDevices.getUserMedia(
              {
                audio: true,
              }
            );

          streamRef.current =
            stream;
        }

        const recorder =
          createSupportedMediaRecorder(
            stream
          );

        recordedChunksRef.current =
          [];

        recorder.ondataavailable =
          (e) => {
            if (
              e.data.size >
              0
            ) {
              recordedChunksRef.current.push(
                e.data
              );
            }
          };

        recorder.onstop =
          () => {
            handleProcessRecording();
          };

        mediaRecorderRef.current =
          recorder;

        recorder.start();

        /* 이전 오류 안내 지우기 */
        setStatusText("");

        setIsRecording(
          true
        );
      } catch (error) {
        console.error(
          error
        );

        showToast(
          "마이크 권한을 확인해 주세요."
        );
      }
    };

  const handleStopRecording =
    () => {
      mediaRecorderRef.current?.stop();

      setIsRecording(
        false
      );
    };

  const handleExitConversation =
    () => {
      if (
        isRecording
      ) {
        mediaRecorderRef.current?.stop();
      }

      bunnyAudioRef.current?.pause();

      streamRef.current
        ?.getTracks()
        .forEach(
          (track) =>
            track.stop()
        );

      streamRef.current =
        null;

      router.push(
        "/conversation"
      );
    };

  /* ─────────────────────────────
     Process
  ───────────────────────────── */

  const handleProcessRecording =
    async () => {
      setIsProcessing(
        true
      );

      setStatusText(
        "듣고 있어요..."
      );

      try {
        const blob =
          new Blob(
            recordedChunksRef.current,
            {
              type:
                mediaRecorderRef
                  .current
                  ?.mimeType ||
                "audio/webm",
            }
          );

        const {
          wavBlob,
        } =
          await convertRecordingToWav(
            blob
          );

        const formData =
          new FormData();

        formData.append(
          "audio",
          wavBlob,
          "recording.wav"
        );

        const sttResponse =
          await fetch(
            "/api/speech-to-text",
            {
              method:
                "POST",

              body:
                formData,
            }
          );

        const sttData =
          await sttResponse.json();

        if (
          !sttResponse.ok ||
          !sttData.text
        ) {
          setStatusText(
            sttData.error ??
              "잘 못 들었어요. 다시 말해볼까요?"
          );

          setIsProcessing(
            false
          );

          return;
        }

        const userText: string =
          sttData.text;

        const nextMessages:
          ChatMessage[] = [
          ...messages,
          {
            role: "user",
            text: userText,
          },
        ];

        setMessages(
          nextMessages
        );

        setStatusText(
          "생각하는 중..."
        );

        const {
          data: {
            user,
          },
        } =
          await supabase.auth.getUser();

        /* 방금까지의 학습 기록으로 단계 · 약한 단어 · 배운 단어를 다시 계산 */
        const summary =
          user
            ? await loadMyLearningSummary()
            : null;

        const weakWords =
          summary?.weakWords ?? [];

        const studiedTypes =
          summary?.studiedTypes ?? [];

        const level: LearningLevel =
          summary?.level ?? "beginner";

        /* 배운 단어가 아직 없으면 Sight Words Level 1 로 대신함 */
        const knownWords =
          summary && summary.knownWords.length > 0
            ? summary.knownWords
            : sightWordLevels[0].words.map(
                (item) => item.word
              );

        levelRef.current = level;

        if (summary) {
          setSummary(summary);
        }

        const history =
          messages.map(
            (m) => ({
              role:
                m.role ===
                "bunny"
                  ? ("assistant" as const)
                  : ("user" as const),

              content:
                m.text,
            })
          );

        const convResponse =
          await fetch(
            "/api/conversation",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  message:
                    userText,

                  history,

                  weakWords,
                    studiedTypes,
                    knownWords,
                    level,
                  }),
            }
          );

        const convData =
          await convResponse.json();

        if (
          !convResponse.ok ||
          !convData.reply
        ) {
          setStatusText(
            convData.error ??
              "응답 생성에 실패했어요."
          );

          setIsProcessing(
            false
          );

          return;
        }

        setMessages([
          ...nextMessages,
          {
            role:
              "bunny",

            text:
              convData.reply,
          },
        ]);

        setStatusText("");

        await playBunnyVoice(
          convData.reply
        );
      } catch (error) {
        console.error(
          error
        );

        setStatusText(
          "문제가 발생했어요. 다시 시도해 주세요."
        );
      } finally {
        setIsProcessing(
          false
        );
      }
    };

  /* ─────────────────────────────
     Status
  ───────────────────────────── */

  const micDisabled =
    isProcessing ||
    isSpeaking;

  /*
    처리가 끝난 뒤에도 statusText가 남아 있으면 오류 안내
    ("잘 못 들었어요" 등)이므로 다음 녹음 전까지 계속 보여줌
  */
  const errorText =
    !isProcessing &&
    !isSpeaking
      ? statusText
      : "";

  const bunnyStatus =
    isProcessing
      ? statusText ||
        "듣고 있어요..."
      : isSpeaking
        ? "말하고 있어요..."
        : errorText ||
          "Ready to talk!";

  const talkCount =
    messages.filter(
      (message) =>
        message.role ===
        "user"
    ).length;

  return (
    <section
      className={
        styles.page
      }
    >
      <div
        className={
          styles.hero
        }
      >
        <div
          className={
            styles.inner
          }
        >
          {/* ───── Top bar ───── */}

          <div
            className={
              styles.topBar
            }
          >
            <Link
              href="/conversation"
              className={
                styles.backButton
              }
              aria-label="Conversation으로 돌아가기"
            >
              <ArrowLeft
                size={21}
                weight="bold"
              />
            </Link>

            {/* 가운데: 내 단계 (로그인하지 않았으면 제목) */}
            {summary ? (
              <LevelCard
                summary={summary}
                inline
              />
            ) : (
              <div
              className={
                styles.modeTitle
              }
            >
              <Sparkle
                size={18}
                weight="fill"
              />

              <span>
                AI Bunny Talk Quest
              </span>
            </div>
            )}

            <HelpTooltip
              title="AI Bunny 이렇게 해요"
              sections={[
                {
                  heading: "학습 목표",
                  items: [
                    "정답이 없는 자유 대화예요. AI Bunny와 영어로 편하게 이야기해요.",
                    "다른 학습에서 점수가 낮았던 단어와 문장을 AI Bunny가 대화 속에 다시 꺼내 줘요.",
                  ],
                },
                {
                  heading: "진행 방법",
                  items: [
                    "Bunny Starts를 누르면 AI Bunny가 먼저 말을 걸고, I Start를 누르면 내가 먼저 말해요.",
                    "Speak를 누르고 영어로 말한 뒤 Stop을 누르면 AI Bunny가 듣고 대답해요.",
                    "틀려도 괜찮아요. AI Bunny가 맞는 표현으로 자연스럽게 다시 말해 줘요.",
                    "이 대화에서는 발음 점수를 매기지 않고, 당근 코인도 주지 않아요.",
                  ],
                },
                {
                  heading: "내 단계 (MY LEVEL)",
                  items: [
                    "화면 맨 위의 MY LEVEL에서 지금 단계와 다음 단계까지 남은 양을 볼 수 있어요. 누르면 영역별로 자세히 나와요.",
                    "단계는 왕초보 → 초급 → 중급 → 고급 순서예요. 단계가 오를수록 AI Bunny의 문장이 길어지고 말이 조금씩 빨라져요.",
                    "Phonics 단어 · Book 이야기 · Conversation 대화를 숙달한 개수로 단계가 정해지고, 세 영역 중 가장 낮은 단계가 내 단계가 돼요.",
                    `단계는 한 번에 한 단계씩 오르고, 오른 뒤 ${LEVEL_UP_COOLDOWN_DAYS}일 동안은 다시 오르지 않아요. 한 번 오른 단계는 내려가지 않아요.`,
                    "왕초보와 초급에서는 내가 배운 단어를 중심으로 쉽게 말해 줘요.",
                  ],
                },
              ]}
            />
          </div>

          {!hasStarted ? (
            /* ─────────────────────
               START
            ───────────────────── */

            <div
              className={
                styles.startScreen
              }
            >
              <div
                className={
                  styles.hubVisual
                }
              >
                <img
                  src="/conversation/ai/ai-talk-hub.webp"
                  alt="AI Bunny Talk Quest"
                  className={
                    styles.hubImage
                  }
                />

                <div
                  className={
                    styles.hubOverlay
                  }
                />

                <div
                  className={
                    styles.hubLabel
                  }
                >
                  <span
                    className={
                      styles.liveDot
                    }
                  />

                  AI TALK STUDIO
                </div>
              </div>

              <div
                className={
                  styles.startPanel
                }
              >
                <div
                  className={
                    styles.startEyebrow
                  }
                >
                  TODAY&apos;S TALK
                </div>

                <h1
                  className={
                    styles.startTitle
                  }
                >
                  Ready for a
                  <br />
                  Talk Quest?
                </h1>

                <p
                  className={
                    styles.startDesc
                  }
                >
                  AI Bunny와 자유롭게
                  영어로 이야기해 보세요.
                </p>

                <div
                  className={
                    styles.missionBox
                  }
                >
                  <div
                    className={
                      styles.missionIcon
                    }
                  >
                    <Star
                      size={21}
                      weight="fill"
                    />
                  </div>

                  <div>
                    <span>
                      Free Talk
                      Mission
                    </span>

                    <strong>
                      Talk with
                      Bunny!
                    </strong>
                  </div>
                </div>

                <div
                  className={
                    styles.startButtonRow
                  }
                >
                  <button
                    className={
                      styles.startButton
                    }
                    onClick={
                      handleStartConversation
                    }
                  >
                    <SpeakerHigh
                      size={20}
                      weight="fill"
                    />

                    Bunny Starts
                  </button>

                  <button
                    className={
                      styles.startButtonOutline
                    }
                    onClick={
                      handleStartAsUser
                    }
                  >
                    <Microphone
                      size={20}
                      weight="fill"
                    />

                    I Start
                  </button>
                </div>

                <p
                  className={
                    styles.startHint
                  }
                >
                  You can talk
                  about anything!
                </p>
              </div>
            </div>
          ) : (
            /* ─────────────────────
               CHAT
            ───────────────────── */

            <div
              className={
                styles.chatStage
              }
            >
              <div
                className={
                  styles.chatBackground
                }
              />

              <div
                className={
                  styles.chatHeader
                }
              >
                <div
                  className={
                    styles.bunnyProfile
                  }
                >
                  <div
                    className={`${styles.bunnyAvatar} ${
                      isSpeaking
                        ? styles.bunnyAvatarSpeaking
                        : ""
                    }`}
                  >
                    <img
                      src="/conversation/ai/ai-bunny-avatar.webp"
                      alt="AI Bunny"
                    />
                  </div>

                  <div>
                    <p
                      className={
                        styles.profileLabel
                      }
                    >
                      AI TALK PARTNER
                    </p>

                    <h2>
                      Bunny
                      Teacher
                    </h2>

                    <div
                      className={
                        styles.statusRow
                      }
                    >
                      <span
                        className={`${styles.statusDot} ${
                          isProcessing ||
                          isSpeaking
                            ? styles.statusDotActive
                            : ""
                        }`}
                      />

                      {
                        bunnyStatus
                      }
                    </div>
                  </div>
                </div>

                <div
                  className={
                    styles.talkProgress
                  }
                >
                  <span>
                    TALK
                  </span>

                  <strong>
                    {talkCount}
                  </strong>

                  <ChatsCircle
                    size={20}
                    weight="fill"
                  />
                </div>
              </div>

              <div
                className={
                  styles.chatBody
                }
              >
                <div
                  className={
                    styles.bunnyCharacter
                  }
                >
                  <div
                    className={
                      styles.characterGlow
                    }
                  />

                  <img
                    src="/conversation/ai/ai-bunny-headset.webp"
                    alt=""
                  />

                  {isSpeaking && (
                    <div
                      className={
                        styles.characterWave
                      }
                    >
                      <span />
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>
                  )}
                </div>

                <div
                  className={
                    styles.conversationPanel
                  }
                >
                  <div
                    className={
                      styles.messageList
                    }
                    ref={
                      messageListRef
                    }
                  >
                    {messages.length ===
                      0 && (
                      <div
                        className={
                          styles.emptyHint
                        }
                      >
                        <Microphone
                          size={24}
                          weight="fill"
                        />

                        <span>
                          Speak를
                          눌러 먼저
                          영어로
                          말을
                          걸어보세요!
                        </span>
                      </div>
                    )}

                    {messages.map(
                      (
                        message,
                        index
                      ) =>
                        message.role ===
                        "bunny" ? (
                          <div
                            key={
                              index
                            }
                            className={
                              styles.bunnyRow
                            }
                          >
                            <div
                              className={
                                styles.rowAvatar
                              }
                            >
                              <img
                                src="/conversation/ai/ai-bunny-avatar.webp"
                                alt=""
                              />
                            </div>

                            <div
                              className={
                                styles.bunnyMessage
                              }
                            >
                              {
                                message.text
                              }
                            </div>
                          </div>
                        ) : (
                          <div
                            key={
                              index
                            }
                            className={
                              styles.userRow
                            }
                          >
                            <div
                              className={
                                styles.userMessage
                              }
                            >
                              {
                                message.text
                              }
                            </div>
                          </div>
                        )
                    )}

                    {isProcessing &&
                      !statusText.includes(
                        "실패"
                      ) && (
                        <div
                          className={
                            styles.bunnyRow
                          }
                        >
                          <div
                            className={
                              styles.rowAvatar
                            }
                          >
                            <img
                              src="/conversation/ai/ai-bunny-avatar.webp"
                              alt=""
                            />
                          </div>

                          <div
                            className={
                              styles.typingBubble
                            }
                          >
                            <span />
                            <span />
                            <span />
                          </div>
                        </div>
                      )}
                  </div>

                  <div
                    className={
                      styles.voiceBox
                    }
                  >
                    <button
                      className={
                        styles.exitButton
                      }
                      onClick={
                        handleExitConversation
                      }
                    >
                      End Talk
                    </button>

                    <button
                      className={`${styles.micButton} ${
                        isRecording
                          ? styles.micButtonRecording
                          : ""
                      }`}
                      onClick={
                        isRecording
                          ? handleStopRecording
                          : handleStartRecording
                      }
                      disabled={
                        micDisabled
                      }
                    >
                      {isRecording && (
                        <span
                          className={
                            styles.micPulseRing
                          }
                        />
                      )}

                      <Microphone
                        size={24}
                        weight="fill"
                      />

                      <span
                        className={
                          styles.micButtonLabel
                        }
                      >
                        {isRecording
                          ? "Stop"
                          : "Speak"}
                      </span>
                    </button>

                    <div
                      className={`${styles.voiceHint} ${
                        errorText && !isRecording
                          ? styles.voiceHintError
                          : ""
                      }`}
                      role={
                        errorText && !isRecording
                          ? "alert"
                          : undefined
                      }
                    >
                      {isRecording
                        ? "말이 끝나면 Stop을 눌러요"
                        : errorText ||
                          "버튼을 누르고 영어로 말해요"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}