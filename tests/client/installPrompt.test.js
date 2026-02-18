// @vitest-environment jsdom
/**
 * installPrompt Module — Test Suite
 *
 * Tests: canInstall, isInstalled, PWA install prompt handling
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  vi.restoreAllMocks();
  // jsdom doesn't have matchMedia — provide a stub
  if (!window.matchMedia) {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  }
});

describe('installPrompt', () => {
  it('exports canInstall function', async () => {
    const mod = await import('../../client/js/modules/installPrompt.js');
    expect(mod.canInstall).toBeDefined();
    expect(typeof mod.canInstall).toBe('function');
  });

  it('exports isInstalled function', async () => {
    const mod = await import('../../client/js/modules/installPrompt.js');
    expect(mod.isInstalled).toBeDefined();
    expect(typeof mod.isInstalled).toBe('function');
  });

  it('canInstall returns boolean', async () => {
    const { canInstall } = await import('../../client/js/modules/installPrompt.js');
    const result = canInstall();
    expect(typeof result).toBe('boolean');
  });

  it('isInstalled returns boolean', async () => {
    const { isInstalled } = await import('../../client/js/modules/installPrompt.js');
    const result = isInstalled();
    expect(typeof result).toBe('boolean');
  });

  it('isInstalled returns false in non-standalone mode', async () => {
    // Default jsdom does not have standalone mode
    const { isInstalled } = await import('../../client/js/modules/installPrompt.js');
    expect(isInstalled()).toBe(false);
  });
});
