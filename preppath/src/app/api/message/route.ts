import { NextRequest, NextResponse } from "next/server";
import { sendMessage, submitToolOutputs } from "@/lib/backboard";
import { sendMessageSchema, submitToolOutputsSchema } from "@/lib/schemas";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const rl = rateLimit(req.ip ?? "anonymous");
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = sendMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { threadId, content, memory } = parsed.data;
    const result = await sendMessage(threadId, content, memory, false);

    if (result.status === "REQUIRES_ACTION" && result.tool_calls) {
      const toolOutputs = result.tool_calls.map(
        (tc: { id: string; function: { name: string; arguments: string } }) => {
          const args = JSON.parse(tc.function.arguments);
          return {
            tool_call_id: tc.id,
            output: JSON.stringify({ recorded: true, ...args }),
          };
        }
      );

      const finalResult = await submitToolOutputs(
        threadId,
        result.run_id,
        toolOutputs
      );

      const scores = result.tool_calls.map(
        (tc: { function: { arguments: string } }) =>
          JSON.parse(tc.function.arguments)
      );

      return NextResponse.json({
        ...finalResult,
        scores,
      });
    }

    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to send message";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const rl = rateLimit(req.ip ?? "anonymous");
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = submitToolOutputsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { threadId, runId, toolOutputs } = parsed.data;
    const result = await submitToolOutputs(threadId, runId, toolOutputs);
    return NextResponse.json(result);
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to submit tool outputs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
