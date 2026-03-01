"use client";

import { SessionPhase } from "@/lib/types";

interface VoiceOrbProps {
  phase: SessionPhase;
}

const phaseConfig: Record<
  SessionPhase,
  { className: string; label: string; color: string }
> = {
  idle: {
    className: "orb-idle",
    label: "Ready",
    color: "from-emerald-300 to-emerald-500",
  },
  setting_up: {
    className: "orb-processing",
    label: "Setting up...",
    color: "from-emerald-200 to-emerald-400",
  },
  ai_speaking: {
    className: "orb-speaking",
    label: "Interviewer speaking",
    color: "from-emerald-400 to-green-500",
  },
  user_speaking: {
    className: "orb-listening",
    label: "Listening...",
    color: "from-emerald-300 to-teal-500",
  },
  processing: {
    className: "orb-processing",
    label: "Thinking...",
    color: "from-emerald-200 to-emerald-400",
  },
  finished: {
    className: "orb-idle",
    label: "Interview complete",
    color: "from-emerald-200 to-emerald-300",
  },
};

export function VoiceOrb({ phase }: VoiceOrbProps) {
  const config = phaseConfig[phase];

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={`w-28 h-28 rounded-full bg-gradient-to-br ${config.color} ${config.className} transition-all duration-300`}
      />
      <span className="text-sm text-muted-foreground font-medium">
        {config.label}
      </span>
    </div>
  );
}
