// @vitest-environment jsdom
/**
 * Theme Toggle Module Tests
 * Tests dark/light mode switching, localStorage persistence, and OS preference detection.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Mock localStorage for jsdom (vitest jsdom doesn't always provide it).
 */
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (i) => Object.keys(store)[i] ?? null,
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

let initThemeToggle, toggleTheme, applyTheme, resolveInitialTheme;

function setupDOM() {
  document.documentElement.removeAttribute('data-theme');
  document.body.innerHTML = `
    <nav class="site-nav">
      <div class="nav-utilities"></div>
    </nav>
    <main>Content</main>
  `;
}

describe('Theme Toggle Module', () => {
  beforeEach(async () => {
    vi.resetModules();
    localStorageMock.clear();
    setupDOM();

    // Stub matchMedia
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
    });

    const mod = await import('../../client/js/modules/themeToggle.js');
    initThemeToggle = mod.initThemeToggle;
    toggleTheme = mod.toggleTheme;
    applyTheme = mod.applyTheme;
    resolveInitialTheme = mod.resolveInitialTheme;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorageMock.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  describe('resolveInitialTheme()', () => {
    it('should return "dark" by default when no stored preference and OS is dark', () => {
      const theme = resolveInitialTheme();
      expect(theme).toBe('dark');
    });

    it('should return stored preference from localStorage', () => {
      localStorage.setItem('sfg-theme', 'light');
      const theme = resolveInitialTheme();
      expect(theme).toBe('light');
    });

    it('should detect OS light preference when no stored value', () => {
      window.matchMedia = vi.fn().mockReturnValue({
        matches: true, // prefers-color-scheme: light
        addEventListener: vi.fn(),
      });
      // Need to re-import to pick up the new matchMedia
      const theme = resolveInitialTheme();
      // With stored = null and OS = light, should return light
      expect(theme).toBe('light');
    });
  });

  describe('applyTheme()', () => {
    it('should set data-theme="light" for light mode', () => {
      applyTheme('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should remove data-theme for dark mode', () => {
      document.documentElement.setAttribute('data-theme', 'light');
      applyTheme('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBeNull();
    });
  });

  describe('toggleTheme()', () => {
    it('should switch from dark to light', () => {
      applyTheme('dark');
      const result = toggleTheme();
      expect(result).toBe('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      expect(localStorage.getItem('sfg-theme')).toBe('light');
    });

    it('should switch from light to dark', () => {
      applyTheme('light');
      const result = toggleTheme();
      expect(result).toBe('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBeNull();
      expect(localStorage.getItem('sfg-theme')).toBe('dark');
    });
  });

  describe('initThemeToggle()', () => {
    it('should inject a toggle button into .nav-utilities', () => {
      initThemeToggle();
      const btn = document.querySelector('.theme-toggle');
      expect(btn).toBeTruthy();
      expect(btn.getAttribute('aria-label')).toBeTruthy();
    });

    it('should create a live region for announcements', () => {
      initThemeToggle();
      const region = document.getElementById('theme-announcement');
      expect(region).toBeTruthy();
      expect(region.getAttribute('aria-live')).toBe('polite');
    });

    it('should toggle theme on button click', () => {
      initThemeToggle();
      const btn = document.querySelector('.theme-toggle');
      expect(btn).toBeTruthy();

      // Default is dark, clicking should switch to light
      btn.click();
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');

      // Click again to go back to dark
      btn.click();
      expect(document.documentElement.getAttribute('data-theme')).toBeNull();
    });
  });
});
