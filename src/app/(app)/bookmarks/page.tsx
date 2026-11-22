import { Bookmark } from "lucide-react";
import { getViewer } from "@/lib/viewer";
import { getBookmarks } from "@/lib/queries";
import PageHeader from "@/components/PageHeader";
import TweetCard from "@/components/TweetCard";

export const dynamic = "force-dynamic";

export default async function BookmarksPage() {
  const { userId, currentUser } = await getViewer();
  const tweets = await getBookmarks(userId);

  return (
    <div>
      <PageHeader title="Bookmarks" subtitle={`@${currentUser.username}`} />
      {tweets.length === 0 ? (
        <div className="px-8 py-16 text-center">
          <Bookmark size={40} className="mx-auto mb-3 text-[var(--muted)]" />
          <h2 className="text-[31px] font-extrabold">Save posts for later</h2>
          <p className="mx-auto mt-2 max-w-[400px] text-[15px] text-[var(--muted)]">
            Bookmark posts to easily find them again in the future.
          </p>
        </div>
      ) : (
        tweets.map((tweet) => <TweetCard key={tweet.id} tweet={tweet} currentUserId={userId} currentUser={currentUser} />)
      )}
    </div>
  );
}
