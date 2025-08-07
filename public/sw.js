// Enhanced Service Worker for PWA with background sync and periodic sync
const CACHE_NAME = 'needyfy-v1.2';
const OFFLINE_CACHE = 'needyfy-offline-v1.2';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/equipment',
  '/offline.html'
];

// Background sync queue
const BACKGROUND_SYNC_TAG = 'needyfy-background-sync';
const syncQueue = [];

console.log('Service Worker script loaded');

// Install event - cache app shell
self.addEventListener('install', function(event) {
  console.log('Service Worker installing.');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Caching app shell');
        return cache.addAll(urlsToCache).catch(function(error) {
          console.error('Failed to cache:', error);
        });
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
  console.log('Service Worker activating.');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  event.waitUntil(self.clients.claim());
});

// Enhanced fetch event with offline support and background sync
self.addEventListener('fetch', function(event) {
  // Handle POST requests for background sync
  if (event.request.method === 'POST') {
    event.respondWith(
      fetch(event.request.clone()).catch(function() {
        // Queue for background sync if offline
        syncQueue.push({
          url: event.request.url,
          method: event.request.method,
          body: event.request.body,
          headers: Object.fromEntries(event.request.headers.entries())
        });
        
        // Register background sync
        self.registration.sync.register(BACKGROUND_SYNC_TAG);
        
        return new Response(JSON.stringify({ queued: true }), {
          status: 202,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Handle GET requests with cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        
        return fetch(event.request).then(function(response) {
          // Don't cache non-200 responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Cache successful responses
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseToCache);
          });
          
          return response;
        }).catch(function() {
          // Return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
        });
      }
    )
  );
});

// Push notification handling
self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.message || 'You have a new notification',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: data.tag || 'notification',
      data: {
        url: data.url || '/'
      }
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Needyfy', options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

// Background sync event
self.addEventListener('sync', function(event) {
  if (event.tag === BACKGROUND_SYNC_TAG) {
    event.waitUntil(doBackgroundSync());
  }
});

// Periodic sync event
self.addEventListener('periodicsync', function(event) {
  if (event.tag === 'content-sync') {
    event.waitUntil(updateContent());
  }
});

// Background sync function
async function doBackgroundSync() {
  const queue = [...syncQueue];
  syncQueue.length = 0; // Clear the queue
  
  for (const request of queue) {
    try {
      await fetch(request.url, {
        method: request.method,
        body: request.body,
        headers: request.headers
      });
    } catch (error) {
      console.error('Background sync failed:', error);
      // Re-queue failed requests
      syncQueue.push(request);
    }
  }
}

// Periodic content update
async function updateContent() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await fetch('/api/equipment?featured=true');
    if (response.ok) {
      await cache.put('/api/equipment?featured=true', response);
    }
  } catch (error) {
    console.error('Periodic sync failed:', error);
  }
}

// Share target handling
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SHARE_TARGET') {
    const data = event.data.data;
    // Handle shared content
    event.ports[0].postMessage({ success: true });
  }
});