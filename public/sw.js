
const CACHE_NAME = 'needyfy-v1.4';
const RUNTIME_CACHE = 'needyfy-runtime-v1.4';
const urlsToCache = [
  '/',
  '/offline.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/lovable-uploads/c8a8c731-f261-4752-9811-ed5a532dd2bf.png',
  '/lovable-uploads/b10588a4-3d99-4756-afca-c2bcf51374e2.png',
  '/lovable-uploads/0c649a1e-0ba9-49ec-a985-237ab00f08a4.png',
  '/lovable-uploads/4fe721dd-68db-496d-b1a3-ba8fb8d518da.png',
  '/lovable-uploads/ea754658-c32e-4149-a5ac-2a906d4d031c.png',
  '/lovable-uploads/31e5ee59-6e78-4ce6-bb12-c045bad04558.png',
  '/lovable-uploads/2e78ef83-a8b0-44af-a9b3-f691e46d14a1.png',
  '/lovable-uploads/49fb9ab1-3945-4c06-8d58-a45f786e28fd.png',
  '/lovable-uploads/4bda1892-294b-4f88-b51a-cc6d5cad44c6.png',
  '/lovable-uploads/e541a522-5621-43ff-b544-3e118a24a424.png',
  '/lovable-uploads/fa6c0da4-be4d-4f57-9de8-cb1b0214f84f.png',
  '/lovable-uploads/f8c35258-6e1f-4caf-8eda-778b9f232b46.png'
];

// Install service worker with immediate activation
self.addEventListener('install', event => {
  console.log('Service worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Force activation of new service worker
        return self.skipWaiting();
      })
  );
});

// Activate service worker immediately
self.addEventListener('activate', event => {
  console.log('Service worker activating...');
  const cacheWhitelist = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all([
        // Delete old caches
        ...cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        }),
        // Take control of all clients immediately
        self.clients.claim()
      ]);
    })
  );
});

// Enhanced fetch handler with offline support and caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful navigation responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached page or offline page
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
          // Cache successful API responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached API response if available
          return caches.match(request);
        })
    );
    return;
  }

  // Handle static assets with cache-first strategy
  event.respondWith(
    caches.match(request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // No cache hit - fetch from network and cache
        return fetch(request).then(fetchResponse => {
          // Check if valid response
          if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
            return fetchResponse;
          }

          // Clone the response for caching
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
    event.waitUntil(
      // Process any queued actions (bookings, uploads, etc.)
      processBackgroundSync()
    );
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

// Process background sync queue
async function processBackgroundSync() {
  try {
    // Get queued actions from IndexedDB or localStorage
    const queuedActions = await getQueuedActions();
    
    for (const action of queuedActions) {
      try {
        await processAction(action);
        await removeFromQueue(action.id);
      } catch (error) {
        console.error('Failed to process queued action:', error);
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

// Helper functions for queue management
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

// Handle push notifications (when implemented)
self.addEventListener('push', event => {
  console.log('Push notification received:', event);
  
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
        title: 'Close',
        icon: '/lovable-uploads/c8a8c731-f261-4752-9811-ed5a532dd2bf.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Needyfy', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
