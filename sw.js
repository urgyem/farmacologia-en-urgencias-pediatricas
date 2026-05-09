const CACHE = 'pedifarma-v2';

const APP_SHELL = [
  './index.html',
  './manifest.json',
  './icon.svg'
];

const CDN_URLS = [
  'https://unpkg.com/react@18/umd/react.development.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.development.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(async cache => {
      await cache.addAll(APP_SHELL);
      // CDN resources: intentamos cachearlas pero no bloqueamos si fallan
      await Promise.allSettled(
        CDN_URLS.map(url =>
          fetch(url, { mode: 'cors' })
            .then(res => res.ok && cache.put(url, res))
            .catch(() => {})
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
