import Link from "next/link";
import BackButton from "@/components/ui/BackButton";
import HelpTooltip from "@/components/HelpTooltip";
import { coinHelp } from "@/components/helpSections";
import PageTitle from "@/components/PageTitle";
import styles from "./alphabet.module.css";
import { alphabetItems } from "./data";

const cardColors = ["green", "yellow", "pink", "blue", "purple", "mint"];

export default function AlphabetPage() {
  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.helpWrap}>
          <HelpTooltip
            title="Alphabet 이렇게 해요"
            sections={[
              {
                heading: "학습 목표",
                items: [
                  "알파벳 26개의 이름(A는 '에이')과 소리(A는 '애')를 구별해서 듣고 따라 말해요.",
                  "글자의 이름과 소리를 알아야 Short · Long Vowels와 Blend Sounds의 읽기 규칙을 배울 수 있어요.",
                ],
              },
              {
                heading: "진행 방법",
                items: [
                  "카드를 누르면 그 글자의 학습 화면이 열려요.",
                  "Listen과 AI Voice로 소리를 듣고, 마이크를 눌러 따라 말한 뒤 내 녹음을 들어 봐요.",
                  "Alphabet에는 AI 발음 확인이 없어요. 글자의 이름과 소리가 섞여서 정확하게 채점하기 어렵기 때문이에요.",
                  "한글 학습 자료를 내려받을 수 있어요.",
                ],
              },
              coinHelp("글자", 1),
            ]}
          />
        </div>

        <div className={styles.inner}>
          <div className={styles.titleBox}>
            <PageTitle
              eyebrow="PHONICS"
              title="Alphabet Sounds"
              subtitle="Tap a letter card to start learning."
            />
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
              Phonics로 돌아가기
            </BackButton>
          </div>
        </div>
      </div>
    </section>
  );
}