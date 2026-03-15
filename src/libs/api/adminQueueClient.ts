import axios from 'axios';
import type { AdminQueueEntry } from '../../schemas/adminQueue.schema';
import { AvailableRoomSchema, type AvailableRoom } from '../../schemas/adminQueue.schema';

export type { AvailableRoom };
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1';
const AI_BASE = import.meta.env.VITE_AI_API_URL ?? 'http://localhost:8000';

function authHeader() {
  const token = localStorage.getItem('staffAccessToken')
    ?? localStorage.getItem('accessToken')
    ?? '';
  return { Authorization: `Bearer ${token}` };
}

export const adminQueueClient = {
  /**
   * GET /api/v1/queue/department/{departmentId}
   * Initial board load — call before or right after socket connects.
   */
  getDepartmentQueue: async (departmentId: string): Promise<AdminQueueEntry[]> => {
    const { data } = await axios.get(
      `${BASE}/queue/department/${departmentId}`,
      { headers: authHeader() },
    );
    return Array.isArray(data) ? data : (data.entries ?? []);
  },

  /**
   * POST /api/v1/queue/swap?queueEntryIdA=uuid&queueEntryIdB=uuid
   * Swaps the positions of two queue entries.
   */
  swapEntries: async (queueEntryIdA: string, queueEntryIdB: string): Promise<void> => {
    await axios.post(
      `${BASE}/queue/swap`,
      null,
      { params: { queueEntryIdA, queueEntryIdB }, headers: authHeader() },
    );
  },

  /**
   * GET /api/v1/departments/{departmentId}/rooms/available
   * Returns rooms that are currently free and ready to accept a patient.
   */
  getAvailableRooms: async (departmentId: string): Promise<AvailableRoom[]> => {
    const { data } = await axios.get(
      `${BASE}/departments/${departmentId}/rooms/available`,
      { headers: authHeader() },
    );
    const raw = Array.isArray(data) ? data : [];
    return raw.map(r => AvailableRoomSchema.parse(r));
  },

  /**
   * POST /api/v1/queue/call/{queueEntryId}?roomId={roomId}
   * Calls a patient from the queue into the specified room.
   */
  callPatientToRoom: async (queueEntryId: string, roomId: string): Promise<void> => {
    await axios.post(
      `${BASE}/queue/call/${queueEntryId}`,
      null,
      { params: { roomId }, headers: authHeader() },
    );
  },

  /**
   * POST /api/v1/admin/patient-check/{visitId}
   * Triggers an AI-generated check-in question to the patient.
   * Pass either `question` (verbatim) or `intent` (AI writes the question).
   */
  triggerPatientCheckIn: async (
    visitId: string,
    departmentId: string,
    payload: { question: string } | { intent: string },
  ): Promise<{ status: string; questionId: string }> => {
    const { data } = await axios.post(
      `${AI_BASE}/admin/patient-check/${visitId}`,
      { departmentId, ...payload },
      { headers: authHeader() },
    );
    return data;
  },
};