"use client";

import Image from "next/image";
import styles from "./StudyPanel.module.css";

type Props = {
  imageSrc: string;
  imageAlt: string;

  /* 그림 바로 아래에 크게 보여줄 글 (Phonics 의 단어) */
  caption?: React.ReactNode;

  children: React.ReactNode;
};

/*
  Phonics 단어 학습 화면의 틀
  크림색 컨테이너 안에 왼쪽 그림 카드 + 오른쪽 학습 카드
*/
export default function StudyFrame({
  imageSrc,
  imageAlt,
  caption,
  children,
}: Props) {
  return (
    <div className={styles.layout}>
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

        <div className={styles.imageFrame}>
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

      <div className={styles.panel}>{children}</div>
    </div>
  );
}
