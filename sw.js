
// sw.js — TripFast
// Súbele la versión en cada deploy para forzar update
const CACHE = 'tripfast-v7';

// Precarga lo crítico de tu app. Agrega acá lo que quieras dejar offline.
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png' // si la tienes
];

// Instalar: precache + tomar control rápido
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

// Activar: limpiar caches viejas + reclamar control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Estrategia:
// - HTML/navegación: NETWORK-FIRST (así no te quedas pegado en versiones viejas)
// - Assets (css/js/img/json): CACHE-FIRST con actualización en segundo plano
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Solo manejamos GET
  if (req.method !== 'GET') return;

  const accept = req.headers.get('accept') || '';

  // Navegación / HTML → network first
  const isNav = req.mode === 'navigate' || accept.includes('text/html');

  if (isNav) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  // Assets → cache first
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) {
        // Actualiza en segundo plano
        fetch(req).then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
          }
        }).catch(() => {});
        return cached;
      }
      // Si no está en cache, a red
      return fetch(req).then((res) => {
        // Cachea solo respuestas OK
        if (res && res.status === 200 && (req.url.startsWith(self.location.origin) || req.url.startsWith('./'))) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      }).catch(() => caches.match('./index.html')); // último recurso
    })
  );
});

// Opcional: permitir saltar espera si algún cliente lo pide
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
