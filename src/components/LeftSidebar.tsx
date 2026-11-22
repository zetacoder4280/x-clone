"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  House, Search, Bell, Mail, Sparkles, Bookmark, Users, BadgeCheck, UserRound,
  MoreHorizontal, Feather, LogOut,
} from "lucide-react";
import Avatar from "./Avatar";
import ThemeToggle from "./ThemeToggle";
import type { UserDTO } from "@/lib/types";

export function XLogo({ size = 30 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-label="X">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const navItems = [
  { label: "Home", href: "/", icon: House },
  { label: "Explore", href: "/explore", icon: Search },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Messages", href: "/messages", icon: Mail },
  { label: "Grok", href: "/explore?q=grok", icon: Sparkles },
  { label: "Bookmarks", href: "/bookmarks", icon: Bookmark },
  { label: "Communities", href: "/explore?q=community", icon: Users },
  { label: "Premium", href: "/settings", icon: BadgeCheck },
  { label: "Profile", href: "/profile/demo", icon: UserRound },
  { label: "More", href: "/settings", icon: MoreHorizontal },
];

interface Props {
  currentUser: UserDTO;
  unreadNotifications: number;
  unreadMessages: number;
  onCompose: () => void;
}

export default function LeftSidebar({ currentUser, unreadNotifications, unreadMessages, onCompose }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [showAccount, setShowAccount] = useState(false);

  const items = navItems.map((item) =>
    item.label === "Profile" ? { ...item, href: `/profile/${currentUser.username}` } : item,
  );

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="sticky top-0 flex h-screen w-[68px] shrink-0 flex-col items-center px-1 pt-1 xl:w-[275px] xl:items-stretch xl:px-2">
      <Link href="/" className="mb-1 flex h-[52px] w-[52px] items-center justify-center rounded-full transition-colors hover:bg-[var(--hover-strong)]">
        <XLogo size={30} />
      </Link>

      <nav className="flex w-full flex-col items-center gap-0.5 xl:items-start">
        {items.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href.split("?")[0]);
          const Icon = item.icon;
          const badge = item.label === "Notifications" ? unreadNotifications : item.label === "Messages" ? unreadMessages : 0;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`group flex h-[50px] items-center gap-5 rounded-full px-3 transition-colors hover:bg-[var(--hover-strong)] xl:pr-6 ${
                active ? "font-bold" : "font-normal"
              }`}
            >
              <div className="relative">
                <Icon size={26} strokeWidth={active ? 2.6 : 1.9} />
                {badge > 0 && (
                  <span className="absolute -right-2 -top-1 flex min-w-[17px] items-center justify-center rounded-full bg-[#1d9bf0] px-1 text-[10px] font-bold text-white">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </div>
              <span className="hidden text-[20px] xl:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <button
        onClick={onCompose}
        className="mt-4 flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#1d9bf0] text-white shadow-lg transition-colors hover:bg-[#1a8cd8] xl:w-[90%] xl:gap-2"
      >
        <Feather size={24} className="xl:hidden" />
        <span className="hidden text-[17px] font-bold xl:inline">Post</span>
      </button>

      <div className="mt-auto mb-3 w-full">
        <div className="hidden xl:block">
          <ThemeToggle />
        </div>
        <div className="relative">
          <button
            onClick={() => setShowAccount((v) => !v)}
            className="flex w-full items-center gap-3 rounded-full p-2 transition-colors hover:bg-[var(--hover-strong)]"
          >
            <Avatar src={currentUser.avatar} name={currentUser.name} username={currentUser.username} size={40} />
            <div className="hidden min-w-0 flex-1 text-left xl:block">
              <div className="truncate text-[14px] font-bold">{currentUser.name}</div>
              <div className="truncate text-[14px] text-[var(--muted)]">@{currentUser.username}</div>
            </div>
            <MoreHorizontal size={18} className="hidden xl:block" />
          </button>
          {showAccount && (
            <div className="absolute bottom-14 left-0 z-40 w-[260px] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg)] py-1 shadow-2xl">
              <button onClick={logout} className="flex w-full items-center gap-3 px-4 py-3 text-left text-[14px] font-bold hover:bg-[var(--hover)]">
                <LogOut size={18} /> Log out @{currentUser.username}
              </button>
              <div className="border-t border-[var(--border)] px-4 py-3 xl:hidden">
                <ThemeToggle />
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
