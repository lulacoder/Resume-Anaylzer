import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist, CacheFirst, StaleWhileRevalidate, NetworkFirst } from 'serwist';

// Typed self for the service worker scope
declare global {
  interface ServiceWorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Cache Google Fonts stylesheet
    {
      matcher: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: new CacheFirst({
        cacheName: 'google-fonts-cache',
        plugins: [
          {
            cacheWillUpdate: async ({ response }) =>
              response && response.status === 200 ? response : null,
          },
        ],
      }),
    },
    // Cache Google Fonts files
    {
      matcher: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: new CacheFirst({
        cacheName: 'gstatic-fonts-cache',
      }),
    },
    // Cache static assets (JS, CSS, images)
    {
      matcher: /\.(?:js|css|woff2?|png|jpg|jpeg|svg|gif|ico|webp|avif)$/i,
      handler: new StaleWhileRevalidate({
        cacheName: 'static-assets',
      }),
    },
    // Network-first for HTML pages → falls back to /offline
    {
      matcher: ({ request }) => request.destination === 'document',
      handler: new NetworkFirst({
        cacheName: 'pages-cache',
        networkTimeoutSeconds: 10,
      }),
    },
  ],
  fallbacks: {
    entries: [
      {
        url: '/offline',
        matcher: ({ request }) => request.destination === 'document',
      },
    ],
  },
});

serwist.addEventListeners();
