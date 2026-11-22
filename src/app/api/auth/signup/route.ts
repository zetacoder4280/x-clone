import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { createToken, hashPassword, sessionCookieOptions } from "@/lib/auth";
import { generateAvatar, generateBanner } from "@/lib/utils";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const username = String(body.username || "").trim().toLowerCase().replace(/^@/, "");
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!name || !username || !email || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    if (!/^[a-z0-9_]{3,15}$/.test(username)) {
      return NextResponse.json(
        { error: "Username must be 3-15 characters (letters, numbers, underscores)." },
        { status: 400 },
      );
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 },
      );
    }

    await connectDB();
    const existing = await User.findOne({ $or: [{ email }, { username }] }).lean();
    if (existing) {
      return NextResponse.json(
        { error: existing.email === email ? "Email already registered." : "Username is taken." },
        { status: 409 },
      );
    }

    const user = await User.create({
      name,
      username,
      email,
      password: await hashPassword(password),
      avatar: generateAvatar(username),
      banner: generateBanner(username),
      bio: "",
    });

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
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
