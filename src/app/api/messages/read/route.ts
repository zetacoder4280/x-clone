import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Conversation, Message } from "@/lib/models";
import { requireApiUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const user = await requireApiUser();
    const { conversationId } = await req.json();
    if (!conversationId) {
      return NextResponse.json({ error: "conversationId is required." }, { status: 400 });
    }

    await connectDB();
    const conversation = await Conversation.findById(conversationId).lean();
    if (!conversation || !conversation.participants.map(String).includes(user.id)) {
      return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    }

    await Message.updateMany(
      { conversation: conversationId, sender: { $ne: user.id } },
      { $addToSet: { readBy: user.id } },
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
