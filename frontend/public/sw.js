const CACHE_NAME = 'transitflow-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/bundle.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  // Simple cache-first strategy for static assets
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});
