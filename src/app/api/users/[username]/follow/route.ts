import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Notification, User } from "@/lib/models";
import { requireApiUser } from "@/lib/auth";
import { createNotification } from "@/lib/notify";

export const runtime = "nodejs";

type Ctx = { params: { username: string } };

export async function POST(_req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireApiUser();
    await connectDB();
    const target = await User.findOne({ username: params.username.toLowerCase() });
    if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });
    const me = await User.findById(user.id);
    if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const targetId = String(target._id);
    if (!me.following.map(String).includes(targetId)) {
      me.following.push(target._id);
      target.followers.push(me._id);
      await Promise.all([me.save(), target.save()]);
      await createNotification({ recipient: targetId, actor: user.id, type: "follow" });
    }

    return NextResponse.json({
      following: true,
      followersCount: (target.followers as any[]).length,
    });
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("Follow error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireApiUser();
    await connectDB();
    const target = await User.findOne({ username: params.username.toLowerCase() });
    if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });
    const me = await User.findById(user.id);
    if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const targetId = String(target._id);
    me.following = me.following.filter((id) => String(id) !== targetId) as any;
    target.followers = target.followers.filter((id) => String(id) !== user.id) as any;
    await Promise.all([me.save(), target.save()]);
    await Notification.deleteOne({ recipient: targetId, actor: user.id, type: "follow" });

    return NextResponse.json({
      following: false,
      followersCount: (target.followers as any[]).length,
    });
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("Unfollow error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
