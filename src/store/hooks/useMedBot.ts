import { useState, useRef, useCallback } from "react";
import { sendMedBotMessage, type MedBotMessage } from "../../libs/api/medbotClient";

export interface MedBotChatMessage {
  id:        string;
  role:      "user" | "assistant";
  content:   string;
  timestamp: Date;
  playing?:  boolean;
}

export function useMedBot(profile: object | null, authToken?: string) {
  const [messages, setMessages] = useState<MedBotChatMessage[]>([]);
  const [history,  setHistory]  = useState<MedBotMessage[]>([]);
  const [typing,   setTyping]   = useState(false);
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

  const playAudio = useCallback((blob: Blob, messageId: string) => {
    cleanupAudio();

    const url   = URL.createObjectURL(blob);
    audioUrlRef.current = url;
    const audio = new Audio(url);
    audioRef.current = audio;

    setMessages(prev =>
      prev.map(m => m.id === messageId ? { ...m, playing: true } : m)
    );

    audio.onended = () => {
      setMessages(prev =>
        prev.map(m => m.id === messageId ? { ...m, playing: false } : m)
      );
      URL.revokeObjectURL(url);
      audioUrlRef.current = null;
    };

    audio.onerror = () => {
      setMessages(prev =>
        prev.map(m => m.id === messageId ? { ...m, playing: false } : m)
      );
    };

    audio.play().catch(() => {
      setMessages(prev =>
        prev.map(m => m.id === messageId ? { ...m, playing: false } : m)
      );
    });
  }, [cleanupAudio]);

  const send = useCallback(async (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed || typing) return;

    const userId = crypto.randomUUID();
    setError(null);
    setMessages(prev => [...prev, {
      id:        userId,
      role:      "user",
      content:   trimmed,
      timestamp: new Date(),
    }]);
    setTyping(true);

    try {
      const { text, audioBlob } = await sendMedBotMessage(
        trimmed, history, profile, authToken
      );

      const assistantId = crypto.randomUUID();

      setMessages(prev => [
        ...prev,
        { id: assistantId, role: "assistant", content: text, timestamp: new Date(), playing: false },
      ]);

      setTimeout(() => playAudio(audioBlob, assistantId), 50);

      setHistory(prev => [
        ...prev,
        { role: "user",      content: trimmed },
        { role: "assistant", content: text    },
      ]);

    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      setMessages(prev => [...prev, {
        id:        crypto.randomUUID(),
        role:      "assistant",
        content:   "I couldn't connect right now. Please try again.",
        timestamp: new Date(),
      }]);
    } finally {
      setTyping(false);
    }
  }, [typing, history, profile, authToken, playAudio]);

  const reset = useCallback(() => {
    cleanupAudio();
    setMessages([]);
    setHistory([]);
    setError(null);
    setTyping(false);
  }, [cleanupAudio]);

  const started = messages.length > 0;

  return { messages, typing, error, started, send, reset };
}