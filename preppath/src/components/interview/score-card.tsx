"use client";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AnswerScore } from "@/lib/types";

interface ScoreCardProps {
  scores: AnswerScore[];
  totalQuestions: number;
}

export function ScoreCard({ scores, totalQuestions }: ScoreCardProps) {
  if (scores.length === 0) return null;

  const avgScore =
    scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
  const completed = scores.length;

  const byCategory = scores.reduce(
    (acc, s) => {
      if (!acc[s.category]) acc[s.category] = [];
      acc[s.category].push(s.score);
      return acc;
    },
    {} as Record<string, number[]>
  );

  return (
    <div className="border border-border rounded-lg bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Performance</h3>
        <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
          {completed}/{totalQuestions}
        </Badge>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-muted-foreground">Average Score</span>
            <span className="font-medium text-foreground">{avgScore.toFixed(1)}/10</span>
          </div>
          <Progress value={avgScore * 10} className="h-2" />
        </div>

        {Object.entries(byCategory).map(([category, categoryScores]) => {
          const avg = categoryScores.reduce((a, b) => a + b, 0) / categoryScores.length;
          return (
            <div key={category}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground capitalize">
                  {category.replace("_", " ")}
                </span>
                <span className="text-xs text-foreground">{avg.toFixed(1)}/10</span>
              </div>
              <Progress value={avg * 10} className="h-1.5" />
            </div>
          );
        })}

        {scores.length > 0 && (
          <div className="pt-3 space-y-2.5 border-t border-border">
            {scores.slice(-3).map((s, idx) => (
              <div key={`${s.questionNumber}-${idx}`} className="text-xs space-y-0.5">
                <div className="flex justify-between">
                  <span className="font-medium text-foreground">Q{s.questionNumber}</span>
                  <span
                    className={
                      s.score >= 7
                        ? "text-emerald-600 font-medium"
                        : s.score >= 5
                          ? "text-amber-600 font-medium"
                          : "text-red-500 font-medium"
                    }
                  >
                    {s.score}/10
                  </span>
                </div>
                {s.strengths && (
                  <p className="text-muted-foreground">+ {s.strengths}</p>
                )}
                {s.improvements && (
                  <p className="text-muted-foreground">- {s.improvements}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
