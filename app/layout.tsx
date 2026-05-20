import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Phonics Bunny",
  description: "Phonics Bunny App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}