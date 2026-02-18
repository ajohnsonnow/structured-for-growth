/**
 * @file offlineStore.js — IndexedDB wrapper for offline data persistence (P5.2.4)
 *
 * Think of this as a mini-database that lives right inside the browser.
 * When the user loses connectivity, their form submissions and data
 * get stashed here, then sync back to the server once they reconnect.
 *
 * Three main stores:
 *   1. outbox  — queued API requests waiting to be sent
 *   2. cache   — server responses cached for offline reads
 *   3. drafts  — user-created content saved locally
 */

const DB_NAME = 'sfg-offline';
const DB_VERSION = 1;

/** @type {IDBDatabase|null} */
let _db = null;

/* ─── helpers ─────────────────────────────────────────────────────── */

/**
 * Open (or create) the IndexedDB database. Returns a promise that
 * resolves with the db handle and caches it for future calls.
 * @returns {Promise<IDBDatabase>}
 */
export function openDatabase() {
  if (_db) {
    return Promise.resolve(_db);
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = /** @type {IDBDatabase} */ (event.target.result);

      // outbox — queued API calls that couldn't be sent while offline
      if (!db.objectStoreNames.contains('outbox')) {
        const outbox = db.createObjectStore('outbox', {
          keyPath: 'id',
          autoIncrement: true,
        });
        outbox.createIndex('timestamp', 'timestamp', { unique: false });
        outbox.createIndex('url', 'url', { unique: false });
      }

      // cache — lightweight key-value store for server data
      if (!db.objectStoreNames.contains('cache')) {
        const cache = db.createObjectStore('cache', { keyPath: 'key' });
        cache.createIndex('expires', 'expires', { unique: false });
      }

      // drafts — user-generated content saved locally
      if (!db.objectStoreNames.contains('drafts')) {
        const drafts = db.createObjectStore('drafts', {
          keyPath: 'id',
          autoIncrement: true,
        });
        drafts.createIndex('type', 'type', { unique: false });
        drafts.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      _db = /** @type {IDBDatabase} */ (event.target.result);
      resolve(_db);
    };

    request.onerror = () => reject(request.error);
  });
}

/* ─── generic transaction helpers ─────────────────────────────────── */

/**
 * Run a read-write transaction on one store.
 * @param {string} storeName
 * @param {'readonly'|'readwrite'} mode
 * @param {(store: IDBObjectStore) => IDBRequest} fn
 * @returns {Promise<any>}
 */
async function txn(storeName, mode, fn) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const request = fn(store);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/* ─── OUTBOX — queued form submissions / API calls ────────────────── */

/**
 * Enqueue an API request to be replayed when back online.
 * @param {string} url
 * @param {string} method
 * @param {Record<string, string>} headers
 * @param {any} body
 * @returns {Promise<number>} The outbox entry id
 */
export function enqueueRequest(url, method, headers, body) {
  return txn('outbox', 'readwrite', (store) =>
    store.add({ url, method, headers, body, timestamp: Date.now() })
  );
}

/**
 * Get all queued requests, oldest first.
 * @returns {Promise<Array<{id:number, url:string, method:string, headers:object, body:any, timestamp:number}>>}
 */
export async function getQueuedRequests() {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('outbox', 'readonly');
    const store = tx.objectStore('outbox');
    const idx = store.index('timestamp');
    const request = idx.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Remove a single outbox entry after successful replay.
 * @param {number} id
 */
export function removeQueuedRequest(id) {
  return txn('outbox', 'readwrite', (store) => store.delete(id));
}

/**
 * Replay all queued requests. Returns results array with success/failure per item.
 * @returns {Promise<Array<{id: number, ok: boolean, status?: number, error?: string}>>}
 */
export async function replayQueue() {
  const items = await getQueuedRequests();
  const results = [];

  for (const item of items) {
    try {
      const response = await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body ? JSON.stringify(item.body) : undefined,
      });

      if (response.ok) {
        await removeQueuedRequest(item.id);
        results.push({ id: item.id, ok: true, status: response.status });
      } else {
        results.push({ id: item.id, ok: false, status: response.status });
      }
    } catch (err) {
      results.push({ id: item.id, ok: false, error: err.message });
    }
  }

  return results;
}

/* ─── CACHE — offline data reads ──────────────────────────────────── */

/**
 * Store a value in the offline cache with optional TTL.
 * @param {string} key   Cache key (usually the API endpoint path)
 * @param {any}    value The data to cache
 * @param {number} [ttlMs=3600000] Time-to-live in ms (default 1 hour)
 */
