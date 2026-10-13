import Link from "next/link";
import BackButton from "@/components/ui/BackButton";
import HelpTooltip from "@/components/HelpTooltip";
import { SCORE_HELP, coinHelp, masteryHelp } from "@/components/helpSections";
import PageTitle from "@/components/PageTitle";
import styles from "./vowel-words.module.css";
import { longVowelItems } from "../data";
import { groupBySection } from "../../wordHelpers";

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
            title="Long Vowels 이렇게 해요"
            sections={[
              {
                heading: "학습 목표",
                items: [
                  "모음이 알파벳 이름처럼 길게 나는 규칙을 익혀요. cake처럼 끝에 e가 붙는 단어와 ai · ee · oa처럼 모음이 겹치는 단어가 있어요.",
                  "규칙을 익히면 처음 보는 단어도 소리를 짐작해서 읽을 수 있고, 짧은 모음과 구별하는 감각이 자라요.",
                ],
              },
              {
                heading: "진행 방법",
                items: [
                  "단어 카드를 누르면 학습 화면이 열려요.",
                  "Listen(내 목소리 녹음 또는 AI 음성)과 AI Voice로 소리를 듣고, 마이크를 눌러 따라 말해요.",
                  "Play My Recording으로 내 목소리를 들어 보고, Check My Pronunciation으로 점수를 확인해요.",
                  SCORE_HELP,
                  "점수가 낮았던 단어는 AI Bunny 대화에 다시 나와서 한 번 더 연습할 수 있어요.",
                  "한글 학습 자료가 있는 단어는 학습 화면에서 내려받을 수 있어요.",
                ],
              },
              masteryHelp("단어"),
              coinHelp("단어", 1),
            ]}
          />
        </div>

        <div className={styles.inner}>
          <PageTitle
            eyebrow="LONG VOWELS"
            title={`Long ${item.upper}`}
            subtitle="Tap a word card to start learning."
          />

          {groupBySection(item.words).map((group) => (
            <div key={group.section || "all"} className={styles.section}>
              {group.section && (
                <h2 className={styles.sectionTitle}>
                  {group.section}
                  <span>{group.words.length} words</span>
                </h2>
              )}

              <div className={styles.grid}>
                {group.words.map((wordItem) => (
                  <Link
                    key={wordItem.slug}
                    href={`/english/long-vowels/${item.vowel}/${wordItem.slug}`}
                    className={styles.card}
                  >
                    <div className={styles.imageBox}>
                      {wordItem.image ? (
                        <img src={wordItem.image} alt={wordItem.word} />
                      ) : (
                        <span className={styles.noImage} aria-hidden="true">
                          {wordItem.word.charAt(0)}
                        </span>
                      )}
                    </div>

                    <div className={styles.word}>{wordItem.word}</div>

                    <div className={styles.studyButton}>Study</div>
                  </Link>
                ))}
              </div>
            </div>
          ))}

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