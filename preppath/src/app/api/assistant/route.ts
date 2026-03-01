import { NextRequest, NextResponse } from "next/server";
import { createAssistant, listAssistants } from "@/lib/backboard";
import { createAssistantSchema } from "@/lib/schemas";
import { buildInterviewerPrompt, SCORE_TOOL } from "@/lib/prompts";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const rl = rateLimit(req.ip ?? "anonymous");
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = createAssistantSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { type, questionCount } = parsed.data;
    const systemPrompt = buildInterviewerPrompt(type, questionCount);
    const name = `PrepPath ${type} Interview`;

    const assistant = await createAssistant(name, systemPrompt, [SCORE_TOOL]);
    return NextResponse.json(assistant);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create assistant";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const rl = rateLimit(req.ip ?? "anonymous");
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const assistants = await listAssistants();
    return NextResponse.json(assistants);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to list assistants";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
