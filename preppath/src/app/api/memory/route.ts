import { NextRequest, NextResponse } from "next/server";
import {
  listMemories,
  getMemoryStats,
  updateMemory,
  deleteMemory,
} from "@/lib/backboard";
import { memoryUpdateSchema, memoryDeleteSchema } from "@/lib/schemas";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const rl = rateLimit(req.ip ?? "anonymous");
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const assistantId = req.nextUrl.searchParams.get("assistantId");
    if (!assistantId) {
      return NextResponse.json(
        { error: "assistantId is required" },
        { status: 400 }
      );
    }

    const statsParam = req.nextUrl.searchParams.get("stats");

    if (statsParam === "true") {
      const stats = await getMemoryStats(assistantId);
      return NextResponse.json(stats);
    }

    const memories = await listMemories(assistantId);
    return NextResponse.json(memories);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch memories";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const rl = rateLimit(req.ip ?? "anonymous");
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = memoryUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const result = await updateMemory(parsed.data.memoryId, parsed.data.content);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update memory";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const rl = rateLimit(req.ip ?? "anonymous");
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = memoryDeleteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const result = await deleteMemory(parsed.data.memoryId);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to delete memory";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
