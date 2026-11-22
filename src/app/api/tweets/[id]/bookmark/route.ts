import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Tweet, User } from "@/lib/models";
import { requireApiUser } from "@/lib/auth";

export const runtime = "nodejs";

type Ctx = { params: { id: string } };

export async function POST(_req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireApiUser();
    await connectDB();
    await Tweet.findById(params.id);
    const doc = await User.findById(user.id);
    if (!doc) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!doc.bookmarks.map(String).includes(params.id)) doc.bookmarks.push(params.id as any);
    await doc.save();
    return NextResponse.json({ bookmarked: true });
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("Bookmark error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireApiUser();
    await connectDB();
    const doc = await User.findById(user.id);
    if (!doc) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    doc.bookmarks = doc.bookmarks.filter((id) => String(id) !== params.id) as any;
    await doc.save();
    return NextResponse.json({ bookmarked: false });
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("Unbookmark error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
