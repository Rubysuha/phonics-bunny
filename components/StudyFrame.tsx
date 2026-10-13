"use client";

import Image from "next/image";
import { ImageSquare } from "@phosphor-icons/react";
import styles from "./StudyPanel.module.css";

type Props = {
  imageSrc: string;
  imageAlt: string;

  /* imageSrc 가 "" 이면 "그림 준비 중" 표시 */

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
        {imageSrc && (
          <span
            className={styles.imageBackdrop}
            style={{ backgroundImage: `url("${imageSrc}")` }}
            aria-hidden="true"
          />
        )}

        <span className={styles.sparkleA} aria-hidden="true">
          ✦
        </span>

        <span className={styles.sparkleB} aria-hidden="true">
          ✦
        </span>

        {imageSrc ? (
          <div className={styles.imageFrame}>
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              priority
              sizes="(max-width: 900px) 90vw, 540px"
            />
          </div>
        ) : (
          /* 그림이 아직 없는 단어 */
          <div className={styles.noImage}>
            <ImageSquare size={56} />
            <span>Picture coming soon</span>
          </div>
        )}

        {caption && <p className={styles.caption}>{caption}</p>}
      </div>

      <div className={styles.panel}>{children}</div>
    </div>
  );
}
