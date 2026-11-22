import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Conversation, Message, User } from "@/lib/models";
import { requireApiUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const user = await requireApiUser();
    const body = await req.json();
    const text = String(body.text || "").trim();
    if (!text) return NextResponse.json({ error: "Empty message." }, { status: 400 });

    await connectDB();
    let conversationId = body.conversationId ? String(body.conversationId) : null;
    let conversation: any = null;

    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      if (!conversation || !conversation.participants.map(String).includes(user.id)) {
        return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
      }
    } else {
      const recipientName = String(body.username || "").trim().toLowerCase().replace(/^@/, "");
      const recipient = await User.findOne({ username: recipientName }).lean();
      if (!recipient) return NextResponse.json({ error: "User not found." }, { status: 404 });
      if (String(recipient._id) === user.id)
        return NextResponse.json({ error: "You cannot message yourself." }, { status: 400 });

      const existing = await Conversation.findOne({
        participants: { $all: [user.id, recipient._id], $size: 2 },
      }).lean();
      if (existing) {
        conversation = await Conversation.findById(existing._id);
      } else {
        conversation = await Conversation.create({ participants: [user.id, recipient._id] });
      }
      conversationId = String(conversation._id);
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: user.id,
      text,
      readBy: [user.id],
    });
    conversation.updatedAt = new Date();
    await conversation.save();

    return NextResponse.json({
      conversationId,
      message: {
        id: String(message._id),
        text: message.text,
        senderId: user.id,
        createdAt: message.createdAt.toISOString(),
      },
    });
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("Message error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
