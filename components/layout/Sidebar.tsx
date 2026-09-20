"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  Notebook,
  ChatCircleDots,
  BookOpen,
  ClipboardText,
  ShoppingBag,
  UsersThree,
  Carrot,
} from "@phosphor-icons/react";
import styles from "./Sidebar.module.css";

const menus = [
  { icon: House, label: "Home", href: "/dashboard" },
  { icon: Notebook, label: "Phonics", href: "/english" },
  { icon: ChatCircleDots, label: "Conversation", href: "/conversation" },
  { icon: BookOpen, label: "Book", href: "/book" },
  { icon: ClipboardText, label: "Test", href: "/test" },
  { icon: ShoppingBag, label: "Shop", href: "/shop" },
  { icon: UsersThree, label: "Community", href: "/community" },
];

export default function Sidebar() {
  const pathname = usePathname();

  if (pathname.startsWith("/shop")) {
    return null;
  }

  const getCurrentTitle = () => {
    if (pathname.startsWith("/english")) return "Phonics";
    if (pathname.startsWith("/conversation")) return "Conversation";
    if (pathname.startsWith("/book")) return "Book";
    if (pathname.startsWith("/test")) return "Test";
    if (pathname.startsWith("/community")) return "Community";
    return "Home";
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.titleBox}>
        <span className={styles.titleIcon}>
          <Carrot size={26} weight="duotone" />
        </span>
        <span className={styles.titleText}>{getCurrentTitle()}</span>
      </div>

      <div className={styles.menuPanel}>
        {menus.map((menu) => {
          const Icon = menu.icon;

          const isActive =
            menu.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(menu.href);

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`${styles.menuItem} ${isActive ? styles.active : ""}`}
            >
              <span className={styles.menuIcon}>
                <Icon size={28} weight="duotone" />
              </span>
              <span className={styles.menuLabel}>{menu.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}