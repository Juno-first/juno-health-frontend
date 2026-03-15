import { z } from 'zod';

// ── Enums ──────────────────────────────────────────────────────────────────────

export const PriorityTierSchema =z.enum(['RESUSCITATION', 'EMERGENCY', 'URGENT', 'SEMI_URGENT', 'NON_URGENT'])
export type PriorityTier = z.infer<typeof PriorityTierSchema>;

export const QueueStatusValueSchema = z.enum([
  'CHECKED_IN',
  'CALLED',
  'DISCHARGED',
  'LEFT_QUEUE',
  'CANCELLED',
  'IN_PROGRESS'
]);
export type QueueStatusValue = z.infer<typeof QueueStatusValueSchema>;

export const SymptomSeveritySchema = z.enum(['MILD', 'MODERATE', 'SEVERE', 'EMERGENCY']);
export type SymptomSeverity = z.infer<typeof SymptomSeveritySchema>;

export const SymptomCategorySchema = z.enum([
  'CHEST_PAIN', 'DIFFICULTY_BREATHING', 'DIZZINESS', 'VOMITING',
  'BLEEDING', 'FEVER', 'INJURY', 'ALLERGIC_REACTION',
]);
export type SymptomCategory = z.infer<typeof SymptomCategorySchema>;

export const SymptomDurationSchema = z.enum([
  'UNDER_1_HOUR', '1_TO_6_HOURS', '6_TO_24_HOURS', 'OVER_24_HOURS',
]);
export type SymptomDuration = z.infer<typeof SymptomDurationSchema>;

export const VisitTypeSchema = z.enum(['WALK_IN', 'EMERGENCY']);
export const CheckInMethodSchema = z.enum(['QR', 'CODE']);

// ── REST: GET /api/v1/queue/status ─────────────────────────────────────────────

export const QueueStatusSchema = z.object({
  visitId: z.string().uuid(),
  queueEntryId: z.string().uuid(),
  position: z.number().int().positive(),
  queueDepth: z.number().int().nonnegative(),
  priorityTier: PriorityTierSchema,
  aiPriorityScore: z.number(),
  estimatedWaitMinutes: z.number().int().nonnegative(),
  facilityName: z.string(),
  departmentName: z.string(),
  status: z.string(),
  qrToken: z.string(),
  checkinCode: z.string(),
  checkedInAt: z.string(),

  roomName: z.string().nullable().optional(),
  assignedStaffName: z.string().nullable().optional(),
  assignedStaffRole: z.string().nullable().optional(),
});

export type QueueStatus = z.infer<typeof QueueStatusSchema>;

// ── REST: POST /api/v1/queue/checkin ───────────────────────────────────────────

export const CheckInRequestSchema = z.object({
  method: CheckInMethodSchema,
  token: z.string().min(1),
  presentingComplaint: z.string().min(1),
  symptomSeverity: SymptomSeveritySchema,
  painLevel: z.number().int().min(0).max(10),
  symptomCategories: z.array(SymptomCategorySchema).min(1),
  symptomDuration: SymptomDurationSchema,
  additionalNotes: z.string().nullable().optional(),
  visitType: VisitTypeSchema,
});

export type CheckInRequest = z.infer<typeof CheckInRequestSchema>;

// ── WebSocket events ───────────────────────────────────────────────────────────

export const WsQueueEventTypeSchema = z.enum([
  'CHECKED_IN',
  'POSITION_UPDATED',
  'QUEUE_UPDATED',
  'CALLED',
  'LEFT_QUEUE',
  'DISCHARGED',
]);
export type WsQueueEventType = z.infer<typeof WsQueueEventTypeSchema>;

export const WsQueueEventSchema = z.object({
  eventType: WsQueueEventTypeSchema,
  departmentId: z.string().uuid(),
  patientId: z.string().uuid(),
  visitId: z.string().uuid(),
  queueEntryId: z.string().uuid(),
  position: z.number().int().min(0),
  queueDepth: z.number().int().min(0),
  priorityTier: PriorityTierSchema,
  estimatedWaitMinutes: z.number(),
  status: QueueStatusValueSchema,

  roomName: z.string().nullable().optional(),
  assignedStaffName: z.string().nullable().optional(),
  assignedStaffRole: z.string().nullable().optional(),
});

export type WsQueueEvent = z.infer<typeof WsQueueEventSchema>;

export const PushSubscribeRequestSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({ p256dh: z.string(), auth: z.string() }),
  queueEntryId: z.string().uuid().optional(),
});
export type PushSubscribeRequest = z.infer<typeof PushSubscribeRequestSchema>;

export function parseQueueStatus(data: unknown): QueueStatus {
  return QueueStatusSchema.parse(data);
}

export function parseWsQueueEvent(body: string): WsQueueEvent | null {
  try {
    const json = JSON.parse(body);
    const result = WsQueueEventSchema.safeParse(json);
    if (!result.success) {
      console.warn('[JUNO WS] Unrecognised frame:', json, result.error.flatten());
      return null;
    }
    return result.data;
  } catch {
    console.warn('[JUNO WS] Non-JSON frame:', body);
    return null;
  }
}

export const SEVERITY_MAP: Record<string, SymptomSeverity> = {
  mild: 'MILD',
  moderate: 'MODERATE',
  severe: 'SEVERE',
  emergency: 'EMERGENCY',
};

export const CATEGORY_MAP: Record<string, SymptomCategory> = {
  chest: 'CHEST_PAIN',
  breathing: 'DIFFICULTY_BREATHING',
  dizziness: 'DIZZINESS',
  vomiting: 'VOMITING',
  bleeding: 'BLEEDING',
  fever: 'FEVER',
  injury: 'INJURY',
  allergy: 'ALLERGIC_REACTION',
};

export const DURATION_MAP: Record<string, SymptomDuration> = {
  'less-1h': 'UNDER_1_HOUR',
  '1-6h': '1_TO_6_HOURS',
  '6-24h': '6_TO_24_HOURS',
  'more-1d': 'OVER_24_HOURS',
};