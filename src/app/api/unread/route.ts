import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { getUnreadCounts } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireApiUser();
    return NextResponse.json(await getUnreadCounts(user.id), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
