import { useState, useEffect, useRef } from 'react';
import { ZodError } from 'zod';
import { facilityClient } from '../../libs/api/facilityClient';
import type { FacilityInfo } from '../../schemas/facility.schema';

export type LookupStatus = 'idle' | 'loading' | 'found' | 'error';

interface UseFacilityLookupResult {
  facility: FacilityInfo | null;
  status:   LookupStatus;
  error:    string | null;
  reset:    () => void;
}

const DEBOUNCE_MS  = 600;
const MIN_CODE_LEN = 4;

export function useFacilityLookup(code: string): UseFacilityLookupResult {
  const [facility, setFacility] = useState<FacilityInfo | null>(null);
  const [status,   setStatus]   = useState<LookupStatus>('idle');
  const [error,    setError]    = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function reset() {
    setFacility(null);
    setStatus('idle');
    setError(null);
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  useEffect(() => {
    const trimmed = code.trim();

    if (!trimmed || trimmed.length < MIN_CODE_LEN) {
      reset();
      return;
    }

    setStatus('loading');
    setError(null);
    setFacility(null);

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      try {
        const isQr   = trimmed.toUpperCase().startsWith('FAC-');
        const result = isQr
          ? await facilityClient.lookupByQrToken(trimmed)
          : await facilityClient.lookupByCode(trimmed);
        setFacility(result);
        setStatus('found');
        setError(null);
      } catch (err: unknown) {
        if (err instanceof ZodError) {
          // API returned 200 but shape didn't match schema
          console.error('[useFacilityLookup] Schema validation failed:', err.issues);
          setError('Unexpected response from server. Please try again.');
        } else {
          const msg =
            (err as { response?: { data?: { message?: string } } })
              ?.response?.data?.message
            ?? 'Facility not found. Check the code and try again.';
          setError(msg);
        }
        setFacility(null);
        setStatus('error');
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [code]);

  return { facility, status, error, reset };
}