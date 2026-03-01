export type InterviewType = "behavioral" | "technical" | "system_design" | "mixed";

export interface InterviewConfig {
  type: InterviewType;
  questionCount: number;
  resumeFile?: File;
  jobDescription: string;
}

export interface TranscriptEntry {
  id: string;
  role: "ai" | "user";
  content: string;
  timestamp: number;
  score?: AnswerScore;
}

export interface AnswerScore {
  questionNumber: number;
  category: string;
  score: number;
  strengths: string;
  improvements: string;
}

export interface InterviewSession {
  assistantId: string;
  threadId: string;
  type: InterviewType;
  questionCount: number;
  startedAt: number;
}

export type SessionPhase =
  | "idle"
  | "setting_up"
  | "ai_speaking"
  | "user_speaking"
  | "processing"
  | "finished";

export interface MemoryItem {
  id: string;
  content: string;
  created_at?: string;
  updated_at?: string;
  category?: string;
}

export interface MemoryStats {
  total: number;
}

export interface BackboardMessage {
  content: string;
  status?: string;
  run_id?: string;
  memory_operation_id?: string;
  tool_calls?: BackboardToolCall[];
}

export interface BackboardToolCall {
  id: string;
  function: {
    name: string;
    arguments: string;
    parsed_arguments?: Record<string, unknown>;
  };
}
