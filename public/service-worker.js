const CACHE_NAME = 'truth-cache-v2';
const STATIC_CACHE = 'truth-static-v2';
const DYNAMIC_CACHE = 'truth-dynamic-v2';

const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/assets/logo192.png',
  '/assets/logo512.png',
  '/assets/digima_logo.svg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('TRUTH PWA: Caching static assets');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Activate new SW immediately
  );
});

// Fetch event - Network first with offline fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone and cache successful responses
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(async () => {
        // Try to get from cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // For navigation requests, show offline page
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
        
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      })
  );
});

// Activate event - Clean up old caches and take control
self.addEventListener('activate', (event) => {
  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE];
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!currentCaches.includes(cacheName)) {
              console.log('TRUTH PWA: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim()) // Take control of all pages
  );
});

// Listen for messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
  );
});
