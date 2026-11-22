import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Notification, Tweet } from "@/lib/models";
import { requireApiUser } from "@/lib/auth";
import { createNotification } from "@/lib/notify";

export const runtime = "nodejs";

type Ctx = { params: { id: string } };

export async function POST(_req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireApiUser();
    await connectDB();
    const tweet = await Tweet.findById(params.id);
    if (!tweet) return NextResponse.json({ error: "Post not found." }, { status: 404 });

    if (!tweet.retweets.map(String).includes(user.id)) {
      tweet.retweets.push(user.id as any);
      await tweet.save();
      await createNotification({
        recipient: String(tweet.author),
        actor: user.id,
        type: "retweet",
        tweet: String(tweet._id),
      });
    }
    return NextResponse.json({ retweeted: true, count: tweet.retweets.length });
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("Repost error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireApiUser();
    await connectDB();
    const tweet = await Tweet.findById(params.id);
    if (!tweet) return NextResponse.json({ error: "Post not found." }, { status: 404 });
    tweet.retweets = tweet.retweets.filter((id) => String(id) !== user.id) as any;
    await tweet.save();
    await Notification.deleteOne({
      recipient: String(tweet.author),
      actor: user.id,
      type: "retweet",
      tweet: String(tweet._id),
    });
    return NextResponse.json({ retweeted: false, count: tweet.retweets.length });
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("Undo repost error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
