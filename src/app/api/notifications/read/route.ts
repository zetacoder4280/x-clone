import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Notification } from "@/lib/models";
import { requireApiUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  try {
    const user = await requireApiUser();
    await connectDB();
    await Notification.updateMany({ recipient: user.id, read: false }, { read: true });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("Mark read error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
