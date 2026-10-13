import Link from "next/link";
import { notFound } from "next/navigation";
import BackButton from "@/components/ui/BackButton";
import HelpTooltip from "@/components/HelpTooltip";
import { SCORE_HELP, coinHelp, masteryHelp } from "@/components/helpSections";
import PageTitle from "@/components/PageTitle";
import styles from "./level.module.css";
import { getBookLevel } from "../data";

type Props = {
  params: Promise<{
    level: string;
  }>;
};

export default async function BookLevelPage({ params }: Props) {
  const { level } = await params;
  const currentLevel = getBookLevel(level);

  if (!currentLevel) {
    notFound();
  }

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.helpWrap}>
          <HelpTooltip
            title="Book 이렇게 해요"
            sections={[
              {
                heading: "학습 목표",
                items: [
                  "여러 문장으로 이어진 이야기를 통째로 읽어요. 끊어 읽기와 억양, 자연스러운 속도를 연습해요.",
                  "그림과 문장을 함께 보면서 이야기 속에서 단어의 뜻을 알아가요.",
                ],
              },
              {
                heading: "진행 방법",
                items: [
                  "이야기 카드를 누르면 그림책이 열려요.",
                  "AI가 읽어 주는 소리를 듣고, 마이크를 눌러 이야기 전체를 소리 내어 읽어요.",
                  "내 녹음을 들어 본 뒤 발음 확인으로 점수를 받아요. 점수는 이야기 전체를 기준으로 매겨요.",
                  SCORE_HELP,
                  "점수가 낮았던 이야기의 문장은 AI Bunny 대화에 다시 나와요.",
                  "이야기를 읽은 뒤 Test의 Reading Quiz에서 내용을 확인할 수 있어요.",
                ],
              },
              masteryHelp("이야기"),
              coinHelp("이야기", 3),
            ]}
          />
        </div>

        <div className={styles.inner}>
          <PageTitle
            eyebrow="BOOK"
            title={currentLevel.title}
            subtitle={currentLevel.description}
          />

          <div className={styles.grid}>
            {currentLevel.stories.map((story, index) => (
              <Link
                key={story.slug}
                href={`/book/${currentLevel.level}/${story.slug}`}
                className={styles.card}
              >
                <div className={styles.number}>{index + 1}</div>

                <div className={styles.imageWrap}>
                  <img
                    src={story.image}
                    alt={story.title}
                    className={styles.image}
                    draggable={false}
                  />
                </div>

                <h2 className={styles.storyTitle}>{story.title}</h2>
                <p className={styles.storyText}>Read Story ›</p>
              </Link>
            ))}
          </div>

          <div className={styles.bottomRow}>
            <BackButton href="/book">
              Book Library로 돌아가기
            </BackButton>
          </div>
        </div>
      </div>
    </section>
  );
}