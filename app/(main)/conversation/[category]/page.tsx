import Link from "next/link";
import { notFound } from "next/navigation";
import BackButton from "@/components/ui/BackButton";
import HelpTooltip from "@/components/HelpTooltip";
import styles from "./sentence-list.module.css";
import { conversationCategories } from "../data";

type Props = {
  params: Promise<{
    category: string;
  }>;
};

export default async function ConversationCategoryPage({ params }: Props) {
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
        <div className={styles.helpWrap}>
          <HelpTooltip
            title="이렇게 진행돼요"
            sections={[
              {
                heading: "학습 목표",
                items: [
                  "짧은 대화 패턴을 통째로 듣고 따라 말하면서, 실제 상황에서 자주 쓰는 문장을 자연스러운 억양으로 익혀요.",
                  "AI Bunny의 자유 대화보다 대사가 정해져 있어서, 발음과 억양을 정확하게 다지는 연습에 집중할 수 있어요.",
                ],
              },
              {
                heading: "진행 방법",
                items: [
                  "카드를 누르면 학습 페이지로 이동해요.",
                  "대화문을 한 줄씩 들을 수도 있고, 전체 듣기로 대화 전체를 이어서 들을 수도 있어요.",
                  "녹음하기 → 내 녹음 듣기 → AI 발음 분석하기 순서로 대화 전체를 채점받아요.",
                  "AI 발음 분석은 정확도 70% + 완성도 20% + 목소리 크기 10%를 합산해서 점수를 매겨요.",
                  "여기서 발음 정확도가 낮았던 부분은 AI Bunny 대화에서 자동으로 다시 등장해요.",
                  "전체 듣기와 녹음은 각각 코인으로 이어지고, 대화당 최대 5번까지 받을 수 있어요.",
                ],
              },
            ]}
          />
        </div>

        <div className={styles.inner}>
          <h1 className={styles.title}>{item.title}</h1>
          <p className={styles.subtitle}>
            대화 카드를 눌러 학습 페이지로 들어가 보세요.
          </p>

          <div className={styles.grid}>
            {item.dialogues.map((dialogue, index) => (
              <Link
                key={dialogue.id}
                href={`/conversation/${item.slug}/${dialogue.id}`}
                className={styles.card}
              >
                <div className={styles.number}>{index + 1}</div>

                <div className={styles.imageWrap}>
                  <img
                    src={dialogue.image}
                    alt={dialogue.title}
                    className={styles.image}
                  />
                </div>

                <div className={styles.textRow}>
                  <div>
                    <h2 className={styles.sentence}>{dialogue.title}</h2>
                    <p className={styles.preview}>
                      {dialogue.lines[0].role}: "{dialogue.lines[0].text}"
                    </p>
                  </div>
                  <span className={styles.lineCount}>{dialogue.lines.length}줄</span>
                </div>
              </Link>
            ))}
          </div>

          <div className={styles.bottomRow}>
            <BackButton href="/conversation">
              Conversation으로 돌아가기
            </BackButton>
          </div>
        </div>
      </div>
    </section>
  );
}