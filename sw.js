// sw.js
const CACHE_VERSION = 'vf-v1.0.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/app.css',
  '/js/app.js',
  '/js/router.js',
  '/js/auth.js',
  '/js/sheets.js',
  '/js/db.js',
  '/js/sync.js',
  '/js/calc.js',
  '/js/charts.js',
  '/js/utils.js',
  '/views/dashboard.js',
  '/views/gastos.js',
  '/views/ingresos.js',
  '/views/tasas.js',
  '/views/reportes.js',
  '/views/config.js',
  '/lib/chart.min.js',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/manifest.json'
];

// INSTALL: pre-cachear todos los archivos estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ACTIVATE: limpiar cachés viejos
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

// FETCH: Cache-First para estáticos, Network-First para API
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Las llamadas a Google Sheets API siempre van a red
  if (url.hostname === 'sheets.googleapis.com' ||
      url.hostname === 'oauth2.googleapis.com') {
    event.respondWith(fetch(event.request));
    return;
  }

  // Todo lo demás: Cache-First
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        // Cachear respuestas nuevas dinámicamente
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_VERSION)
            .then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    }).catch(() => {
      // Offline fallback: devolver index.html para navegación
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
    })
  );
});

// SYNC: cuando vuelve la conexión, sincronizar pendientes
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending') {
    event.waitUntil(syncPendingOperations());
  }
});

async function syncPendingOperations() {
  // El sync real lo maneja VF.Sync desde el contexto de la página
  const clients = await self.clients.matchAll();
  clients.forEach(client => client.postMessage({ type: 'SYNC_NOW' }));
}