import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Play,
  Sparkle,
} from "@phosphor-icons/react/ssr";

import HelpTooltip from "@/components/HelpTooltip";
import { SCORE_HELP, coinHelp, masteryHelp } from "@/components/helpSections";
import styles from "./sentence-list.module.css";
import StageBadge from "../StageBadge";
import { conversationCategories } from "../data";
import { STAGE_DONE_SCORE, STAGE_TIERS, getStageTier } from "@/lib/learningRules";

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
              title="World Adventure 이렇게 해요"
              sections={[
                {
                  heading: "학습 목표",
                  items: [
                    "짧은 영어 대화를 듣고 역할을 따라 말하면서 발음과 억양을 연습해요.",
                    "Stage는 Starter(2줄) → Basic(3–4줄) → Challenge(5–8줄) 순으로 대화가 길어져요.",
                  ],
                },
                {
                  heading: "진행 방법",
                  items: [
                    "지도에서 원하는 Stage를 눌러요. 순서와 상관없이 아무 Stage나 할 수 있어요.",
                    "전체 듣기와 한 줄 듣기로 대화를 듣고, 마이크를 눌러 대화 전체를 따라 말해요.",
                    "내 녹음을 들어 본 뒤 발음 확인으로 점수를 받아요.",
                    `발음 확인에서 ${STAGE_DONE_SCORE}점 이상을 받으면 지도의 Stage가 초록색 체크로 바뀌어요.`,
                    SCORE_HELP,
                    "점수가 낮았던 대화의 문장은 AI Bunny 대화에 다시 나와요.",
                  ],
                },
                masteryHelp("대화"),
                coinHelp("대화", 2),
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

                  <span
                    className={`${styles.stageLabel} ${
                      styles[`tier-${getStageTier(index + 1).id}`]
                    }`}
                  >
                    <em>{getStageTier(index + 1).label}</em>

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

              {/* 대화 길이에 따른 3단계 */}
              {STAGE_TIERS.map((tier) => (
                <div
                  key={tier.id}
                  className={`${styles.tierLegend} ${
                    styles[`tier-${tier.id}`]
                  }`}
                >
                  <i />
                  {tier.label}
                  <small>
                    Stage {tier.from}–{tier.to}
                  </small>
                </div>
              ))}
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
                  <span>
                    Stage {index + 1} · {getStageTier(index + 1).label}
                  </span>
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