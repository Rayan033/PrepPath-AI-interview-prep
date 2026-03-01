"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { checkApiKey, listAssistants } from "@/hooks/use-backboard";

interface AssistantInfo {
  assistant_id: string;
  name: string;
  created_at?: string;
}

function extractTypeFromName(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("behavioral")) return "Behavioral";
  if (lower.includes("technical")) return "Technical";
  if (lower.includes("system")) return "System Design";
  if (lower.includes("mixed")) return "Mixed";
  return "Interview";
}

function typeBadgeColor(type: string): string {
  switch (type) {
    case "Behavioral":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "Technical":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "System Design":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "Mixed":
      return "bg-purple-100 text-purple-700 border-purple-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [assistants, setAssistants] = useState<AssistantInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const hasKey = await checkApiKey();
      setConfigured(hasKey);

      if (hasKey) {
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
        } catch {
          // Non-critical
        }
      }
      setLoading(false);
    }
    init();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  if (configured === false) {
    return (
      <div className="max-w-xl mx-auto py-24 px-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl font-bold text-primary">P</span>
        </div>
        <h1 className="text-3xl font-bold mb-3 text-foreground">
          Welcome to PrepPath
        </h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Your AI-powered voice interview coach that remembers your progress and
          adapts to your skill level across sessions.
        </p>
        <Button size="lg" onClick={() => router.push("/settings")}>
          Get Started — Add API Key
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Ready for your next practice session?
          </p>
        </div>
        <Button asChild>
          <Link href="/interview/setup">+ New Interview</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="border border-border rounded-lg p-5 bg-white">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(142 71% 45%)" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M8 12l2 2 4-4" /></svg>
            </div>
            <span className="text-sm text-muted-foreground">Total Sessions</span>
          </div>
          <p className="text-3xl font-bold text-foreground ml-11">
            {assistants.length}
          </p>
        </div>

        <div className="border border-border rounded-lg p-5 bg-white">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(142 71% 45%)" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
            </div>
            <span className="text-sm text-muted-foreground">Average Score</span>
          </div>
          <p className="text-3xl font-bold text-foreground ml-11">—</p>
        </div>

        <div className="border border-border rounded-lg p-5 bg-white">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(142 71% 45%)" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>
            </div>
            <span className="text-sm text-muted-foreground">Top Category</span>
          </div>
          <p className="text-xl font-bold text-foreground ml-11">
            {assistants.length > 0 ? extractTypeFromName(assistants[0].name) : "—"}
          </p>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-foreground mb-4">
        Recent Sessions
      </h2>

      {assistants.length === 0 ? (
        <div className="border border-border rounded-lg p-12 text-center bg-white">
          <p className="text-muted-foreground mb-4">
            No interviews yet. Start your first mock interview!
          </p>
          <Button asChild variant="outline">
            <Link href="/interview/setup">Start Interview</Link>
          </Button>
        </div>
      ) : (
        <div className="border border-border rounded-lg bg-white divide-y divide-border">
          {assistants.map((assistant) => {
            const type = extractTypeFromName(assistant.name);
            return (
              <div
                key={assistant.assistant_id}
                className="flex items-center justify-between px-5 py-4"
              >
                <div className="flex items-center gap-4">
                  <Badge
                    variant="outline"
                    className={`text-xs font-medium px-2.5 py-0.5 ${typeBadgeColor(type)}`}
                  >
                    {type}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {assistant.created_at
                      ? new Date(assistant.created_at).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" }
                        )
                      : ""}
                  </span>
                </div>
                <div className="flex items-center gap-4 w-48">
                  <Progress value={70} className="h-2 flex-1" />
                  <span className="text-sm font-medium text-foreground w-8 text-right">
                    —
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
