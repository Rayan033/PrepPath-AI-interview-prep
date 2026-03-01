import { z } from "zod";

export const createAssistantSchema = z.object({
  type: z.enum(["behavioral", "technical", "system_design", "mixed"]),
  questionCount: z.number().int().min(3).max(20),
});

export const createThreadSchema = z.object({
  assistantId: z.string().min(1),
});

export const sendMessageSchema = z.object({
  threadId: z.string().min(1),
  content: z.string().min(1).max(10000),
  memory: z.enum(["Auto", "None"]).default("Auto"),
});

export const submitToolOutputsSchema = z.object({
  threadId: z.string().min(1),
  runId: z.string().min(1),
  toolOutputs: z.array(
    z.object({
      tool_call_id: z.string().min(1),
      output: z.string().min(1),
    })
  ),
});

export const memoryUpdateSchema = z.object({
  memoryId: z.string().min(1),
  content: z.string().min(1).max(5000),
});

export const memoryDeleteSchema = z.object({
  memoryId: z.string().min(1),
});

export const apiKeySchema = z.object({
  apiKey: z.string().min(10, "API key must be at least 10 characters"),
});

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: "File must be under 10MB" };
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Only PDF, TXT, and DOCX files are accepted",
    };
  }
  return { valid: true };
}
