const cacheName = 'manytwitch-cache';
const toCache = [
  '/js/bootstrap.min.js',
  '/js/handlebars.js',
  '/js/all.min.js',
  '/js/Sortable.min.js',
  '/js/manytwitch.js',
  '/style/bootstrap-dark.min.css',
  '/style/all.min.css',
  '/style/manytwitch.css'
];

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install');
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    console.log('[Service Worker] Caching all: app shell and content');
    await cache.addAll(toCache);
  })());
});

self.addEventListener('fetch', (event) => {
  event.respondWith((async () => {
    const r = await caches.match(e.request);
    console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
    if (r) { return r; }
    const response = await fetch(e.request);
    const cache = await caches.open(cacheName);
    console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
    cache.put(e.request, response.clone());
    return response;
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});
