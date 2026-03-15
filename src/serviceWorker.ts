/// <reference lib="webworker" />

import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST?: Array<{
    url: string;
    revision?: string | null;
  }>;
};

type NotificationActionCompat = {
  action: string;
  title: string;
  icon?: string;
};

type NotificationOptionsCompat = NotificationOptions & {
  actions?: NotificationActionCompat[];
};

// ── Workbox precache ───────────────────────────────────────────────────────────
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST || []);

// ── Navigation fallback (SPA) ─────────────────────────────────────────────────
registerRoute(
  new NavigationRoute(
    new NetworkFirst({
      cacheName: 'juno-navigation',
      networkTimeoutSeconds: 5,
    }),
    { denylist: [/^\/api\//] }
  )
);

// ── Runtime: Google Fonts ─────────────────────────────────────────────────────
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com',
  new CacheFirst({
    cacheName: 'google-fonts-stylesheets',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxAgeSeconds: 60 * 60 * 24 * 365, maxEntries: 10 }),
    ],
  })
);

registerRoute(
  ({ url }) => url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxAgeSeconds: 60 * 60 * 24 * 365, maxEntries: 20 }),
    ],
  })
);

// ── Push Notifications ────────────────────────────────────────────────────────
self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return;

  let payload: {
    title?: string;
    body?: string;
    position?: number;
    waitMins?: number;
    tag?: string;
    url?: string;
  };

  try {
    payload = event.data.json() as typeof payload;
  } catch {
    payload = { title: 'JUNO Update', body: event.data.text() };
  }

  const title = payload.title ?? 'JUNO Healthcare';

  const options: NotificationOptionsCompat = {
    body: payload.body ?? 'Your queue status has been updated.',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: payload.tag ?? 'juno-queue',
    requireInteraction: true,
    data: {
      url: payload.url ?? '/er-queue',
    },
    actions: [
      { action: 'open', title: 'View Queue' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ── Notification click ────────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl: string = (event.notification.data?.url as string) ?? '/er-queue';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((c) => c.url.includes(self.location.origin));
      if (existing) {
        existing.focus();
        return existing.navigate(targetUrl);
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});

// ── Service worker lifecycle ──────────────────────────────────────────────────
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(self.clients.claim());
});