const CACHE_NAME = 'carbon-coffee-v1';

const PRECACHE_ASSETS = [
  '/',
  '/assets/hero-cup.png',
  '/assets/framerusercontent.com/images/snawRh3kduwUM969MzVgQuJ8JM.png',
  '/assets/framerusercontent.com/images/OLImv5ZR4hvnhTgwisp3puYNG2Q.webp',
  '/assets/framerusercontent.com/images/AIyRkThoOE6nslTFVrzoIc9VaQ0.webp',
  '/assets/framerusercontent.com/images/dGq8f4t94hPz3WfO118E8YgG5Y.webp',
  '/assets/framerusercontent.com/images/2j2i5637yQd78Z8qE0gJkK2q4w.webp'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Pre-cache error (ignoring non-critical):', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle same-origin or asset requests
  if (event.request.method !== 'GET') return;

  const isImageOrFont = /\.(png|jpg|jpeg|webp|svg|gif|ico|hdr|woff2|woff|ttf)(\?.*)?$/i.test(url.pathname);
  const isStaticAsset = url.pathname.startsWith('/assets/');

  if (isImageOrFont || isStaticAsset) {
    // Cache-First strategy for images, fonts, and static assets
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return networkResponse;
        }).catch(() => cachedResponse);
      })
    );
    return;
  }

  // Network-First strategy for HTML navigation
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(() => caches.match(event.request).then(res => res || caches.match('/')))
    );
  }
});

