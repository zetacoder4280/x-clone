import { Notification, User } from "./models";

interface NotifyInput {
  recipient: string;
  actor: string;
  type: "like" | "retweet" | "follow" | "reply" | "mention";
  tweet?: string | null;
}

export async function createNotification({ recipient, actor, type, tweet = null }: NotifyInput) {
  if (recipient === actor) return;
  await Notification.create({ recipient, actor, type, tweet });
}

export async function notifyMentions(text: string, actor: string, tweetId: string, authorId: string) {
  const usernames = Array.from(text.matchAll(/@([A-Za-z0-9_]{1,15})/g)).map((m) =>
    m[1].toLowerCase(),
  );
  const unique = [...new Set(usernames)];
  if (!unique.length) return;
  const users = await User.find({ username: { $in: unique } }).lean();
  await Promise.all(
    users.map((user) =>
      createNotification({
        recipient: String(user._id),
        actor,
        type: user._id.toString() === authorId ? "reply" : "mention",
        tweet: tweetId,
      }),
    ),
  );
}
