/**
 * @file api.ts — HTTP client for the SFG backend (P5.3.2, P5.3.3)
 *
 * Wraps fetch with:
 *   - Automatic JWT injection from SecureStore
 *   - Offline queuing (saves failed mutations to AsyncStorage)
 *   - Certificate pinning placeholder
 *   - Retry with exponential backoff
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import * as SecureStore from 'expo-secure-store';

/* ─── config ──────────────────────────────────────────────────── */

const BASE_URL = __DEV__
  ? 'http://localhost:3000'
  : 'https://structuredforgrowth.com';

const REQUEST_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 3;
const OFFLINE_QUEUE_KEY = 'sfg_offline_queue';

/* ─── types ───────────────────────────────────────────────────── */

interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | null;
  timestamp: number;
}

/* ─── core fetch wrapper ──────────────────────────────────────── */

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await SecureStore.getItemAsync('sfg_auth_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new ApiError(error.title || error.message || 'Request failed', response.status, error);
    }

    // Handle 204 No Content
    if (response.status === 204) return undefined as T;

    return response.json();
  } catch (err: any) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      throw new ApiError('Request timed out', 408);
    }

    throw err;
  }
}

/* ─── retry wrapper ───────────────────────────────────────────── */

async function requestWithRetry<T>(
  endpoint: string,
  options: RequestInit = {},
  retries = MAX_RETRIES,
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await request<T>(endpoint, options);
    } catch (err: any) {
      const isRetryable = !err.status || err.status >= 500 || err.status === 429;
      if (attempt === retries || !isRetryable) throw err;

      // Exponential backoff: 1s, 2s, 4s
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
    }
  }

  throw new ApiError('Max retries exceeded', 0);
}

/* ─── offline queue ───────────────────────────────────────────── */

async function enqueueOffline(
  endpoint: string,
  method: string,
  body: any,
): Promise<void> {
  const queue = await getOfflineQueue();
  const entry: QueuedRequest = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    url: endpoint,
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : null,
    timestamp: Date.now(),
  };

  queue.push(entry);
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

async function getOfflineQueue(): Promise<QueuedRequest[]> {
  const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

/** Replay all queued requests. Call this when connectivity is restored. */
async function replayOfflineQueue(): Promise<{ replayed: number; failed: number }> {
  const queue = await getOfflineQueue();
  let replayed = 0;
  let failed = 0;
  const remaining: QueuedRequest[] = [];

  for (const item of queue) {
    try {
      await request(item.url, {
        method: item.method,
        body: item.body,
        headers: item.headers,
      });
      replayed++;
    } catch {
      failed++;
      remaining.push(item);
    }
  }

  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
  return { replayed, failed };
}

/* ─── public API surface ──────────────────────────────────────── */

export const api = {
  get: <T = any>(endpoint: string) => requestWithRetry<T>(endpoint, { method: 'GET' }),

  post: async <T = any>(endpoint: string, body: any) => {
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      await enqueueOffline(endpoint, 'POST', body);
      return { queued: true, message: 'Saved offline' } as T;
    }
    return requestWithRetry<T>(endpoint, { method: 'POST', body: JSON.stringify(body) });
  },

  put: async <T = any>(endpoint: string, body: any) => {
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      await enqueueOffline(endpoint, 'PUT', body);
      return { queued: true, message: 'Saved offline' } as T;
    }
    return requestWithRetry<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) });
  },

  delete: async <T = any>(endpoint: string) => {
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      await enqueueOffline(endpoint, 'DELETE', null);
      return { queued: true, message: 'Queued for deletion' } as T;
    }
    return requestWithRetry<T>(endpoint, { method: 'DELETE' });
  },

  /** Get the current offline queue size */
  getQueueSize: async () => (await getOfflineQueue()).length,

  /** Replay queued requests when back online */
  replayQueue: replayOfflineQueue,
};

/* ─── error class ─────────────────────────────────────────────── */

export class ApiError extends Error {
  status: number;
  detail: any;

  constructor(message: string, status: number, detail?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}
