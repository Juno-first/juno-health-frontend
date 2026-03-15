import { z } from 'zod';

// ── Request ───────────────────────────────────────────────────────────────────

export const OnboardingSurveyRequestSchema = z.object({
  // Demographics
  heightCm:             z.number().positive().nullable().optional(),
  weightKg:             z.number().positive().nullable().optional(),
  waistCircumferenceCm: z.number().positive().nullable().optional(),
  pregnancyStatus:      z.string().nullable().optional(),

  // Conditions
  conditionsNone:       z.boolean().nullable().optional(),
  conditionsSelected:   z.array(z.string()).nullable().optional(),
  conditionsOtherText:  z.string().nullable().optional(),
  surgicalHistory:      z.array(z.string()).nullable().optional(),

  // Medications
  medications: z.array(z.object({
    name:      z.string(),
    dosage:    z.string(),
    frequency: z.string(),
    doctor:    z.string().optional(),
    pharmacy:  z.string().optional(),
  })).nullable().optional(),

  // Allergies
  allergies: z.array(z.object({
    name:     z.string(),
    severity: z.string(),
    reaction: z.string(),
  })).nullable().optional(),

  // Family history — { mother: string[], father: string[], ... }
  familyHistory: z.record(z.string(), z.array(z.string())).nullable().optional(),

  // Lifestyle
  smokingStatus:         z.string().nullable().optional(),
  alcoholFrequency:      z.string().nullable().optional(),
  physicalActivityLevel: z.string().nullable().optional(),
  dietPattern:           z.string().nullable().optional(),
  sleepPattern:          z.string().nullable().optional(),
  lifestyleNotes:        z.string().nullable().optional(),

  // Completion flag
  markCompleted: z.boolean().default(false),
});

export type OnboardingSurveyRequest = z.infer<typeof OnboardingSurveyRequestSchema>;

// ── Response ──────────────────────────────────────────────────────────────────

export const OnboardingSurveyResponseSchema = z.object({
  id:                   z.string().uuid(),
  heightCm:             z.number().nullable().optional(),
  weightKg:             z.number().nullable().optional(),
  waistCircumferenceCm: z.number().nullable().optional(),
  pregnancyStatus:      z.string().nullable().optional(),

  conditionsNone:       z.boolean().nullable().optional(),
  conditionsSelected:   z.array(z.string()).nullable().optional(),
  conditionsOtherText:  z.string().nullable().optional(),
  surgicalHistory:      z.array(z.string()).nullable().optional(),

  medications: z.array(z.object({
    name:      z.string(),
    dosage:    z.string(),
    frequency: z.string(),
    doctor:    z.string().optional(),
    pharmacy:  z.string().optional(),
  })).nullable().optional(),

  allergies: z.array(z.object({
    name:     z.string(),
    severity: z.string(),
    reaction: z.string(),
  })).nullable().optional(),

  familyHistory: z.record(z.string(), z.array(z.string())).nullable().optional(),

  smokingStatus:         z.string().nullable().optional(),
  alcoholFrequency:      z.string().nullable().optional(),
  physicalActivityLevel: z.string().nullable().optional(),
  dietPattern:           z.string().nullable().optional(),
  sleepPattern:          z.string().nullable().optional(),
  lifestyleNotes:        z.string().nullable().optional(),

  completed:     z.boolean(),
  completedAt:   z.string().nullable().optional(),
  lastUpdatedAt: z.string().nullable().optional(),
});

export type OnboardingSurveyResponse = z.infer<typeof OnboardingSurveyResponseSchema>;