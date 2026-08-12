import Link from "next/link";
import BackButton from "@/components/ui/BackButton";
import HelpTooltip from "@/components/HelpTooltip";
import styles from "./vowel-words.module.css";
import { longVowelItems } from "../data";

type Props = {
  params: Promise<{
    vowel: string;
  }>;
};

export default async function LongVowelWordsPage({ params }: Props) {
  const { vowel: rawVowel } = await params;
  const vowel = rawVowel.toLowerCase();

  const item = longVowelItems.find(
    (v) => v.vowel.toLowerCase() === vowel
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
                  "모음이 알파벳 이름처럼 길게 나는 규칙(무음 e가 붙는 cake 유형, ai·ee·oa처럼 모음이 겹치는 유형)을 익혀요.",
                  "규칙을 반복 연습하면 처음 보는 단어도 모음 조합만 보고 소리를 유추해서 읽는 능력이 늘고, short vowel과 구별하는 감각도 자라요.",
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
          <h1 className={styles.title}>Long {item.upper}</h1>

          <p className={styles.subtitle}>
            <span>✦</span>
            단어 박스를 눌러 학습 페이지로 들어가 보세요.
            <span>✦</span>
          </p>

          <div className={styles.grid}>
            {item.words.map((wordItem) => (
              <Link
                key={wordItem.slug}
                href={`/english/long-vowels/${item.vowel}/${wordItem.slug}`}
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
            <BackButton href="/english/long-vowels">
              Long Vowels로 돌아가기
            </BackButton>
          </div>
        </div>
      </div>
    </section>
  );
}