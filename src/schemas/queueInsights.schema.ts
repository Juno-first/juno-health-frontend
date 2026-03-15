import { z } from 'zod';

export const InsightSeveritySchema = z.enum([
  'LOW',
  'MODERATE',
  'HIGH',
  'CRITICAL',
]);

export const InsightTypeSchema = z.enum([
  'CRITICAL',
  'PATIENT_RISK',
  'DETERIORATION_RISK',
  'ESCALATION_REQUIRED',
  'WAIT_RISK',
  'QUEUE_GROWTH',
  'QUEUE_SURGE',
  'QUEUE_STAGNATION',
  'CAPACITY_WARNING',
  'CAPACITY_AVAILABLE',
  'THROUGHPUT_DROP',
  'EFFICIENCY_GAIN',
  'STAFFING_SHORTAGE',
  'STAFFING_AVAILABLE',
  'ROOM_UTILIZATION',
  'ROOM_BLOCKED',
  'PATTERN',
  'SYMPTOM_CLUSTER',
  'TIME_PATTERN',
  'SURGE_PREDICTION',
  'QUEUE_COLLAPSE_RISK',
  'DELAY_FORECAST',
  'FLOW_IMBALANCE',
  'TRANSFER_OPPORTUNITY',
  'BOTTLENECK',
  'INSIGHT',
  'STATUS_UPDATE',
  'TREND',
  'SUGGESTION',
  'PATIENT_CHECK_RESULT',
]);

export const QueueInsightSchema = z.object({
  type: InsightTypeSchema,
  severity: InsightSeveritySchema,
  title: z.string(),
  message: z.string(),
  confidence: z.number().min(0).max(1),
  subjectPosition: z.number().int().min(1).nullish(),
});

export const QueueInsightsPayloadSchema = z.object({
  departmentId:   z.string().uuid(),
  facilityName:   z.string(),
  departmentName: z.string(),
  source:         z.string().optional(),      // ← add
  eventType:      z.string().optional(),      // ← was required, now optional
  generatedAt:    z.string().optional(),      // ← was required, now optional
  queueDepth:     z.number().int().optional(), // ← was required, now optional
  insights:       z.array(QueueInsightSchema),
});

export const QueueInsightsSocketMessageSchema = z.object({
  type: z.literal('QUEUE_INSIGHTS'),
  data: QueueInsightsPayloadSchema,
});

export type QueueInsight = z.infer<typeof QueueInsightSchema>;
export type QueueInsightsPayload = z.infer<typeof QueueInsightsPayloadSchema>;
export type QueueInsightsSocketMessage = z.infer<typeof QueueInsightsSocketMessageSchema>;

export function parseQueueInsightsMessage(body: string): QueueInsightsSocketMessage | null {
  try {
    const json = JSON.parse(body);
    const result = QueueInsightsSocketMessageSchema.safeParse(json);

    if (!result.success) {
      console.warn('[JUNO Insights WS] Unrecognised frame:', json, result.error.flatten());
      return null;
    }

    return result.data;
  } catch {
    console.warn('[JUNO Insights WS] Non-JSON frame:', body);
    return null;
  }
}