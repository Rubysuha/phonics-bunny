"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import styles from "./AppShell.module.css";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isShopPage = pathname.startsWith("/shop");

  return (
    <div className={styles.page}>
      <div className={styles.frame}>
        {!isShopPage && <TopBar />}

        <div className={`${styles.body} ${isShopPage ? styles.shopBody : ""}`}>
          {!isShopPage && <Sidebar />}

          <main className={`${styles.main} ${isShopPage ? styles.shopMain : ""}`}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}