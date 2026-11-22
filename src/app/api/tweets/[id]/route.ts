import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Notification, Tweet, User } from "@/lib/models";
import { requireApiUser } from "@/lib/auth";

export const runtime = "nodejs";

type Ctx = { params: { id: string } };

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireApiUser();
    await connectDB();
    const tweet = await Tweet.findOne({ _id: params.id, author: user.id });
    if (!tweet) return NextResponse.json({ error: "Post not found." }, { status: 404 });

    await Tweet.deleteMany({ parent: tweet._id });
    await Notification.deleteMany({ tweet: tweet._id });
    await User.updateMany({ bookmarks: tweet._id }, { $pull: { bookmarks: tweet._id } });
    await Tweet.deleteOne({ _id: tweet._id });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("Delete post error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
