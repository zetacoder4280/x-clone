"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

export default function ExploreSearch({ initial }: { initial: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    router.push(value.trim() ? `/explore?q=${encodeURIComponent(value.trim())}` : "/explore");
  }

  return (
    <div className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--bg)]/85 p-3 backdrop-blur-md">
      <form onSubmit={submit} className="flex h-[44px] items-center gap-3 rounded-full bg-[var(--panel)] px-4 focus-within:ring-1 focus-within:ring-[#1d9bf0]">
        <Search size={18} className="text-[var(--muted)]" />
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search X"
          className="w-full bg-transparent text-[15px] outline-none placeholder:text-[var(--muted)]"
        />
        {value && (
          <button type="button" onClick={() => { setValue(""); router.push("/explore"); }} className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1d9bf0] text-white">
            <X size={12} />
          </button>
        )}
      </form>
    </div>
  );
}
