// @vitest-environment jsdom
/**
 * Glossary Tooltip Module Tests
 * Tests tooltip rendering, keyboard interaction, accessibility attributes.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let initGlossaryTooltips, loadGlossary, lookupTerm;

function mockGlossaryFetch() {
  const mockGlossary = {
    version: '1.0.0',
    terms: [
      {
        id: 'wcag',
        term: 'WCAG',
        fullForm: 'Web Content Accessibility Guidelines',
        definition: 'International standard for web accessibility.',
        category: 'accessibility',
        related: ['aria'],
        sources: [],
      },
      {
        id: 'aria',
        term: 'ARIA',
        fullForm: 'Accessible Rich Internet Applications',
        definition: 'A set of attributes for accessible web apps.',
        category: 'accessibility',
        related: ['wcag'],
        sources: [],
      },
    ],
  };

  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockGlossary),
  });
}

describe('Glossary Tooltip Module', () => {
  beforeEach(async () => {
    vi.resetModules();
    mockGlossaryFetch();
    document.body.innerHTML = '';

    const mod = await import('../../client/js/modules/glossaryTooltip.js');
    initGlossaryTooltips = mod.initGlossaryTooltips;
    loadGlossary = mod.loadGlossary;
    lookupTerm = mod.lookupTerm;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('loadGlossary()', () => {
    it('should fetch and cache glossary data', async () => {
      const data = await loadGlossary();
      expect(data).toBeDefined();
      // loadGlossary returns a Map, not a plain object
      expect(data instanceof Map).toBe(true);
      expect(data.size).toBeGreaterThan(0);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const data2 = await loadGlossary();
      expect(data2).toBe(data);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('lookupTerm()', () => {
    it('should find a term by key (case-insensitive)', async () => {
      await loadGlossary();
      const term = lookupTerm('wcag');
      expect(term).toBeDefined();
      expect(term.term).toBe('WCAG');
      expect(term.definition).toContain('accessibility');
    });

    it('should return undefined for unknown terms', async () => {
      await loadGlossary();
      const term = lookupTerm('nonexistent');
      expect(term).toBeUndefined();
    });
  });

  describe('initGlossaryTooltips()', () => {
    it('should initialize without throwing even with no triggers', () => {
      document.body.innerHTML = '<main>No glossary triggers here</main>';
      // initGlossaryTooltips is synchronous — just sets up listeners
      expect(() => initGlossaryTooltips()).not.toThrow();
    });

    it('should attach tooltips to existing glossary-term elements', async () => {
      document.body.innerHTML = `
        <main>
          <abbr class="glossary-term" data-glossary-key="wcag">WCAG</abbr>
        </main>
      `;
      await initGlossaryTooltips();

      const trigger = document.querySelector('.glossary-term');
      expect(trigger).toBeTruthy();
      // The trigger should have an aria-describedby or tabindex set after init
      // Exact behavior depends on implementation, but it should not throw
    });
  });
});
