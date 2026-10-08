"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { HOME_LOOK_EVENT, loadHomeLook } from "@/lib/homeLook";
import { backgroundSkins } from "@/app/(main)/shop/data";
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
  const isHomePage = pathname.startsWith("/dashboard");

  /*
    Shop 에서 "Home에 적용"한 배경
    Home 화면에서만 앱 전체 배경(사이드바 · 상단 바 뒤)을 이 그림으로 바꿈
  */
  const [homeBackground, setHomeBackground] = useState<string | null>(null);

  useEffect(() => {
    if (!isHomePage) return;

    let cancelled = false;

    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const look = user ? await loadHomeLook(user.id) : null;

      const background = backgroundSkins.find(
        (item) => item.id === look?.backgroundId
      );

      if (!cancelled) {
        setHomeBackground(background?.image ?? null);
      }
    };

    load();

    window.addEventListener(HOME_LOOK_EVENT, load);

    return () => {
      cancelled = true;
      window.removeEventListener(HOME_LOOK_EVENT, load);
    };
  }, [isHomePage]);

  return (
    <div className={styles.page}>
      <div
        className={styles.frame}
        style={
          isHomePage && homeBackground
            ? { backgroundImage: `url("${homeBackground}")` }
            : undefined
        }
      >
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