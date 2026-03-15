/**
 * adminQueueSocket.ts — Staff STOMP socket over SockJS
 *
 * Connects to /ws (no auth header — per docs, connection itself is unauthenticated).
 * Subscribes to /topic/queue/{departmentId} after connect.
 *
 * Event types handled:
 *   CHECKED_IN    → dispatch addEntry
 *   CALLED        → dispatch updateEntryStatus
 *   QUEUE_UPDATED → dispatch updatePositions
 *   DISCHARGED    → dispatch removeEntry
 *   LEFT_QUEUE    → dispatch removeEntry
 *
 * On reconnect: fires onReconnect callback so the caller can re-fetch REST.
 * Survives React route changes (module-scope singleton).
 */

import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { parseAdminWsEvent, type AdminWsEvent } from '../../schemas/adminQueue.schema';

const BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1')
  .replace(/\/api\/v1\/?$/, '');

export type AdminSocketStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

export type AdminSocketCallbacks = {
  onEvent:      (event: AdminWsEvent) => void;
  onStatusChange: (status: AdminSocketStatus) => void;
  onReconnect:  () => void;    // called after reconnect so caller can re-fetch REST
};

class AdminQueueSocketManager {
  private client:       Client | null = null;
  private departmentId: string | null = null;
  private callbacks:    AdminSocketCallbacks | null = null;
  private intentional   = false;
  private hasConnectedOnce = false;

  /**
   * Connect (or reconnect) to the given departmentId.
   * Safe to call multiple times — no-ops if already connected to same dept.
   */
  connect(departmentId: string, callbacks: AdminSocketCallbacks): void {
    // Already active on the same department — just update callbacks
    if (this.client?.active && this.departmentId === departmentId) {
      this.callbacks = callbacks;
      return;
    }

    // Different department — tear down first
    if (this.client?.active) {
      this.client.deactivate();
    }

    this.departmentId    = departmentId;
    this.callbacks       = callbacks;
    this.intentional     = false;
    this.hasConnectedOnce = false;

    this._open();
    document.addEventListener('visibilitychange', this._onVisible);
  }

  disconnect(): void {
    this.intentional = true;
    document.removeEventListener('visibilitychange', this._onVisible);
    this.client?.deactivate();
    this.client       = null;
    this.departmentId = null;
    this.callbacks?.onStatusChange('disconnected');
    this.callbacks    = null;
  }

  get isActive(): boolean {
    return !!this.client?.active;
  }

  private _open(): void {
    this.callbacks?.onStatusChange('connecting');

    this.client = new Client({
      webSocketFactory: () => new SockJS(`${BASE_URL}/ws`),
      // No auth header on the WS connection itself per backend docs.
      // REST calls use the staff JWT independently.
      connectHeaders: {},
      reconnectDelay: 5000,

      onConnect: () => {
        this.callbacks?.onStatusChange('connected');
        console.info(`[JUNO Admin WS] Connected — dept: ${this.departmentId}`);

        // Subscribe to department topic
        this.client!.subscribe(
          `/topic/queue/${this.departmentId}`,
          (msg: IMessage) => this._onMessage(msg),
        );

        // If this is a reconnect (not the initial connect) re-fetch REST
        if (this.hasConnectedOnce) {
          console.info('[JUNO Admin WS] Reconnected — triggering REST resync');
          this.callbacks?.onReconnect();
        }
        this.hasConnectedOnce = true;
      },

      onDisconnect: () => {
        if (!this.intentional) {
          this.callbacks?.onStatusChange('disconnected');
          console.warn('[JUNO Admin WS] Disconnected unexpectedly');
        }
      },

      onStompError: (frame) => {
        console.error('[JUNO Admin WS] STOMP error', frame);
        this.callbacks?.onStatusChange('error');
      },
    });

    this.client.activate();
  }

  private _onMessage(msg: IMessage): void {
    const event = parseAdminWsEvent(msg.body);
    if (!event || !this.callbacks) return;
    console.debug(`[JUNO Admin WS] ${event.eventType} — patient: ${event.patientId}`);
    this.callbacks.onEvent(event);
  }

  private _onVisible = (): void => {
    if (document.visibilityState !== 'visible') return;
    if (this.intentional || !this.departmentId) return;
    if (!this.client?.active) {
      console.info('[JUNO Admin WS] Tab visible — reconnecting');
      this._open();
    }
  };
}

// Module-scope singleton — survives React route changes
export const adminQueueSocket = new AdminQueueSocketManager();