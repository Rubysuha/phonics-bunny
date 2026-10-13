import { Carrot } from "@phosphor-icons/react";
import type { TestCoinResult } from "@/lib/testReward";
import styles from "./TestCoinNote.module.css";

type Props = {
  coins: TestCoinResult | null;
};

/*
  Test 결과 화면의 코인 안내
  (칭찬과 별이 먼저 · 더 크게 보이도록 작은 한 줄로 그 아래에 둠)
*/
export default function TestCoinNote({ coins }: Props) {
  if (!coins || coins.starCoins + coins.bonusCoins === 0) {
    return null;
  }

  return (
    <div className={styles.note}>
      {coins.starCoins > 0 && (
        <span className={styles.item}>
          <Carrot size={16} weight="fill" />
          새 별 {coins.newStars}개
          <strong>+{coins.starCoins}</strong>
        </span>
      )}

      {coins.bonusCoins > 0 && (
        <span className={styles.item}>
          <Carrot size={16} weight="fill" />
          전체 통과 보너스
          <strong>+{coins.bonusCoins}</strong>
        </span>
      )}
    </div>
  );
}
