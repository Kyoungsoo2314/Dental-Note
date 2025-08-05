
const CACHE_NAME = 'dental-voice-note-ai-v2'; // Bump version to ensure update
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
  // Note: App shell files like TSX/JS bundles and icons will be cached by the fetch event handler on first visit.
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // AddAll can fail if one of the resources fails.
        // For production, a more robust strategy might be needed.
        return cache.addAll(urlsToCache).catch(err => {
          console.error('Failed to cache resources during install:', err);
        });
      })
  );
});

self.addEventListener('fetch', (event) => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200) {
              return response;
            }
            
            // We don't want to cache opaque responses for third-party scripts unless we're sure
            if (response.type !== 'basic' && !event.request.url.startsWith('https://esm.sh') && !event.request.url.startsWith('https://cdn.tailwindcss.com')) {
                return response;
            }

            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
