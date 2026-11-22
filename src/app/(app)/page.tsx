import Link from "next/link";
import { Sparkles } from "lucide-react";
import { getViewer } from "@/lib/viewer";
import { getFeedTweets } from "@/lib/queries";
import ComposeBox from "@/components/ComposeBox";
import TweetCard from "@/components/TweetCard";
import EmptyFeed from "@/components/EmptyFeed";

export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }: { searchParams: { tab?: string } }) {
  const { userId, currentUser } = await getViewer();
  const tab = searchParams.tab === "following" ? "following" : "forYou";
  const tweets = await getFeedTweets(userId, tab);

  return (
    <div>
      <div className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur-md">
        <div className="flex h-[53px] items-center justify-between px-4">
          <h1 className="text-[20px] font-extrabold">Home</h1>
          <button className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--hover-strong)]" aria-label="Timeline settings">
            <Sparkles size={20} />
          </button>
        </div>
        <div className="flex">
          <Link
            href="/?tab=forYou"
            className={`relative flex h-[53px] flex-1 items-center justify-center text-[15px] transition-colors hover:bg-[var(--hover)] ${
              tab === "forYou" ? "font-bold" : "font-medium text-[var(--muted)]"
            }`}
          >
            For you
            {tab === "forYou" && <span className="absolute bottom-0 h-1 w-14 rounded-full bg-[#1d9bf0]" />}
          </Link>
          <Link
            href="/?tab=following"
            className={`relative flex h-[53px] flex-1 items-center justify-center text-[15px] transition-colors hover:bg-[var(--hover)] ${
              tab === "following" ? "font-bold" : "font-medium text-[var(--muted)]"
            }`}
          >
            Following
            {tab === "following" && <span className="absolute bottom-0 h-1 w-14 rounded-full bg-[#1d9bf0]" />}
          </Link>
        </div>
      </div>

      <div className="hidden sm:block"><ComposeBox currentUser={currentUser} /></div>

      <div className="h-2 border-b border-[var(--border)] bg-[var(--panel)]/40" />

      {tweets.length === 0 ? (
        <EmptyFeed />
      ) : (
        tweets.map((tweet) => (
          <TweetCard key={tweet.id} tweet={tweet} currentUserId={userId} currentUser={currentUser} />
        ))
      )}
      <div className="py-10 text-center text-[14px] text-[var(--muted)]">You&apos;re all caught up ✨</div>
    </div>
  );
}
