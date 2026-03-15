import { z } from 'zod';
import {
  QueueStatusValueSchema,
  SymptomSeveritySchema,
  SymptomCategorySchema,
  SymptomDurationSchema,
  PriorityTierSchema,
  VisitTypeSchema,
} from './queue.schema';

// ── Admin queue entry (one row in the department queue) ───────────────────────

export const AdminQueueEntrySchema = z.object({
  queueEntryId:         z.string().uuid(),
  visitId:              z.string().uuid(),
  patientId:            z.string().uuid(),
  patientName:          z.string(),
  age:                  z.number().int().optional(),
  departmentName:       z.string().optional(),
  checkinCode:          z.string().optional(),
  position:             z.number().int().min(1),
  queueDepth:           z.number().int().min(0).optional(),
  priorityTier:         PriorityTierSchema,
  aiPriorityScore:      z.number(),
  status:               QueueStatusValueSchema,
  visitType:            VisitTypeSchema.optional(),
  symptomSeverity:      SymptomSeveritySchema,
  symptomCategories:    z.array(SymptomCategorySchema),
  symptomDuration:      SymptomDurationSchema,
  presentingComplaint:  z.string(),
  painLevel:            z.number().int().min(0).max(10),
  additionalNotes:      z.string().nullable().optional(),
  checkedInAt:          z.string(),   // ISO string
  estimatedWaitMinutes: z.number().optional(),
  assignedTo:           z.string().nullable().optional(),
});

export type AdminQueueEntry = z.infer<typeof AdminQueueEntrySchema>;

// ── Department queue REST response ────────────────────────────────────────────
// GET /api/v1/queue/department/{departmentId}

export const DepartmentQueueSchema = z.object({
  departmentId:       z.string().uuid(),
  departmentName:     z.string(),
  facilityName:       z.string(),
  totalInQueue:       z.number().int(),
  averageWaitMinutes: z.number(),
  entries:            z.array(AdminQueueEntrySchema),
});

export type DepartmentQueue = z.infer<typeof DepartmentQueueSchema>;

// ── WebSocket event types ─────────────────────────────────────────────────────
// Topic: /topic/queue/{departmentId}

export const AdminWsEventTypeSchema = z.enum([
  'CHECKED_IN',    // new patient joined → add to board
  'CALLED',        // staff called patient → update status to CALLED
  'QUEUE_UPDATED', // someone left, others shifted → update position + estimatedWaitMinutes
  'DISCHARGED',    // patient discharged → remove from board
  'LEFT_QUEUE',    // patient left voluntarily → remove from board
]);
export type AdminWsEventType = z.infer<typeof AdminWsEventTypeSchema>;

// Every event ships the full entry — the eventType tells you what to do with it
export const AdminWsEventSchema = AdminQueueEntrySchema.extend({
  eventType:    AdminWsEventTypeSchema,
  departmentId: z.string().uuid(),
});
export type AdminWsEvent = z.infer<typeof AdminWsEventSchema>;

export function parseAdminWsEvent(body: string): AdminWsEvent | null {
  try {
    const json   = JSON.parse(body);
    const result = AdminWsEventSchema.safeParse(json);
    if (!result.success) {
      console.warn('[JUNO Admin WS] Unrecognised frame:', json, result.error.flatten());
      return null;
    }
    return result.data;
  } catch {
    console.warn('[JUNO Admin WS] Non-JSON frame:', body);
    return null;
  }
}

// ── Priority tier display config ───────────────────────────────────────────────

export type PriorityTier = z.infer<typeof PriorityTierSchema>;

export const PRIORITY_CONFIG: Record<PriorityTier, {
  label: string; bg: string; text: string; border: string; dot: string; order: number;
}> = {
  RESUSCITATION: { label: "Resuscitation", bg: "bg-black",       text: "text-white",    border: "border-black",       dot: "bg-white",      order: 1 },
  EMERGENCY:     { label: "Emergency",     bg: "bg-red-600",     text: "text-white",    border: "border-red-600",     dot: "bg-red-600",    order: 2 },
  URGENT:        { label: "Urgent",        bg: "bg-orange-500",  text: "text-white",    border: "border-orange-500",  dot: "bg-orange-500", order: 3 },
  SEMI_URGENT:   { label: "Semi-Urgent",   bg: "bg-yellow-400",  text: "text-gray-900", border: "border-yellow-400",  dot: "bg-yellow-400", order: 4 },
  NON_URGENT:    { label: "Non-Urgent",    bg: "bg-green-500",   text: "text-white",    border: "border-green-500",   dot: "bg-green-500",  order: 5 },
};

export const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  CHECKED_IN:  { label: "Waiting",     bg: "bg-blue-100",   text: "text-blue-700"   },
  CALLED:      { label: "Called",      bg: "bg-purple-100", text: "text-purple-700" },
  IN_PROGRESS: { label: "In Progress", bg: "bg-purple-100", text: "text-purple-700" },
  COMPLETED:   { label: "Completed",   bg: "bg-green-100",  text: "text-green-700"  },
  CANCELLED:   { label: "Cancelled",   bg: "bg-gray-100",   text: "text-gray-600"   },
};

export const SEVERITY_LABEL: Record<string, string> = {
  MILD:      "Mild",
  MODERATE:  "Moderate",
  SEVERE:    "Severe",
  EMERGENCY: "Emergency",
};

export const CATEGORY_LABEL: Record<string, string> = {
  CHEST_PAIN:           "Chest Pain",
  DIFFICULTY_BREATHING: "Breathing",
  DIZZINESS:            "Dizziness",
  VOMITING:             "Vomiting",
  BLEEDING:             "Bleeding",
  FEVER:                "Fever",
  INJURY:               "Injury",
  ALLERGIC_REACTION:    "Allergy",
};

// ── Available Room ─────────────────────────────────────────────────────────────

export const AvailableRoomSchema = z.object({
  id:                z.string().uuid(),
  name:              z.string(),
  description:       z.string().default(""),
  isAvailable:       z.boolean(),
  assignedStaffId:   z.string().uuid().optional(),
  assignedStaffName: z.string().optional(),
});

export type AvailableRoom = z.infer<typeof AvailableRoomSchema>;