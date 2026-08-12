// components/Toast.tsx
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
import styles from "./Toast.module.css";

type ToastItem = {
  id: number;
  message: string;
};

type ToastContextType = {
  showToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);

  if (!ctx) {
    throw new Error("useToast는 ToastProvider 안에서만 사용할 수 있어");
  }

  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const idRef = useRef(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const showToast = useCallback((message: string) => {
    const id = idRef.current++;
    setToasts((prev) => [...prev, { id, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 2400);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {isMounted &&
        createPortal(
          <div className={styles.toastStack}>
            {toasts.map((toast) => (
              <div key={toast.id} className={styles.toast}>
                <span className={styles.toastText}>{toast.message}</span>
              </div>
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}