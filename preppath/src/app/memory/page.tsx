"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  checkApiKey,
  listAssistants,
  listMemories,
  updateMemory,
  deleteMemory,
} from "@/hooks/use-backboard";
import { MemoryList } from "@/components/memory/memory-list";

interface Memory {
  id: string;
  content: string;
  created_at?: string;
  category?: string;
}

interface AssistantInfo {
  assistant_id: string;
  name: string;
}

export default function MemoryPage() {
  const router = useRouter();

  const [assistants, setAssistants] = useState<AssistantInfo[]>([]);
  const [selectedAssistant, setSelectedAssistant] = useState<string | null>(
    null
  );
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const hasKey = await checkApiKey();
      if (!hasKey) {
        router.push("/settings");
        return;
      }

      try {
        const data = await listAssistants();
        const list = Array.isArray(data)
          ? data
          : data?.assistants || data?.data || [];
        const prepPathAssistants = list.filter(
          (a: AssistantInfo) =>
            a.name && a.name.toLowerCase().includes("preppath")
        );
        setAssistants(prepPathAssistants);

        if (prepPathAssistants.length > 0) {
          setSelectedAssistant(prepPathAssistants[0].assistant_id);
        }
      } catch {
        // Non-critical
      }
      setLoading(false);
    }
    init();
  }, [router]);

  const loadMemories = useCallback(async () => {
    if (!selectedAssistant) return;
    try {
      const data = await listMemories(selectedAssistant);
      const list = Array.isArray(data)
        ? data
        : data?.memories || data?.data || [];
      setMemories(list);
    } catch {
      setMemories([]);
    }
  }, [selectedAssistant]);

  useEffect(() => {
    loadMemories();
  }, [loadMemories]);

  async function handleUpdate(memoryId: string, content: string) {
    await updateMemory(memoryId, content);
    await loadMemories();
  }

  async function handleDelete(memoryId: string) {
    await deleteMemory(memoryId);
    setMemories((prev) => prev.filter((m) => m.id !== memoryId));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-8">
      <h1 className="text-2xl font-bold text-foreground mb-1">
        Memory Inspector
      </h1>
      <p className="text-muted-foreground text-sm mb-8">
        Facts and context the AI remembers about you across sessions
      </p>

      <div className="border border-border rounded-lg p-5 bg-white mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(142 71% 45%)" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Memories</p>
            <p className="text-xl font-bold text-foreground">{memories.length}</p>
          </div>
        </div>
      </div>

      {assistants.length > 1 && (
        <div className="mb-6">
          <select
            value={selectedAssistant || ""}
            onChange={(e) => setSelectedAssistant(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {assistants.map((a) => (
              <option key={a.assistant_id} value={a.assistant_id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {assistants.length === 0 ? (
        <div className="border border-border rounded-lg p-12 text-center bg-white">
          <p className="text-muted-foreground text-sm">
            No interview sessions found. Complete an interview first to see
            memories here.
          </p>
        </div>
      ) : (
        <MemoryList
          memories={memories}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
