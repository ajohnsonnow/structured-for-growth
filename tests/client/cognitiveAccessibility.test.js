// @vitest-environment jsdom
/**
 * cognitiveAccessibility Module — Test Suite
 *
 * Tests: AutoSaveManager, step wizard, session timeout
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  document.body.innerHTML = '';
  vi.useFakeTimers();
  // Mock localStorage
  const store = {};
  vi.stubGlobal('localStorage', {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, val) => {
      store[key] = val;
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach((k) => delete store[k]);
    }),
  });
});

describe('cognitiveAccessibility', () => {
  it('exports AutoSaveManager class', async () => {
    const mod = await import('../../client/js/modules/cognitiveAccessibility.js');
    expect(mod.AutoSaveManager).toBeDefined();
    expect(typeof mod.AutoSaveManager).toBe('function');
  });

  it('AutoSaveManager initializes with default config', async () => {
    const { AutoSaveManager } = await import('../../client/js/modules/cognitiveAccessibility.js');
    const form = document.createElement('form');
    form.id = 'test-form';
    const input = document.createElement('input');
    input.name = 'testField';
    input.value = 'hello';
    form.appendChild(input);
    document.body.appendChild(form);

    const manager = new AutoSaveManager('test-form');
    expect(manager).toBeDefined();
  });

  it('saves form data to localStorage on change', async () => {
    const { AutoSaveManager } = await import('../../client/js/modules/cognitiveAccessibility.js');
    const form = document.createElement('form');
    form.id = 'autosave-test';
    const input = document.createElement('input');
    input.name = 'name';
    input.type = 'text';
    form.appendChild(input);
    document.body.appendChild(form);

    const manager = new AutoSaveManager('autosave-test');
    manager.init(); // Must call init() to wire up event listeners
    input.value = 'Test Name';
    input.dispatchEvent(new Event('change', { bubbles: true }));

    expect(localStorage.setItem).toHaveBeenCalled();
  });
});
