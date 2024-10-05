const CACHE_NAME = 'job-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/offline.html',
    '/favicon.ico', // Added favicon to cache
    // Add any other assets you want to cache here
];

// Install service worker and cache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
        })
    );
});

// Fetch assets from cache or network
self.addEventListener('fetch', (event) => {
    console.log('Fetch request for: ' + event.request.url);
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // If a cached response is found, return it
            if (cachedResponse) {
                return cachedResponse;
            }
            // Otherwise, try to fetch from the network
            return fetch(event.request).catch((error) => {
                console.error('Fetch failed; returning offline page instead.', error);
                // Return the offline page if the fetch fails
                return caches.match('/offline.html'); // Ensure you have this page cached
            });
        })
    );
});

// Activate the service worker and remove old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Remove old caches that don't match the current cache name
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
