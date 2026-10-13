"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Question, X } from "@phosphor-icons/react";
import styles from "./HelpTooltip.module.css";

export type HelpSection = {
  heading: string;
  items: string[];
};

type HelpTooltipProps = {
  title: string;
  sections: HelpSection[];
};

/*
  화면 오른쪽 위의 ? 버튼
  누르면 그 화면의 사용 방법을 화면 가운데에 크게 보여 줌
*/
export default function HelpTooltip({ title, sections }: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setIsOpen(true)}
        aria-label="이용 안내"
        aria-haspopup="dialog"
      >
        <Question size={22} weight="bold" />
      </button>

      {isOpen &&
        createPortal(
          /* 바깥(어두운 부분)을 누르면 닫힘 */
          <div className={styles.overlay} onClick={() => setIsOpen(false)}>
            <div
              className={styles.panel}
              role="dialog"
              aria-modal="true"
              aria-label={title}
              onClick={(event) => event.stopPropagation()}
            >
              <div className={styles.panelHeader}>
                <span className={styles.headerIcon}>
                  <Question size={22} weight="bold" />
                </span>

                <h2 className={styles.title}>{title}</h2>

                <button
                  type="button"
                  className={styles.closeButton}
                  onClick={() => setIsOpen(false)}
                  aria-label="닫기"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>

              <div className={styles.body}>
                {sections.map((section) => (
                  <section key={section.heading} className={styles.section}>
                    <h3 className={styles.sectionHeading}>{section.heading}</h3>

                    <ul className={styles.list}>
                      {section.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>

              <button
                type="button"
                className={styles.okButton}
                onClick={() => setIsOpen(false)}
              >
                알겠어요
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
