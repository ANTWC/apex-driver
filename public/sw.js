const CACHE_NAME = 'apex-driver-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Network-first strategy — app is dynamic, don't cache aggressively
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
