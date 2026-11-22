import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { createToken, sessionCookieOptions, verifyPassword } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const identifier = String(body.identifier || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!identifier || !password) {
      return NextResponse.json({ error: "Enter your email or username and password." }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });
    if (!user || !(await verifyPassword(password, user.password))) {
      return NextResponse.json({ error: "Incorrect credentials." }, { status: 401 });
    }

    const token = await createToken({
      id: String(user._id),
      username: user.username,
      name: user.name,
      avatar: user.avatar,
    });

    const response = NextResponse.json({
      user: { id: String(user._id), name: user.name, username: user.username },
    });
    response.cookies.set(sessionCookieOptions.name, token, sessionCookieOptions);
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
