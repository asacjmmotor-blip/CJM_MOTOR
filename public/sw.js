const CACHE_NAME = 'cjm-motor-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/cs/index.html',
  '/cs/result.html',
  '/cs/detail.html',
  '/assets/css/style.css',
  '/assets/css/mobile.css',
  '/assets/js/api.js',
  '/assets/js/cs.js',
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event (Network First for API requests, Cache First / Network Fallback for static assets)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Network First for API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }

  // Stale While Revalidate / Cache First for Static Assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch background update
        fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
