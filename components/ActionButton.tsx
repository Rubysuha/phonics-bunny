"use client";

import Link from "next/link";
import styles from "./ActionButton.module.css";

export type ActionButtonVariant =
  | "listen"
  | "aiListen"
  | "record"
  | "recording"
  | "playback"
  | "analyze"
  | "download"
  | "close"
  | "retry";

type ActionButtonProps = {
  variant: ActionButtonVariant;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  href?: string;
  size?: "md" | "sm";
};

export default function ActionButton({
  variant,
  icon,
  children,
  onClick,
  disabled,
  href,
  size = "md",
}: ActionButtonProps) {
  const className = `${styles.button} ${styles[variant]} ${
    size === "sm" ? styles.sm : ""
  }`;

  if (href) {
    return (
      <Link href={href} className={className}>
        <span className={styles.icon}>{icon}</span>
        <span>{children}</span>
      </Link>
    );
  }

  return (
    <button className={className} onClick={onClick} disabled={disabled}>
      <span className={styles.icon}>{icon}</span>
      <span>{children}</span>
    </button>
  );
}