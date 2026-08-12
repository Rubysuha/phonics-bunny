import Link from "next/link";
import BackButton from "@/components/ui/BackButton";
import HelpTooltip from "@/components/HelpTooltip";
import styles from "./blend-words.module.css";
import { blendItems } from "../data";

type Props = {
  params: Promise<{
    group: string;
  }>;
};

export default async function BlendWordsPage({ params }: Props) {
  const { group: rawGroup } = await params;
  const group = rawGroup.toLowerCase();

  const item = blendItems.find(
    (v) => v.group.toLowerCase() === group
  );

  if (!item) {
    return <div>없는 페이지입니다.</div>;
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
                  "black, clock, flag처럼 자음 두 개가 겹쳐서 나는 소리(bl, cl, fl 같은 블렌드)를 하나의 소리 단위로 듣고 따라 말해요.",
                  "자음이 겹쳐도 각 소리를 뭉개지 않고 이어서 발음하는 감각이 늘고, 짧은/장모음 단어보다 한 단계 복잡한 단어를 읽는 힘이 생겨요.",
                ],
              },
              {
                heading: "진행 방법",
                items: [
                  "단어 카드를 누르면 학습 페이지로 이동해요.",
                  "소리 재생 → AI가 읽어주기 → 녹음하기 → 내 녹음 듣기 → AI 발음 분석하기 순서로 진행돼요.",
                  "AI 발음 분석은 정확도 70% + 완성도 20% + 목소리 크기 10%를 합산해서 점수를 매겨요.",
                  "여기서 발음 정확도가 낮았던 단어는 AI Bunny 대화에서 자동으로 다시 등장해요.",
                  "한글 학습 자료도 내려받을 수 있어요.",
                  "소리 듣기와 녹음은 각각 코인으로 이어지고, 같은 단어에서 듣기 5번·녹음 5번까지 따로 받을 수 있어요.",
                ],
              },
            ]}
          />
        </div>

        <div className={styles.inner}>
          <h1 className={styles.title}>{item.title}</h1>

          <p className={styles.subtitle}>
            <span>✦</span>
            단어 박스를 눌러 학습 페이지로 들어가 보세요.
            <span>✦</span>
          </p>

          <div className={styles.grid}>
            {item.words.map((wordItem) => (
              <Link
                key={wordItem.slug}
                href={`/english/blend-sounds/${item.group}/${wordItem.slug}`}
                className={styles.card}
              >
                <div className={styles.imageBox}>
                  <img src={wordItem.image} alt={wordItem.word} />
                </div>

                <div className={styles.word}>{wordItem.word}</div>

                <div className={styles.studyButton}>학습하기</div>
              </Link>
            ))}
          </div>

          <div className={styles.bottomRow}>
            <BackButton href="/english/blend-sounds">
              Blending Sounds로 돌아가기
            </BackButton>
          </div>
        </div>
      </div>
    </section>
  );
}