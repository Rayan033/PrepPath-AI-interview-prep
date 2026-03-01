import { NextRequest, NextResponse } from "next/server";
import { uploadDocument } from "@/lib/backboard";
import { rateLimit } from "@/lib/rate-limit";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export async function POST(req: NextRequest) {
  const rl = rateLimit(req.ip ?? "anonymous");
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const assistantId = formData.get("assistantId") as string | null;

    if (!file || !assistantId) {
      return NextResponse.json(
        { error: "File and assistantId are required" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File must be under 10MB" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.has(file.type) && !file.name.endsWith(".txt")) {
      return NextResponse.json(
        { error: "Only PDF, TXT, and DOCX files are accepted" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadDocument(
      assistantId,
      buffer,
      file.name,
      file.type || "text/plain"
    );

    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to upload document";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
