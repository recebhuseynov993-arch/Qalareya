// Qalareya — sadə service worker (offline ke-ş)
const CACHE = 'qalareya-v1';
const ASSETS = [
  './index.html', './style.css', './data.js', './script.js',
  './manifest.webmanifest', './assets/icon-192.png', './assets/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

// Network-first API sorğuları, cache-first statik fayllar
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.url.includes('/api/')) {
    e.respondWith(fetch(req).catch(()=>caches.match(req)));
    return;
  }
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(()=>{});
      return res;
    }).catch(()=>caches.match('./index.html')))
  );
});
