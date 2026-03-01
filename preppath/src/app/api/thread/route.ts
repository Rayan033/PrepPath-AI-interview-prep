import { NextRequest, NextResponse } from "next/server";
import { createThread } from "@/lib/backboard";
import { createThreadSchema } from "@/lib/schemas";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const rl = rateLimit(req.ip ?? "anonymous");
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = createThreadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const thread = await createThread(parsed.data.assistantId);
    return NextResponse.json(thread);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create thread";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
