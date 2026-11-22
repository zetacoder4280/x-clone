import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Tweet } from "@/lib/models";
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

    if (!tweet.likes.map(String).includes(user.id)) {
      tweet.likes.push(user.id as any);
      await tweet.save();
      await createNotification({
        recipient: String(tweet.author),
        actor: user.id,
        type: "like",
        tweet: String(tweet._id),
      });
    }
    return NextResponse.json({ liked: true, count: tweet.likes.length });
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("Like error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireApiUser();
    await connectDB();
    const tweet = await Tweet.findById(params.id);
    if (!tweet) return NextResponse.json({ error: "Post not found." }, { status: 404 });
    tweet.likes = tweet.likes.filter((id) => String(id) !== user.id) as any;
    await tweet.save();
    await deleteNotification(String(tweet.author), user.id, "like", String(tweet._id));
    return NextResponse.json({ liked: false, count: tweet.likes.length });
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("Unlike error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

async function deleteNotification(recipient: string, actor: string, type: string, tweet: string) {
  const { Notification } = await import("@/lib/models");
  await Notification.deleteOne({ recipient, actor, type, tweet });
}
