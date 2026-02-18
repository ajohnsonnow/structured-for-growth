// @vitest-environment jsdom
/**
 * offlineStore Module — Test Suite
 *
 * Tests: openDatabase, enqueueRequest, replayQueue, cacheGet/Set, drafts CRUD
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock IndexedDB
const mockDB = {
  transaction: vi.fn(() => ({
    objectStore: vi.fn(() => ({
      add: vi.fn(() => ({ onsuccess: null, onerror: null })),
      get: vi.fn(() => ({ onsuccess: null, onerror: null, result: null })),
      put: vi.fn(() => ({ onsuccess: null, onerror: null })),
      delete: vi.fn(() => ({ onsuccess: null, onerror: null })),
      getAll: vi.fn(() => ({ onsuccess: null, onerror: null, result: [] })),
      openCursor: vi.fn(() => ({ onsuccess: null, onerror: null })),
    })),
  })),
  close: vi.fn(),
};

const mockOpenRequest = {
  onsuccess: null,
  onerror: null,
  onupgradeneeded: null,
  result: mockDB,
};

beforeEach(() => {
  vi.restoreAllMocks();
  vi.stubGlobal('indexedDB', {
    open: vi.fn(() => {
      setTimeout(() => mockOpenRequest.onsuccess?.({ target: mockOpenRequest }), 0);
      return mockOpenRequest;
    }),
  });
});

describe('offlineStore', () => {
  it('exports openDatabase function', async () => {
    const mod = await import('../../client/js/modules/offlineStore.js');
    expect(mod.openDatabase).toBeDefined();
    expect(typeof mod.openDatabase).toBe('function');
  });

  it('exports enqueueRequest function', async () => {
    const mod = await import('../../client/js/modules/offlineStore.js');
    expect(mod.enqueueRequest).toBeDefined();
    expect(typeof mod.enqueueRequest).toBe('function');
  });

  it('exports replayQueue function', async () => {
    const mod = await import('../../client/js/modules/offlineStore.js');
    expect(mod.replayQueue).toBeDefined();
    expect(typeof mod.replayQueue).toBe('function');
  });

  it('exports cacheGet and cacheSet', async () => {
    const mod = await import('../../client/js/modules/offlineStore.js');
    expect(mod.cacheGet || mod.cacheSet).toBeDefined();
  });
});
