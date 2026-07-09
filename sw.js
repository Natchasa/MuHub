// sw.js — MuHub Service Worker for Offline Support

const CACHE_NAME = 'muhub-cache-v7';
const ASSETS_TO_CACHE = [
  './index.html',
  './styles.css',
  './state.js',
  './astro-calc.js',
  './wheel-renderer.js',
  './table-renderer.js',
  './thaksa.js',
  './location-manager.js',
  './booking.js',
  './siimsi.js',
  './free-horoscope.js',
  './shop.js',
  './app-init.js',
  './astronomy.browser.min.js',
  './logo.png',
  './ganesh_cup.png',
  './guanyin_cup.png',
  './citypillar_cup.png',
  './wallpaper_mockup.png',
  './pdf_book_mockup.png',
  './bracelet_mockup.png',
  './yantra_mockup.png'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching essential assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Service Worker & cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Strategy: Stale-While-Revalidate / Cache falling back to network
self.addEventListener('fetch', (event) => {
  // Only cache local requests (http/https scheme matching our host)
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch fresh version in the background
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch((err) => console.log('Background fetch failed (offline):', err));

        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    })
  );
});
