import axios from 'axios';
import type { FacilityInfo } from '../../schemas/facility.schema';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1';

function authHeader() {
  const token = localStorage.getItem('accessToken') ?? '';
  return { Authorization: `Bearer ${token}` };
}

export const facilityClient = {
  lookupByCode: async (code: string): Promise<FacilityInfo> => {
    const { data } = await axios.get(
      `${BASE}/departments/lookup`,
      { params: { code }, headers: authHeader() },
    );
    return data as FacilityInfo;
  },

  lookupByQrToken: async (qrToken: string): Promise<FacilityInfo> => {
    const { data } = await axios.get(
      `${BASE}/departments/lookup`,
      { params: { qrToken }, headers: authHeader() },
    );
    return data as FacilityInfo;
  },
};