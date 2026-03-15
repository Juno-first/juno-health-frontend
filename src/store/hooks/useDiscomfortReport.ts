import { useState, useCallback } from 'react';
import { queueClient } from '../../libs/api/queueClient';

export type DiscomfortStatus = 'idle' | 'sending' | 'sent' | 'error';

export interface UseDiscomfortReportResult {
  status:  DiscomfortStatus;
  error:   string | null;
  report:  (visitId: string, departmentId: string, message: string) => Promise<void>;
  reset:   () => void;
}

export function useDiscomfortReport(): UseDiscomfortReportResult {
  const [status, setStatus] = useState<DiscomfortStatus>('idle');
  const [error,  setError]  = useState<string | null>(null);

  const report = useCallback(async (
    visitId:      string,
    departmentId: string,
    message:      string,
  ) => {
    setStatus('sending');
    setError(null);
    try {
      await queueClient.reportDiscomfort({ visitId, departmentId, message });
      setStatus('sent');
      // Auto-reset after 4 s so the button returns to idle
      setTimeout(() => setStatus('idle'), 4000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? 'Failed to send report. Please try again.';
      setError(msg);
      setStatus('error');
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  return { status, error, report, reset };
}