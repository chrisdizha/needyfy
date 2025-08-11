const CACHE_NAME = 'needyfy-v1.3';
const urlsToCache = [
  '/',
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

// Install a service worker
self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Listen for requests
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Activate the service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
