// @vitest-environment jsdom
/**
 * Icons Module Tests
 * Tests the SVG icon system: icon rendering, emoji mapping, data-icon init.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

let icon, getIconSvg, getIconNames, initIcons, emojiMap;

describe('Icons Module', () => {
  beforeEach(async () => {
    vi.resetModules();
    document.body.innerHTML = '';
    const mod = await import('../../client/js/modules/icons.js');
    icon = mod.icon;
    getIconSvg = mod.getIconSvg;
    getIconNames = mod.getIconNames;
    initIcons = mod.initIcons;
    emojiMap = mod.emojiMap;
  });

  describe('icon()', () => {
    it('should return an SVG string for a known icon name', () => {
      const svg = icon('home');
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      expect(svg).toContain('aria-hidden="true"');
    });

    it('should return empty string for unknown icon', () => {
      const svg = icon('nonexistent-icon-xyz');
      expect(svg).toBe('');
    });

    it('should apply custom size', () => {
      const svg = icon('home', { size: 32 });
      expect(svg).toContain('width="32"');
      expect(svg).toContain('height="32"');
    });

    it('should apply custom class', () => {
      const svg = icon('home', { class: 'my-icon' });
      expect(svg).toContain('class="icon icon-home my-icon"');
    });

    it('should keep aria-hidden when no label option exists in implementation', () => {
      // The icon() function always sets aria-hidden="true" for decorative icons.
      // If the implementation adds label support later, update this test.
      const svg = icon('home', { label: 'Go Home' });
      // For now, it still has aria-hidden since label isn't supported yet
      expect(svg).toContain('aria-hidden="true"');
    });
  });

  describe('getIconSvg()', () => {
    it('should return raw SVG path data for a known icon', () => {
      const raw = getIconSvg('search');
      // Should be the inner SVG elements (paths, circles, lines, etc.)
      expect(raw).toBeTruthy();
      expect(typeof raw).toBe('string');
    });

    it('should return falsy value for unknown icon', () => {
      const raw = getIconSvg('does-not-exist');
      expect(raw).toBeFalsy();
    });
  });

  describe('getIconNames()', () => {
    it('should return an array of available icon names', () => {
      const names = getIconNames();
      expect(Array.isArray(names)).toBe(true);
      expect(names.length).toBeGreaterThan(50);
      expect(names).toContain('home');
      expect(names).toContain('search');
      expect(names).toContain('shield');
    });
  });

  describe('emojiMap', () => {
    it('should map common emojis to icon names', () => {
      expect(emojiMap).toBeDefined();
      expect(typeof emojiMap).toBe('object');
      // At least some known mappings
      const keys = Object.keys(emojiMap);
      expect(keys.length).toBeGreaterThan(10);
    });
  });

  describe('initIcons()', () => {
    it('should replace data-icon attributes with SVG icons', () => {
      document.body.innerHTML = `
        <span data-icon="home"></span>
        <span data-icon="search"></span>
      `;
      initIcons();
      const spans = document.querySelectorAll('[data-icon]');
      spans.forEach((span) => {
        expect(span.querySelector('svg') || span.innerHTML).toContain('svg');
      });
    });

    it('should not throw when no data-icon elements exist', () => {
      document.body.innerHTML = '<div>No icons here</div>';
      expect(() => initIcons()).not.toThrow();
    });
  });
});
