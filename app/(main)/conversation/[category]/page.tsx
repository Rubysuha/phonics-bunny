import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Play,
  Sparkle,
} from "@phosphor-icons/react/ssr";

import HelpTooltip from "@/components/HelpTooltip";
import styles from "./sentence-list.module.css";
import StageBadge from "../StageBadge";
import { conversationCategories } from "../data";

type Props = {
  params: Promise<{
    category: string;
  }>;
};

export default async function ConversationCategoryPage({
  params,
}: Props) {
  const { category: rawCategory } = await params;

  const category = rawCategory.toLowerCase();

  const item = conversationCategories.find(
    (v) => v.slug.toLowerCase() === category
  );

  if (!item) {
    notFound();
  }

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.inner}>
          <div className={styles.topBar}>
            <Link
              href="/conversation/practice"
              className={styles.backButton}
              aria-label="Practice로 돌아가기"
            >
              <ArrowLeft size={21} weight="bold" />
            </Link>

            <div className={styles.worldTitle}>
              <MapPin size={18} weight="fill" />

              <div>
                <span>WORLD ADVENTURE</span>
                <strong>{item.title}</strong>
              </div>
            </div>

            <HelpTooltip
              title="이렇게 진행돼요"
              sections={[
                {
                  heading: "학습 목표",
                  items: [
                    "스테이지를 선택해 짧은 영어 대화를 듣고 따라 말해요.",
                    "정해진 대화문으로 발음과 억양을 집중해서 연습해요.",
                  ],
                },
                {
                  heading: "진행 방법",
                  items: [
                    "원하는 Stage를 선택해 학습을 시작해요.",
                    "전체 듣기와 한 줄 듣기를 모두 사용할 수 있어요.",
                    "녹음 후 AI 발음 분석으로 점수를 확인할 수 있어요.",
                    "AI 발음 분석까지 마친 Stage는 초록색 체크로 표시돼요.",
                  ],
                },
              ]}
            />
          </div>

          <div className={styles.stageMap}>
            <div className={styles.worldIntro}>
              <span>
                <Sparkle size={16} weight="fill" />
                {item.dialogues.length} STAGES
              </span>

              <h1>{item.title} World</h1>

              <p>{item.description}</p>
            </div>

            <div className={styles.mapCanvas}>
            <img
              src={item.worldImage}
              alt={`${item.title} World`}
              className={styles.mapImage}
            />

            <div className={styles.mapShade} />

            {item.dialogues.map((dialogue, index) => {
              const position =
                item.stagePositions[
                  index % item.stagePositions.length
                ];

              return (
                <Link
                  key={dialogue.id}
                  href={`/conversation/${item.slug}/${dialogue.id}`}
                  className={styles.stagePoint}
                  style={{
                    left: `${position.left}%`,
                    top: `${position.top}%`,
                  }}
                >
                  <span className={styles.stagePulse} />

                  <StageBadge
                    dialogueId={dialogue.id}
                    number={index + 1}
                    className={styles.stageCircle}
                    doneClassName={styles.stageDone}
                  />

                  <span className={styles.stageLabel}>
                    <strong>
                      Stage {index + 1}
                    </strong>

                    <small>
                      {dialogue.title}
                    </small>
                  </span>
                </Link>
              );
            })}

            </div>

            <div className={styles.mapLegend}>
              <div>
                <Play size={15} weight="fill" />
                Stage를 눌러 시작해요
              </div>
            </div>
          </div>

          <div className={styles.mobileStages}>
            {item.dialogues.map((dialogue, index) => (
              <Link
                key={dialogue.id}
                href={`/conversation/${item.slug}/${dialogue.id}`}
                className={styles.mobileStage}
              >
                <StageBadge
                  dialogueId={dialogue.id}
                  number={index + 1}
                  className={styles.mobileNumber}
                  doneClassName={styles.stageDone}
                />

                <div>
                  <span>Stage {index + 1}</span>
                  <strong>{dialogue.title}</strong>
                </div>

                <Play size={18} weight="fill" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}