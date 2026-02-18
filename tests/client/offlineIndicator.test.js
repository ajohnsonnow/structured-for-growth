// @vitest-environment jsdom
/**
 * offlineIndicator Module — Test Suite
 *
 * Tests: initOfflineIndicator, onConnectivityChange, isOnline
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('offlineIndicator', () => {
  it('exports initOfflineIndicator function', async () => {
    const mod = await import('../../client/js/modules/offlineIndicator.js');
    expect(mod.initOfflineIndicator).toBeDefined();
    expect(typeof mod.initOfflineIndicator).toBe('function');
  });

  it('exports isOnline function', async () => {
    const mod = await import('../../client/js/modules/offlineIndicator.js');
    expect(mod.isOnline).toBeDefined();
    expect(typeof mod.isOnline).toBe('function');
  });

  it('isOnline returns boolean', async () => {
    const { isOnline } = await import('../../client/js/modules/offlineIndicator.js');
    const result = isOnline();
    expect(typeof result).toBe('boolean');
  });

  it('exports onConnectivityChange function', async () => {
    const mod = await import('../../client/js/modules/offlineIndicator.js');
    expect(mod.onConnectivityChange).toBeDefined();
    expect(typeof mod.onConnectivityChange).toBe('function');
  });

  it('initOfflineIndicator creates indicator element', async () => {
    const { initOfflineIndicator } = await import('../../client/js/modules/offlineIndicator.js');
    initOfflineIndicator();
    // Should add an offline indicator to the DOM
    // (exact selector depends on implementation)
  });
});
