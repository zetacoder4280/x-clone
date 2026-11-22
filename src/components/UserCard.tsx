"use client";

import Link from "next/link";
import Avatar from "./Avatar";
import FollowButton from "./FollowButton";
import type { UserDTO } from "@/lib/types";

interface Props {
  user: UserDTO;
  currentUserId: string;
}

export default function UserCard({ user, currentUserId }: Props) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[var(--hover)]">
      <Link href={`/profile/${user.username}`}>
        <Avatar src={user.avatar} name={user.name} username={user.username} size={40} />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/profile/${user.username}`} className="group min-w-0">
            <div className="truncate text-[14px] font-bold leading-5 hover:underline">{user.name}</div>
            <div className="truncate text-[14px] text-[var(--muted)]">@{user.username}</div>
          </Link>
          <FollowButton user={user} currentUserId={currentUserId} small />
        </div>
        {user.bio && <p className="mt-1.5 line-clamp-2 text-[14px] leading-5">{user.bio}</p>}
      </div>
    </div>
  );
}
