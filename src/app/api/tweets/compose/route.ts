import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Tweet } from "@/lib/models";
import { requireApiUser } from "@/lib/auth";
import { createNotification, notifyMentions } from "@/lib/notify";
import { serializeTweet } from "@/lib/serialize";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const user = await requireApiUser();
    const body = await req.json();
    const text = String(body.text || "").trim();
    const images: string[] = Array.isArray(body.images)
      ? body.images
          .filter((url: unknown) => typeof url === "string")
          .filter((url: string) => url.startsWith("/api/media/") || url.startsWith("https://"))
          .slice(0, 4)
      : [];
    const parentId = body.parentId ? String(body.parentId) : null;

    if (!text && images.length === 0) {
      return NextResponse.json({ error: "Write something first." }, { status: 400 });
    }
    if (text.length > 1000) {
      return NextResponse.json({ error: "Posts are limited to 1000 characters." }, { status: 400 });
    }

    await connectDB();
    let parent = null;
    if (parentId) {
      parent = await Tweet.findById(parentId).lean();
      if (!parent) return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    const tweet = await Tweet.create({
      author: user.id,
      text,
      images,
      parent: parentId,
      mentions: [],
    });

    await notifyMentions(text, user.id, String(tweet._id), parent ? String(parent.author) : user.id);
    if (parent) {
      await createNotification({
        recipient: String(parent.author),
        actor: user.id,
        type: "reply",
        tweet: String(tweet._id),
      });
    }

    const populated = await Tweet.findById(tweet._id)
      .populate([
        { path: "author", model: "User" },
        { path: "parent", model: "Tweet", populate: [{ path: "author", model: "User" }] },
      ])
      .lean();

    return NextResponse.json({ tweet: serializeTweet(populated as any, user.id) });
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Compose error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
