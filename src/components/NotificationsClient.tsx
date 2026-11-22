"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Heart, Repeat2, UserPlus, MessageCircle, AtSign, Settings2 } from "lucide-react";
import Avatar from "./Avatar";
import { useUnread } from "./AppShell";
import type { NotificationDTO } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

const styles = {
  like: { icon: Heart, bg: "bg-[#f91880]" },
  retweet: { icon: Repeat2, bg: "bg-[#00ba7c]" },
  follow: { icon: UserPlus, bg: "bg-[#1d9bf0]" },
  reply: { icon: MessageCircle, bg: "bg-[#1d9bf0]" },
  mention: { icon: AtSign, bg: "bg-[#1d9bf0]" },
};

const verbs: Record<string, string> = {
  like: "liked your post",
  retweet: "reposted your post",
  follow: "followed you",
  reply: "replied to your post",
  mention: "mentioned you",
};

export default function NotificationsClient({ initialItems }: { initialItems: NotificationDTO[] }) {
  const { refresh, set } = useUnread();
  const [items, setItems] = useState(initialItems);
  const [read, setRead] = useState(false);
  const marked = useRef(false);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const markRead = useCallback(async () => {
    if (marked.current) return;
    marked.current = true;
    setRead(true);
    setItems((prev) => prev.map((item) => ({ ...item, read: true })));
    try {
      await fetch("/api/notifications/read", { method: "POST", keepalive: true });
      await refresh();
      set((prev) => ({ ...prev, notifications: 0 }));
    } catch {
      marked.current = false;
      setRead(false);
    }
  }, [refresh, set]);

  useEffect(() => {
    void markRead();
  }, [markRead]);

  return (
    <div>
      <div className="sticky top-0 z-20 flex h-[53px] items-center justify-between border-b border-[var(--border)] bg-[var(--bg)]/85 px-4 backdrop-blur-md">
        <h1 className="text-[20px] font-extrabold">Notifications</h1>
        <button onClick={markRead} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--hover-strong)]" title="Mark all as read">
          <Settings2 size={20} />
        </button>
      </div>

      {!read && (
        <button onClick={markRead} className="w-full border-b border-[var(--border)] py-2.5 text-center text-[14px] font-bold text-[#1d9bf0] hover:bg-[var(--hover)]">
          Mark all as read
        </button>
      )}

      {items.length === 0 ? (
        <div className="px-8 py-16 text-center">
          <h2 className="text-[31px] font-extrabold">Nothing to see here — yet</h2>
          <p className="mx-auto mt-2 max-w-[380px] text-[15px] text-[var(--muted)]">
            When someone likes, reposts or replies to your posts, you&apos;ll find it here.
          </p>
        </div>
      ) : (
        items.map((item) => {
          const style = styles[item.type];
          const Icon = style.icon;
          const content = (
            <div className="flex gap-3 border-b border-[var(--border)] px-4 py-3 hover-row">
              <div className="relative shrink-0">
                <Avatar src={item.actor.avatar} name={item.actor.name} username={item.actor.username} size={40} />
                <span className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-[var(--bg)] ${style.bg}`}>
                  <Icon size={12} className="text-white" fill={item.type === "like" ? "currentColor" : "none"} />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] leading-5">
                  <b>{item.actor.name}</b> <span className="text-[var(--muted)]">{verbs[item.type]}</span>
                  {!item.read && <span className={`ml-1 inline-block h-2 w-2 rounded-full ${style.bg}`} />}
                </div>
                <div className="mt-1 text-[14px] text-[var(--muted)]">{timeAgo(item.createdAt)}</div>
                {item.tweetText && (
                  <div className="mt-2 rounded-xl border border-[var(--border)] p-3 text-[14px] leading-5 text-[var(--muted)]">
                    {item.tweetText.length > 130 ? item.tweetText.slice(0, 130) + "…" : item.tweetText}
                  </div>
                )}
              </div>
            </div>
          );
          return item.tweetId ? (
            <Link key={item.id} href={`/status/${item.tweetId}`} onClick={() => void markRead()} className="block">{content}</Link>
          ) : (
            <Link key={item.id} href={`/profile/${item.actor.username}`} onClick={() => void markRead()} className="block">{content}</Link>
          );
        })
      )}
    </div>
  );
}
