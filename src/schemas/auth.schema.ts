import { z } from 'zod';

// ── Login form ─────────────────────────────────────────────────────────────────

export const LoginFormSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

export type LoginFormData = z.infer<typeof LoginFormSchema>;

// ── API request / response shapes ─────────────────────────────────────────────

export const RefreshRequestSchema = z.object({
  refreshToken: z.string().min(1),
});

export type RefreshRequest = z.infer<typeof RefreshRequestSchema>;

export const AuthResponseSchema = z.object({
  accessToken:  z.string().min(1, 'Missing access token'),
  refreshToken: z.string().min(1, 'Missing refresh token'),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

// ── Decoded JWT payload ────────────────────────────────────────────────────────

// ── Shared base claims (present on every token) ────────────────────────────────

const BasePayloadSchema = z.object({
  sub:         z.string().uuid('Invalid subject UUID'),
  email:       z.string().email('Invalid email in token'),
  firstName:   z.string().optional(),   // ← was .min(1)
  lastName:    z.string().optional(),   // ← was .min(1)
  iat:         z.number().int().positive(),
  exp:         z.number().int().positive(),
});
// ── PATIENT token ──────────────────────────────────────────────────────────────

export const PatientPayloadSchema = BasePayloadSchema.extend({
  accountType: z.literal('PATIENT'),
  patientId:   z.string().uuid('Invalid patientId UUID'),
});

export type PatientPayload = z.infer<typeof PatientPayloadSchema>;

// ── STAFF token ────────────────────────────────────────────────────────────────

export const StaffRoleSchema = z.enum(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']);
export type StaffRole = z.infer<typeof StaffRoleSchema>;

export const StaffPayloadSchema = BasePayloadSchema.extend({
  accountType: z.literal('STAFF'),
  staffRole:   StaffRoleSchema,
  staffId:     z.string().uuid('Invalid staffId UUID'),
});

export type StaffPayload = z.infer<typeof StaffPayloadSchema>;

// ── Discriminated union ────────────────────────────────────────────────────────

export const TokenPayloadSchema = z.discriminatedUnion('accountType', [
  PatientPayloadSchema,
  StaffPayloadSchema,
]);

export type TokenPayload = z.infer<typeof TokenPayloadSchema>;
export type AccountType  = TokenPayload['accountType'];

// ── Runtime validators ─────────────────────────────────────────────────────────
// Use these anywhere you receive untrusted data (API responses, decoded JWTs)

/**
 * Validates and parses the login API response.
 * Throws a ZodError if the shape is wrong.
 */
export function parseAuthResponse(data: unknown): AuthResponse {
  return AuthResponseSchema.parse(data);
}

/**
 * Decodes a JWT and validates the payload shape.
 * Throws a ZodError if any field is missing or the wrong type.
 */
export function parseTokenPayload(token: string): TokenPayload {
  const [, payload] = token.split('.');
  if (!payload) throw new Error('Malformed JWT: missing payload segment');

  const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
  const raw  = JSON.parse(json);

  return TokenPayloadSchema.parse(raw);
}

export const RegisterRequestSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  parishOfResidence: z.string().min(1, "Parish is required"),
  languagePreference: z.string().min(1, "Language preference is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  phone: z.string().min(1, "Phone is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
