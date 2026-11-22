import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { createToken, requireApiUser, sessionCookieOptions } from "@/lib/auth";
import { serializeUser } from "@/lib/serialize";

export const runtime = "nodejs";

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireApiUser();
    const body = await req.json();
    await connectDB();
    const doc = await User.findById(user.id);
    if (!doc) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const clean = (value: unknown, max: number) => String(value || "").trim().slice(0, max);
    doc.name = clean(body.name, 50) || doc.name;
    doc.bio = clean(body.bio, 160);
    doc.location = clean(body.location, 30);
    doc.website = clean(body.website, 100);
    if (typeof body.avatar === "string" && body.avatar.startsWith("/api/media/"))
      doc.avatar = body.avatar;
    if (typeof body.banner === "string" && body.banner.startsWith("/api/media/"))
      doc.banner = body.banner;
    await doc.save();

    const token = await createToken({
      id: String(doc._id),
      username: doc.username,
      name: doc.name,
      avatar: doc.avatar,
    });
    const response = NextResponse.json({ user: serializeUser(doc.toObject(), user.id) });
    response.cookies.set(sessionCookieOptions.name, token, sessionCookieOptions);
    return response;
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
