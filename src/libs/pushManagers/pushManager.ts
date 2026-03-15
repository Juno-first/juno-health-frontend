/**
 * pushManager.ts
 *
 * Handles Web Push API registration so the server can send notifications
 * to the patient even when JUNO is backgrounded or closed.
 *
 * HOW IT WORKS
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. The browser generates a push subscription (endpoint + keys) via the
 *    Push API. This is tied to your VAPID key pair.
 * 2. We POST the subscription to our backend (POST /push/subscribe).
 * 3. When the queue moves, the server fetches that subscription and sends a
 *    Web Push message directly to the browser's push service (Google FCM,
 *    Apple APNs, etc.).
 * 4. The browser wakes up your service worker (sw.ts) to handle the push
 *    event and show a system notification — even if the app is closed.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * REQUIREMENTS
 * - Add VITE_VAPID_PUBLIC_KEY=<your_base64url_vapid_public_key> to .env
 * - Your backend must implement POST /api/v1/push/subscribe
 * - Your backend must implement DELETE /api/v1/push/subscribe
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { queueClient } from '../api/queueClient';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

/** Convert a base64url VAPID public key to the byte format the Push API expects */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);

  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

/** Create a real ArrayBuffer so TS does not infer SharedArrayBuffer */
function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

/**
 * Requests notification permission, creates a push subscription,
 * and registers it with the backend.
 *
 * Call this after the user successfully joins the queue.
 * Pass the queueEntryId so the backend can target the right subscription
 * when sending position-update pushes.
 */
export async function subscribeToPush(queueEntryId?: string): Promise<void> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[JUNO Push] Push API not supported in this browser');
    return;
  }

  if (!VAPID_PUBLIC_KEY) {
    console.warn('[JUNO Push] VITE_VAPID_PUBLIC_KEY not set — skipping push registration');
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.info('[JUNO Push] Notification permission denied');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    const existing = await registration.pushManager.getSubscription();

    const subscription =
      existing ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: toArrayBuffer(urlBase64ToUint8Array(VAPID_PUBLIC_KEY)),
      }));

    const json = subscription.toJSON();

    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
      throw new Error('Incomplete push subscription object');
    }

    await queueClient.subscribePush({
      endpoint: json.endpoint,
      keys: {
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
      },
      ...(queueEntryId ? { queueEntryId } : {}),
    });

    console.info('[JUNO Push] Push subscription registered with backend');
  } catch (err) {
    console.error('[JUNO Push] Failed to subscribe to push notifications:', err);
  }
}

/**
 * Unsubscribes from push notifications.
 * Call on logout or when the patient leaves the queue.
 */
export async function unsubscribeFromPush(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      return;
    }

    await queueClient.unsubscribePush(subscription.endpoint);
    await subscription.unsubscribe();

    console.info('[JUNO Push] Push subscription removed');
  } catch (err) {
    console.error('[JUNO Push] Failed to unsubscribe:', err);
  }
}