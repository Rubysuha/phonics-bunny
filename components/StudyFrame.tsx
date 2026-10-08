"use client";

import Image from "next/image";
import styles from "./StudyPanel.module.css";

type Props = {
  imageSrc: string;
  imageAlt: string;

  /*
    word  : 단어 그림 (정사각 틀 안에 가운데)
    scene : 대화 · 이야기 장면 그림 (카드에 맞춰 크게, 모서리 둥글게)
  */
  imageKind?: "word" | "scene";

  /* 오른쪽 카드 내용을 위에서부터 채우고, 남는 높이는 안에서 스크롤 */
  fill?: boolean;

  /*
    넘기면 "읽기 배치"가 됨:
    왼쪽 넓은 카드에 글(children), 오른쪽에 그림 + 조작 카드(aside)
    문장이 많은 Conversation · Book 에서 글이 한눈에 보이도록 하기 위함
  */
  aside?: React.ReactNode;

  /* 그림 바로 아래에 크게 보여줄 글 (Phonics 의 단어) */
  caption?: React.ReactNode;

  children: React.ReactNode;
};

/*
  학습 화면의 공통 틀
  크림색 컨테이너 안에 왼쪽 그림 카드 + 오른쪽 학습 카드
*/
export default function StudyFrame({
  imageSrc,
  imageAlt,
  imageKind = "word",
  fill = false,
  aside,
  caption,
  children,
}: Props) {
  const imageCard = (
    <div className={styles.imageCard}>
      {/*
        그림의 모서리 색을 카드 전체에 깔아서
        그림에 들어 있는 배경색과 카드가 이어져 보이게 함
      */}
      <span
        className={styles.imageBackdrop}
        style={{ backgroundImage: `url("${imageSrc}")` }}
        aria-hidden="true"
      />

      <span className={styles.sparkleA} aria-hidden="true">
        ✦
      </span>

      <span className={styles.sparkleB} aria-hidden="true">
        ✦
      </span>

      <div
        className={`${styles.imageFrame} ${
          imageKind === "scene" ? styles.imageFrameScene : ""
        }`}
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          sizes="(max-width: 900px) 90vw, 540px"
        />
      </div>

      {caption && <p className={styles.caption}>{caption}</p>}
    </div>
  );

  /* 읽기 배치: 글(왼쪽, 넓게) | 그림 + 조작(오른쪽) */
  if (aside) {
    return (
      <div
        className={`${styles.layout} ${styles.layoutFill} ${styles.layoutReading}`}
      >
        <div className={`${styles.panel} ${styles.panelFill}`}>
          {children}
        </div>

        <div className={styles.sideColumn}>
          {imageCard}

          <div className={`${styles.panel} ${styles.sidePanel}`}>
            {aside}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.layout} ${fill ? styles.layoutFill : ""}`}>
      {imageCard}

      <div className={`${styles.panel} ${fill ? styles.panelFill : ""}`}>
        {children}
      </div>
    </div>
  );
}
