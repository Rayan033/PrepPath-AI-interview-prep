"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MemoryCardProps {
  id: string;
  content: string;
  createdAt?: string;
  category?: string;
  onUpdate: (id: string, content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function categoryColor(cat: string): string {
  const lower = cat.toLowerCase();
  if (lower.includes("experience")) return "bg-blue-100 text-blue-700";
  if (lower.includes("leadership")) return "bg-purple-100 text-purple-700";
  if (lower.includes("preference")) return "bg-amber-100 text-amber-700";
  if (lower.includes("skill")) return "bg-emerald-100 text-emerald-700";
  return "bg-gray-100 text-gray-600";
}

export function MemoryCard({
  id,
  content,
  createdAt,
  category,
  onUpdate,
  onDelete,
}: MemoryCardProps) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!editContent.trim() || editContent === content) {
      setEditing(false);
      return;
    }
    setLoading(true);
    try {
      await onUpdate(id, editContent.trim());
      setEditing(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setLoading(true);
    try {
      await onDelete(id);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border-b border-border last:border-b-0 py-4 px-1 group">
      {editing ? (
        <div className="space-y-2">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
            className="resize-none text-sm bg-white"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditing(false);
                setEditContent(content);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground leading-relaxed">{content}</p>
            <div className="flex items-center gap-2 mt-2">
              {category && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColor(category)}`}>
                  {category}
                </span>
              )}
              {createdAt && (
                <span className="text-xs text-muted-foreground">
                  {new Date(createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              onClick={() => setEditing(true)}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-500"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
