import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { connectDB } from "./db";
import { User } from "./models";
import type { SessionUser } from "./types";

const COOKIE_NAME = "xclone_session";
const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "xclone-local-development-secret-change-in-production-2026",
);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createToken(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET);
}

export const sessionCookieOptions = {
  name: COOKIE_NAME,
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

export async function getSession(): Promise<SessionUser | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    if (!payload.id || !payload.username) return null;
    return {
      id: payload.id as string,
      username: payload.username as string,
      name: (payload.name as string) || "",
      avatar: (payload.avatar as string) || "",
    };
  } catch {
    return null;
  }
}

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  banner: string;
  verified: boolean;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getSession();
  if (!session) return null;

  await connectDB();
  const user = await User.findById(session.id).lean();
  if (!user) return null;

  return {
    id: String(user._id),
    username: user.username,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    bio: user.bio,
    banner: user.banner,
    verified: user.verified,
  };
}

export async function requireApiUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}
