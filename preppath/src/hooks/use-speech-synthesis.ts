"use client";

import { useState, useCallback, useEffect, useRef } from "react";

interface UseSpeechSynthesisOptions {
  rate?: number;
  pitch?: number;
  voiceURI?: string;
  onEnd?: () => void;
}

function splitIntoChunks(text: string, maxLen = 180): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+\s*/g);
  if (!sentences) return text.length > 0 ? [text] : [];

  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if (current.length + sentence.length > maxLen && current.length > 0) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

export function useSpeechSynthesis(options: UseSpeechSynthesisOptions = {}) {
  const { rate = 1, pitch = 1, voiceURI, onEnd } = options;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSupported, setIsSupported] = useState(false);
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelledRef = useRef(false);
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    setIsSupported(true);

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const clearKeepAlive = useCallback(() => {
    if (keepAliveRef.current) {
      clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }
  }, []);

  const getVoice = useCallback((): SpeechSynthesisVoice | null => {
    const available = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
    if (voiceURI) {
      return available.find((v) => v.voiceURI === voiceURI) || null;
    }
    return (
      available.find((v) => v.lang.startsWith("en") && v.localService) ||
      available.find((v) => v.lang.startsWith("en")) ||
      null
    );
  }, [voices, voiceURI]);

  const speak = useCallback(
    (text: string) => {
      if (!isSupported) {
        onEndRef.current?.();
        return;
      }

      window.speechSynthesis.cancel();
      clearKeepAlive();
      cancelledRef.current = false;

      const chunks = splitIntoChunks(text);
      if (chunks.length === 0) {
        onEndRef.current?.();
        return;
      }

      const voice = getVoice();
      let index = 0;

      const speakNext = () => {
        if (cancelledRef.current || index >= chunks.length) {
          setIsSpeaking(false);
          clearKeepAlive();
          if (!cancelledRef.current) onEndRef.current?.();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(chunks[index]);
        utterance.rate = rate;
        utterance.pitch = pitch;
        if (voice) utterance.voice = voice;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
          index++;
          speakNext();
        };
        utterance.onerror = (e) => {
          if (e.error === "canceled" || cancelledRef.current) return;
          index++;
          speakNext();
        };

        window.speechSynthesis.speak(utterance);
      };

      keepAliveRef.current = setInterval(() => {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 5000);

      setIsSpeaking(true);
      speakNext();
    },
    [isSupported, rate, pitch, getVoice, clearKeepAlive]
  );

  const cancel = useCallback(() => {
    if (!isSupported) return;
    cancelledRef.current = true;
    clearKeepAlive();
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported, clearKeepAlive]);

  useEffect(() => {
    return () => {
      clearKeepAlive();
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [clearKeepAlive]);

  return { isSpeaking, voices, isSupported, speak, cancel };
}
