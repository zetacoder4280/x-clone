import { Schema, model, models, Document, Types, Model } from "mongoose";

export interface IUser {
  name: string;
  username: string;
  email: string;
  password: string;
  bio: string;
  location: string;
  website: string;
  avatar: string;
  banner: string;
  verified: boolean;
  followers: Types.ObjectId[];
  following: Types.ObjectId[];
  bookmarks: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = IUser & Document<Types.ObjectId, unknown, IUser>;

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    bio: { type: String, default: "" },
    location: { type: String, default: "" },
    website: { type: String, default: "" },
    avatar: { type: String, default: "" },
    banner: { type: String, default: "" },
    verified: { type: Boolean, default: false },
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
    bookmarks: [{ type: Schema.Types.ObjectId, ref: "Tweet" }],
  },
  { timestamps: true },
);

export const User = (models.User as Model<IUser>) || model<IUser>("User", userSchema);

export interface ITweet {
  author: Types.ObjectId;
  text: string;
  images: string[];
  parent: Types.ObjectId | null;
  mentions: Types.ObjectId[];
  likes: Types.ObjectId[];
  retweets: Types.ObjectId[];
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export type TweetDocument = ITweet & Document<Types.ObjectId, unknown, ITweet>;

const tweetSchema = new Schema<ITweet>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    text: { type: String, required: true, maxlength: 1000 },
    images: { type: [String], default: [] },
    parent: { type: Schema.Types.ObjectId, ref: "Tweet", default: null, index: true },
    mentions: [{ type: Schema.Types.ObjectId, ref: "User" }],
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    retweets: [{ type: Schema.Types.ObjectId, ref: "User" }],
    views: { type: Number, default: 0 },
  },
  { timestamps: true },
);

tweetSchema.index({ createdAt: -1 });

export const Tweet = (models.Tweet as Model<ITweet>) || model<ITweet>("Tweet", tweetSchema);

export interface INotification {
  recipient: Types.ObjectId;
  actor: Types.ObjectId;
  type: "like" | "retweet" | "follow" | "reply" | "mention";
  tweet: Types.ObjectId | null;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type NotificationDocument = INotification &
  Document<Types.ObjectId, unknown, INotification>;

const notificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    actor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["like", "retweet", "follow", "reply", "mention"],
      required: true,
    },
    tweet: { type: Schema.Types.ObjectId, ref: "Tweet", default: null },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

notificationSchema.index({ recipient: 1, createdAt: -1 });

export const Notification =
  (models.Notification as Model<INotification>) ||
  model<INotification>("Notification", notificationSchema);

export interface IConversation {
  participants: Types.ObjectId[];
  updatedAt: Date;
  createdAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
  },
  { timestamps: true },
);

conversationSchema.index({ participants: 1 });

export const Conversation =
  (models.Conversation as Model<IConversation>) ||
  model<IConversation>("Conversation", conversationSchema);

export interface IMessage {
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
  text: string;
  readBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversation: { type: Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
);

export const Message =
  (models.Message as Model<IMessage>) || model<IMessage>("Message", messageSchema);
