import axios from 'axios';
import {
  OnboardingSurveyResponseSchema,
  type OnboardingSurveyRequest,
  type OnboardingSurveyResponse,
} from '../../schemas/onboarding.schema';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1';

function authHeader() {
  const token = localStorage.getItem('accessToken') ?? '';
  return { Authorization: `Bearer ${token}` };
}

export const onboardingClient = {
  /**
   * GET /api/v1/onboarding
   * Returns saved progress, or null if none started yet (204 response).
   */
  getProgress: async (): Promise<OnboardingSurveyResponse | null> => {
    const res = await axios.get(`${BASE}/onboarding`, {
      headers: authHeader(),
      validateStatus: s => s === 200 || s === 204,
    });
    if (res.status === 204 || !res.data) return null;
    return OnboardingSurveyResponseSchema.parse(res.data);
  },

  /**
   * POST /api/v1/onboarding
   * Save progress for any step(s). Pass markCompleted=true on the final step.
   */
  saveProgress: async (
    request: OnboardingSurveyRequest,
  ): Promise<OnboardingSurveyResponse> => {
    const { data } = await axios.post(`${BASE}/onboarding`, request, {
      headers: authHeader(),
    });
    return OnboardingSurveyResponseSchema.parse(data);
  },
};