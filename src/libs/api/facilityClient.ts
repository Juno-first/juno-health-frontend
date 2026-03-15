import axios from 'axios';
import type { FacilityInfo,NearbyFacility } from '../../schemas/facility.schema';
import { parseNearbyFacilities } from '../../schemas/facility.schema';
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
  /**
   * GET /api/v1/facilities/nearby
   * Returns facilities within radiusKm of the given coordinates.
   */
  getNearby: async (
    lat:      number,
    lon:      number,
    radiusKm: number = 10,
    limit:    number = 10,
  ): Promise<NearbyFacility[]> => {
    const { data } = await axios.get(
      `${BASE}/facilities/nearby`,
      {
        params:  { lat, lon, radiusKm, limit },
        headers: authHeader(),
      },
    );
    return parseNearbyFacilities(data);
  },
};