"use client";

import { InterviewType } from "@/lib/types";

const jsonHeaders = { "Content-Type": "application/json" };

export async function checkApiKey(): Promise<boolean> {
  const res = await fetch("/api/settings");
  const data = await res.json();
  return data.configured;
}

export async function saveApiKey(apiKey: string): Promise<void> {
  const res = await fetch("/api/settings", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ apiKey }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to save API key");
  }
}

export async function testConnection(): Promise<boolean> {
  const res = await fetch("/api/settings", { method: "PUT" });
  const data = await res.json();
  return data.connected;
}

export async function createAssistant(
  type: InterviewType,
  questionCount: number
): Promise<{ assistant_id: string }> {
  const res = await fetch("/api/assistant", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ type, questionCount }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to create assistant");
  }
  return res.json();
}

export async function createThread(
  assistantId: string
): Promise<{ thread_id: string }> {
  const res = await fetch("/api/thread", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ assistantId }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to create thread");
  }
  return res.json();
}

export async function sendMessage(
  threadId: string,
  content: string,
  memory: "Auto" | "None" = "Auto"
) {
  const res = await fetch("/api/message", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ threadId, content, memory }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to send message");
  }
  return res.json();
}

export async function uploadDocument(
  assistantId: string,
  file: File
): Promise<{ document_id: string }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("assistantId", assistantId);

  const res = await fetch("/api/documents", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to upload document");
  }
  return res.json();
}

export async function uploadTextAsDocument(
  assistantId: string,
  text: string,
  filename: string
): Promise<{ document_id: string }> {
  const file = new File([text], filename, { type: "text/plain" });
  return uploadDocument(assistantId, file);
}

export async function waitForDocumentsReady(
  documentIds: string[]
): Promise<void> {
  const res = await fetch("/api/documents/status", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ documentIds }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Documents failed to index");
  }
}

export async function listMemories(assistantId: string) {
  const res = await fetch(
    `/api/memory?assistantId=${encodeURIComponent(assistantId)}`
  );
  if (!res.ok) throw new Error("Failed to fetch memories");
  return res.json();
}

export async function getMemoryStats(assistantId: string) {
  const res = await fetch(
    `/api/memory?assistantId=${encodeURIComponent(assistantId)}&stats=true`
  );
  if (!res.ok) throw new Error("Failed to fetch memory stats");
  return res.json();
}

export async function updateMemory(memoryId: string, content: string) {
  const res = await fetch("/api/memory", {
    method: "PATCH",
    headers: jsonHeaders,
    body: JSON.stringify({ memoryId, content }),
  });
  if (!res.ok) throw new Error("Failed to update memory");
  return res.json();
}

export async function deleteMemory(memoryId: string) {
  const res = await fetch("/api/memory", {
    method: "DELETE",
    headers: jsonHeaders,
    body: JSON.stringify({ memoryId }),
  });
  if (!res.ok) throw new Error("Failed to delete memory");
  return res.json();
}

export async function listAssistants() {
  const res = await fetch("/api/assistant");
  if (!res.ok) throw new Error("Failed to list assistants");
  return res.json();
}
