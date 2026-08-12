"use client";

import { ArrowLeft } from "@phosphor-icons/react";
import ActionButton from "@/components/ActionButton";

type BackButtonProps = {
  href: string;
  children: React.ReactNode;
};

export default function BackButton({ href, children }: BackButtonProps) {
  return (
    <ActionButton
      variant="close"
      icon={<ArrowLeft size={20} weight="fill" />}
      href={href}
    >
      {children}
    </ActionButton>
  );
}