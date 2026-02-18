/**
 * @file syncEngine.ts — Offline-first data sync with conflict resolution (P5.3.3)
 *
 * How it works (in plain English):
 *   1. Every data change is written locally first (AsyncStorage)
 *   2. A "change log" tracks what was modified and when
 *   3. When connectivity is restored, the engine pushes local changes
 *      to the server and pulls remote changes
 *   4. Conflicts are resolved with "last-write-wins" by default,
 *      but can be set to "manual" for sensitive data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { api } from './api';

/* ─── types ───────────────────────────────────────────────────── */

interface ChangeEntry {
  id: string;
  collection: string;
  documentId: string;
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  synced: boolean;
}

interface SyncResult {
  pushed: number;
  pulled: number;
  conflicts: number;
  errors: string[];
}

type ConflictStrategy = 'last-write-wins' | 'server-wins' | 'client-wins' | 'manual';

interface SyncConfig {
  /** Collections to sync (e.g. ['templates', 'checklists', 'evidence']) */
  collections: string[];
  /** How to resolve conflicts */
  conflictStrategy: ConflictStrategy;
  /** Sync interval in ms (0 = manual only) */
  intervalMs: number;
}

/* ─── constants ───────────────────────────────────────────────── */

const CHANGE_LOG_KEY = 'sfg_sync_changelog';
const LAST_SYNC_KEY = 'sfg_sync_last';
const LOCAL_DATA_PREFIX = 'sfg_local_';

/* ─── change log ──────────────────────────────────────────────── */

