import type { NotificationDTO, TweetDTO, UserDTO } from "./types";

type Lean = Record<string, any>;

function toId(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "object" && "_id" in (value as object)) return String((value as Lean)._id);
  return String(value);
}

function dateString(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

export function serializeUser(user: Lean | null | undefined, currentUserId?: string): UserDTO | null {
  if (!user) return null;
  const followers: unknown[] = user.followers || [];
  const following: unknown[] = user.following || [];
  return {
    id: toId(user._id || user.id),
    name: user.name || "",
    username: user.username || "",
    email: user.email || undefined,
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
    avatar: user.avatar || "",
    banner: user.banner || "",
    verified: Boolean(user.verified),
    followersCount: followers.length,
    followingCount: following.length,
    createdAt: dateString(user.createdAt),
    isFollowing: currentUserId
      ? followers.some((id) => toId(id) === currentUserId)
      : undefined,
  };
}

export function serializeTweet(
  tweet: Lean | null | undefined,
  currentUserId?: string,
  repostedByLean?: Lean | null,
): TweetDTO | null {
  if (!tweet) return null;
  const likes: unknown[] = tweet.likes || [];
  const retweets: unknown[] = tweet.retweets || [];
  const author = serializeUser(tweet.author, currentUserId);
  const parent = tweet.parent && typeof tweet.parent === "object" && tweet.parent.text
    ? serializeTweet(tweet.parent, currentUserId)
    : null;

  return {
    id: toId(tweet._id || tweet.id),
    text: tweet.text || "",
    images: Array.isArray(tweet.images) ? tweet.images : [],
    createdAt: dateString(tweet.createdAt),
    author: author || {
      id: "unknown",
      name: "Unknown",
      username: "unknown",
      bio: "",
      location: "",
      website: "",
      avatar: "",
      banner: "",
      verified: false,
      followersCount: 0,
      followingCount: 0,
      createdAt: dateString(null),
    },
    likesCount: likes.length,
    retweetsCount: retweets.length,
    repliesCount: Number(tweet.repliesCount || 0),
    views: Number(tweet.views || 0),
    likedByMe: currentUserId ? likes.some((id) => toId(id) === currentUserId) : false,
    retweetedByMe: currentUserId ? retweets.some((id) => toId(id) === currentUserId) : false,
    bookmarkedByMe: false,
    isReply: Boolean(tweet.parent),
    replyingTo: tweet.replyingTo || null,
    parent,
    repostedBy: repostedByLean ? serializeUser(repostedByLean, currentUserId) : null,
  };
}

export function serializeNotification(
  notification: Lean,
  currentUserId?: string,
): NotificationDTO | null {
  const actor = serializeUser(notification.actor, currentUserId);
  if (!actor) return null;
  const tweet = notification.tweet && typeof notification.tweet === "object"
    ? notification.tweet
    : null;
  return {
    id: toId(notification._id),
    type: notification.type,
    actor,
    tweetText: tweet?.text || undefined,
    tweetId: tweet ? toId(tweet._id) : undefined,
    read: Boolean(notification.read),
    createdAt: dateString(notification.createdAt),
  };
}
