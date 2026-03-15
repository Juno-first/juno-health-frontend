import type { NearbyFacility } from "../../schemas/facility.schema";
export interface VoiceAssistantPayload {
  method: string;
  token: string;
  presentingComplaint: string;
  symptomSeverity: string;
  painLevel: number;
  symptomCategories: string[];
  symptomDuration: string;
  additionalNotes?: string | null;
  visitType: string;

  facilityName?: string;
  departmentName?: string;
  queuePosition?: number;
  queueDepth?: number;
  estimatedWaitMinutes?: number;
  checkinCode?: string;
  queueEntryId?: string;
  checkedInAt?: string;
  patientName?: string | null;
}

export interface QueueAudioPayload {
  eventType: "CALLED" | "POSITION_CHANGED" | "WAIT_TIME_CHANGED" | "STATUS_CHANGED";
  facilityName: string;
  departmentName: string;
  position: number;
  queueDepth: number;
  estimatedWaitMinutes: number;
  checkinCode: string;
  priorityTier: string;
  roomName?: string | null;
  assignedStaffName?: string | null;
  assignedStaffRole?: string | null;
}

export interface VoiceAssistantResponse {
  audioBlob: Blob;
  script: string;
}

const AI_API_BASE = import.meta.env.VITE_AI_API_URL ?? "http://localhost:8000";

export async function requestWelcomeAudio(
  payload: VoiceAssistantPayload,
  authToken?: string
): Promise<VoiceAssistantResponse> {
  const response = await fetch(`${AI_API_BASE}/check-in`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(errText || "Failed to generate voice welcome");
  }

  const audioBlob = await response.blob();
  const script = response.headers.get("X-Generated-Script") ?? "";

  return { audioBlob, script };
}

export async function requestQueueAudio(
  payload: QueueAudioPayload,
  authToken?: string
): Promise<VoiceAssistantResponse> {
  const response = await fetch(`${AI_API_BASE}/queue-update`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(errText || "Failed to generate queue audio");
  }

  const audioBlob = await response.blob();
  const script = response.headers.get("X-Generated-Script") ?? "";

  return { audioBlob, script };
}
export interface GuidanceMessage {
  role: "user" | "assistant";
  content: string;
}

export interface FacilityGuidancePayload {
  facilities: NearbyFacility[];
  prompt: string;
  history: GuidanceMessage[];
  symptomDescription?: string;
}

export interface FacilityGuidanceResponse {
  audioBlob: Blob;
  text: string;
}

export async function requestFacilityGuidance(
  payload: FacilityGuidancePayload,
  authToken?: string
): Promise<FacilityGuidanceResponse> {
  // strip route field — backend doesn't need it
  const facilities = payload.facilities.map(({ route, ...rest }) => rest);

  const response = await fetch(`${AI_API_BASE}/facility/guidance`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify({ ...payload, facilities }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(errText || "Failed to generate facility guidance");
  }

  const audioBlob = await response.blob();
  const text = response.headers.get("X-Juno-Text") ?? "";

  return { audioBlob, text };
}