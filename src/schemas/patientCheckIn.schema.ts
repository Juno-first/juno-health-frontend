import { z } from 'zod';

// ── Question types ─────────────────────────────────────────────────────────────

export const QuestionTypeSchema = z.enum(['YES_NO', 'MCQ']);
export type QuestionType = z.infer<typeof QuestionTypeSchema>;

// ── Incoming: server → patient ─────────────────────────────────────────────────

export const CheckInQuestionSchema = z.object({
  type:         z.literal('CHECK_IN_QUESTION'),
  questionId:   z.string().uuid(),
  question:     z.string(),
  questionType: QuestionTypeSchema,
  options:      z.array(z.string()).nullable(),
  audioBase64:  z.string(),
});
export type CheckInQuestion = z.infer<typeof CheckInQuestionSchema>;

export const CheckInAnswerAckSchema = z.object({
  type: z.literal('CHECK_IN_ANSWER_ACK'),
});
export type CheckInAnswerAck = z.infer<typeof CheckInAnswerAckSchema>;

// Union of all incoming message types
export const PatientWsIncomingSchema = z.discriminatedUnion('type', [
  CheckInQuestionSchema,
  CheckInAnswerAckSchema,
]);
export type PatientWsIncoming = z.infer<typeof PatientWsIncomingSchema>;

// ── Outgoing: patient → server ─────────────────────────────────────────────────

export interface CheckInAnswer {
  type:       'CHECK_IN_ANSWER';
  questionId: string;
  answer:     string;
}

// ── Parser ─────────────────────────────────────────────────────────────────────

export function parsePatientWsMessage(raw: string): PatientWsIncoming | null {
  try {
    const parsed = PatientWsIncomingSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      console.warn('[patientCheckIn] Unknown message shape:', parsed.error.issues);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}