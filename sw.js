// sw.js — VenFinance Service Worker
const CACHE_VERSION = 'vf-v6.0.0';
const STATIC_ASSETS = [
  './',
  './login.html',
  './index.html',
  './ingresos.html',
  './dashboard.html',
  './rates.html',
  './style.css',
  './css/global.css',
  './js/settings.js',
  './db.js',
  './auth.js',
  './firebase-config.js',
  './manifest.json'
];

// INSTALL: pre-cache all static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ACTIVATE: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_VERSION)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// FETCH: Cache-First for static assets, Network-First for API
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Firebase, Google API & auth calls always go to network
  if (url.hostname.includes('googleapis.com') ||
      url.hostname.includes('accounts.google.com') ||
      url.hostname.includes('gstatic.com') ||
      url.hostname.includes('firebaseio.com') ||
      url.hostname.includes('firestore.googleapis.com') ||
      url.hostname.includes('dolarapi.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Everything else: Cache-First with network fallback
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        // Dynamically cache new responses (fonts, CDN scripts, etc.)
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_VERSION)
            .then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    }).catch(() => {
      // Offline fallback: return login.html for navigation requests
      if (event.request.mode === 'navigate') {
        return caches.match('./login.html');
      }
    })
  );
});

// SYNC: when connection returns, notify clients to sync pending ops
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending') {
    event.waitUntil(syncPendingOperations());
  }
});

async function syncPendingOperations() {
  const clients = await self.clients.matchAll();
  clients.forEach(client => client.postMessage({ type: 'SYNC_NOW' }));
}
