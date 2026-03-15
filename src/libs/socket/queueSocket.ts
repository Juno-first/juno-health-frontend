/**
 * queueSocket.ts — STOMP over SockJS singleton
 *
 * Uses @stomp/stompjs + sockjs-client to match the backend WebSocket setup.
 * Install: npm install @stomp/stompjs sockjs-client
 *
 * Connects to /ws and subscribes to /topic/patient/{patientId}.
 * Survives React route changes (module scope singleton).
 * Reconnects automatically on tab visibility restore.
 */
import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { AppDispatch } from '../../store/index';
import { parseWsQueueEvent } from '../../schemas/queue.schema';
import {
  setSocketStatus,
  wsQueueEvent,
} from '../../store/slices/queueSlice';

// Derive base URL (strip /api/v1) so we can point at /ws
const BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1')
  .replace(/\/api\/v1\/?$/, '');

class QueueSocketManager {
  private client: Client | null = null;
  private dispatch: AppDispatch | null = null;
  private patientId: string | null = null;
  private token: string | null = null;
  private intentional = false;

  connect(patientId: string, token: string, dispatch: AppDispatch): void {
    this.dispatch = dispatch;
    this.intentional = false;

    const samePatient = this.patientId === patientId;
    const sameToken = this.token === token;
    const alreadyActive = this.client?.active;

    this.patientId = patientId;
    this.token = token;

    if (samePatient && sameToken && alreadyActive) {
      this.dispatch(setSocketStatus('connected'));
      return;
    }

    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }

    this.dispatch(setSocketStatus('connecting'));
    this._open();

    document.removeEventListener('visibilitychange', this._onVisible);
    document.addEventListener('visibilitychange', this._onVisible);
  }

  private _open(): void {
    if (!this.patientId || !this.token) return;

    if (this.client?.active) {
      this.client.deactivate();
    }

    this.dispatch?.(setSocketStatus('connecting'));

    this.client = new Client({
      webSocketFactory: () => new SockJS(`${BASE_URL}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${this.token}`,
      },
      reconnectDelay: 5000,

      onConnect: () => {
        this.dispatch?.(setSocketStatus('connected'));
        console.info('[JUNO WS] STOMP connected');

        this.client!.subscribe(
          `/topic/patient/${this.patientId}`,
          (msg: IMessage) => this._onMessage(msg)
        );
      },

      onDisconnect: () => {
        if (!this.intentional) {
          this.dispatch?.(setSocketStatus('disconnected'));
        }
      },

      onStompError: (frame) => {
        console.error('[JUNO WS] STOMP error', frame);
        this.dispatch?.(setSocketStatus('error'));
      },

      onWebSocketClose: () => {
        if (!this.intentional) {
          this.dispatch?.(setSocketStatus('disconnected'));
        }
      },
    });

    this.client.activate();
  }

  disconnect(): void {
    this.intentional = true;
    document.removeEventListener('visibilitychange', this._onVisible);
    this.client?.deactivate();
    this.client = null;
    this.patientId = null;
    this.token = null;
    this.dispatch?.(setSocketStatus('disconnected'));
    this.dispatch = null;
  }

  private _onMessage(msg: IMessage): void {
    const event = parseWsQueueEvent(msg.body);
    if (!event || !this.dispatch) return;
    this.dispatch(wsQueueEvent(event));
  }

  private _onVisible = (): void => {
    if (document.visibilityState !== 'visible') return;
    if (this.intentional || !this.patientId || !this.token) return;
    if (!this.client?.active) {
      console.info('[JUNO WS] Tab visible — reconnecting');
      this._open();
    }
  };
}

export const queueSocket = new QueueSocketManager();