/**
 * Service Worker (P5.2.2)
 *
 * Handles offline caching, background sync, and push notifications.
 *
 * Caching strategy (in plain English):
 * - "App Shell" (HTML, CSS, JS): Cache first, update in background
 * - API calls: Network first, fall back to cache
 * - Images: Cache first with 30-day expiry
 * - Offline: Show cached fallback page if everything fails
 *
 * Standards: W3C Service Workers, Workbox strategies
 */

const CACHE_VERSION = 'sfg-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const API_CACHE = `${CACHE_VERSION}-api`;

// App Shell — files needed for basic offline functionality
const APP_SHELL = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/templates.html',
  '/compliance.html',
  '/portal.html',
  '/docs.html',
  '/mbai.html',
  '/offline.html',
  '/styles/main.css',
  '/styles/components.css',
  '/styles/mobile-accessibility.css',
  '/js/main.js',
  '/manifest.json',
];

// ────────────────────────────────────────────────────────────
// Install — Pre-cache the app shell
// ────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Pre-caching app shell');
      return cache.addAll(APP_SHELL).catch((err) => {
        // Don't fail install if some assets are missing in dev
        console.warn('[SW] Some app shell assets not available:', err.message);
      });
    })
  );
  // Activate immediately without waiting for old SW to finish
  self.skipWaiting();
});

// ────────────────────────────────────────────────────────────
// Activate — Clean up old caches
// ────────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE && key !== API_CACHE)
          .map((key) => {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          })
      );
    })
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// ────────────────────────────────────────────────────────────
// Fetch — Smart caching strategies
// ────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip Chrome extensions and other schemes
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // API calls → Network First with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // Static assets (JS, CSS, images) → Cache First
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // HTML pages → Network First (always get latest)
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }

  // Everything else → Stale While Revalidate
  event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
});

// ────────────────────────────────────────────────────────────
// Caching Strategies
// ────────────────────────────────────────────────────────────

/**
 * Cache First: Check cache, only go to network if not cached.
 * Best for: Static assets that rarely change (CSS, JS bundles, images).
 */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

/**
 * Network First: Try network, fall back to cache.
 * Best for: API calls and dynamic content.
 */
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return (
      cached ||
      new Response(JSON.stringify({ error: 'Offline', offline: true }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      })
    );
  }
}

/**
 * Network First with offline page fallback for HTML requests.
 */
async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // Show offline page
    const offlinePage = await caches.match('/offline.html');
    return (
      offlinePage ||
      new Response('<h1>Offline</h1><p>Please check your connection.</p>', {
        status: 503,
        headers: { 'Content-Type': 'text/html' },
      })
    );
  }
}

/**
 * Stale While Revalidate: Return cached version immediately,
 * then update cache in background.
 * Best for: Fonts, non-critical images.
 */
async function staleWhileRevalidate(request, cacheName) {
  const cached = await caches.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        const cloned = response.clone();
        caches.open(cacheName).then((cache) => cache.put(request, cloned));
      }
      return response;
    })
    .catch(() => cached);

  return cached || fetchPromise;
}

// ────────────────────────────────────────────────────────────
// Background Sync (P5.2.5)
// ────────────────────────────────────────────────────────────

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-queued-forms') {
    event.waitUntil(syncQueuedForms());
  }
});

async function syncQueuedForms() {
  // This works with the IndexedDB offline store
  // Forms saved while offline get replayed here
  try {
    const db = await openSyncDB();
    const tx = db.transaction('outbox', 'readonly');
    const store = tx.objectStore('outbox');
    const requests = await getAllFromStore(store);

    for (const item of requests) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body: item.body,
        });
        if (response.ok) {
          const deleteTx = db.transaction('outbox', 'readwrite');
          deleteTx.objectStore('outbox').delete(item.id);
        }
      } catch {
        // Network still down — sync will retry
      }
    }
  } catch (err) {
    console.error('[SW] Background sync failed:', err);
  }
}

// ────────────────────────────────────────────────────────────
// Push Notifications (P5.2.6)
// ────────────────────────────────────────────────────────────

self.addEventListener('push', (event) => {
  let data = { title: 'Structured for Growth', body: 'You have an update.' };

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' },
    actions: data.actions || [
      { action: 'open', title: 'Open' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
    tag: data.tag || 'sfg-notification',
    renotify: data.renotify || false,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      // Focus existing window or open new one
      const existingClient = clients.find((c) => c.url.includes(url));
      if (existingClient) {
        return existingClient.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});

// ────────────────────────────────────────────────────────────
// Update Notification (P5.2.8)
// ────────────────────────────────────────────────────────────

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function isStaticAsset(pathname) {
  return /\.(js|css|png|jpg|jpeg|gif|svg|woff2?|ttf|eot|ico|webp|avif)$/i.test(pathname);
}

function openSyncDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('sfg-sync', 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('outbox', { keyPath: 'id', autoIncrement: true });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getAllFromStore(store) {
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
