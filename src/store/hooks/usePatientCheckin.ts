import { useState, useEffect, useCallback, useRef } from 'react';
import { patientCheckInSocket, type PatientCheckInStatus } from '../../libs/socket/patientCheckInSocket';
import { type CheckInQuestion } from '../../schemas/patientCheckIn.schema';
import { useAppSelector } from './hooks';

export interface UsePatientCheckInResult {
  question:       CheckInQuestion | null;
  socketStatus:   PatientCheckInStatus;
  answered:       boolean;         // true while waiting for ACK after submitting
  submitAnswer:   (answer: string) => void;
  dismissQuestion:() => void;
}

export function usePatientCheckIn(visitId: string | undefined): UsePatientCheckInResult {
  const accessToken = useAppSelector(s => s.user.accessToken);

  const [question,     setQuestion]     = useState<CheckInQuestion | null>(null);
  const [socketStatus, setSocketStatus] = useState<PatientCheckInStatus>('idle');
  const [answered,     setAnswered]     = useState(false);

  // Keep a ref to the current audio element so we can revoke the URL on cleanup
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ── Play audio from base64 ─────────────────────────────────────────────────
  const playAudio = useCallback((base64: string) => {
    try {
      // Cleanup any previous audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const binary = atob(base64);
      const bytes  = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'audio/mpeg' });
      const url  = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };

      audio.play().catch(() => {
        // Browser blocked autoplay — question text is still shown so patient can tap play
        console.warn('[patientCheckIn] Autoplay blocked — question shown without audio');
      });
    } catch (e) {
      console.error('[patientCheckIn] Audio decode error', e);
    }
  }, []);

  // ── Socket lifecycle ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!visitId || !accessToken) return;

    patientCheckInSocket.connect(visitId, accessToken, {
      onStatusChange: setSocketStatus,
      onMessage: (msg) => {
        if (msg.type === 'CHECK_IN_QUESTION') {
          setQuestion(msg);
          setAnswered(false);
          playAudio(msg.audioBase64);
        }

        if (msg.type === 'CHECK_IN_ANSWER_ACK') {
          // Server confirmed — dismiss
          setQuestion(null);
          setAnswered(false);
        }
      },
    });

    return () => {
      patientCheckInSocket.disconnect();
    };
  }, [visitId, accessToken, playAudio]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const submitAnswer = useCallback((answer: string) => {
    if (!question) return;
    setAnswered(true);
    patientCheckInSocket.sendAnswer({
      type:       'CHECK_IN_ANSWER',
      questionId: question.questionId,
      answer,
    });
  }, [question]);

  // Allow manual dismiss (e.g. patient closes popup without answering)
  const dismissQuestion = useCallback(() => {
    setQuestion(null);
    setAnswered(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  return { question, socketStatus, answered, submitAnswer, dismissQuestion };
}