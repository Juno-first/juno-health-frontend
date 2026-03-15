import { useEffect, useState, useCallback } from 'react';
import {
  queueInsightsSocket,
  type InsightsSocketStatus,
} from '../../libs/socket/queueInsightsSocket';
import type { QueueInsight, QueueInsightsPayload } from '../../schemas/queueInsights.schema';

export interface UseQueueInsightsResult {
  insights: QueueInsight[];
  payload: QueueInsightsPayload | null;
  socketStatus: InsightsSocketStatus;
}

export function useQueueInsights(departmentId: string): UseQueueInsightsResult {
  const [insights, setInsights] = useState<QueueInsight[]>([]);
  const [payload, setPayload] = useState<QueueInsightsPayload | null>(null);
  const [socketStatus, setSocketStatus] = useState<InsightsSocketStatus>('idle');

  const handleMessage = useCallback((message: { type: 'QUEUE_INSIGHTS'; data: QueueInsightsPayload }) => {
    setPayload(message.data);
    setInsights(message.data.insights);
  }, []);

  useEffect(() => {
    if (!departmentId) return;

    const token = localStorage.getItem('token') ?? '';

    queueInsightsSocket.connect(departmentId, token, {
      onMessage: handleMessage,
      onStatusChange: setSocketStatus,
    });

    return () => {
      queueInsightsSocket.disconnect();
    };
  }, [departmentId, handleMessage]);

  return { insights, payload, socketStatus };
}