import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import { ConfirmProvider } from "@/components/ConfirmDialog";

/* 한글이 기기마다 다른 기본 글꼴로 보이지 않도록 한글 글꼴을 지정 (영문은 Arial 그대로) */
const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-kr",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Phonics Bunny",
  description: "Phonics Bunny App",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={notoSansKr.variable}>
      <body>
        <ToastProvider>
          <ConfirmProvider>{children}</ConfirmProvider>
        </ToastProvider>
      </body>
    </html>
  );
}