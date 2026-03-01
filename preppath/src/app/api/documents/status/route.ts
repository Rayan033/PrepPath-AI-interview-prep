import { NextRequest, NextResponse } from "next/server";
import { waitForDocuments } from "@/lib/backboard";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const rl = rateLimit(req.ip ?? "anonymous");
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { documentIds } = body;

    if (!Array.isArray(documentIds) || documentIds.length === 0) {
      return NextResponse.json(
        { error: "documentIds array is required" },
        { status: 400 }
      );
    }

    await waitForDocuments(documentIds);
    return NextResponse.json({ ready: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to check document status";
    return NextResponse.json({ error: message, ready: false }, { status: 500 });
  }
}
