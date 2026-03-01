"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TranscriptEntry } from "@/lib/types";

interface TranscriptPanelProps {
  entries: TranscriptEntry[];
  liveTranscript?: string;
  isListening?: boolean;
}

export function TranscriptPanel({
  entries,
  liveTranscript,
  isListening,
}: TranscriptPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries, liveTranscript]);

  return (
    <ScrollArea className="h-[400px] w-full rounded-lg border border-border bg-white p-4">
      <div className="space-y-4">
        {entries.length === 0 && !liveTranscript && (
          <p className="text-center text-muted-foreground text-sm py-8">
            The interview transcript will appear here...
          </p>
        )}

        {entries.map((entry) => (
          <div key={entry.id} className="flex gap-3">
            <div
              className={`mt-1 w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                entry.role === "ai"
                  ? "bg-primary/10 text-primary"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              {entry.role === "ai" ? "AI" : "U"}
            </div>
            <div className="flex-1 min-w-0">
              {entry.role === "ai" && (
                <div className="border-l-2 border-primary/30 pl-3">
                  <p className="text-sm text-foreground leading-relaxed">
                    {entry.content}
                  </p>
                </div>
              )}
              {entry.role === "user" && (
                <p className="text-sm text-foreground leading-relaxed">
                  {entry.content}
                </p>
              )}
              {entry.score && (
                <div className="mt-2 text-xs bg-primary/5 border border-primary/10 rounded-md p-2 inline-block text-primary font-medium">
                  Score: {entry.score.score}/10
                </div>
              )}
            </div>
          </div>
        ))}

        {isListening && liveTranscript && (
          <div className="flex gap-3 opacity-60">
            <div className="mt-1 w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold bg-blue-100 text-blue-600">
              U
            </div>
            <div className="flex-1">
              <p className="text-sm leading-relaxed italic text-muted-foreground">
                {liveTranscript}
              </p>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
