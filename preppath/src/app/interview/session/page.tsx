"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { VoiceOrb } from "@/components/interview/voice-orb";
import { TranscriptPanel } from "@/components/interview/transcript-panel";
import { Controls } from "@/components/interview/controls";
import { ScoreCard } from "@/components/interview/score-card";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";
import { sendMessage } from "@/hooks/use-backboard";
import { useInterviewStore } from "@/stores/interview-store";
import { AnswerScore } from "@/lib/types";

function normalizeScore(raw: Record<string, unknown>): AnswerScore {
  return {
    questionNumber: (raw.question_number ?? raw.questionNumber ?? 0) as number,
    category: (raw.category ?? "") as string,
    score: (raw.score ?? 0) as number,
    strengths: (raw.strengths ?? "") as string,
    improvements: (raw.improvements ?? "") as string,
  };
}

export default function InterviewSessionPage() {
  const router = useRouter();
  const store = useInterviewStore();
  const [liveTranscript, setLiveTranscript] = useState("");
  const [waitingToStart, setWaitingToStart] = useState(true);
  const hasStartedRef = useRef(false);

  const voiceURI =
    typeof window !== "undefined"
      ? localStorage.getItem("preppath-voice") || undefined
      : undefined;

  const handleSpeechEnd = useCallback(
    async (finalTranscript: string) => {
      if (!finalTranscript.trim() || !store.threadId) return;

      store.addTranscriptEntry({
        id: `user-${Date.now()}`,
        role: "user",
        content: finalTranscript,
        timestamp: Date.now(),
      });
      setLiveTranscript("");
      store.setPhase("processing");

      try {
        const response = await sendMessage(store.threadId, finalTranscript);
        handleAIResponse(response);
      } catch (e) {
        store.setError(e instanceof Error ? e.message : "Failed to get response");
        store.setPhase("idle");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store.threadId]
  );

  const { isListening, start: startListening, stop: stopListening } =
    useSpeechRecognition({
      onResult: setLiveTranscript,
      onEnd: handleSpeechEnd,
      silenceTimeout: 2500,
    });

  const handleTTSEnd = useCallback(() => {
    store.setPhase("user_speaking");
    startListening();
  }, [store, startListening]);

  const { speak, cancel: cancelSpeech, isSpeaking } = useSpeechSynthesis({
    voiceURI,
    onEnd: handleTTSEnd,
  });

  function handleAIResponse(response: {
    content?: string;
    scores?: Record<string, unknown>[];
  }) {
    const scores: AnswerScore[] = (response.scores || []).map(normalizeScore);
    scores.forEach((score) => store.addScore(score));

    if (response.content) {
      store.addTranscriptEntry({
        id: `ai-${Date.now()}`,
        role: "ai",
        content: response.content,
        timestamp: Date.now(),
        score: scores[0],
      });

      store.incrementQuestion();
      store.setPhase("ai_speaking");
      speak(response.content);
    }
  }

  async function startInterview() {
    if (!store.threadId || hasStartedRef.current) return;
    hasStartedRef.current = true;
    store.setPhase("processing");

    try {
      const response = await sendMessage(
        store.threadId,
        "Start the interview. Ask your first question."
      );
      handleAIResponse(response);
    } catch (e) {
      store.setError(e instanceof Error ? e.message : "Failed to start");
      store.setPhase("idle");
    }
  }

  useEffect(() => {
    if (!store.threadId || !store.assistantId) {
      router.push("/interview/setup");
    }
  }, [store.threadId, store.assistantId, router]);

  function handleBeginClick() {
    setWaitingToStart(false);
    startInterview();
  }

  function handleMicToggle() {
    if (isListening) {
      stopListening();
    } else {
      cancelSpeech();
      store.setPhase("user_speaking");
      setLiveTranscript("");
      startListening();
    }
  }

  async function handleEndInterview() {
    stopListening();
    cancelSpeech();

    if (!store.threadId) {
      store.setPhase("finished");
      return;
    }

    store.setPhase("processing");

    try {
      const response = await sendMessage(
        store.threadId,
        "The interview is now over. Please provide a comprehensive performance summary with overall score, top strengths, areas for improvement, and one specific actionable suggestion."
      );

      if (response.content) {
        store.addTranscriptEntry({
          id: `ai-summary-${Date.now()}`,
          role: "ai",
          content: response.content,
          timestamp: Date.now(),
        });
      }
    } catch {
      // Proceed to finished even on error
    }

    store.setPhase("finished");
  }

  useEffect(() => {
    if (isListening && store.phase !== "user_speaking") {
      store.setPhase("user_speaking");
    }
    if (isSpeaking && store.phase !== "ai_speaking") {
      store.setPhase("ai_speaking");
    }
  }, [isListening, isSpeaking, store]);

  if (waitingToStart) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-6 bg-white">
        <VoiceOrb phase="idle" />
        <div className="text-center space-y-3 max-w-md">
          <h1 className="text-2xl font-bold text-foreground">Ready to Begin</h1>
          <p className="text-muted-foreground text-sm">
            Your interview is set up. Click below to start — the AI interviewer
            will speak its questions aloud and listen to your answers.
          </p>
        </div>
        <Button
          size="lg"
          className="h-14 px-10 text-base"
          onClick={handleBeginClick}
        >
          Begin Interview
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-foreground">Mock Interview</h1>
          {store.phase === "finished" && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/memory")}
              >
                View Memory
              </Button>
              <Button size="sm" onClick={() => {
                store.reset();
                router.push("/interview/setup");
              }}>
                New Interview
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-center py-4">
          <VoiceOrb phase={store.phase} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TranscriptPanel
              entries={store.transcript}
              liveTranscript={liveTranscript}
              isListening={isListening}
            />
          </div>
          <div>
            <ScoreCard
              scores={store.scores}
              totalQuestions={store.questionCount}
            />
          </div>
        </div>

        {store.phase !== "finished" && (
          <Controls
            phase={store.phase}
            isListening={isListening}
            onMicToggle={handleMicToggle}
            onEndInterview={handleEndInterview}
          />
        )}

        {store.error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-center">
            <p className="text-sm text-red-600">{store.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
