const CACHE_NAME = 'manytwitch-v1';
const urlsToCache = [
	'/',
	'/js/bootstrap.min.js',
	'/js/handlebars.js',
	'/js/all.min.js',
	'/js/manytwitch.js',
	'/js/express-useragent.min.js',
	'/js/pwa.js',
	'/style/bootstrap-dark.min.css',
	'/style/all.min.css',
	'/style/solid.min.css',
	'/style/manytwitch.css',
	'/images/apple-touch-icon.png',
	'/offline.html'
];

self.addEventListener('install', (event) => {
	console.log('[Service Worker] Install');
	event.waitUntil(
		caches.open(CACHE_NAME)
			.then((cache) => {
				console.log('[Service Worker] Caching app shell');
				return cache.addAll(urlsToCache);
			})
			.then(() => self.skipWaiting())
	);
});

self.addEventListener('fetch', (event) => {
	// Skip cross-origin requests and chrome-extension requests
	if (!event.request.url.startsWith(self.location.origin)) {
		return;
	}

	event.respondWith(
		caches.match(event.request)
			.then((response) => {
				// Cache hit - return response
				if (response) {
					return response;
				}

				// Clone the request
				const fetchRequest = event.request.clone();

				return fetch(fetchRequest).then(
					(response) => {
						// Check if we received a valid response
						if (!response || response.status !== 200 || response.type !== 'basic') {
							return response;
						}

						// Clone the response
						const responseToCache = response.clone();

						// Don't cache POST requests or Twitch API calls
						if (event.request.method === 'GET' && 
							!event.request.url.includes('twitch.tv') &&
							!event.request.url.includes('api')) {
							caches.open(CACHE_NAME)
								.then((cache) => {
									cache.put(event.request, responseToCache);
								});
						}

						return response;
					}
				).catch(() => {
					// Network request failed, try to get offline page from cache
					return caches.match('/offline.html');
				});
			})
	);
});

self.addEventListener('activate', (event) => {
	console.log('[Service Worker] Activate');
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((cacheName) => {
					if (cacheName !== CACHE_NAME) {
						console.log('[Service Worker] Deleting old cache:', cacheName);
						return caches.delete(cacheName);
					}
				})
			);
		}).then(() => {
			return self.clients.claim();
		})
	);
});

// Message handler for skip waiting
self.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'SKIP_WAITING') {
		self.skipWaiting();
	}
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
	event.notification.close();
	event.waitUntil(
		clients.openWindow('/')
	);
});
