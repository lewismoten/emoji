const CACHE_PREFIX = 'emoji-explorer-';
const CACHE_NAME = `${CACHE_PREFIX}__PACKAGE_VERSION__`;
const CORE_ASSETS = __CORE_ASSETS__;
const scopedUrl = path => new URL(path, self.registration.scope).href;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS.map(scopedUrl)))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(names
        .filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
        .map(name => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

const cacheResponse = async (request, response) => {
  if (response?.ok) {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  }
  return response;
};

const networkFirst = async request => {
  try {
    return await cacheResponse(request, await fetch(request));
  } catch {
    return await caches.match(request, { ignoreSearch: true })
      ?? await caches.match(scopedUrl('./offline.html'));
  }
};

const cacheFirst = async request => {
  const cached = await caches.match(request);
  if (cached) return cached;
  return cacheResponse(request, await fetch(request));
};

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(request.mode === 'navigate' ? networkFirst(request) : cacheFirst(request));
});
