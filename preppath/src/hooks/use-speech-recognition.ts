"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface UseSpeechRecognitionOptions {
  onResult?: (transcript: string) => void;
  onEnd?: (finalTranscript: string) => void;
  silenceTimeout?: number;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const { onResult, onEnd, silenceTimeout = 2000 } = options;
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<ReturnType<typeof createRecognition> | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const finalTranscriptRef = useRef("");

  useEffect(() => {
    setIsSupported(
      typeof window !== "undefined" &&
        ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    );
  }, []);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    clearSilenceTimer();
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, [clearSilenceTimer]);

  const start = useCallback(() => {
    if (!isSupported) return;

    stop();

    finalTranscriptRef.current = "";
    setTranscript("");

    const recognition = createRecognition();
    if (!recognition) return;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      clearSilenceTimer();

      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (final) {
        finalTranscriptRef.current += final;
      }

      const currentText = finalTranscriptRef.current + interim;
      setTranscript(currentText);
      onResult?.(currentText);

      silenceTimerRef.current = setTimeout(() => {
        const finalText = finalTranscriptRef.current || currentText;
        stop();
        onEnd?.(finalText.trim());
      }, silenceTimeout);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== "aborted") {
        console.error("Speech recognition error:", event.error);
      }
      stop();
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, stop, onResult, onEnd, silenceTimeout, clearSilenceTimer]);

  useEffect(() => {
    return () => {
      clearSilenceTimer();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [clearSilenceTimer]);

  return { isListening, transcript, isSupported, start, stop };
}

function createRecognition() {
  if (typeof window === "undefined") return null;
  const SR =
    (window as unknown as Record<string, unknown>).SpeechRecognition ||
    (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
  if (!SR) return null;
  return new (SR as new () => SpeechRecognition)();
}

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  0: { transcript: string };
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}
