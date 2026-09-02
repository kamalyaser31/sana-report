const CACHE_NAME = 'sana-report-v14';
const ASSETS = [
  './',
  './index.html',
  './tajweed.html',
  './manifest.json',
  './css/styles.css',
  './js/constants.js',
  './js/state.js',
  './js/ui.js',
  './js/drafts.js',
  './js/settings.js',
  './js/render.js',
  './js/students.js',
  './js/report.js',
  './js/quran.js',
  './js/app.js',
  './js/quran-data.js',
  './js/html2pdf.bundle.min.js',
  './data/quran_surahs.json',
  './data/quran_juzs.json',
  './assets/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  const isHtml = event.request.headers.get('accept')?.includes('text/html') ||
                 requestUrl.pathname.endsWith('.html') ||
                 requestUrl.pathname.endsWith('/');

  // استراتيجية الشبكة أولاً لصفحات HTML لضمان وصول التحديثات لحظياً
  if (isHtml) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  // استراتيجية الكاش أولاً للملفات الثابتة (js, css, json, fonts, svg) مع الجلب عند الغياب
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      });
    })
  );
});
