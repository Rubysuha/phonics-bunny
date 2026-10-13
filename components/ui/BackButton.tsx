import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/ssr";
import styles from "./BackButton.module.css";

type BackButtonProps = {
  href: string;
  children: React.ReactNode;
};

/* 목록 화면 아래의 "돌아가기" 버튼 (모든 메뉴 공통 모양) */
export default function BackButton({ href, children }: BackButtonProps) {
  return (
    <Link href={href} className={styles.button}>
      <ArrowLeft size={19} />
      {children}
    </Link>
  );
}
