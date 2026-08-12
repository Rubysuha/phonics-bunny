"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./HelpTooltip.module.css";

type HelpSection = {
  heading: string;
  items: string[];
};

type HelpTooltipProps = {
  title: string;
  sections: HelpSection[];
};

export default function HelpTooltip({ title, sections }: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 패널 바깥을 클릭하면 자동으로 닫힘
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="이용 안내"
        aria-expanded={isOpen}
      >
        ?
      </button>

      {isOpen && (
        <div className={styles.panel} role="dialog" aria-label={title}>
          <div className={styles.panelHeader}>
            <strong>{title}</strong>
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
              aria-label="닫기"
            >
              ×
            </button>
          </div>

          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className={styles.section}>
              <p className={styles.sectionHeading}>{section.heading}</p>
              <ul className={styles.list}>
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}