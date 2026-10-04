"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import styles from "./phonics-test.module.css";
import LoginNotice from "../LoginNotice";
import { phonicsTestCategories } from "./data";
import { PHONICS_STAGE_COUNT } from "@/lib/phonicsTestRules";

export default function PhonicsTestPage() {
  const router = useRouter();

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.inner}>
          {/* Back */}
          <button
            type="button"
            className={styles.backButton}
            onClick={() => router.push("/test")}
            aria-label="테스트 메인으로 돌아가기"
          >
            <ArrowLeft size={22} weight="bold" />
          </button>

          {/* Header */}
          <div className={styles.header}>
            <p className={styles.eyebrow}>
              PHONICS TEST
            </p>

            <h1 className={styles.title}>
              Phonics Challenge
            </h1>

            <p className={styles.subtitle}>
              Choose what you want to practice!
            </p>
          </div>

          <LoginNotice />

          {/* Category Cards */}
          <div className={styles.grid}>
            {phonicsTestCategories.map((test) => (
              <button
                key={test.id}
                type="button"
                className={`${styles.card} ${styles[test.colorClass]}`}
                onClick={() =>
                  router.push(`/test/phonics/${test.id}`)
                }
              >
                <div
                  className={`${styles.badge} ${
                    styles[test.badgeClass]
                  }`}
                >
                  {test.badge}
                </div>

                <div className={styles.cardContent}>
                  <h2>{test.title}</h2>

                  <p className={styles.cardSubtitle}>
                    {test.shortTitle}
                  </p>

                  <p className={styles.description}>
                    {test.description}
                  </p>
                </div>

                <div className={styles.bottomRow}>
                  <div className={styles.stageInfo}>
                    <span className={styles.stageNumber}>
                      {PHONICS_STAGE_COUNT}
                    </span>

                    <span>
                      Stages
                    </span>
                  </div>

                  <span className={styles.arrow}>
                    <ArrowRight
                      size={20}
                      weight="bold"
                    />
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className={styles.notice}>
            <div>
              <strong>
                How does it work?
              </strong>

              <p>
                각 영역은 여러 Stage로 구성되며,
                문제를 통과하면 다음 Stage가 열려요.
              </p>
            </div>

            <span className={styles.noticeBadge}>
              ⭐ Keep going!
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}