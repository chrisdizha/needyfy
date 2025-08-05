// Enhanced Service Worker for PWA functionality
const CACHE_NAME = 'needyfy-v1';
const STATIC_CACHE = 'needyfy-static-v1';
const DYNAMIC_CACHE = 'needyfy-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html'
];

// Install event - cache core assets
self.addEventListener('install', function(event) {
  console.log('Service Worker installing.');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
  console.log('Service Worker activating.');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        return fetch(event.request)
          .then(fetchResponse => {
            // Don't cache non-successful responses
            if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
              return fetchResponse;
            }
            
            // Cache dynamic content
            const responseClone = fetchResponse.clone();
            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                cache.put(event.request, responseClone);
              });
            
            return fetchResponse;
          })
          .catch(() => {
            // Offline fallback
            if (event.request.destination === 'document') {
              return caches.match('/offline.html');
            }
          });
      })
  );
});

// Push notification handling
self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.message || 'You have a new notification',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      tag: data.tag || 'notification',
      data: {
        url: data.url || '/'
      },
      actions: [
        {
          action: 'open',
          title: 'Open',
          icon: '/icons/icon-96x96.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/icons/icon-96x96.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Needyfy', options)
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

// Background sync for offline actions
self.addEventListener('sync', function(event) {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync operations
      console.log('Background sync triggered')
    );
  }
});