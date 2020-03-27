const FILES_TO_CACHE = [
    "/",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
    "/index.html",
    "/index.js",
    "/manifest.webmanifest",
    "/styles.css"
]

const CACHE_NAME = "static-cache-v2"
const DATA_CACHE_NAME = "data-cache-v1"

self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Pre-Cache successful')
            return cache.addAll(FILES_TO_CACHE)
        })
    )
    self.skipWaiting()
})

self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log('removing old files from cache', key)
                        return caches.delete(key)
                    }
                })
            )
        })
    )
    self.clients.claim()
})

self.addEventListener("fetch", evt => {
    if(evt.request.url.includes('/api/')) {
        console.log('[Service Worker] Fetch(data)', evt.request.url);
    
evt.respondWith(
                caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(evt.request)
                .then(response => {
                    if (response.status === 200){
                        cache.put(evt.request.url, response.clone());
                    }
                    return response;
                })
                .catch(err => {
                    return cache.match(evt.request);
                });
            })
            );
            return;
        }

evt.respondWith(
    caches.open(CACHE_NAME).then( cache => {
      return cache.match(evt.request).then(response => {
        return response || fetch(evt.request);
      });
    })
  );
});
