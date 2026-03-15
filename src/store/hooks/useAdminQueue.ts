import { useState, useEffect, useCallback } from 'react';
import { adminQueueClient, type AvailableRoom } from '../../libs/api/adminQueueClient';
import { adminQueueSocket, type AdminSocketStatus } from '../../libs/socket/adminQueueSocket';
import { type AdminQueueEntry, type AdminWsEvent } from '../../schemas/adminQueue.schema';

export type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

export interface UseAdminQueueResult {
  entries:            AdminQueueEntry[];
  socketStatus:       AdminSocketStatus;
  loadStatus:         LoadStatus;
  error:              string | null;
  fetchAvailableRooms:(departmentId: string) => Promise<AvailableRoom[]>;
  callPatient:        (queueEntryId: string, roomId: string) => Promise<void>;
  removePatient:      (queueEntryId: string) => void;
  swapPatients:       (queueEntryIdA: string, queueEntryIdB: string) => Promise<void>;
  triggerCheckIn:     (visitId: string, departmentId: string, payload: { question: string } | { intent: string }) => Promise<void>;
  refresh:            () => void;
}

export function useAdminQueue(departmentId: string): UseAdminQueueResult {
  const [entries,      setEntries]      = useState<AdminQueueEntry[]>([]);
  const [socketStatus, setSocketStatus] = useState<AdminSocketStatus>('idle');
  const [loadStatus,   setLoadStatus]   = useState<LoadStatus>('idle');
  const [error,        setError]        = useState<string | null>(null);

  // ── REST load ──────────────────────────────────────────────────────────────
  const loadQueue = useCallback(async () => {
    if (!departmentId) return;
    setLoadStatus('loading');
    setError(null);
    try {
      const data = await adminQueueClient.getDepartmentQueue(departmentId);
      setEntries(data);
      setLoadStatus('loaded');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message
        ?? 'Failed to load queue. Please try again.';
      setError(msg);
      setLoadStatus('error');
    }
  }, [departmentId]);

  // ── WebSocket event handler ────────────────────────────────────────────────
  const handleEvent = useCallback((event: AdminWsEvent) => {
    setEntries(prev => {
      switch (event.eventType) {
        case 'CHECKED_IN': {
          const { eventType: _, departmentId: _d, ...entry } = event;
          if (prev.some(e => e.queueEntryId === entry.queueEntryId)) return prev;
          return [...prev, entry as AdminQueueEntry].sort((a, b) => a.position - b.position);
        }
        case 'CALLED':
          return prev.map(e =>
            e.queueEntryId === event.queueEntryId ? { ...e, status: 'CALLED' as const } : e,
          );
        case 'QUEUE_UPDATED':
          return prev
            .map(e =>
              e.queueEntryId === event.queueEntryId
                ? { ...e, position: event.position, estimatedWaitMinutes: event.estimatedWaitMinutes }
                : e,
            )
            .sort((a, b) => a.position - b.position);
        case 'DISCHARGED':
        case 'LEFT_QUEUE':
          return prev.filter(e => e.queueEntryId !== event.queueEntryId);
        default:
          return prev;
      }
    });
  }, []);

  // ── Mount: initial REST load + connect socket ──────────────────────────────
  useEffect(() => {
    if (!departmentId) return;

    loadQueue();

    adminQueueSocket.connect(departmentId, {
      onEvent:        handleEvent,
      onStatusChange: setSocketStatus,
      onReconnect:    loadQueue,
    });

    return () => { adminQueueSocket.disconnect(); };
  }, [departmentId]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const fetchAvailableRooms = useCallback(async (deptId: string): Promise<AvailableRoom[]> => {
    return adminQueueClient.getAvailableRooms(deptId);
  }, []);

  const callPatient = useCallback(async (queueEntryId: string, roomId: string): Promise<void> => {
    // Optimistically mark as CALLED so the card updates instantly
    setEntries(prev =>
      prev.map(e => e.queueEntryId === queueEntryId ? { ...e, status: 'CALLED' as const } : e),
    );
    try {
      await adminQueueClient.callPatientToRoom(queueEntryId, roomId);
      // WS CALLED / QUEUE_UPDATED events will confirm final state
    } catch (err: unknown) {
      // Rollback on failure
      setEntries(prev =>
        prev.map(e => e.queueEntryId === queueEntryId ? { ...e, status: 'CHECKED_IN' as const } : e),
      );
      throw err;
    }
  }, []);

  const removePatient = useCallback((queueEntryId: string) => {
    setEntries(prev => prev.filter(e => e.queueEntryId !== queueEntryId));
  }, []);

  const swapPatients = useCallback(async (idA: string, idB: string): Promise<void> => {
    let snapshot: AdminQueueEntry[] = [];

    setEntries(prev => {
      snapshot = prev;
      const a = prev.find(e => e.queueEntryId === idA);
      const b = prev.find(e => e.queueEntryId === idB);
      if (!a || !b) return prev;
      return prev
        .map(e => {
          if (e.queueEntryId === idA) return { ...e, position: b.position };
          if (e.queueEntryId === idB) return { ...e, position: a.position };
          return e;
        })
        .sort((x, y) => x.position - y.position);
    });

    try {
      await adminQueueClient.swapEntries(idA, idB);
      // WS QUEUE_UPDATED events will broadcast final positions
    } catch (err: unknown) {
      console.error('[useAdminQueue] Swap failed — rolling back:', err);
      setEntries(snapshot);
    }
  }, []);

  const triggerCheckIn = useCallback(async (
    visitId: string,
    deptId: string,
    payload: { question: string } | { intent: string },
  ): Promise<void> => {
    await adminQueueClient.triggerPatientCheckIn(visitId, deptId, payload);
  }, []);

  return {
    entries,
    socketStatus,
    loadStatus,
    error,
    fetchAvailableRooms,
    callPatient,
    removePatient,
    swapPatients,
    triggerCheckIn,
    refresh: loadQueue,
  };
}