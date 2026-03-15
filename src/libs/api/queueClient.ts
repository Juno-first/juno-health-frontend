import { api } from './userClient';
import {
  parseQueueStatus,
  type CheckInRequest,
  type QueueStatus,
  type PushSubscribeRequest,
} from '../../schemas/queue.schema';
import axios from 'axios';
const AI_BASE = import.meta.env.VITE_AI_API_URL ?? 'http://localhost:8000';

export const queueClient = {
  /** GET /queue/status — null on 204 (not in queue) */
  getStatus: async (): Promise<QueueStatus | null> => {
    const res = await api.get('/queue/status', {
      validateStatus: (s) => s === 200 || s === 204,
    });
    if (res.status === 204 || !res.data) return null;
    return parseQueueStatus(res.data);
  },

  /** POST /queue/checkin */
  checkIn: async (body: CheckInRequest): Promise<QueueStatus> => {
    const res = await api.post('/queue/checkin', body);
    return parseQueueStatus(res.data);
  },

  /** POST /queue/leave */
  leave: async (): Promise<void> => {
    await api.post('/queue/leave');
  },

  subscribePush: async (body: PushSubscribeRequest): Promise<void> => {
    await api.post('/push/subscribe', body);
  },

  unsubscribePush: async (endpoint: string): Promise<void> => {
    await api.delete('/push/subscribe', { data: { endpoint } });
  },
  
  /**
   * POST {AI_BASE}/patient/discomfort
   * Notify the department that a patient's condition is worsening.
   */
  reportDiscomfort: async (payload: {
    visitId:      string;
    departmentId: string;
    message:      string;
  }): Promise<void> => {
    const token = localStorage.getItem('accessToken') ?? '';
    await axios.post(`${AI_BASE}/patient/discomfort`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};