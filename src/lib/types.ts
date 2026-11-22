export interface UserDTO {
  id: string;
  name: string;
  username: string;
  email?: string;
  bio: string;
  location: string;
  website: string;
  avatar: string;
  banner: string;
  verified: boolean;
  followersCount: number;
  followingCount: number;
  createdAt: string;
  isFollowing?: boolean;
}

export interface ReplyPreviewDTO {
  id: string;
  text: string;
  author: UserDTO;
  createdAt: string;
}

export interface TweetDTO {
  id: string;
  text: string;
  images: string[];
  createdAt: string;
  author: UserDTO;
  likesCount: number;
  retweetsCount: number;
  repliesCount: number;
  views: number;
  likedByMe: boolean;
  retweetedByMe: boolean;
  bookmarkedByMe: boolean;
  isReply: boolean;
  replyingTo?: string | null;
  parent?: TweetDTO | null;
  repostedBy?: UserDTO | null;
}

export interface NotificationDTO {
  id: string;
  type: "like" | "retweet" | "follow" | "reply" | "mention";
  actor: UserDTO;
  tweetText?: string;
  tweetId?: string;
  read: boolean;
  createdAt: string;
}

export interface ConversationDTO {
  id: string;
  participant: UserDTO;
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
}

export interface MessageDTO {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export interface SessionUser {
  id: string;
  username: string;
  name: string;
  avatar: string;
}

export interface TrendDTO {
  category: string;
  title: string;
  posts: string;
}
