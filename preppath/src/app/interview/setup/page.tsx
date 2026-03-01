"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  checkApiKey,
  createAssistant,
  createThread,
  uploadDocument,
  uploadTextAsDocument,
  waitForDocumentsReady,
} from "@/hooks/use-backboard";
import { useInterviewStore } from "@/stores/interview-store";
import { InterviewType } from "@/lib/types";
import {
  saveResume,
  getSavedResume,
  getSavedResumeName,
  clearSavedResume,
} from "@/lib/resume-store";

const INTERVIEW_TYPES: { value: InterviewType; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    value: "behavioral",
    label: "Behavioral",
    desc: "STAR-method situational questions",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  },
  {
    value: "technical",
    label: "Technical",
    desc: "Coding & problem-solving focus",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>,
  },
  {
    value: "system_design",
    label: "System Design",
    desc: "Architecture & scalability",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>,
  },
  {
    value: "mixed",
    label: "Mixed",
    desc: "Blend of all question types",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
  },
];

export default function InterviewSetupPage() {
  const router = useRouter();

  const {
    interviewType,
    questionCount,
    setInterviewType,
    setQuestionCount,
    setAssistantId,
    setThreadId,
    setPhase,
    reset,
  } = useInterviewStore();

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [savedResumeName, setSavedResumeName] = useState<string | null>(null);
  const [useSavedResume, setUseSavedResume] = useState(true);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkApiKey().then((configured) => {
      if (!configured) router.push("/settings");
    });
    const name = getSavedResumeName();
    setSavedResumeName(name);
  }, [router]);

  function handleFileSelect(file: File | null) {
    setResumeFile(file);
    if (file) setUseSavedResume(false);
  }

  async function handleStart() {
    if (!jobDescription.trim()) {
      setError("Please enter a job description.");
      return;
    }

    setLoading(true);
    setError(null);
    setLoadingMessage("Creating assistant...");
    reset();

    try {
      setPhase("setting_up");

      const assistant = await createAssistant(interviewType, questionCount);
      const assistantId = assistant.assistant_id;
      setAssistantId(assistantId);

      setLoadingMessage("Uploading documents...");

      const documentIds: string[] = [];

      const activeResume =
        resumeFile && !useSavedResume
          ? resumeFile
          : useSavedResume && savedResumeName
            ? getSavedResume()
            : null;

      if (activeResume) {
        const doc = await uploadDocument(assistantId, activeResume);
        if (doc.document_id) documentIds.push(doc.document_id);

        if (!useSavedResume && resumeFile) {
          await saveResume(resumeFile);
          setSavedResumeName(resumeFile.name);
        }
      }

      const jdDoc = await uploadTextAsDocument(
        assistantId,
        jobDescription,
        "job-description.txt"
      );
      if (jdDoc.document_id) documentIds.push(jdDoc.document_id);

      if (documentIds.length > 0) {
        setLoadingMessage("Indexing documents (this may take a moment)...");
        await waitForDocumentsReady(documentIds);
      }

      setLoadingMessage("Creating interview thread...");
      const thread = await createThread(assistantId);
      setThreadId(thread.thread_id);

      router.push("/interview/session");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Setup failed");
      setPhase("idle");
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-8">
      <h1 className="text-2xl font-bold text-foreground mb-1">
        Interview Setup
      </h1>
      <p className="text-muted-foreground text-sm mb-8">
        Configure your mock interview session
      </p>

      <div className="space-y-6">
        {/* Resume */}
        <div className="border border-border rounded-lg p-6 bg-white">
          <h2 className="text-base font-semibold text-foreground mb-4">Resume</h2>

          {savedResumeName && (
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="use-saved"
                checked={useSavedResume}
                onChange={(e) => setUseSavedResume(e.target.checked)}
                className="rounded border-border"
              />
              <div className="flex items-center gap-2 text-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(142 71% 45%)" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                <label htmlFor="use-saved" className="cursor-pointer text-foreground">
                  {savedResumeName}
                </label>
              </div>
              <button
                onClick={() => {
                  clearSavedResume();
                  setSavedResumeName(null);
                  setUseSavedResume(false);
                }}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors ml-auto"
              >
                Remove
              </button>
            </div>
          )}

          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/40 transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto mb-2 text-muted-foreground"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
            <p className="text-sm text-muted-foreground mb-1">
              Drop your resume here or{" "}
              <label htmlFor="resume" className="text-primary cursor-pointer hover:underline">
                browse
              </label>
            </p>
            <p className="text-xs text-muted-foreground">PDF, TXT, or DOCX</p>
            <input
              id="resume"
              type="file"
              accept=".pdf,.txt,.docx"
              onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
              className="hidden"
            />
          </div>

          {resumeFile && !useSavedResume && (
            <p className="text-xs text-muted-foreground mt-2">
              Selected: {resumeFile.name} ({(resumeFile.size / 1024).toFixed(1)} KB)
            </p>
          )}

          <p className="text-xs text-muted-foreground mt-2 italic">
            Your resume will be saved for future sessions
          </p>
        </div>

        {/* Job Description */}
        <div className="border border-border rounded-lg p-6 bg-white">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Job Description
          </h2>
          <Textarea
            placeholder="Paste the job description here to tailor your interview questions..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={6}
            className="resize-none bg-white"
          />
        </div>

        {/* Interview Type */}
        <div className="border border-border rounded-lg p-6 bg-white">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Interview Type
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {INTERVIEW_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setInterviewType(type.value)}
                className={`p-4 rounded-lg border text-left transition-all flex items-start gap-3 ${
                  interviewType === type.value
                    ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                    : "border-border hover:border-muted-foreground/30"
                }`}
              >
                <span className={interviewType === type.value ? "text-primary" : "text-muted-foreground"}>
                  {type.icon}
                </span>
                <div>
                  <span className="font-medium text-sm text-foreground block">
                    {type.label}
                  </span>
                  <span className="text-xs text-muted-foreground mt-0.5 block">
                    {type.desc}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Question Count */}
        <div className="border border-border rounded-lg p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">
              Question Count
            </h2>
            <span className="text-lg font-bold text-primary">
              {questionCount}
            </span>
          </div>
          <Slider
            value={[questionCount]}
            onValueChange={([val]) => setQuestionCount(val)}
            min={3}
            max={15}
            step={1}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>3 (quick)</span>
            <span>15 (thorough)</span>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <Button
          onClick={handleStart}
          disabled={loading || !jobDescription.trim()}
          className="w-full h-12 text-base"
          size="lg"
        >
          {loading ? (loadingMessage || "Setting up interview...") : "Start Interview"}
        </Button>
      </div>
    </div>
  );
}
