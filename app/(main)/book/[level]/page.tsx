import Link from "next/link";
import { notFound } from "next/navigation";
import BackButton from "@/components/ui/BackButton";
import HelpTooltip from "@/components/HelpTooltip";
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
            title="이렇게 진행돼요"
            sections={[
              {
                heading: "학습 목표",
                items: [
                  "단어 하나가 아니라 여러 문장으로 이어진 이야기를 통째로 읽어요. 끊어 읽기, 억양, 자연스러운 속도로 이어 말하는 유창성을 길러요.",
                  "그림과 문장을 함께 보면서 문맥 속에서 단어 의미를 파악하는 독해 감각도 같이 늘어요.",
                ],
              },
              {
                heading: "진행 방법",
                items: [
                  "이야기 카드를 누르면 학습 페이지로 이동해요.",
                  "AI가 읽어주기(이미 AI 음성으로 만들어진 낭독) → 녹음하기 → 내 녹음 듣기 → AI 발음 분석하기 순서로 진행돼요.",
                  "발음 분석은 단어 하나가 아니라 이야기 전체 문장을 기준으로 정확도 70% + 완성도 20% + 목소리 크기 10%를 합산해서 채점해요.",
                  "여기서 발음 정확도가 낮았던 부분은 AI Bunny 대화에서 자동으로 다시 등장해요.",
                  "이 섹션은 워크시트 다운로드가 없고, 대신 AI 읽기·녹음이 각각 코인으로 이어지며 이야기당 5번까지 받을 수 있어요.",
                ],
              },
            ]}
          />
        </div>

        <div className={styles.inner}>
          <h1 className={styles.title}>{currentLevel.title}</h1>
          <p className={styles.subtitle}>{currentLevel.description}</p>

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