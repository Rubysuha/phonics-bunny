import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Sparkle,
} from "@phosphor-icons/react/ssr";

import styles from "./practice.module.css";
import { conversationCategories } from "../data";

export default function ConversationPracticePage() {
  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.inner}>
          <div className={styles.topRow}>
            <Link
              href="/conversation"
              className={styles.backButton}
              aria-label="Conversation으로 돌아가기"
            >
              <ArrowLeft size={22} weight="bold" />
            </Link>

            <header className={styles.header}>
              <p className={styles.eyebrow}>
                <Sparkle size={14} weight="fill" />
                WORLD ADVENTURE
              </p>

              <h1 className={styles.title}>
                Choose Your World
              </h1>
            </header>

            <div className={styles.topSpacer} />
          </div>

          {/* 월드 선택 지도: 섬을 누르면 그 월드로 이동 */}
          <div className={styles.worldMap}>
            <div className={styles.mapCanvas}>
              <img
                src="/conversation/worlds/practice-menu.webp"
                alt="World Adventure 지도"
                className={styles.mapImage}
              />

              {conversationCategories.map((category, index) => (
                <Link
                  key={category.slug}
                  href={`/conversation/${category.slug}`}
                  className={`${styles.island} ${
                    styles[`theme${(index % 6) + 1}`]
                  }`}
                  style={{
                    left: `${category.menuArea.left}%`,
                    top: `${category.menuArea.top}%`,
                    width: `${category.menuArea.width}%`,
                    height: `${category.menuArea.height}%`,
                  }}
                >
                  <span className={styles.islandTag}>
                    <span className={styles.tagText}>
                      <small>WORLD {index + 1}</small>

                      <strong>{category.title}</strong>

                      <em>
                        {category.dialogues.length} Stages
                      </em>
                    </span>

                    <span className={styles.tagArrow}>
                      <ArrowRight weight="bold" />
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* 폰: 지도 대신 목록으로 선택 */}
          <div className={styles.mobileWorlds}>
            {conversationCategories.map((category, index) => (
              <Link
                key={category.slug}
                href={`/conversation/${category.slug}`}
                className={`${styles.mobileWorld} ${
                  styles[`theme${(index % 6) + 1}`]
                }`}
              >
                <span className={styles.mobileNumber}>
                  {index + 1}
                </span>

                <div>
                  <strong>{category.title}</strong>

                  <span>
                    {category.preview} ·{" "}
                    {category.dialogues.length} Stages
                  </span>
                </div>

                <ArrowRight size={18} weight="bold" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
