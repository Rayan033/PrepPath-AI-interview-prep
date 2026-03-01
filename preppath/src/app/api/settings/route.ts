import { NextRequest, NextResponse } from "next/server";
import { storeApiKey, getApiKey, clearApiKey } from "@/lib/cookies";
import { testConnection } from "@/lib/backboard";
import { apiKeySchema } from "@/lib/schemas";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const rl = rateLimit(req.ip ?? "anonymous");
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = apiKeySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    await storeApiKey(parsed.data.apiKey);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to save API key" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const rl = rateLimit(req.ip ?? "anonymous");
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const key = await getApiKey();
    return NextResponse.json({ configured: !!key });
  } catch {
    return NextResponse.json({ configured: false });
  }
}

export async function DELETE(req: NextRequest) {
  const rl = rateLimit(req.ip ?? "anonymous");
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  await clearApiKey();
  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest) {
  const rl = rateLimit(req.ip ?? "anonymous");
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const key = await getApiKey();
    if (!key) {
      return NextResponse.json(
        { connected: false, error: "No API key configured" },
        { status: 400 }
      );
    }

    const connected = await testConnection();
    return NextResponse.json({ connected });
  } catch {
    return NextResponse.json({ connected: false, error: "Connection test failed" }, { status: 500 });
  }
}
