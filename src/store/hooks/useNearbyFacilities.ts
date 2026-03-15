import { useState, useEffect, useCallback } from 'react';
import { facilityClient }      from '../../libs/api/facilityClient';
import type { NearbyFacility } from '../../schemas/facility.schema';

export type GeoStatus   = 'idle' | 'locating' | 'located' | 'denied' | 'error';
export type FetchStatus = 'idle' | 'loading' | 'loaded' | 'error';

export interface UseNearbyFacilitiesResult {
  facilities:  NearbyFacility[];
  geoStatus:   GeoStatus;
  fetchStatus: FetchStatus;
  error:       string | null;
  userLat:     number | null;
  userLon:     number | null;
  refresh:     () => void;
}

const RADIUS_KM = 10;
const LIMIT     = 10;

export function useNearbyFacilities(): UseNearbyFacilitiesResult {
  const [facilities,  setFacilities]  = useState<NearbyFacility[]>([]);
  const [geoStatus,   setGeoStatus]   = useState<GeoStatus>('idle');
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>('idle');
  const [error,       setError]       = useState<string | null>(null);
  const [userLat,     setUserLat]     = useState<number | null>(null);
  const [userLon,     setUserLon]     = useState<number | null>(null);
  const [tick,        setTick]        = useState(0);

  const refresh = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoStatus('error');
      setError('Geolocation is not supported by this browser.');
      return;
    }

    setGeoStatus('locating');
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setUserLat(lat);
        setUserLon(lon);
        setGeoStatus('located');
        setFetchStatus('loading');

        try {
          const data = await facilityClient.getNearby(lat, lon, RADIUS_KM, LIMIT);
          setFacilities(data);
          setFetchStatus('loaded');
          setError(null);
        } catch (err: unknown) {
          const msg =
            (err as { response?: { data?: { message?: string } } })
              ?.response?.data?.message
            ?? 'Failed to load nearby facilities.';
          setError(msg);
          setFetchStatus('error');
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGeoStatus('denied');
          setError('Location access denied. Enable location to see nearby facilities.');
        } else {
          setGeoStatus('error');
          setError('Could not determine your location. Please try again.');
        }
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }, [tick]);

  return { facilities, geoStatus, fetchStatus, error, userLat, userLon, refresh };
}