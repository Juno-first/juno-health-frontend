/**
 * patientCheckInSocket.ts
 *
 * Connects to wss://<host>/ws/patient/{visitId}?token=<jwt>
 * Follows the QueueInsightsSocketManager pattern.
 *
 * Lifecycle:
 *  - connect() on check-in / ERQueuePage mount
 *  - disconnect() when patient is CALLED or DISCHARGED
 *  - Reconnects automatically on drop / tab restore
 */
import {
  parsePatientWsMessage,
  type PatientWsIncoming,
  type CheckInAnswer,
} from '../../schemas/patientCheckIn.schema';

// Strip /api/v1 to get the base host
const BASE_URL = (import.meta.env.VITE_AI_API_URL ?? 'http://localhost:8000').replace(/\/+$/, '');


export type PatientCheckInStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error';

export type PatientCheckInCallbacks = {
  onMessage:      (message: PatientWsIncoming) => void;
  onStatusChange: (status: PatientCheckInStatus) => void;
};

class PatientCheckInSocketManager {
  private socket:           WebSocket | null = null;
  private visitId:          string | null = null;
  private callbacks:        PatientCheckInCallbacks | null = null;
  private intentional       = false;
  private reconnectTimer:   number | null = null;
//   private hasConnectedOnce  = false;

  connect(visitId: string, token: string, callbacks: PatientCheckInCallbacks): void {
    // Same visit already open — just refresh callbacks
    if (this.socket && this.visitId === visitId &&
        this.socket.readyState === WebSocket.OPEN) {
      this.callbacks = callbacks;
      callbacks.onStatusChange('connected');
      return;
    }

    this.disconnect();

    this.visitId         = visitId;
    this.callbacks       = callbacks;
    this.intentional     = false;
    // this.hasConnectedOnce = false;

    this.open(token);
    document.removeEventListener('visibilitychange', this.onVisible);
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
    this.socket   = null;
    this.visitId  = null;
    this.callbacks?.onStatusChange('disconnected');
    this.callbacks = null;
  }

  sendAnswer(answer: CheckInAnswer): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(answer));
    } else {
      console.warn('[patientCheckIn] Cannot send — socket not open');
    }
  }

  private open(token: string): void {
    if (!this.visitId) return;

    this.callbacks?.onStatusChange('connecting');

    const url = `${BASE_URL}/ws/patient/${this.visitId}?token=${encodeURIComponent(token)}`;
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      this.callbacks?.onStatusChange('connected');
      console.info(`[patientCheckIn] Connected — visit: ${this.visitId}`);
    //   this.hasConnectedOnce = true;
    };

    this.socket.onmessage = (event) => {
      const parsed = parsePatientWsMessage(event.data);
      if (!parsed || !this.callbacks) return;
      this.callbacks.onMessage(parsed);
    };

    this.socket.onerror = () => {
      this.callbacks?.onStatusChange('error');
      console.error('[patientCheckIn] Socket error');
    };

    this.socket.onclose = () => {
      if (this.intentional) return;

      this.callbacks?.onStatusChange('disconnected');
      console.warn('[patientCheckIn] Disconnected — reconnecting in 5s');

      this.reconnectTimer = window.setTimeout(() => {
        const freshToken = localStorage.getItem('accessToken') ?? '';
        this.open(freshToken);
      }, 5000);
    };
  }

  private onVisible = (): void => {
    if (document.visibilityState !== 'visible') return;
    if (this.intentional || !this.visitId) return;

    if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
      console.info('[patientCheckIn] Tab visible — reconnecting');
      const freshToken = localStorage.getItem('accessToken') ?? '';
      this.open(freshToken);
    }
  };
}

export const patientCheckInSocket = new PatientCheckInSocketManager();