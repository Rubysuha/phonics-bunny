import Link from "next/link";
import BackButton from "@/components/ui/BackButton";
import HelpTooltip from "@/components/HelpTooltip";
import styles from "./vowel-words.module.css";
import { shortVowelItems } from "../data";

type Props = {
  params: Promise<{
    vowel: string;
  }>;
};

export default async function ShortVowelWordsPage({ params }: Props) {
  const { vowel: rawVowel } = await params;
  const vowel = rawVowel.toLowerCase();

  const item = shortVowelItems.find(
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
                  "A/E/I/O/U 각각의 짧은 소리를 구별하고, cat·bed·pig처럼 자음-모음-자음(CVC) 구조의 단어를 소리 내어 읽어요.",
                  "같은 모음 패턴을 반복하면서 낱글자 소리를 조합해 새 단어를 읽어내는 디코딩 능력과 음소 인식이 늘어요.",
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
          <h1 className={styles.title}>Short {item.upper}</h1>

          <p className={styles.subtitle}>
            <span>✦</span>
            단어 박스를 눌러 학습 페이지로 들어가 보세요.
            <span>✦</span>
          </p>

          <div className={styles.grid}>
            {item.words.map((wordItem) => (
              <Link
                key={wordItem.slug}
                href={`/english/short-vowels/${item.vowel}/${wordItem.slug}`}
                className={styles.card}
              >
                <div className={styles.imageBox}>
                  <img src={wordItem.image} alt={wordItem.word} />
                </div>

                <div className={styles.word}>
                  {wordItem.word}
                </div>

                <div className={styles.studyButton}>
                  학습하기
                </div>
              </Link>
            ))}
          </div>

          <div className={styles.bottomRow}>
            <BackButton href="/english/short-vowels">
              Short Vowels로 돌아가기
            </BackButton>
          </div>
        </div>
      </div>
    </section>
  );
}