export function cacheSet(key, value, ttlMs = 3_600_000) {
  return txn('cache', 'readwrite', (store) =>
    store.put({
      key,
      value,
      cachedAt: Date.now(),
      expires: Date.now() + ttlMs,
    })
  );
}

/**
 * Retrieve a cached value. Returns `null` if missing or expired.
 * @param {string} key
 * @returns {Promise<any|null>}
 */
export async function cacheGet(key) {
  const record = await txn('cache', 'readonly', (store) => store.get(key));
  if (!record) {
    return null;
  }
  if (record.expires < Date.now()) {
    // expired — clean up
    await txn('cache', 'readwrite', (store) => store.delete(key));
    return null;
  }
  return record.value;
}

/**
 * Remove expired entries from cache.
 */
export async function cachePurgeExpired() {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('cache', 'readwrite');
    const store = tx.objectStore('cache');
    const idx = store.index('expires');
    const range = IDBKeyRange.upperBound(Date.now());
    const cursor = idx.openCursor(range);

    cursor.onsuccess = (event) => {
      const c = event.target.result;
      if (c) {
        c.delete();
        c.continue();
      }
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/* ─── DRAFTS — local working copies ──────────────────────────────── */

/**
 * Save a draft. If `draft.id` exists, it updates; otherwise inserts.
 * @param {object} draft
 * @param {string} draft.type  e.g. 'template', 'report', 'message'
 * @param {any}    draft.data  The draft content
 * @param {number} [draft.id]  Optional existing draft id for updates
 * @returns {Promise<number>} The draft id
 */
export function saveDraft(draft) {
  return txn('drafts', 'readwrite', (store) =>
    store.put({
      ...draft,
      updatedAt: Date.now(),
    })
  );
}

/**
 * Get all drafts of a given type.
 * @param {string} type
 * @returns {Promise<Array>}
 */
export async function getDraftsByType(type) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('drafts', 'readonly');
    const store = tx.objectStore('drafts');
    const idx = store.index('type');
    const request = idx.getAll(type);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Delete a draft by id.
 * @param {number} id
 */
export function deleteDraft(id) {
  return txn('drafts', 'readwrite', (store) => store.delete(id));
}

/* ─── NETWORK-AWARE FETCH WRAPPER ─────────────────────────────────── */

/**
 * Smart fetch that checks cache when offline and queues mutations.
 *
 * - GET requests: tries network first, falls back to IndexedDB cache
 * - POST/PUT/DELETE: if offline, queues to outbox for later replay
 *
 * @param {string} url
 * @param {RequestInit} [options]
 * @returns {Promise<any>}
 */
export async function offlineFetch(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase();

  if (navigator.onLine) {
    try {
      const res = await fetch(url, options);
      const data = await res.json();

      // Cache successful GET responses
      if (method === 'GET' && res.ok) {
        await cacheSet(url, data);
      }

      return data;
    } catch (err) {
      // Network error — fall through to offline logic
      if (method === 'GET') {
        const cached = await cacheGet(url);
        if (cached) {
          return cached;
        }
      }
      throw err;
    }
  }

  // Offline
  if (method === 'GET') {
    const cached = await cacheGet(url);
    if (cached) {
      return cached;
    }
    throw new Error('Offline and no cached data available for ' + url);
  }

  // Queue mutation for later
  await enqueueRequest(
    url,
    method,
    /** @type {Record<string,string>} */ (
      options.headers || { 'Content-Type': 'application/json' }
    ),
    options.body ? JSON.parse(/** @type {string} */ (options.body)) : null
  );

  return { queued: true, message: 'Saved offline. Will sync when back online.' };
}

/* ─── STORAGE STATS ───────────────────────────────────────────────── */

/**
 * Get current storage usage info.
 * @returns {Promise<{outboxCount: number, cacheCount: number, draftCount: number, estimatedMB?: number}>}
 */
export async function getStorageStats() {
  const db = await openDatabase();

  const count = (storeName) =>
    new Promise((resolve) => {
      const tx = db.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(0);
    });

  const [outboxCount, cacheCount, draftCount] = await Promise.all([
    count('outbox'),
    count('cache'),
    count('drafts'),
  ]);

  let estimatedMB;
  if (navigator.storage && navigator.storage.estimate) {
    const est = await navigator.storage.estimate();
    estimatedMB = Math.round(((est.usage || 0) / 1024 / 1024) * 100) / 100;
  }

  return { outboxCount, cacheCount, draftCount, estimatedMB };
}
