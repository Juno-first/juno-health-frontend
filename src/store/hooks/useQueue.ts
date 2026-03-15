/**
 * useQueue.ts
 *
 * useQueueGate()   — JoinQueuePage: checks status on mount, redirects to
 *                    /er-queue if already queued, exposes join().
 *
 * useQueueData()   — ERQueuePage: returns live queue state + leave().
 *
 * useQueueSocket() — Starts the WebSocket for the active queue entry.
 *                    Call once inside ERQueuePage.
 */

import { useEffect, useCallback }         from 'react';
import { useNavigate }                    from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import {
  checkQueueStatus,
  joinQueue,
  leaveQueue,
} from '../slices/queueSlice';
import { queueSocket }                          from '../../libs/socket/queueSocket';
import { subscribeToPush, unsubscribeFromPush } from '../../libs/pushManagers/pushManager';
import type { CheckInRequest } from "../../schemas/queue.schema";

// ── useQueueGate ───────────────────────────────────────────────────────────────

export function useQueueGate() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const checkStatus = useAppSelector(s => s.queue.checkStatus);
  const error = useAppSelector(s => s.queue.error);

  useEffect(() => {
    dispatch(checkQueueStatus());
  }, [dispatch]);

  useEffect(() => {
    if (checkStatus === "in_queue") {
      navigate("/er-queue", { replace: true });
    }
  }, [checkStatus, navigate]);

  const join = useCallback(
    async (data: CheckInRequest) => {
      const result = await dispatch(joinQueue(data));

      if (joinQueue.fulfilled.match(result)) {
        await subscribeToPush(result.payload.queueEntryId);
        return result.payload; // important
      }

      return null;
    },
    [dispatch]
  );

  return {
    ready: checkStatus === "not_in_queue",
    checking: checkStatus === "idle" || checkStatus === "checking",
    joining: checkStatus === "joining",
    error,
    join,
  };
}

// ── useQueueData ───────────────────────────────────────────────────────────────

export function useQueueData() {
  const dispatch     = useAppDispatch();
  const navigate     = useNavigate();
  const data         = useAppSelector(s => s.queue.data);
  const checkedInAt  = useAppSelector(s => s.queue.checkedInAt);  // ← ADD
  const checkStatus  = useAppSelector(s => s.queue.checkStatus);
  const socketStatus = useAppSelector(s => s.queue.socketStatus);
  const updates      = useAppSelector(s => s.queue.updates);
  const error        = useAppSelector(s => s.queue.error);

  useEffect(() => {
    if (!data && checkStatus === 'idle') {
      dispatch(checkQueueStatus());
    }
  }, [dispatch, data, checkStatus]);

  // ← ADD THIS
  useEffect(() => {
    if (checkStatus === 'not_in_queue') {
      navigate('/join-queue', { replace: true });
    }
  }, [checkStatus, navigate]);

  const leave = useCallback(async () => {
    const result = await dispatch(leaveQueue());
    if (leaveQueue.fulfilled.match(result)) {
      await unsubscribeFromPush();
      queueSocket.disconnect();
      navigate('/join-queue', { replace: true });
    }
  }, [dispatch, navigate]);

  return {
    data,
    checkedInAt,   // ← ADD
    checkStatus,
    socketStatus,
    updates,
    error,
    isLive: socketStatus === 'connected',
    leave,
  };
}
// ── useQueueSocket ─────────────────────────────────────────────────────────────

/**
 * Usage inside ERQueuePage:
 *   const { data } = useQueueData();
 *   useQueueSocket(data?.queueEntryId);
 *
 * The socket intentionally survives React unmount (route changes).
 * It is only torn down when the patient calls leave() from useQueueData.
 */
export function useQueueSocket(queueEntryId?: string) {
  const dispatch = useAppDispatch();

  const patientId = useAppSelector((s) =>
    s.user.user?.accountType === 'PATIENT' ? s.user.user.patientId : undefined
  );

  const accessToken = useAppSelector((s) => s.user.accessToken);
  const checkStatus = useAppSelector((s) => s.queue.checkStatus);

  useEffect(() => {
    if (!patientId || !accessToken) return;
    if (checkStatus !== 'in_queue') return;
    if (!queueEntryId) return;

    queueSocket.connect(patientId, accessToken, dispatch);
  }, [patientId, accessToken, checkStatus, queueEntryId, dispatch]);
}