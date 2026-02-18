// @vitest-environment jsdom
/**
 * CUI Banner Module Tests
 * Tests the CuiBanner class: banner text generation, mounting, unmounting,
 * designation block, portion marking, escapeHtml, and print styles.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

let CuiBanner;

describe('CUI Banner Module', () => {
  beforeEach(async () => {
    vi.resetModules();
    document.body.innerHTML = '';
    document.head.innerHTML = '';

    const mod = await import('../../client/js/modules/cuiBanner.js');
    CuiBanner = mod.CuiBanner || mod.default;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Constructor & config defaults ──
  describe('constructor', () => {
    it('should use default config when none provided', () => {
      const banner = new CuiBanner();
      expect(banner.config.enabled).toBe(false);
      expect(banner.config.type).toBe('CUI');
      expect(banner.config.categories).toEqual([]);
      expect(banner.config.dissemination).toEqual([]);
      expect(banner.config.distributionStatement).toBe('A');
      expect(banner.config.controlledBy).toBe('');
      expect(banner.config.poc).toBe('');
    });

    it('should merge user-provided config', () => {
      const banner = new CuiBanner({
        enabled: true,
        type: 'CUI//SP',
        categories: ['CTI', 'EXPT'],
        dissemination: ['NOFORN'],
        distributionStatement: 'D',
        controlledBy: 'US Army',
        poc: 'john@army.mil',
      });

      expect(banner.config.enabled).toBe(true);
      expect(banner.config.type).toBe('CUI//SP');
      expect(banner.config.categories).toEqual(['CTI', 'EXPT']);
      expect(banner.config.dissemination).toEqual(['NOFORN']);
      expect(banner.config.controlledBy).toBe('US Army');
    });
  });

  // ── getBannerText ──
  describe('getBannerText', () => {
    it('should return type-only text when no categories or dissemination', () => {
      const banner = new CuiBanner({ type: 'CUI' });
      expect(banner.getBannerText()).toBe('CUI');
    });

    it('should include categories separated by /', () => {
      const banner = new CuiBanner({ type: 'CUI', categories: ['CTI', 'EXPT'] });
      expect(banner.getBannerText()).toBe('CUI//CTI/EXPT');
    });

    it('should include dissemination controls', () => {
      const banner = new CuiBanner({
        type: 'CUI//SP',
        categories: ['CTI'],
        dissemination: ['NOFORN'],
      });
      expect(banner.getBannerText()).toBe('CUI//SP//CTI//NOFORN');
    });
  });

  // ── createBannerElement ──
  describe('createBannerElement', () => {
    it('should create header banner element with correct attributes', () => {
      const banner = new CuiBanner({ type: 'CUI', categories: ['CTI'] });
      const el = banner.createBannerElement('header');

      expect(el.tagName).toBe('DIV');
      expect(el.className).toContain('cui-banner--header');
      expect(el.getAttribute('role')).toBe('banner');
      expect(el.getAttribute('aria-label')).toBe('CUI header marking');
      expect(el.textContent).toBe('CUI//CTI');
      expect(el.style.position).toBe('sticky');
    });

    it('should create footer banner element positioned fixed at bottom', () => {
      const banner = new CuiBanner({ type: 'CUI' });
      const el = banner.createBannerElement('footer');

      expect(el.className).toContain('cui-banner--footer');
      expect(el.style.position).toBe('fixed');
      expect(el.style.bottom).toBe('0px');
    });
  });

  // ── createDesignationBlock ──
  describe('createDesignationBlock', () => {
    it('should render designation indicator block with all fields', () => {
      const banner = new CuiBanner({
        type: 'CUI//SP',
        categories: ['CTI'],
        controlledBy: 'USACE',
        poc: 'admin@usace.mil',
        distributionStatement: 'B',
      });

      const block = banner.createDesignationBlock();

      expect(block.getAttribute('role')).toBe('region');
      expect(block.getAttribute('aria-label')).toBe('CUI Designation Indicator');
      expect(block.innerHTML).toContain('USACE');
      expect(block.innerHTML).toContain('admin@usace.mil');
      expect(block.innerHTML).toContain('Controlled Technical Information');
      expect(block.innerHTML).toContain('U.S. Government agencies only');
    });

    it('should show "Not specified" for empty controlledBy and poc', () => {
      const banner = new CuiBanner({ categories: [] });
      const block = banner.createDesignationBlock();

      expect(block.innerHTML).toContain('Not specified');
    });
  });

  // ── mount / unmount ──
  describe('mount & unmount', () => {
    it('should not mount anything if enabled is false', () => {
      const banner = new CuiBanner({ enabled: false });
      banner.mount(document.body);

      expect(document.querySelector('.cui-banner')).toBeNull();
    });

    it('should add header and footer banners when enabled', () => {
      const banner = new CuiBanner({ enabled: true, type: 'CUI' });
      banner.mount(document.body);

      const header = document.querySelector('.cui-banner--header');
      const footer = document.querySelector('.cui-banner--footer');

      expect(header).toBeTruthy();
      expect(footer).toBeTruthy();
      expect(header.textContent).toBe('CUI');
      expect(footer.textContent).toBe('CUI');
    });

    it('should add body padding for banner space', () => {
      const banner = new CuiBanner({ enabled: true });
      banner.mount(document.body);

      expect(document.body.style.paddingTop).toBe('28px');
      expect(document.body.style.paddingBottom).toBe('28px');
    });

    it('should remove banners on unmount', () => {
      const banner = new CuiBanner({ enabled: true });
      banner.mount(document.body);

      expect(document.querySelectorAll('.cui-banner').length).toBe(2);

      banner.unmount();

      expect(document.querySelectorAll('.cui-banner').length).toBe(0);
      expect(banner.headerEl).toBeNull();
      expect(banner.footerEl).toBeNull();
    });

    it('should replace existing banners on re-mount', () => {
      const banner = new CuiBanner({ enabled: true });
      banner.mount(document.body);
      banner.mount(document.body); // re-mount

      // Should still only have 2 banners (old ones removed)
      expect(document.querySelectorAll('.cui-banner').length).toBe(2);
    });
  });

  // ── Print styles ──
  describe('addPrintStyles', () => {
    it('should inject print stylesheet into head', () => {
      const banner = new CuiBanner({ enabled: true });
      banner.mount(document.body);

      const style = document.getElementById('cui-print-styles');
      expect(style).toBeTruthy();
      expect(style.textContent).toContain('@media print');
    });

    it('should not duplicate print styles on multiple mounts', () => {
      const banner = new CuiBanner({ enabled: true });
      banner.mount(document.body);
      banner.mount(document.body);

      const styles = document.querySelectorAll('#cui-print-styles');
      expect(styles.length).toBe(1);
    });
  });

  // ── Static portionMark ──
  describe('portionMark', () => {
    it('should wrap text with CUI portion marking', () => {
      const html = CuiBanner.portionMark('sensitive data', 'CTI');
      expect(html).toContain('(CTI)');
      expect(html).toContain('sensitive data');
      expect(html).toContain('cui-portion');
    });

    it('should default to CUI category', () => {
      const html = CuiBanner.portionMark('data');
      expect(html).toContain('(CUI)');
    });
  });

  // ── escapeHtml ──
  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      const banner = new CuiBanner();
      const escaped = banner.escapeHtml('<script>alert("XSS")</script>');
      expect(escaped).not.toContain('<script>');
      expect(escaped).toContain('&lt;script&gt;');
    });

    it('should preserve safe text unchanged', () => {
      const banner = new CuiBanner();
      expect(banner.escapeHtml('Hello World')).toBe('Hello World');
    });
  });
});
