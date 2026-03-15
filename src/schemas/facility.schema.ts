import { z } from 'zod';

export const ServiceSchema = z.object({
  id:          z.string(),
  name:        z.string(),
  description: z.string(),
});

export const OpeningHoursSchema = z.record(z.string(), z.string());

export const FacilityInfoSchema = z.object({
  facilityName: z.string(),
  facilityAddress: z.string(),
  departmentName: z.string(),
  openingHours: z.record(z.string(), z.string()).nullable(),
  services: z.array(ServiceSchema),
});

export type FacilityInfo = z.infer<typeof FacilityInfoSchema>;
export type Service      = z.infer<typeof ServiceSchema>;

export function parseFacilityInfo(data: unknown): FacilityInfo {
  return FacilityInfoSchema.parse(data);
}