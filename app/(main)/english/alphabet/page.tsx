import Link from "next/link";
import BackButton from "@/components/ui/BackButton";
import HelpTooltip from "@/components/HelpTooltip";
import styles from "./alphabet.module.css";
import { alphabetItems } from "./data";

const cardColors = ["green", "yellow", "pink", "blue", "purple", "mint"];

export default function AlphabetPage() {
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
                  "알파벳 26개의 이름(예: A는 '에이')과 소리(예: A는 '애')를 구별해서 듣고 따라 말해요.",
                  "글자 하나하나의 이름과 소리를 확실히 알아야, 이후 Short/Long Vowels와 Blend Sounds에서 배우는 글자 조합 규칙을 이해할 수 있어요.",
                ],
              },
              {
                heading: "진행 방법",
                items: [
                  "카드를 누르면 학습 페이지로 이동해요.",
                  "소리 재생 → AI가 읽어주기 → 녹음하기 순서로 진행돼요.",
                  "이 섹션은 AI 발음 분석이 없어요. 알파벳의 이름과 소리를 혼동할 수 있어서 정확한 채점이 어렵기 때문이에요.",
                  "한글 학습 자료도 내려받을 수 있어요.",
                  "소리 재생과 녹음은 각각 코인으로 이어지고, 같은 글자에서 최대 5번까지 받을 수 있어요.",
                ],
              },
            ]}
          />
        </div>

        <div className={styles.inner}>
          <div className={styles.titleBox}>
            <h1 className={styles.title}>Alphabet Sounds</h1>
            <p className={styles.subtitle}>
              알파벳 카드를 눌러 학습 페이지로 들어가 보세요.
            </p>
          </div>

          <div className={styles.grid}>
            {alphabetItems.map((item, index) => (
              <Link
                key={item.letter}
                href={`/english/alphabet/${item.letter}`}
                className={`${styles.card} ${
                  styles[cardColors[index % cardColors.length]]
                }`}
              >
                <div className={styles.imageWrap}>
                  <img
                    src={item.image}
                    alt={item.word}
                    className={styles.image}
                    draggable={false}
                  />
                </div>

                <div className={styles.arrow}>›</div>
              </Link>
            ))}
          </div>

          <div className={styles.bottomRow}>
            <BackButton href="/english">
              English로 돌아가기
            </BackButton>
          </div>
        </div>
      </div>
    </section>
  );
}