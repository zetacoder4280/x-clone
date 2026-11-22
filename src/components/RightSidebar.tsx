"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, MoreHorizontal, BadgeCheck } from "lucide-react";
import Avatar from "./Avatar";
import FollowButton from "./FollowButton";
import type { TrendDTO, UserDTO } from "@/lib/types";

interface Props {
  currentUserId: string;
  suggested: UserDTO[];
  trends: TrendDTO[];
}

export default function RightSidebar({ currentUserId, suggested, trends }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function search(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/explore?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-[350px] shrink-0 overflow-y-auto px-6 pb-8 lg:block">
      <form onSubmit={search} className="sticky top-0 z-10 py-1">
        <div className="flex h-[44px] items-center gap-3 rounded-full border border-transparent bg-[var(--panel)] px-4 focus-within:border-[#1d9bf0] focus-within:bg-[var(--bg)]">
          <Search size={18} className="text-[var(--muted)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="w-full bg-transparent text-[14px] outline-none placeholder:text-[var(--muted)]"
          />
        </div>
      </form>

      <section className="mt-4 overflow-hidden rounded-2xl border border-[var(--border)]">
        <h2 className="px-4 pt-3 text-[20px] font-extrabold">Subscribe to Premium</h2>
        <p className="mt-1 px-4 text-[14px] leading-5">
          Subscribe to unlock new features and if eligible, receive a share of revenue.
        </p>
        <button className="mb-3 ml-4 mt-3 rounded-full bg-[#1d9bf0] px-4 py-1.5 text-[14px] font-bold text-white hover:bg-[#1a8cd8]">
          Subscribe
        </button>
      </section>

      <section className="mt-4 overflow-hidden rounded-2xl border border-[var(--border)]">
        <h2 className="px-4 py-3 text-[20px] font-extrabold">What&apos;s happening</h2>
        {trends.map((trend) => (
          <Link
            key={trend.title}
            href={`/explore?q=${encodeURIComponent(trend.title.replace("#", ""))}`}
            className="block px-4 py-3 transition-colors hover:bg-[var(--hover)]"
          >
            <div className="flex items-center justify-between text-[13px] text-[var(--muted)]">
              <span>{trend.category}</span>
              <MoreHorizontal size={16} />
            </div>
            <div className="mt-0.5 text-[15px] font-bold">{trend.title}</div>
            <div className="mt-0.5 text-[13px] text-[var(--muted)]">{trend.posts}</div>
          </Link>
        ))}
        <Link href="/explore" className="block px-4 py-3 text-[14px] text-[#1d9bf0] hover:bg-[var(--hover)]">
          Show more
        </Link>
      </section>

      <section className="mt-4 overflow-hidden rounded-2xl border border-[var(--border)]">
        <h2 className="px-4 py-3 text-[20px] font-extrabold">Who to follow</h2>
        {suggested.map((user) => (
          <div key={user.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--hover)]">
            <Link href={`/profile/${user.username}`}>
              <Avatar src={user.avatar} name={user.name} username={user.username} size={40} />
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <Link href={`/profile/${user.username}`} className="truncate text-[14px] font-bold hover:underline">
                  {user.name}
                </Link>
                {user.verified && <BadgeCheck size={14} className="shrink-0 fill-[#1d9bf0] text-white" />}
              </div>
              <div className="truncate text-[14px] text-[var(--muted)]">@{user.username}</div>
            </div>
            <FollowButton user={user} currentUserId={currentUserId} small />
          </div>
        ))}
        <Link href="/explore" className="block px-4 py-3 text-[14px] text-[#1d9bf0] hover:bg-[var(--hover)]">
          Show more
        </Link>
      </section>

      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 px-2 text-[12px] text-[var(--muted)]">
        {["Terms of Service", "Privacy Policy", "Cookie Policy", "Accessibility", "Ads info", "More"].map((item) => (
          <Link key={item} href="/settings" className="hover:underline">{item}</Link>
        ))}
        <span>© 2026 X Corp.</span>
      </div>
    </aside>
  );
}
