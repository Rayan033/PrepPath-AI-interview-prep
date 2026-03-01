"use client";

import { MemoryCard } from "./memory-card";

interface Memory {
  id: string;
  content: string;
  created_at?: string;
  category?: string;
}

interface MemoryListProps {
  memories: Memory[];
  onUpdate: (id: string, content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function MemoryList({ memories, onUpdate, onDelete }: MemoryListProps) {
  if (memories.length === 0) {
    return (
      <div className="border border-border rounded-lg p-12 text-center bg-white">
        <p className="text-muted-foreground text-sm">
          No memories stored yet. Start an interview and the AI will remember
          your performance across sessions.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg bg-white divide-y-0">
      {memories.map((memory) => (
        <MemoryCard
          key={memory.id}
          id={memory.id}
          content={memory.content}
          createdAt={memory.created_at}
          category={memory.category}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
