import { notFound } from "next/navigation";
import { getViewer } from "@/lib/viewer";
import { getReplies, getTweetById } from "@/lib/queries";
import PageHeader from "@/components/PageHeader";
import TweetCard from "@/components/TweetCard";
import ComposeBox from "@/components/ComposeBox";
import { formatCount } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StatusPage({ params }: { params: { id: string } }) {
  const { userId, currentUser } = await getViewer();
  const [tweet, replies] = await Promise.all([
    getTweetById(params.id, userId),
    getReplies(params.id, userId),
  ]);
  if (!tweet) notFound();

  const parent = tweet.parent;

  return (
    <div>
      <PageHeader title="Post" showBack />

      {parent && (
        <div className="flex gap-3 px-4 pt-3">
          <div className="flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={parent.author.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
            <div className="mt-1 w-0.5 flex-1 bg-[var(--border)]" />
          </div>
          <div className="min-w-0 flex-1 pb-2">
            <div className="flex items-center gap-1 text-[15px]">
              <span className="font-bold">{parent.author.name}</span>
              <span className="text-[var(--muted)]">@{parent.author.username}</span>
            </div>
            <p className="whitespace-pre-wrap text-[15px] leading-5">{parent.text}</p>
            <div className="mt-2 text-[13px] text-[var(--muted)]">
              Replying to <span className="text-[#1d9bf0]">@{tweet.author.username}</span>
            </div>
          </div>
        </div>
      )}

      <TweetCard tweet={tweet} currentUserId={userId} currentUser={currentUser} detailed />

      <div className="flex gap-5 border-b border-[var(--border)] px-4 py-3 text-[14px] text-[var(--muted)]">
        <span><b className="text-[var(--text)]">{formatCount(tweet.repliesCount)}</b> Replies</span>
        <span><b className="text-[var(--text)]">{formatCount(tweet.retweetsCount)}</b> Reposts</span>
        <span><b className="text-[var(--text)]">{formatCount(tweet.likesCount)}</b> Likes</span>
        <span><b className="text-[var(--text)]">{formatCount(tweet.views)}</b> Views</span>
      </div>

      <ComposeBox
        currentUser={currentUser}
        parent={{ id: tweet.id, username: tweet.author.username, text: tweet.text }}
        placeholder="Post your reply"
      />

      <div className="h-2 border-b border-[var(--border)] bg-[var(--panel)]/40" />

      {replies.length === 0 ? (
        <div className="px-8 py-10 text-center text-[15px] text-[var(--muted)]">
          No replies yet. Be the first to reply.
        </div>
      ) : (
        replies.map((reply) => (
          <TweetCard key={reply.id} tweet={reply} currentUserId={userId} currentUser={currentUser} />
        ))
      )}
    </div>
  );
}