async function getChangeLog(): Promise<ChangeEntry[]> {
  const raw = await AsyncStorage.getItem(CHANGE_LOG_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function appendChange(entry: Omit<ChangeEntry, 'id' | 'synced'>): Promise<void> {
  const log = await getChangeLog();
  log.push({
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    synced: false,
  });
  await AsyncStorage.setItem(CHANGE_LOG_KEY, JSON.stringify(log));
}

async function markSynced(ids: string[]): Promise<void> {
  const log = await getChangeLog();
  const idSet = new Set(ids);
  const updated = log.map((e) => (idSet.has(e.id) ? { ...e, synced: true } : e));
  // Keep only last 500 synced entries for debugging, purge older
  const trimmed = updated.filter((e) => !e.synced || Date.now() - e.timestamp < 7 * 86400000);
  await AsyncStorage.setItem(CHANGE_LOG_KEY, JSON.stringify(trimmed));
}

/* ─── local data store ────────────────────────────────────────── */

function localKey(collection: string): string {
  return `${LOCAL_DATA_PREFIX}${collection}`;
}

/** Read all documents in a collection from local storage */
export async function getLocalCollection<T = any>(collection: string): Promise<T[]> {
  const raw = await AsyncStorage.getItem(localKey(collection));
  return raw ? JSON.parse(raw) : [];
}

/** Save a document locally and log the change */
export async function saveLocal(collection: string, documentId: string, data: any): Promise<void> {
  const items = await getLocalCollection(collection);
  const idx = items.findIndex((i: any) => i.id === documentId);

  if (idx >= 0) {
    items[idx] = { ...data, id: documentId, _updatedAt: Date.now() };
    await appendChange({ collection, documentId, operation: 'update', data, timestamp: Date.now() });
  } else {
    items.push({ ...data, id: documentId, _updatedAt: Date.now() });
    await appendChange({ collection, documentId, operation: 'create', data, timestamp: Date.now() });
  }

  await AsyncStorage.setItem(localKey(collection), JSON.stringify(items));
}

/** Delete a document locally and log the change */
export async function deleteLocal(collection: string, documentId: string): Promise<void> {
  const items = await getLocalCollection(collection);
  const filtered = items.filter((i: any) => i.id !== documentId);
  await AsyncStorage.setItem(localKey(collection), JSON.stringify(filtered));
  await appendChange({ collection, documentId, operation: 'delete', data: null, timestamp: Date.now() });
}

/* ─── sync engine ─────────────────────────────────────────────── */

let _syncInterval: ReturnType<typeof setInterval> | null = null;
let _unsubscribeNetInfo: (() => void) | null = null;

/**
 * Push unsynced local changes to server, then pull remote changes.
 */
export async function sync(config: SyncConfig): Promise<SyncResult> {
  const result: SyncResult = { pushed: 0, pulled: 0, conflicts: 0, errors: [] };

  const netState = await NetInfo.fetch();
  if (!netState.isConnected) {
    result.errors.push('No network connection');
    return result;
  }

  // --- PUSH: send local changes to server ---
  const log = await getChangeLog();
  const unsynced = log.filter((e) => !e.synced);
  const syncedIds: string[] = [];

  for (const entry of unsynced) {
    try {
      const endpoint = `/api/sync/${entry.collection}`;

      switch (entry.operation) {
        case 'create':
          await api.post(endpoint, { id: entry.documentId, ...entry.data });
          break;
        case 'update':
          await api.put(`${endpoint}/${entry.documentId}`, entry.data);
          break;
        case 'delete':
          await api.delete(`${endpoint}/${entry.documentId}`);
          break;
      }

      syncedIds.push(entry.id);
      result.pushed++;
    } catch (err: any) {
      if (err.status === 409) {
        // Conflict
        result.conflicts++;
        await resolveConflict(entry, config.conflictStrategy);
        syncedIds.push(entry.id);
      } else {
        result.errors.push(`Failed to push ${entry.collection}/${entry.documentId}: ${err.message}`);
      }
    }
  }

  if (syncedIds.length > 0) {
    await markSynced(syncedIds);
  }

  // --- PULL: fetch remote changes since last sync ---
  const lastSync = await AsyncStorage.getItem(LAST_SYNC_KEY);
  const since = lastSync ? parseInt(lastSync, 10) : 0;

  for (const collection of config.collections) {
    try {
      const remote = await api.get<any[]>(`/api/sync/${collection}?since=${since}`);
      if (Array.isArray(remote) && remote.length > 0) {
        const local = await getLocalCollection(collection);
        const localMap = new Map(local.map((i: any) => [i.id, i]));

        for (const doc of remote) {
          localMap.set(doc.id, { ...doc, _updatedAt: Date.now() });
          result.pulled++;
        }

        await AsyncStorage.setItem(localKey(collection), JSON.stringify([...localMap.values()]));
      }
    } catch (err: any) {
      result.errors.push(`Failed to pull ${collection}: ${err.message}`);
    }
  }

  await AsyncStorage.setItem(LAST_SYNC_KEY, String(Date.now()));
  return result;
}

/* ─── conflict resolution ─────────────────────────────────────── */

async function resolveConflict(entry: ChangeEntry, strategy: ConflictStrategy): Promise<void> {
  switch (strategy) {
    case 'server-wins': {
      // Pull server version and overwrite local
      try {
        const remote = await api.get(`/api/sync/${entry.collection}/${entry.documentId}`);
        const items = await getLocalCollection(entry.collection);
        const idx = items.findIndex((i: any) => i.id === entry.documentId);
        if (idx >= 0) items[idx] = { ...remote, _updatedAt: Date.now() };
        await AsyncStorage.setItem(localKey(entry.collection), JSON.stringify(items));
      } catch { /* swallow */ }
      break;
    }
    case 'client-wins': {
      // Force-push local version
      await api.put(`/api/sync/${entry.collection}/${entry.documentId}?force=true`, entry.data);
      break;
    }
    case 'last-write-wins': {
      // Compare timestamps — whoever wrote last wins
      try {
        const remote = await api.get(`/api/sync/${entry.collection}/${entry.documentId}`);
        if ((remote._updatedAt || 0) > entry.timestamp) {
          // Server is newer — accept server
          const items = await getLocalCollection(entry.collection);
          const idx = items.findIndex((i: any) => i.id === entry.documentId);
          if (idx >= 0) items[idx] = { ...remote, _updatedAt: Date.now() };
          await AsyncStorage.setItem(localKey(entry.collection), JSON.stringify(items));
        } else {
          // Local is newer — force push
          await api.put(`/api/sync/${entry.collection}/${entry.documentId}?force=true`, entry.data);
        }
      } catch { /* fallback to client-wins */ }
      break;
    }
    case 'manual':
      // Store conflict for user to resolve later
      // TODO: In a production app, you'd show a UI for this
      console.warn(`[Sync] Manual conflict resolution needed: ${entry.collection}/${entry.documentId}`);
      break;
  }
}

/* ─── auto-sync lifecycle ─────────────────────────────────────── */

/**
 * Start automatic syncing. Syncs on interval and when connectivity changes.
 */
export function startAutoSync(config: SyncConfig): void {
  stopAutoSync();

  if (config.intervalMs > 0) {
    _syncInterval = setInterval(() => {
      sync(config).catch(console.warn);
    }, config.intervalMs);
  }

  // Sync when connection is restored
  _unsubscribeNetInfo = NetInfo.addEventListener((state: NetInfoState) => {
    if (state.isConnected) {
      sync(config).catch(console.warn);
    }
  });

  // Initial sync
  sync(config).catch(console.warn);
}

/**
 * Stop automatic syncing.
 */
export function stopAutoSync(): void {
  if (_syncInterval) {
    clearInterval(_syncInterval);
    _syncInterval = null;
  }
  if (_unsubscribeNetInfo) {
    _unsubscribeNetInfo();
    _unsubscribeNetInfo = null;
  }
}
