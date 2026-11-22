"use client";

import {
  createContext, useCallback, useContext, useEffect, useState,
  type Dispatch, type SetStateAction,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Search, Bell, Mail, UserRound, Feather, X as XClose } from "lucide-react";
import Avatar from "./Avatar";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import ComposeBox from "./ComposeBox";
import type { TrendDTO, UserDTO } from "@/lib/types";

const ComposeContext = createContext<() => void>(() => {});
export const useCompose = () => useContext(ComposeContext);

interface UnreadState {
  notifications: number;
  messages: number;
}

interface UnreadContextValue extends UnreadState {
  refresh: () => Promise<void>;
  set: Dispatch<SetStateAction<UnreadState>>;
}

const UnreadContext = createContext<UnreadContextValue>({
  notifications: 0,
  messages: 0,
  refresh: async () => {},
  set: () => {},
});
export const useUnread = () => useContext(UnreadContext);

interface Props {
  currentUser: UserDTO;
  suggested: UserDTO[];
  trends: TrendDTO[];
  unreadNotifications: number;
  unreadMessages: number;
  children: React.ReactNode;
}

export default function AppShell({
  currentUser,
  suggested,
  trends,
  unreadNotifications,
  unreadMessages,
  children,
}: Props) {
  const [composeOpen, setComposeOpen] = useState(false);
  const [unread, setUnread] = useState<UnreadState>({
    notifications: unreadNotifications,
    messages: unreadMessages,
  });
  const pathname = usePathname();

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/unread", { cache: "no-store" });
      if (res.ok) setUnread(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    setUnread({ notifications: unreadNotifications, messages: unreadMessages });
  }, [unreadNotifications, unreadMessages]);

  useEffect(() => {
    void refresh();
  }, [pathname, refresh]);

  const mobileNav = [
    { href: "/", icon: House, badge: 0 },
    { href: "/explore", icon: Search, badge: 0 },
    { href: "/notifications", icon: Bell, badge: unread.notifications },
    { href: "/messages", icon: Mail, badge: unread.messages },
    { href: `/profile/${currentUser.username}`, icon: UserRound, badge: 0 },
  ];

  return (
    <ComposeContext.Provider value={() => setComposeOpen(true)}>
      <UnreadContext.Provider value={{ ...unread, refresh, set: setUnread }}>
        <div className="mx-auto flex w-full max-w-[1265px] justify-center">
          <div className="hidden md:flex">
            <LeftSidebar
              currentUser={currentUser}
              unreadNotifications={unread.notifications}
              unreadMessages={unread.messages}
              onCompose={() => setComposeOpen(true)}
            />
          </div>

          <main className="min-h-screen w-full max-w-[600px] border-x border-[var(--border)] pb-16 md:pb-0">
            {children}
          </main>

          <RightSidebar currentUserId={currentUser.id} suggested={suggested} trends={trends} />
        </div>

        <nav className="fixed bottom-0 left-0 z-30 flex h-[54px] w-full items-center justify-around border-t border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur md:hidden">
          {mobileNav.map(({ href, icon: Icon, badge }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className="relative flex h-11 w-11 items-center justify-center rounded-full">
                <Icon size={24} strokeWidth={active ? 2.6 : 1.9} />
                {badge > 0 && (
                  <span className="absolute right-0.5 top-0.5 flex min-w-[16px] items-center justify-center rounded-full bg-[#1d9bf0] px-1 text-[9px] font-bold text-white">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </Link>
            );
          })}
          <Link href={`/profile/${currentUser.username}`} className="flex h-11 w-11 items-center justify-center rounded-full">
            <Avatar src={currentUser.avatar} name={currentUser.name} username={currentUser.username} size={26} />
          </Link>
        </nav>

        <button
          onClick={() => setComposeOpen(true)}
          className="fixed bottom-20 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#1d9bf0] text-white shadow-xl hover:bg-[#1a8cd8] md:hidden"
          aria-label="New post"
        >
          <Feather size={24} />
        </button>

        {composeOpen && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-2 pt-[5vh] sm:pt-[10vh]"
            onMouseDown={(e) => { if (e.target === e.currentTarget) setComposeOpen(false); }}
          >
            <div className="w-full max-w-[600px] overflow-hidden rounded-2xl bg-[var(--bg)] shadow-2xl">
              <div className="flex items-center justify-between px-4 py-2">
                <button
                  onClick={() => setComposeOpen(false)}
                  className="rounded-full px-3 py-1.5 text-[14px] hover:bg-[var(--hover-strong)]"
                >
                  Cancel
                </button>
                <span className="text-[15px] font-bold">New post</span>
                <button
                  onClick={() => setComposeOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--hover-strong)]"
                >
                  <XClose size={20} />
                </button>
              </div>
              <ComposeBox currentUser={currentUser} variant="modal" autoFocus onClose={() => setComposeOpen(false)} />
              <div className="h-3" />
            </div>
          </div>
        )}
      </UnreadContext.Provider>
    </ComposeContext.Provider>
  );
}
