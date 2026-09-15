const cacheName = 'timelya-v2';
const filesToCache = [
  './',
  './index.html',
  './manifest.json',
  './logo.jpeg',
  './favicon.jpeg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(cacheName).then((cache) => cache.addAll(filesToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== cacheName) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('message', (e) => {
  if (e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      if (response) {
        const fetchPromise = fetch(e.request).then((networkResponse) => {
          caches.open(cacheName).then((cache) => {
            cache.put(e.request, networkResponse.clone());
          });
          return networkResponse;
        });
        return fetchPromise;
      }
      return fetch(e.request);
    })
  );
});
