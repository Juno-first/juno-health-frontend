import { z } from 'zod';

export const ServiceSchema = z.object({
  id:          z.string(),
  name:        z.string(),
  description: z.string(),
});

export const OpeningHoursSchema = z.record(z.string(), z.string());

// ── Lookup schema (used by JoinQueuePage) ─────────────────────────────────────
export const FacilityInfoSchema = z.object({
  facilityName:    z.string(),
  facilityAddress: z.string(),
  departmentName:  z.string(),
  openingHours:    z.record(z.string(), z.string()).nullable(),
  services:        z.array(ServiceSchema),
});

export type FacilityInfo = z.infer<typeof FacilityInfoSchema>;
export type Service      = z.infer<typeof ServiceSchema>;

export function parseFacilityInfo(data: unknown): FacilityInfo {
  return FacilityInfoSchema.parse(data);
}

// ── Route schema ──────────────────────────────────────────────────────────────
// geometry is an array of line-strings, each line-string is an array of [lng, lat] pairs

export const RouteSchema = z.object({
  distanceMeters:  z.number(),
  durationSeconds: z.number(),
  durationMinutes: z.number(),
  steps:           z.array(z.string()),
  // array of line-strings → array of [lng, lat] coordinate pairs
  geometry:        z.array(z.array(z.tuple([z.number(), z.number()]))),
});

export type Route = z.infer<typeof RouteSchema>;

// ── Nearby schema (used by EmergencyWatchPage) ────────────────────────────────
export const NearbyFacilitySchema = z.object({
  id:             z.string().uuid(),
  name:           z.string(),
  description:    z.string(),
  facilityType:   z.string(),
  address:        z.string(),
  parish:         z.string(),
  latitude:       z.number(),
  longitude:      z.number(),
  phone:          z.string(),
  nhfAccepted:    z.boolean(),
  checkinCode:    z.string(),
  qrToken:        z.string(),
  createdAt:      z.string(),
  avgWaitMinutes: z.number(),
  services:       z.array(ServiceSchema),
  distanceKm:     z.number(),
  route:          RouteSchema.nullable().optional(),
});

export type NearbyFacility = z.infer<typeof NearbyFacilitySchema>;

export function parseNearbyFacilities(data: unknown): NearbyFacility[] {
  return z.array(NearbyFacilitySchema).parse(data);
}