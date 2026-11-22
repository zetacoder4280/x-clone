import { notFound } from "next/navigation";
import Link from "next/link";
import { getViewer } from "@/lib/viewer";
import { getUserProfile, getUserTweets, getFollowList } from "@/lib/queries";
import PageHeader from "@/components/PageHeader";
import ProfileHeader from "@/components/ProfileHeader";
import TweetCard from "@/components/TweetCard";
import UserCard from "@/components/UserCard";
import { formatCount } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Params { params: { username: string }; searchParams: { tab?: string } }

export default async function ProfilePage({ params, searchParams }: Params) {
  const { userId, currentUser } = await getViewer();
  const profile = await getUserProfile(params.username, userId);
  if (!profile) notFound();

  const tab = ["tweets", "replies", "media", "likes", "following", "followers"].includes(searchParams.tab || "")
    ? searchParams.tab!
    : "tweets";
  const isList = tab === "following" || tab === "followers";

  let tweets: Awaited<ReturnType<typeof getUserTweets>> = [];
  let users: Awaited<ReturnType<typeof getFollowList>> = [];
  if (isList) users = await getFollowList(profile.id, tab, userId);
  else tweets = await getUserTweets(profile.id, userId, tab as "tweets" | "replies" | "media" | "likes");

  const tabs = [
    { key: "tweets", label: "Posts" },
    { key: "replies", label: "Replies" },
    { key: "media", label: "Media" },
    { key: "likes", label: "Likes" },
  ];

  const headerTitle = isList ? (tab === "followers" ? "Followers" : "Following") : profile.name;

  return (
    <div>
      <PageHeader title={headerTitle} subtitle={isList ? `@${profile.username}` : `${formatCount(profile.followersCount)} followers`} showBack />

      {isList ? (
        users.length === 0 ? (
          <div className="px-8 py-12 text-center text-[15px] text-[var(--muted)]">Nothing to see here yet.</div>
        ) : (
          users.map((user) => <UserCard key={user.id} user={user} currentUserId={userId} />)
        )
      ) : (
        <>
          <ProfileHeader profile={profile} currentUserId={userId} />
          <div className="flex border-b border-[var(--border)]">
            {tabs.map((item) => (
              <Link
                key={item.key}
                href={`/profile/${profile.username}?tab=${item.key}`}
                className={`relative flex h-[53px] flex-1 items-center justify-center text-[14px] transition-colors hover:bg-[var(--hover)] ${
                  tab === item.key ? "font-bold" : "font-medium text-[var(--muted)]"
                }`}
              >
                {item.label}
                {tab === item.key && <span className="absolute bottom-0 h-1 w-12 rounded-full bg-[#1d9bf0]" />}
              </Link>
            ))}
          </div>

          {tweets.length === 0 ? (
            <div className="px-8 py-12 text-center">
              <h3 className="text-[31px] font-extrabold">No posts yet</h3>
              <p className="mt-1 text-[15px] text-[var(--muted)]">When they post, it&apos;ll show up here.</p>
            </div>
          ) : (
            tweets.map((tweet) => (
              <TweetCard key={tweet.id} tweet={tweet} currentUserId={userId} currentUser={currentUser} />
            ))
          )}
        </>
      )}
    </div>
  );
}
