import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
};

export async function GET(_req: Request, { params }: { params: { filename: string } }) {
  const name = params.filename;
  if (!/^[a-f0-9-]{36}\.[a-z]+$/i.test(name)) {
    return NextResponse.json({ error: "Invalid file." }, { status: 400 });
  }
  const ext = name.split(".").pop()!.toLowerCase();
  const mime = MIME[ext];
  if (!mime) return NextResponse.json({ error: "Invalid file type." }, { status: 400 });

  try {
    const data = await readFile(path.join(process.cwd(), "data", "uploads", name));
    return new NextResponse(data, {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
}
