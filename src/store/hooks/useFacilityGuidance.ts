import { useState, useRef, useCallback } from "react";
import { requestFacilityGuidance, type GuidanceMessage } from "../../libs/api/voiceAssistantClient";
import type { NearbyFacility } from "../../schemas/facility.schema";

export interface GuidanceChatMessage {
  role: "user" | "assistant";
  text: string;
  playing?: boolean;
}

export function useFacilityGuidance(
  facilities: NearbyFacility[],
  authToken?: string
) {
  const [messages, setMessages] = useState<GuidanceChatMessage[]>([]);
  const [history,  setHistory]  = useState<GuidanceMessage[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const audioRef    = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, []);

  const playAudio = useCallback((blob: Blob, messageIndex: number) => {
    cleanupAudio();

    const url = URL.createObjectURL(blob);
    audioUrlRef.current = url;

    const audio = new Audio(url);
    audioRef.current = audio;

    setMessages(prev =>
      prev.map((m, i) => i === messageIndex ? { ...m, playing: true } : m)
    );

    audio.onended = () => {
      setMessages(prev =>
        prev.map((m, i) => i === messageIndex ? { ...m, playing: false } : m)
      );
      URL.revokeObjectURL(url);
      audioUrlRef.current = null;
    };

    audio.onerror = () => {
      setMessages(prev =>
        prev.map((m, i) => i === messageIndex ? { ...m, playing: false } : m)
      );
    };

    audio.play().catch(() => {
      setMessages(prev =>
        prev.map((m, i) => i === messageIndex ? { ...m, playing: false } : m)
      );
    });
  }, [cleanupAudio]);

  const send = useCallback(async (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed || loading || facilities.length === 0) return;

    setError(null);
    setMessages(prev => [...prev, { role: "user", text: trimmed }]);
    setLoading(true);

    try {
      const { audioBlob, text } = await requestFacilityGuidance(
        { facilities, prompt: trimmed, history },
        authToken
      );

      setMessages(prev => {
        const next = [...prev, { role: "assistant" as const, text, playing: false }];
        setTimeout(() => playAudio(audioBlob, next.length - 1), 50);
        return next;
      });

      setHistory(prev => [
        ...prev,
        { role: "user",      content: trimmed },
        { role: "assistant", content: text    },
      ]);

    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      setMessages(prev => [...prev, {
        role: "assistant",
        text: "I couldn't connect right now. Please try again.",
      }]);
    } finally {
      setLoading(false);
    }
  }, [loading, facilities, history, authToken, playAudio]);

  const reset = useCallback(() => {
    cleanupAudio();
    setMessages([]);
    setHistory([]);
    setError(null);
    setLoading(false);
  }, [cleanupAudio]);

  const isPlaying = messages.some(m => m.playing);

  return {
    messages,
    loading,
    error,
    isPlaying,
    send,
    reset,
  };
}