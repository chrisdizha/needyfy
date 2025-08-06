// NUCLEAR SERVICE WORKER - Clears everything and prevents caching
const NUCLEAR_CACHE_VERSION = 'nuclear-' + Date.now();

console.log('☢️ Nuclear SW: Starting with version', NUCLEAR_CACHE_VERSION);

self.addEventListener('install', function(event) {
  console.log('☢️ Nuclear SW: Installing and clearing all caches');
  
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      console.log('☢️ Nuclear SW: Found caches to delete:', cacheNames);
      return Promise.all(
        cacheNames.map(function(cacheName) {
          console.log('☢️ Nuclear SW: Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(function() {
      console.log('☢️ Nuclear SW: All caches cleared, taking control');
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(event) {
  console.log('☢️ Nuclear SW: Activating and claiming clients');
  
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          console.log('☢️ Nuclear SW: Final cache delete:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(function() {
      console.log('☢️ Nuclear SW: Taking control of all clients');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  // NUCLEAR: Don't cache ANYTHING, always fetch fresh
  console.log('☢️ Nuclear SW: Fetching fresh (no cache):', event.request.url);
  
  event.respondWith(
    fetch(event.request.clone(), {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    }).catch(function(error) {
      console.error('☢️ Nuclear SW: Fetch failed:', error);
      throw error;
    })
  );
});

self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'NUCLEAR_CLEAR') {
    console.log('☢️ Nuclear SW: Received nuclear clear command');
    
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    }).then(function() {
      event.ports[0].postMessage({success: true});
    });
  }
});