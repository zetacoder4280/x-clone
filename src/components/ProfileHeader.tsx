"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, BadgeCheck } from "lucide-react";
import Avatar from "./Avatar";
import FollowButton from "./FollowButton";
import { joinDate } from "@/lib/utils";
import type { UserDTO } from "@/lib/types";

interface Props {
  profile: UserDTO;
  currentUserId: string;
}

export default function ProfileHeader({ profile, currentUserId }: Props) {
  const router = useRouter();
  const isMine = profile.id === currentUserId;
  const banner = profile.banner || "";

  return (
    <div>
      <div className="h-[200px] w-full bg-[var(--panel)]">
        {banner && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={banner} alt="banner" className="h-full w-full object-cover" />
        )}
      </div>

      <div className="px-4 pb-3">
        <div className="flex items-end justify-between">
          <div className="-mt-[67px] rounded-full border-4 border-[var(--bg)]">
            <Avatar src={profile.avatar} name={profile.name} username={profile.username} size={133} />
          </div>
          <div className="mb-2 flex items-center gap-2">
            {isMine ? (
              <Link
                href="/settings"
                className="rounded-full border border-[var(--border)] px-4 py-1.5 text-[14px] font-bold transition-colors hover:bg-[var(--hover-strong)]"
              >
                Edit profile
              </Link>
            ) : (
              <FollowButton user={profile} currentUserId={currentUserId} />
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1">
          <h2 className="text-[20px] font-extrabold leading-6">{profile.name}</h2>
          {profile.verified && <BadgeCheck size={18} className="fill-[#1d9bf0] text-white" />}
        </div>
        <div className="text-[15px] text-[var(--muted)]">@{profile.username}</div>

        {profile.bio && <p className="mt-3 whitespace-pre-wrap text-[15px] leading-5">{profile.bio}</p>}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[15px] text-[var(--muted)]">
          {profile.location && <span>{profile.location}</span>}
          {profile.website && (
            <a href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="text-[#1d9bf0] hover:underline">
              {profile.website.replace(/^https?:\/\//, "")}
            </a>
          )}
          <span className="flex items-center gap-1">
            <CalendarDays size={16} /> Joined {joinDate(profile.createdAt)}
          </span>
        </div>

        <div className="mt-3 flex gap-5 text-[14px]">
          <button onClick={() => router.push(`/profile/${profile.username}?tab=following`)} className="hover:underline">
            <b className="text-[var(--text)]">{profile.followingCount}</b>{" "}
            <span className="text-[var(--muted)]">Following</span>
          </button>
          <button onClick={() => router.push(`/profile/${profile.username}?tab=followers`)} className="hover:underline">
            <b className="text-[var(--text)]">{profile.followersCount}</b>{" "}
            <span className="text-[var(--muted)]">Followers</span>
          </button>
        </div>
      </div>
    </div>
  );
}
