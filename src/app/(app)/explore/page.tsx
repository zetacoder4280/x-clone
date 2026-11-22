import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { getViewer } from "@/lib/viewer";
import { search, TRENDS } from "@/lib/queries";
import ExploreSearch from "@/components/ExploreSearch";
import TweetCard from "@/components/TweetCard";
import UserCard from "@/components/UserCard";

export const dynamic = "force-dynamic";

export default async function ExplorePage({ searchParams }: { searchParams: { q?: string } }) {
  const { userId, currentUser } = await getViewer();
  const query = searchParams.q || "";
  const results = query ? await search(query, userId) : null;

  const tabs = ["Top", "Latest", "People", "Media"];
  const activeTab = "Top";

  return (
    <div>
      <ExploreSearch initial={query} />

      {query ? (
        <>
          <div className="sticky top-[70px] z-10 flex border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md">
            {tabs.map((tab) => (
              <div key={tab} className={`relative flex h-[50px] flex-1 items-center justify-center text-[14px] ${tab === activeTab ? "font-bold" : "text-[var(--muted)]"}`}>
                {tab}
                {tab === activeTab && <span className="absolute bottom-0 h-1 w-12 rounded-full bg-[#1d9bf0]" />}
              </div>
            ))}
          </div>

          {results && (results.users.length > 0 || results.tweets.length > 0) ? (
            <>
              {results.users.length > 0 && (
                <>
                  <div className="px-4 pb-1 pt-3 text-[15px] font-bold text-[var(--muted)]">People</div>
                  {results.users.map((user) => <UserCard key={user.id} user={user} currentUserId={userId} />)}
                </>
              )}
              {results.tweets.length > 0 && (
                <>
                  <div className="px-4 pb-1 pt-3 text-[15px] font-bold text-[var(--muted)]">Posts</div>
                  {results.tweets.map((tweet) => <TweetCard key={tweet.id} tweet={tweet} currentUserId={userId} currentUser={currentUser} />)}
                </>
              )}
            </>
          ) : (
            <div className="px-8 py-14 text-center">
              <h3 className="text-[31px] font-extrabold">No results for &ldquo;{query}&rdquo;</h3>
              <p className="mt-1 text-[15px] text-[var(--muted)]">Try searching for something else, or check your spelling.</p>
            </div>
          )}
        </>
      ) : (
        <>
          <h2 className="px-4 pb-2 pt-4 text-[20px] font-extrabold">Trends for you</h2>
          {TRENDS.map((trend) => (
            <Link key={trend.title} href={`/explore?q=${encodeURIComponent(trend.title.replace("#", ""))}`} className="block border-b border-[var(--border)] px-4 py-3 hover-row">
              <div className="flex items-center justify-between text-[13px] text-[var(--muted)]">
                <span>{trend.category}</span>
                <TrendingUp size={16} />
              </div>
              <div className="mt-0.5 text-[15px] font-bold">{trend.title}</div>
              <div className="text-[13px] text-[var(--muted)]">{trend.posts}</div>
            </Link>
          ))}

          <h2 className="px-4 pb-2 pt-6 text-[20px] font-extrabold">Try searching for</h2>
          {["Next.js", "TypeScript", "design"].map((term) => (
            <Link key={term} href={`/explore?q=${encodeURIComponent(term)}`} className="block border-b border-[var(--border)] px-4 py-3 text-[15px] font-bold hover-row">
              {term}
            </Link>
          ))}
        </>
      )}
    </div>
  );
}
