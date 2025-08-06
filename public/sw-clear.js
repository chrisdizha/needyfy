// Service Worker Cache Clear - Force refresh
const CACHE_VERSION = 'v' + Date.now();
const CACHE_NAME = 'needyfy-' + CACHE_VERSION;

self.addEventListener('install', function(event) {
  console.log('SW: Installing with cache clear', CACHE_VERSION);
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('SW: Activating with cache clear', CACHE_VERSION);
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          console.log('SW: Deleting cache', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  // Don't cache anything for now to force fresh loads
  event.respondWith(fetch(event.request));
});