/* THE RESETE ORDER — Service Worker unificado del host
 * Cachea shell global + entry points de las 3 subapps.
 * Audio MP3: stale-while-revalidate. Resto: network-first con fallback a cache. */
const CACHE_VERSION = 'reset-order-v1';
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const AUDIO_CACHE = `${CACHE_VERSION}-audio`;

const SHELL_URLS = [
  '/shell/shell.css',
  '/shell/shell.js',
  '/shell/logo.png',
  '/shell/icons/icon-192.png',
  '/shell/icons/icon-512.png',
  '/manifest.webmanifest',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => Promise.allSettled(SHELL_URLS.map((u) => cache.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => !k.startsWith(CACHE_VERSION)).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // No interceptar rutas de Next (_next, api) ni navegaciones SSR
  if (url.pathname.startsWith('/_next/') || url.pathname.startsWith('/api/')) return;

  const isAudio = url.pathname.endsWith('.mp3') || url.pathname.includes('/assets/audio/');
  if (isAudio) {
    event.respondWith(
      caches.open(AUDIO_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const networkFetch = fetch(request)
          .then((res) => {
            if (res && res.ok) cache.put(request, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || networkFetch;
      })
    );
    return;
  }

  // Para assets de subapps y shell: network-first con fallback cache
  const isSubappAsset =
    url.pathname.startsWith('/edu/') ||
    url.pathname.startsWith('/binaural/') ||
    url.pathname.startsWith('/shell/');

  if (!isSubappAsset) return; // dejar pasar SSR de Next

  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(SHELL_CACHE).then((c) => c.put(request, copy));
        }
        return res;
      })
      .catch(() => caches.match(request))
  );
});
