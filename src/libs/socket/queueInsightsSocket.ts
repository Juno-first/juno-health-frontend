import {
  parseQueueInsightsMessage,
  type QueueInsightsSocketMessage,
} from '../../schemas/queueInsights.schema';

const INSIGHTS_BASE_URL =
  (import.meta.env.VITE_AI_API_URL ?? 'http://localhost:8000').replace(/\/+$/, '');

export type InsightsSocketStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error';

export type InsightsSocketCallbacks = {
  onMessage: (message: QueueInsightsSocketMessage) => void;
  onStatusChange: (status: InsightsSocketStatus) => void;
  onReconnect?: () => void;
};

class QueueInsightsSocketManager {
  private socket: WebSocket | null = null;
  private departmentId: string | null = null;
  private callbacks: InsightsSocketCallbacks | null = null;
  private intentional = false;
  private reconnectTimer: number | null = null;
  private hasConnectedOnce = false;

  connect(departmentId: string, token: string, callbacks: InsightsSocketCallbacks): void {
    if (this.socket && this.departmentId === departmentId) {
      this.callbacks = callbacks;
      return;
    }

    this.disconnect();

    this.departmentId = departmentId;
    this.callbacks = callbacks;
    this.intentional = false;
    this.hasConnectedOnce = false;

    this.open(token);
    document.addEventListener('visibilitychange', this.onVisible);
  }

  disconnect(): void {
    this.intentional = true;
    document.removeEventListener('visibilitychange', this.onVisible);

    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.socket?.close();
    this.socket = null;
    this.departmentId = null;
    this.callbacks?.onStatusChange('disconnected');
    this.callbacks = null;
  }

  private open(token: string): void {
    if (!this.departmentId) return;

    this.callbacks?.onStatusChange('connecting');

    const url =
      `${INSIGHTS_BASE_URL}/ws/insights/${this.departmentId}?token=${encodeURIComponent(token)}`;

    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      this.callbacks?.onStatusChange('connected');
      console.info(`[JUNO Insights WS] Connected — dept: ${this.departmentId}`);

      if (this.hasConnectedOnce) {
        this.callbacks?.onReconnect?.();
      }

      this.hasConnectedOnce = true;

      // keepalive for your FastAPI websocket receive loop
      this.socket?.send('ping');
    };

    this.socket.onmessage = (event) => {
      const parsed = parseQueueInsightsMessage(event.data);
      if (!parsed || !this.callbacks) return;
      this.callbacks.onMessage(parsed);
    };

    this.socket.onerror = () => {
      this.callbacks?.onStatusChange('error');
      console.error('[JUNO Insights WS] Socket error');
    };

    this.socket.onclose = () => {
      if (this.intentional) return;

      this.callbacks?.onStatusChange('disconnected');
      console.warn('[JUNO Insights WS] Disconnected unexpectedly');

      this.reconnectTimer = window.setTimeout(() => {
        const freshToken = localStorage.getItem('accessToken') ?? '';
        this.open(freshToken);
      }, 5000);
    };
  }

  private onVisible = (): void => {
    if (document.visibilityState !== 'visible') return;
    if (this.intentional || !this.departmentId) return;

    if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
      const freshToken = localStorage.getItem('accessToken') ?? '';
      this.open(freshToken);
    }
  };
}

export const queueInsightsSocket = new QueueInsightsSocketManager();