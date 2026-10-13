"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import styles from "./ConfirmDialog.module.css";

type ConfirmOptions = {
  /* 확인 버튼 글자 (기본 "확인") */
  confirmLabel?: string;
};

type ConfirmFn = (
  message: string,
  options?: ConfirmOptions
) => Promise<boolean>;

type Pending = {
  message: string;
  confirmLabel: string;
  resolve: (ok: boolean) => void;
};

const ConfirmContext = createContext<ConfirmFn | null>(null);

/*
  브라우저 기본 confirm() 대신 쓰는 확인 창

  const confirm = useConfirm();
  const ok = await confirm("댓글을 삭제할까요?", { confirmLabel: "삭제" });
*/
export function useConfirm() {
  const ctx = useContext(ConfirmContext);

  if (!ctx) {
    throw new Error("useConfirm은 ConfirmProvider 안에서만 사용할 수 있어요");
  }

  return ctx;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const confirm = useCallback<ConfirmFn>(
    (message, options) =>
      new Promise<boolean>((resolve) => {
        setPending({
          message,
          confirmLabel: options?.confirmLabel ?? "확인",
          resolve,
        });
      }),
    []
  );

  const close = useCallback(
    (ok: boolean) => {
      pending?.resolve(ok);
      setPending(null);
    },
    [pending]
  );

  useEffect(() => {
    if (!pending) return;

    /* 실수로 지우지 않도록 처음에는 취소 버튼에 포커스 */
    cancelRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close(false);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [pending, close]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {pending &&
        createPortal(
          <div className={styles.overlay} onClick={() => close(false)}>
            <div
              className={styles.dialog}
              role="alertdialog"
              aria-modal="true"
              aria-label={pending.message}
              onClick={(event) => event.stopPropagation()}
            >
              <p className={styles.message}>{pending.message}</p>

              <div className={styles.buttons}>
                <button
                  ref={cancelRef}
                  className={styles.cancel}
                  onClick={() => close(false)}
                >
                  취소
                </button>

                <button
                  className={styles.confirm}
                  onClick={() => close(true)}
                >
                  {pending.confirmLabel}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </ConfirmContext.Provider>
  );
}
