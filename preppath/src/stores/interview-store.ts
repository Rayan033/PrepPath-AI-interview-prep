"use client";

import { create } from "zustand";
import {
  InterviewType,
  TranscriptEntry,
  AnswerScore,
  SessionPhase,
} from "@/lib/types";

interface InterviewState {
  assistantId: string | null;
  threadId: string | null;
  interviewType: InterviewType;
  questionCount: number;
  phase: SessionPhase;
  transcript: TranscriptEntry[];
  scores: AnswerScore[];
  currentQuestion: number;
  error: string | null;

  setAssistantId: (id: string) => void;
  setThreadId: (id: string) => void;
  setInterviewType: (type: InterviewType) => void;
  setQuestionCount: (count: number) => void;
  setPhase: (phase: SessionPhase) => void;
  addTranscriptEntry: (entry: TranscriptEntry) => void;
  addScore: (score: AnswerScore) => void;
  incrementQuestion: () => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  assistantId: null,
  threadId: null,
  interviewType: "behavioral" as InterviewType,
  questionCount: 5,
  phase: "idle" as SessionPhase,
  transcript: [],
  scores: [],
  currentQuestion: 0,
  error: null,
};

export const useInterviewStore = create<InterviewState>((set) => ({
  ...initialState,

  setAssistantId: (id) => set({ assistantId: id }),
  setThreadId: (id) => set({ threadId: id }),
  setInterviewType: (type) => set({ interviewType: type }),
  setQuestionCount: (count) => set({ questionCount: count }),
  setPhase: (phase) => set({ phase }),
  addTranscriptEntry: (entry) =>
    set((state) => ({ transcript: [...state.transcript, entry] })),
  addScore: (score) =>
    set((state) => ({ scores: [...state.scores, score] })),
  incrementQuestion: () =>
    set((state) => ({ currentQuestion: state.currentQuestion + 1 })),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
