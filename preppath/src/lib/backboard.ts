import { getApiKey } from "./cookies";

const BASE_URL = "https://app.backboard.io/api";

async function getHeaders(): Promise<Record<string, string>> {
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error("API key not configured");
  return { "X-API-Key": apiKey };
}

export async function createAssistant(
  name: string,
  systemPrompt: string,
  tools?: Record<string, unknown>[]
) {
  const headers = await getHeaders();
  const res = await fetch(`${BASE_URL}/assistants`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      system_prompt: systemPrompt,
      ...(tools ? { tools } : {}),
    }),
  });
  if (!res.ok) {
    const errBody = await res.text().catch(() => res.statusText);
    throw new Error(`Failed to create assistant: ${errBody}`);
  }
  return res.json();
}

export async function createThread(assistantId: string) {
  const headers = await getHeaders();
  const res = await fetch(`${BASE_URL}/assistants/${assistantId}/threads`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  if (!res.ok) {
    const errBody = await res.text().catch(() => res.statusText);
    throw new Error(`Failed to create thread: ${errBody}`);
  }
  return res.json();
}

export async function sendMessage(
  threadId: string,
  content: string,
  memory: string = "Auto",
  stream: boolean = false
) {
  const headers = await getHeaders();
  const formData = new FormData();
  formData.append("content", content);
  formData.append("stream", String(stream));
  formData.append("memory", memory);

  const res = await fetch(`${BASE_URL}/threads/${threadId}/messages`, {
    method: "POST",
    headers,
    body: formData,
  });
  if (!res.ok) {
    const errBody = await res.text().catch(() => res.statusText);
    throw new Error(`Failed to send message: ${errBody}`);
  }
  return res.json();
}

export async function submitToolOutputs(
  threadId: string,
  runId: string,
  toolOutputs: { tool_call_id: string; output: string }[]
) {
  const headers = await getHeaders();
  const res = await fetch(
    `${BASE_URL}/threads/${threadId}/runs/${runId}/submit-tool-outputs`,
    {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ tool_outputs: toolOutputs }),
    }
  );
  if (!res.ok) {
    const errBody = await res.text().catch(() => res.statusText);
    throw new Error(`Failed to submit tool outputs: ${errBody}`);
  }
  return res.json();
}

export async function uploadDocument(
  assistantId: string,
  file: Buffer,
  filename: string,
  mimeType: string
) {
  const headers = await getHeaders();
  const formData = new FormData();
  formData.append("file", new Blob([new Uint8Array(file)], { type: mimeType }), filename);

  const res = await fetch(`${BASE_URL}/assistants/${assistantId}/documents`, {
    method: "POST",
    headers,
    body: formData,
  });
  if (!res.ok) throw new Error(`Failed to upload document: ${res.statusText}`);
  return res.json();
}

export async function getDocumentStatus(
  documentId: string
): Promise<{ status: string; filename: string }> {
  const headers = await getHeaders();
  const res = await fetch(`${BASE_URL}/documents/${documentId}/status`, {
    headers,
  });
  if (!res.ok) throw new Error(`Failed to get document status`);
  return res.json();
}

export async function waitForDocuments(
  documentIds: string[],
  onProgress?: (msg: string) => void,
  maxWaitMs: number = 120_000
): Promise<void> {
  const start = Date.now();

  while (Date.now() - start < maxWaitMs) {
    const statuses = await Promise.all(
      documentIds.map((id) => getDocumentStatus(id))
    );

    const pending = statuses.filter((s) => s.status === "processing");
    const failed = statuses.filter((s) => s.status === "error");

    if (failed.length > 0) {
      throw new Error(
        `Document indexing failed: ${failed.map((f) => f.filename).join(", ")}`
      );
    }

    if (pending.length === 0) return;

    onProgress?.(
      `Indexing documents (${statuses.length - pending.length}/${statuses.length})...`
    );

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error("Document indexing timed out after 2 minutes");
}

export async function listMemories(assistantId: string) {
  const headers = await getHeaders();
  const res = await fetch(`${BASE_URL}/assistants/${assistantId}/memories`, {
    headers,
  });
  if (!res.ok) throw new Error(`Failed to list memories: ${res.statusText}`);
  return res.json();
}

export async function getMemoryStats(assistantId: string) {
  const headers = await getHeaders();
  const res = await fetch(`${BASE_URL}/assistants/${assistantId}/memories/stats`, {
    headers,
  });
  if (!res.ok) throw new Error(`Failed to get memory stats: ${res.statusText}`);
  return res.json();
}

export async function updateMemory(memoryId: string, content: string) {
  const headers = await getHeaders();
  const res = await fetch(`${BASE_URL}/assistants/memories/${memoryId}`, {
    method: "PATCH",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error(`Failed to update memory: ${res.statusText}`);
  return res.json();
}

export async function deleteMemory(memoryId: string) {
  const headers = await getHeaders();
  const res = await fetch(`${BASE_URL}/assistants/memories/${memoryId}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error(`Failed to delete memory: ${res.statusText}`);
  return res.json();
}

export async function listAssistants() {
  const headers = await getHeaders();
  const res = await fetch(`${BASE_URL}/assistants`, { headers });
  if (!res.ok) throw new Error(`Failed to list assistants: ${res.statusText}`);
  return res.json();
}

export async function testConnection() {
  const headers = await getHeaders();
  const res = await fetch(`${BASE_URL}/assistants`, { headers });
  return res.ok;
}
