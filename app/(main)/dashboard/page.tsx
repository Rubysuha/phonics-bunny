import Image from "next/image";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  const coin = 25;

  const getBunnyImage = () => {
    if (coin >= 500) return "/bunny-avatar-5.png";
    if (coin >= 400) return "/bunny-avatar-4.png";
    if (coin >= 300) return "/bunny-avatar-3.png";
    if (coin >= 200) return "/bunny-avatar-2.png";
    if (coin >= 100) return "/bunny-avatar-1.png";

    return "/bunny-new.png";
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Home</h1>

        <div className={styles.rightCards}>
          {/* 성장 카드 */}
          <div className={styles.kindergartenCard}>
            <div className={styles.cardHeader}>
              🐰 Bunny Growth
            </div>

            <div className={styles.growthBody}>
              <div className={styles.levelRow}>
                <span>Kindergarten</span>
                <span>Lv.1</span>
              </div>

              <div className={styles.progressBar}>
                <div className={styles.progressFill}></div>
              </div>

              <div className={styles.progressText}>
                75 / 100
              </div>

              <div className={styles.nextLevel}>
                Next Level in <span>25</span> Coins!
              </div>

              <div className={styles.todayCoin}>
                Today <span>+3 🥕</span>
              </div>
            </div>
          </div>

          {/* 오늘의 대화 카드 */}
          <div className={styles.todayCard}>
            <div className={styles.cardHeader}>
              ⭐ Today’s Conversation
            </div>

            <div className={styles.todayConversation}>
              <div className={styles.topicRow}>
                <div>
                  <div className={styles.topicLabel}>
                    Today’s Topic
                  </div>

                  <div className={styles.topicTitle}>
                    Weather ☁️
                  </div>
                </div>

                <div className={styles.weatherIcon}>
                  🌤️
                </div>
              </div>

              <div className={styles.sentenceBox}>
                How’s the weather today?
              </div>
            </div>
          </div>
        </div>

        {/* 중앙 토끼 */}
        <div className={styles.centerWrap}>
          <div className={styles.centerArea}>
            <div className={styles.circle}>
              <Image
                src={getBunnyImage()}
                alt="Phonics Bunny"
                fill
                priority
                className={styles.bunny}
              />

              <span className={styles.sparkleLeft}>✦</span>
              <span className={styles.sparkleRight}>✦</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}