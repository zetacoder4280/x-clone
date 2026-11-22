import { connectDB } from "./db";
import { Conversation, Message, Notification, Tweet, User } from "./models";
import { serializeNotification, serializeTweet, serializeUser } from "./serialize";
import type {
  ConversationDTO,
  MessageDTO,
  NotificationDTO,
  TweetDTO,
  UserDTO,
} from "./types";

type Lean = Record<string, any>;

const authorPopulate = { path: "author", model: "User" };
const parentPopulate = {
  path: "parent",
  model: "Tweet",
  populate: [authorPopulate],
};

async function decorateTweets(
  tweets: Lean[],
  currentUserId: string,
  bookmarkIds: Set<string>,
  reposterMap: Map<string, Lean> = new Map(),
): Promise<TweetDTO[]> {
  const ids = tweets.map((t) => String(t._id));
  const replyCounts = await Tweet.aggregate([
    { $match: { parent: { $in: tweets.map((t) => t._id) } } },
    { $group: { _id: "$parent", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(replyCounts.map((r: any) => [String(r._id), r.count as number]));

  return tweets.map((tweet) => {
    const dto = serializeTweet(
      { ...tweet, repliesCount: countMap.get(String(tweet._id)) || 0 },
      currentUserId,
    )!;
    dto.bookmarkedByMe = bookmarkIds.has(dto.id);
    const reposterId = (tweet.retweets || []).map(String).find((id: string) => reposterMap.has(id));
    if (reposterId) dto.repostedBy = serializeUser(reposterMap.get(reposterId), currentUserId);
    return dto;
  });
}

async function getViewerContext(currentUserId: string) {
  const viewer = await User.findById(currentUserId).lean();
  const bookmarkIds = new Set((viewer?.bookmarks || []).map(String));
  const followingIds = (viewer?.following || []).map(String);
  const followUsers = await User.find({ _id: { $in: [...followingIds, currentUserId] } }).lean();
  const reposterMap = new Map(followUsers.map((u) => [String(u._id), u as Lean]));
  return { bookmarkIds, followingIds, reposterMap };
}

export async function getFeedTweets(
  currentUserId: string,
  filter: "forYou" | "following",
  limit = 25,
): Promise<TweetDTO[]> {
  await connectDB();
  const { bookmarkIds, followingIds, reposterMap } = await getViewerContext(currentUserId);
  const scope = filter === "following" ? [...followingIds, currentUserId] : null;

  const query: Record<string, unknown> = { parent: null };
  query.$or = scope
    ? [{ author: { $in: scope } }, { retweets: { $in: scope } }]
    : [{ author: { $exists: true } }];

  const tweets = await Tweet.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate([authorPopulate, parentPopulate])
    .lean();

  return decorateTweets(tweets as Lean[], currentUserId, bookmarkIds, reposterMap);
}

export async function getTweetById(id: string, currentUserId: string): Promise<TweetDTO | null> {
  await connectDB();
  const { bookmarkIds, reposterMap } = await getViewerContext(currentUserId);
  const tweet = await Tweet.findById(id).populate([authorPopulate, parentPopulate]).lean();
  if (!tweet) return null;
  const [dto] = await decorateTweets([tweet as Lean], currentUserId, bookmarkIds, reposterMap);
  return dto || null;
}

export async function getReplies(tweetId: string, currentUserId: string): Promise<TweetDTO[]> {
  await connectDB();
  const { bookmarkIds, reposterMap } = await getViewerContext(currentUserId);
  const tweets = await Tweet.find({ parent: tweetId })
    .sort({ createdAt: 1 })
    .populate([authorPopulate, parentPopulate])
    .lean();
  return decorateTweets(tweets as Lean[], currentUserId, bookmarkIds, reposterMap);
}

export async function getUserProfile(
  username: string,
  currentUserId: string,
): Promise<UserDTO | null> {
  await connectDB();
  const user = await User.findOne({ username: username.toLowerCase() }).lean();
  return serializeUser(user as Lean, currentUserId);
}

export async function getUserById(id: string, currentUserId: string): Promise<UserDTO | null> {
  await connectDB();
  const user = await User.findById(id).lean();
  return serializeUser(user as Lean, currentUserId);
}

export async function getUserTweets(
  userId: string,
  currentUserId: string,
  tab: "tweets" | "replies" | "media" | "likes" = "tweets",
): Promise<TweetDTO[]> {
  await connectDB();
  const { bookmarkIds, reposterMap } = await getViewerContext(currentUserId);
  let query: Record<string, unknown> = { author: userId };

  if (tab === "tweets") query.parent = null;
  if (tab === "replies") query.parent = { $ne: null };
  if (tab === "media") query = { author: userId, images: { $exists: true, $ne: [] } };
  if (tab === "likes") query = { likes: userId };

  const tweets = await Tweet.find(query)
    .sort({ createdAt: -1 })
    .limit(50)
    .populate([authorPopulate, parentPopulate])
    .lean();

  return decorateTweets(tweets as Lean[], currentUserId, bookmarkIds, reposterMap);
}

export async function getLikedTweets(currentUserId: string): Promise<TweetDTO[]> {
  await connectDB();
  const { bookmarkIds, reposterMap } = await getViewerContext(currentUserId);
  const tweets = await Tweet.find({ likes: currentUserId })
    .sort({ createdAt: -1 })
    .populate([authorPopulate, parentPopulate])
    .lean();
  return decorateTweets(tweets as Lean[], currentUserId, bookmarkIds, reposterMap);
}

export async function getBookmarks(currentUserId: string): Promise<TweetDTO[]> {
  await connectDB();
  const { bookmarkIds, reposterMap } = await getViewerContext(currentUserId);
  const tweets = await Tweet.find({ _id: { $in: [...bookmarkIds] } })
    .sort({ createdAt: -1 })
    .populate([authorPopulate, parentPopulate])
    .lean();
  return decorateTweets(tweets as Lean[], currentUserId, bookmarkIds, reposterMap);
}

export async function getNotifications(currentUserId: string): Promise<NotificationDTO[]> {
  await connectDB();
  const items = await Notification.find({ recipient: currentUserId })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate([{ path: "actor", model: "User" }, { path: "tweet", model: "Tweet" }])
    .lean();
  return items
    .map((n) => serializeNotification(n as Lean, currentUserId))
    .filter((n): n is NotificationDTO => n !== null);
}

export async function getConversations(currentUserId: string): Promise<ConversationDTO[]> {
  await connectDB();
  const conversations = await Conversation.find({ participants: currentUserId })
    .sort({ updatedAt: -1 })
    .populate({ path: "participants", model: "User" })
    .lean();

  const result: ConversationDTO[] = [];
  for (const convo of conversations) {
    const messages = await Message.find({ conversation: convo._id }).sort({ createdAt: -1 }).lean();
    const last = messages[0];
    const other = (convo.participants as Lean[]).find(
      (p) => String(p._id) !== currentUserId,
    ) as Lean | undefined;
    const participant = serializeUser(other, currentUserId);
    if (!participant || !last) continue;
    result.push({
      id: String(convo._id),
      participant,
      lastMessage: last.text,
      lastMessageAt: new Date(last.createdAt).toISOString(),
      unread: messages.filter(
        (m) => String(m.sender) !== currentUserId && !(m.readBy || []).map(String).includes(currentUserId),
      ).length,
    });
  }
  return result;
}

export async function getMessages(
  conversationId: string,
  currentUserId: string,
): Promise<MessageDTO[]> {
  await connectDB();
  const messages = await Message.find({ conversation: conversationId })
    .sort({ createdAt: 1 })
    .lean();
  return messages.map((m) => ({
    id: String(m._id),
    conversationId: String(m.conversation),
    senderId: String(m.sender),
    text: m.text,
    createdAt: new Date(m.createdAt).toISOString(),
  }));
}

export async function search(
  query: string,
  currentUserId: string,
): Promise<{ users: UserDTO[]; tweets: TweetDTO[] }> {
  await connectDB();
  if (!query.trim()) return { users: [], tweets: [] };
  const q = query.trim();
  const { bookmarkIds, reposterMap } = await getViewerContext(currentUserId);

  const [users, tweets] = await Promise.all([
    User.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { username: { $regex: q, $options: "i" } },
        { bio: { $regex: q, $options: "i" } },
      ],
    })
      .limit(10)
      .lean(),
    Tweet.find({ text: { $regex: q, $options: "i" } })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate([authorPopulate, parentPopulate])
      .lean(),
  ]);

  return {
    users: users
      .map((u) => serializeUser(u as Lean, currentUserId))
      .filter((u): u is UserDTO => u !== null),
    tweets: await decorateTweets(tweets as Lean[], currentUserId, bookmarkIds, reposterMap),
  };
}

export async function getFollowList(
  userId: string,
  type: "followers" | "following",
  currentUserId: string,
): Promise<UserDTO[]> {
  await connectDB();
  const user = await User.findById(userId).lean();
  const ids = (user?.[type] || []).map(String);
  if (!ids.length) return [];
  const users = await User.find({ _id: { $in: ids } }).lean();
  return users
    .map((u) => serializeUser(u as Lean, currentUserId))
    .filter((u): u is UserDTO => u !== null);
}

export async function getAllUsers(currentUserId: string, limit = 12): Promise<UserDTO[]> {
  await connectDB();
  const users = await User.find({ _id: { $ne: currentUserId } }).limit(limit).lean();
  return users
    .map((u) => serializeUser(u as Lean, currentUserId))
    .filter((u): u is UserDTO => u !== null);
}

export async function getSuggestedUsers(currentUserId: string): Promise<UserDTO[]> {
  await connectDB();
  const viewer = await User.findById(currentUserId).lean();
  const excludeIds = [...(viewer?.following || []).map(String), currentUserId];
  const users = await User.find({ _id: { $not: { $in: excludeIds } } })
    .limit(3)
    .lean();
  return users
    .map((u) => serializeUser(u as Lean, currentUserId))
    .filter((u): u is UserDTO => u !== null);
}

export async function getWhoToFollowExcept(
  currentUserId: string,
  excludeUsername?: string,
): Promise<UserDTO[]> {
  await connectDB();
  const viewer = await User.findById(currentUserId).lean();
  const excludeIds = [...(viewer?.following || []).map(String), currentUserId];
  const excludeUser = excludeUsername
    ? await User.findOne({ username: excludeUsername }).lean()
    : null;
  if (excludeUser) excludeIds.push(String(excludeUser._id));
  const users = await User.find({ _id: { $not: { $in: excludeIds } } }).limit(3).lean();
  return users
    .map((u) => serializeUser(u as Lean, currentUserId))
    .filter((u): u is UserDTO => u !== null);
}

export async function getUnreadCounts(userId: string): Promise<{ notifications: number; messages: number }> {
  await connectDB();
  const conversations = await Conversation.find({ participants: userId }).select("_id").lean();
  const conversationIds = conversations.map((c) => c._id);
  const [notifications, messages] = await Promise.all([
    Notification.countDocuments({ recipient: userId, read: false }),
    Message.countDocuments({
      conversation: { $in: conversationIds },
      sender: { $ne: userId },
      readBy: { $ne: userId },
    }),
  ]);
  return { notifications, messages };
}

export const TRENDS: { category: string; title: string; posts: string }[] = [
  { category: "Technology · Trending", title: "Next.js", posts: "12.4K posts" },
  { category: "Trending in India", title: "#BuildInPublic", posts: "8,921 posts" },
  { category: "Programming · Trending", title: "TypeScript", posts: "24.1K posts" },
  { category: "Trending", title: "MongoDB", posts: "5,432 posts" },
  { category: "Design · Trending", title: "Tailwind CSS", posts: "3,108 posts" },
];
