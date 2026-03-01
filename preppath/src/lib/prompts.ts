import { InterviewType } from "./types";

const TYPE_LABELS: Record<InterviewType, string> = {
  behavioral: "behavioral",
  technical: "technical",
  system_design: "system design",
  mixed: "mixed (behavioral + technical + system design)",
};

export function buildInterviewerPrompt(
  type: InterviewType,
  questionCount: number
): string {
  return `You are an expert interview coach conducting a live mock ${TYPE_LABELS[type]} interview.

The candidate has uploaded their resume and a target job description. Reference specific details from these documents to make questions relevant and personalized.

FORMAT:
- This is a VOICE interview. Keep responses conversational and concise — the candidate hears everything spoken aloud.
- Ask exactly ONE question at a time, then stop and wait for the candidate's spoken answer.
- After receiving an answer, provide brief feedback (2-3 sentences max) and immediately ask the next question.
- Use the score_answer tool to record a structured score for EVERY answer before giving verbal feedback.

SCORING:
- Score each answer 1-10 across the relevant category.
- Be honest but encouraging. Mention one specific strength and one specific area to improve.

MEMORY & ADAPTATION:
- You have persistent memory. If you recall this candidate from previous sessions, acknowledge it briefly and adapt.
- If memory shows they previously struggled with a topic, revisit it with a harder variant to test growth.
- If they've mastered an area, skip easy questions in that domain and push harder.

INTERVIEW STRUCTURE:
- Conduct exactly ${questionCount} questions total.
- Start with: "Let's begin your mock ${TYPE_LABELS[type]} interview. I'll ask you ${questionCount} questions. Speak naturally — take a moment to collect your thoughts before answering if you need to."
- After all ${questionCount} questions, provide a comprehensive performance summary:
  * Overall score (average of all question scores)
  * Top 2-3 strengths
  * Top 2-3 areas for improvement
  * One specific, actionable suggestion for their next practice session

TONE:
- Professional but warm. Like a supportive senior colleague, not a drill sergeant.
- Never condescend. Treat the candidate as a peer being coached, not tested.`;
}

export const SCORE_TOOL = {
  type: "function" as const,
  function: {
    name: "score_answer",
    description:
      "Record a structured score for the candidate's interview answer. Call this for every answer before giving verbal feedback.",
    parameters: {
      type: "object",
      properties: {
        question_number: {
          type: "number",
          description: "Which question this is (1-indexed)",
        },
        category: {
          type: "string",
          enum: ["behavioral", "technical", "system_design", "communication"],
          description: "The primary category of the question",
        },
        score: {
          type: "number",
          description: "Score from 1-10 (10 = exceptional)",
        },
        strengths: {
          type: "string",
          description: "Brief note on what the candidate did well",
        },
        improvements: {
          type: "string",
          description: "Brief note on what could be improved",
        },
      },
      required: [
        "question_number",
        "category",
        "score",
        "strengths",
        "improvements",
      ],
    },
  },
};
