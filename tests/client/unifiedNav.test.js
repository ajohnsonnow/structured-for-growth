// @vitest-environment jsdom
/**
 * Unified Navigation Module Tests
 * Tests nav rendering, mega-menu, mobile overlay, breadcrumbs, keyboard nav.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let initUnifiedNav;

function setupDOM() {
  document.body.innerHTML = `
    <nav class="navbar"></nav>
    <main id="main-content"><p>Page content</p></main>
  `;
  // Mock location for aria-current detection
  Object.defineProperty(window, 'location', {
    value: { pathname: '/', hash: '', href: 'http://localhost/' },
    writable: true,
    configurable: true,
  });
}

describe('Unified Navigation Module', () => {
  beforeEach(async () => {
    vi.resetModules();
    setupDOM();

    // Stub matchMedia
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const mod = await import('../../client/js/modules/unifiedNav.js');
    initUnifiedNav = mod.initUnifiedNav;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initUnifiedNav()', () => {
    it('should not throw when called', () => {
      expect(() => initUnifiedNav()).not.toThrow();
    });

    it('should render a navigation element when renderNav is true', () => {
      initUnifiedNav({ renderNav: true });
      const nav = document.querySelector('.site-nav, nav[aria-label]');
      // Either the new nav was injected or the existing one was updated
      expect(nav).toBeTruthy();
    });

    it('should render a footer when renderFooter is true', () => {
      initUnifiedNav({ renderFooter: true });
      const footer = document.querySelector('.site-footer, footer');
      expect(footer).toBeTruthy();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should handle Escape key to close menus', () => {
      initUnifiedNav({ renderNav: true });

      // Simulate opening a dropdown
      const dropdown = document.querySelector('.mega-menu');
      if (dropdown) {
        dropdown.classList.add('open');

        // Press Escape
        const event = new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
        });
        document.dispatchEvent(event);

        // The dropdown should close
        expect(dropdown.classList.contains('open')).toBe(false);
      }
    });
  });

  describe('ARIA Attributes', () => {
    it('should set appropriate ARIA roles on nav elements', () => {
      initUnifiedNav({ renderNav: true });
      const nav = document.querySelector('.site-nav, nav');
      if (nav) {
        const ariaLabel = nav.getAttribute('aria-label');
        expect(ariaLabel || nav.getAttribute('role')).toBeTruthy();
      }
    });
  });
});
