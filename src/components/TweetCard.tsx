"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MessageCircle, Repeat2, Heart, ChartNoAxesColumn, Bookmark, Share, MoreHorizontal,
  BadgeCheck, Trash2, Copy, Link as LinkIcon,
} from "lucide-react";
import Avatar from "./Avatar";
import TweetText from "./TweetText";
import ComposeBox from "./ComposeBox";
import type { TweetDTO, UserDTO } from "@/lib/types";
import { formatCount, timeAgo, fullDate } from "@/lib/utils";

interface Props {
  tweet: TweetDTO;
  currentUserId: string;
  currentUser: UserDTO;
  detailed?: boolean;
  hideActions?: boolean;
}

export default function TweetCard({ tweet, currentUserId, currentUser, detailed = false, hideActions = false }: Props) {
  const router = useRouter();
  const [liked, setLiked] = useState(tweet.likedByMe);
  const [likes, setLikes] = useState(tweet.likesCount);
  const [reposted, setReposted] = useState(tweet.retweetedByMe);
  const [retweets, setRetweets] = useState(tweet.retweetsCount);
  const [bookmarked, setBookmarked] = useState(tweet.bookmarkedByMe);
  const [showReply, setShowReply] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [toast, setToast] = useState("");

  function flash(message: string) {
    setToast(message);
    setTimeout(() => setToast(""), 2200);
  }

  function goToTweet(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest("a,button,input,textarea")) return;
    router.push(`/status/${tweet.id}`);
  }

  async function toggleLike(e: React.MouseEvent) {
    e.stopPropagation();
    const next = !liked;
    setLiked(next);
    setLikes((c) => c + (next ? 1 : -1));
    try {
      await fetch(`/api/tweets/${tweet.id}/like`, { method: next ? "POST" : "DELETE" });
    } catch {
      setLiked(!next); setLikes((c) => c + (next ? -1 : 1));
    }
  }

  async function toggleRepost(e: React.MouseEvent) {
    e.stopPropagation();
    const next = !reposted;
    setReposted(next);
    setRetweets((c) => c + (next ? 1 : -1));
    try {
      await fetch(`/api/tweets/${tweet.id}/retweet`, { method: next ? "POST" : "DELETE" });
      router.refresh();
      flash(next ? "Reposted" : "Repost removed");
    } catch {
      setReposted(!next); setRetweets((c) => c + (next ? -1 : 1));
    }
  }

  async function toggleBookmark(e: React.MouseEvent) {
    e.stopPropagation();
    const next = !bookmarked;
    setBookmarked(next);
    try {
      await fetch(`/api/tweets/${tweet.id}/bookmark`, { method: next ? "POST" : "DELETE" });
      router.refresh();
      flash(next ? "Added to your Bookmarks" : "Removed from your Bookmarks");
    } catch {
      setBookmarked(!next);
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(`${window.location.origin}/status/${tweet.id}`);
    setShowMenu(false);
    flash("Copied to clipboard");
  }

  async function deleteTweet() {
    setShowMenu(false);
    const res = await fetch(`/api/tweets/${tweet.id}`, { method: "DELETE" });
    if (res.ok) {
      flash("Post deleted");
      setTimeout(() => router.refresh(), 400);
    }
  }

  const isMine = tweet.author.id === currentUserId;

  return (
    <article
      onClick={goToTweet}
      className={`relative cursor-pointer border-b border-[var(--border)] px-4 pt-3 transition-colors hover:bg-[var(--hover)] ${detailed ? "pb-3" : "pb-2"}`}
    >
      {tweet.repostedBy && (
        <div className="mb-1 flex items-center gap-2 pl-8 text-[13px] font-bold text-[var(--muted)]">
          <Repeat2 size={16} />
          <Link href={`/profile/${tweet.repostedBy.username}`} onClick={(e) => e.stopPropagation()} className="hover:underline">
            {tweet.repostedBy.name} reposted
          </Link>
        </div>
      )}

      <div className="flex gap-3">
        <div className="shrink-0">
          <Link href={`/profile/${tweet.author.username}`} onClick={(e) => e.stopPropagation()}>
            <Avatar src={tweet.author.avatar} name={tweet.author.name} username={tweet.author.username} size={40} />
          </Link>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-x-1 text-[15px] leading-5">
              <Link href={`/profile/${tweet.author.username}`} onClick={(e) => e.stopPropagation()} className="max-w-[180px] truncate font-bold hover:underline">
                {tweet.author.name}
              </Link>
              {tweet.author.verified && <BadgeCheck size={16} className="shrink-0 fill-[#1d9bf0] text-white" />}
              <span className="truncate text-[var(--muted)]">@{tweet.author.username}</span>
              <span className="text-[var(--muted)]">·</span>
              <span title={fullDate(tweet.createdAt)} className="whitespace-nowrap text-[var(--muted)] hover:underline">
                {detailed ? fullDate(tweet.createdAt).replace(" at ", " · ") : timeAgo(tweet.createdAt)}
              </span>
            </div>

            <div className="relative shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); setShowMenu((v) => !v); }}
                className="-mr-2 flex h-8 w-8 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[#1d9bf0]/10 hover:text-[#1d9bf0]"
                aria-label="More"
              >
                <MoreHorizontal size={18} />
              </button>
              {showMenu && (
                <div onClick={(e) => e.stopPropagation()} className="absolute right-0 top-8 z-30 w-56 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg)] py-1 shadow-2xl">
                  <button onClick={copyLink} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[14px] font-bold hover:bg-[var(--hover)]">
                    <LinkIcon size={18} /> Copy link to post
                  </button>
                  <button onClick={copyLink} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[14px] font-bold hover:bg-[var(--hover)]">
                    <Copy size={18} /> Share via copy
                  </button>
                  {isMine && (
                    <button onClick={deleteTweet} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[14px] font-bold text-red-500 hover:bg-[var(--hover)]">
                      <Trash2 size={18} /> Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {tweet.isReply && tweet.replyingTo && (
            <div className="text-[13px] text-[var(--muted)]">
              Replying to <span className="text-[#1d9bf0]">@{tweet.replyingTo}</span>
            </div>
          )}

          <div className="mt-0.5"><TweetText text={tweet.text} /></div>

          {tweet.images.length > 0 && (
            <div className={`mt-3 grid gap-0.5 overflow-hidden rounded-2xl border border-[var(--border)] ${tweet.images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
              {tweet.images.slice(0, 4).map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={url}
                  alt="post media"
                  className={`w-full object-cover ${tweet.images.length === 1 ? "max-h-[510px]" : "h-40 sm:h-52"}`}
                />
              ))}
            </div>
          )}

          {!hideActions && (
            <div className="-ml-2 mt-2 flex max-w-[425px] items-center justify-between text-[var(--muted)]">
              <button
                onClick={(e) => { e.stopPropagation(); setShowReply((v) => !v); }}
                className="group flex items-center gap-1 text-[13px] transition-colors hover:text-[#1d9bf0]"
                aria-label="Reply"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full transition-colors group-hover:bg-[#1d9bf0]/10"><MessageCircle size={18} /></span>
                {formatCount(tweet.repliesCount)}
              </button>
              <button
                onClick={toggleRepost}
                className={`group flex items-center gap-1 text-[13px] transition-colors hover:text-[#00ba7c] ${reposted ? "text-[#00ba7c]" : ""}`}
                aria-label="Repost"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full transition-colors group-hover:bg-[#00ba7c]/10"><Repeat2 size={18} /></span>
                {formatCount(retweets)}
              </button>
              <button
                onClick={toggleLike}
                className={`group flex items-center gap-1 text-[13px] transition-colors hover:text-[#f91880] ${liked ? "text-[#f91880]" : ""}`}
                aria-label="Like"
              >
                <span className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors group-hover:bg-[#f91880]/10 ${liked ? "animate-pop" : ""}`}>
                  <Heart size={18} className={liked ? "fill-[#f91880]" : ""} />
                </span>
                {formatCount(likes)}
              </button>
              <Link
                href={`/status/${tweet.id}`}
                onClick={(e) => e.stopPropagation()}
                className="group flex items-center gap-1 text-[13px] transition-colors hover:text-[#1d9bf0]"
                aria-label="Views"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full transition-colors group-hover:bg-[#1d9bf0]/10"><ChartNoAxesColumn size={18} /></span>
                {formatCount(tweet.views)}
              </Link>
              <div className="flex items-center">
                <button
                  onClick={toggleBookmark}
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[#1d9bf0]/10 hover:text-[#1d9bf0] ${bookmarked ? "text-[#1d9bf0]" : ""}`}
                  aria-label="Bookmark"
                >
                  <Bookmark size={18} className={bookmarked ? "fill-[#1d9bf0]" : ""} />
                </button>
                <button
                  onClick={async (e) => { e.stopPropagation(); await copyLink(); }}
                  className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[#1d9bf0]/10 hover:text-[#1d9bf0]"
                  aria-label="Share"
                >
                  <Share size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showReply && (
        <div onClick={(e) => e.stopPropagation()} className="border-t border-[var(--border)]">
          <ComposeBox
            currentUser={currentUser}
            parent={{ id: tweet.id, username: tweet.author.username, text: tweet.text }}
            placeholder="Post your reply"
            autoFocus
            onSuccess={() => setShowReply(false)}
          />
        </div>
      )}

      {toast && (
        <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-md bg-[#1d9bf0] px-4 py-2.5 text-[14px] font-medium text-white shadow-xl">
          {toast}
        </div>
      )}
    </article>
  );
}
