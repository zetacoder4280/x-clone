"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UserDTO } from "@/lib/types";

interface Props {
  user: UserDTO;
  currentUserId: string;
  small?: boolean;
  onChange?: (following: boolean, followersCount: number) => void;
}

export default function FollowButton({ user, currentUserId, small = false, onChange }: Props) {
  const router = useRouter();
  const [following, setFollowing] = useState(Boolean(user.isFollowing));
  const [count, setCount] = useState(user.followersCount);
  const [busy, setBusy] = useState(false);

  if (user.id === currentUserId) return null;

  async function toggle() {
    if (busy) return;
    setBusy(true);
    const next = !following;
    setFollowing(next);
    setCount((c) => c + (next ? 1 : -1));
    try {
      const res = await fetch(`/api/users/${user.username}/follow`, { method: next ? "POST" : "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCount(data.followersCount);
      onChange?.(next, data.followersCount);
      router.refresh();
    } catch {
      setFollowing(!next);
      setCount((c) => c + (next ? -1 : 1));
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={
        small
          ? `rounded-full px-4 py-1.5 text-[13px] font-bold transition-colors disabled:opacity-60 ${
              following
                ? "border border-[var(--border)] text-[var(--text)] hover:border-red-500 hover:text-red-500"
                : "bg-[var(--text)] text-[var(--bg)] hover:opacity-85"
            }`
          : `min-w-[100px] rounded-full px-5 py-2 text-[14px] font-bold transition-colors disabled:opacity-60 ${
              following
                ? "border border-[var(--border)] text-[var(--text)] hover:border-red-500 hover:text-red-500"
                : "bg-[var(--text)] text-[var(--bg)] hover:opacity-85"
            }`
      }
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
