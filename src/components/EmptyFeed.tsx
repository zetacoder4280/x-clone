"use client";

import { useCompose } from "./AppShell";

export default function EmptyFeed() {
  const openCompose = useCompose();
  return (
    <div className="px-8 py-10 text-center">
      <h2 className="text-[31px] font-extrabold">Welcome to X!</h2>
      <p className="mt-2 text-[15px] text-[var(--muted)]">When you follow people, you&apos;ll see their posts here.</p>
      <button
        onClick={openCompose}
        className="mt-5 rounded-full bg-[#1d9bf0] px-5 py-2.5 text-[14px] font-bold text-white hover:bg-[#1a8cd8]"
      >
        Write a post
      </button>
    </div>
  );
}
