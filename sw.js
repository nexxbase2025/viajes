// sw.js — DWCS
const CACHE = 'dwcs-v1';

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(PRECACHE_URLS)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const accept = req.headers.get('accept') || '';
  const isNav = req.mode === 'navigate' || accept.includes('text/html');

  if (isNav) {
    event.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(cache => cache.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then(cached => cached || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) {
        fetch(req).then(res => {
          if (res && res.status === 200) {
            caches.open(CACHE).then(cache => cache.put(req, res.clone()));
          }
        }).catch(()=>{});
        return cached;
      }
      return fetch(req).then(res => {
        if (res && res.status === 200 && (req.url.startsWith(self.location.origin) || req.url.startsWith('./'))) {
          caches.open(CACHE).then(cache => cache.put(req, res.clone()));
        }
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
