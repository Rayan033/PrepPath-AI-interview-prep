"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  saveApiKey,
  testConnection,
  checkApiKey,
} from "@/hooks/use-backboard";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | "idle";
    message: string;
  }>({ type: "idle", message: "" });

  useEffect(() => {
    checkApiKey().then(setIsConfigured);
  }, []);

  async function handleSave() {
    if (!apiKey.trim()) return;
    setSaving(true);
    setStatus({ type: "idle", message: "" });

    try {
      await saveApiKey(apiKey.trim());
      setIsConfigured(true);
      setApiKey("");
      setStatus({ type: "success", message: "API key saved securely." });
    } catch (e) {
      setStatus({
        type: "error",
        message: e instanceof Error ? e.message : "Failed to save",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    setTesting(true);
    setStatus({ type: "idle", message: "" });

    try {
      const connected = await testConnection();
      setStatus({
        type: connected ? "success" : "error",
        message: connected
          ? "Connected to Backboard successfully!"
          : "Connection failed. Check your API key.",
      });
    } catch {
      setStatus({ type: "error", message: "Connection test failed." });
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-8">
      <h1 className="text-2xl font-bold text-foreground mb-1">Settings</h1>
      <p className="text-muted-foreground text-sm mb-8">
        Manage your API keys and preferences
      </p>

      <div className="border border-border rounded-lg p-6 bg-white mb-6">
        <h2 className="text-base font-semibold text-foreground mb-4">
          API Configuration
        </h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key" className="text-sm text-foreground">
              API Key
            </Label>
            <Input
              id="api-key"
              type="password"
              placeholder={isConfigured ? "sk-•••••••••" : "bb_..."}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className="bg-white"
            />
            {isConfigured && (
              <p className="text-xs text-primary font-medium">
                An API key is currently configured.
              </p>
            )}
          </div>

          <div className="flex gap-3">
            {isConfigured && (
              <Button
                variant="outline"
                onClick={handleTest}
                disabled={testing}
                className="border-primary text-primary hover:bg-primary/5"
              >
                {testing ? "Testing..." : "Test Connection"}
              </Button>
            )}
            <Button onClick={handleSave} disabled={saving || !apiKey.trim()}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>

          {status.type !== "idle" && (
            <p
              className={`text-sm ${
                status.type === "success" ? "text-primary" : "text-destructive"
              }`}
            >
              {status.message}
            </p>
          )}
        </div>
      </div>

      <div className="border border-border rounded-lg p-6 bg-white">
        <h2 className="text-base font-semibold text-foreground mb-4">
          Voice Preferences
        </h2>
        <VoicePreview />
      </div>
    </div>
  );
}

function VoicePreview() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState("");

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const load = () => {
      const v = window.speechSynthesis
        .getVoices()
        .filter((voice) => voice.lang.startsWith("en"));
      setVoices(v);
      if (v.length > 0 && !selectedVoice) {
        const saved = localStorage.getItem("preppath-voice");
        setSelectedVoice(saved || v[0].voiceURI);
      }
    };

    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [selectedVoice]);

  function handlePreview() {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(
      "Welcome to PrepPath. Let's start your mock interview."
    );
    const voice = voices.find((v) => v.voiceURI === selectedVoice);
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  }

  function handleVoiceChange(voiceURI: string) {
    setSelectedVoice(voiceURI);
    localStorage.setItem("preppath-voice", voiceURI);
  }

  if (voices.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No English voices available in your browser.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="voice-select" className="text-sm text-foreground">
          TTS Voice
        </Label>
        <div className="flex items-center gap-3">
          <select
            id="voice-select"
            value={selectedVoice}
            onChange={(e) => handleVoiceChange(e.target.value)}
            className="flex-1 h-9 rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {voices.map((voice) => (
              <option key={voice.voiceURI} value={voice.voiceURI}>
                {voice.name}
              </option>
            ))}
          </select>
          <button
            onClick={handlePreview}
            className="w-9 h-9 flex items-center justify-center border border-border rounded-md hover:bg-muted transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
