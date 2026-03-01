"use client";

import { Button } from "@/components/ui/button";
import { SessionPhase } from "@/lib/types";

interface ControlsProps {
  phase: SessionPhase;
  isListening: boolean;
  onMicToggle: () => void;
  onEndInterview: () => void;
}

export function Controls({
  phase,
  isListening,
  onMicToggle,
  onEndInterview,
}: ControlsProps) {
  const disableMic =
    phase === "processing" || phase === "setting_up" || phase === "finished";
  const showEnd =
    phase !== "finished" && phase !== "setting_up";
  const disableEnd = phase === "processing";

  return (
    <div className="flex items-center justify-center gap-4">
      <Button
        variant={isListening ? "destructive" : "default"}
        size="lg"
        onClick={onMicToggle}
        disabled={disableMic}
        className="h-12 px-6 gap-2"
      >
        <MicIcon muted={!isListening} />
        {isListening ? "Stop Speaking" : "Start Speaking"}
      </Button>

      {showEnd && (
        <Button
          variant="outline"
          size="lg"
          onClick={onEndInterview}
          disabled={disableEnd}
          className="h-12 px-6"
        >
          End Interview
        </Button>
      )}
    </div>
  );
}

function MicIcon({ muted }: { muted: boolean }) {
  if (muted) {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
        <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .26-.02.51-.05.76" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    );
  }

  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}
