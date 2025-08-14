const CACHE_NAME = 'needyfy-v2.1';
const RUNTIME_CACHE = 'needyfy-runtime-v2.1';

// Essential resources that should always be cached
const ESSENTIAL_CACHE = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/lovable-uploads/c8a8c731-f261-4752-9811-ed5a532dd2bf.png',
  '/lovable-uploads/b10588a4-3d99-4756-afca-c2bcf51374e2.png'
];

// Install service worker and cache essential resources
self.addEventListener('install', event => {
  console.log('Service worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching essential resources');
        return cache.addAll(ESSENTIAL_CACHE);
      })
      .then(() => {
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Failed to cache essential resources:', error);
      })
  );
});

// Activate service worker and clean old caches
self.addEventListener('activate', event => {
  console.log('Service worker activating...');
  const cacheWhitelist = [CACHE_NAME, RUNTIME_CACHE];
  
  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control immediately
      self.clients.claim()
    ])
  );
});

// Enhanced fetch handler with improved caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and external resources
  if (request.method !== 'GET' || !url.origin.includes(self.location.origin.replace('https://', '').replace('http://', ''))) {
    return;
  }

  // Handle navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request)
            .then(cachedResponse => {
              return cachedResponse || caches.match('/offline.html');
            });
        })
    );
    return;
  }

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Handle static assets with cache-first strategy
  event.respondWith(
    caches.match(request)
      .then(response => {
        if (response) {
          return response;
        }
        
        return fetch(request).then(fetchResponse => {
          if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
            return fetchResponse;
          }

          const responseToCache = fetchResponse.clone();
          caches.open(RUNTIME_CACHE).then(cache => {
            cache.put(request, responseToCache);
          });

          return fetchResponse;
        });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(processBackgroundSync());
  }
});

// Periodic sync for content updates
self.addEventListener('periodicsync', event => {
  console.log('Periodic sync triggered:', event.tag);
  
  if (event.tag === 'periodic-content-sync') {
    event.waitUntil(
      // Update cached content in background
      updateContentCache()
    );
  }
});

// Push notifications
self.addEventListener('push', event => {
  console.log('Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from Needyfy',
    icon: '/lovable-uploads/c8a8c731-f261-4752-9811-ed5a532dd2bf.png',
    badge: '/lovable-uploads/c8a8c731-f261-4752-9811-ed5a532dd2bf.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/lovable-uploads/c8a8c731-f261-4752-9811-ed5a532dd2bf.png'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Needyfy', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync processing
async function processBackgroundSync() {
  try {
    // Process any queued offline actions
    console.log('Processing background sync...');
    
    // Get queued actions from IndexedDB (implement as needed)
    const queuedActions = await getQueuedActions();
    
    for (const action of queuedActions) {
      try {
        await processAction(action);
        await removeFromQueue(action.id);
        console.log('Processed queued action:', action.type);
      } catch (error) {
        console.error('Failed to process action:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Update content cache during periodic sync
async function updateContentCache() {
  try {
    const cache = await caches.open(RUNTIME_CACHE);
    
    // Update frequently accessed content
    const urlsToUpdate = [
      '/',
      '/equipment',
      '/categories'
    ];
    
    for (const url of urlsToUpdate) {
      try {
        const response = await fetch(url);
        if (response.status === 200) {
          await cache.put(url, response);
        }
      } catch (error) {
        console.error(`Failed to update cache for ${url}:`, error);
      }
    }
  } catch (error) {
    console.error('Periodic sync failed:', error);
  }
}

// Helper functions for queue management (implement with IndexedDB)
async function getQueuedActions() {
  // This would typically use IndexedDB
  // For now, return empty array
  return [];
}

async function processAction(action) {
  // Process the queued action (API call, upload, etc.)
  console.log('Processing action:', action);
}

async function removeFromQueue(actionId) {
  // Remove processed action from queue
  console.log('Removing action from queue:', actionId);
}
