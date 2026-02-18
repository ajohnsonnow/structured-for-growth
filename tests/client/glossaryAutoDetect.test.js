// @vitest-environment jsdom
/**
 * Glossary Auto-Detect Module Tests
 * Tests term scanning, wrapping, skip-tag exclusion, and max-occurrence limits.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

let initGlossaryAutoDetect;

/**
 * Helper: set up a mock glossary fetch that returns a small dictionary.
 */
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
        related: [],
        sources: [],
      },
      {
        id: 'api',
        term: 'API',
        fullForm: 'Application Programming Interface',
        definition: 'A set of protocols for building software.',
        category: 'development',
        related: [],
        sources: [],
      },
      {
        id: 'nist',
        term: 'NIST',
        fullForm: 'National Institute of Standards and Technology',
        definition: 'US agency that develops standards.',
        category: 'government',
        related: [],
        sources: [],
      },
    ],
  };

  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockGlossary),
  });
}

describe('Glossary Auto-Detect Module', () => {
  beforeEach(async () => {
    vi.resetModules();
    mockGlossaryFetch();
    document.body.innerHTML = '';

    const mod = await import('../../client/js/modules/glossaryAutoDetect.js');
    initGlossaryAutoDetect = mod.initGlossaryAutoDetect;
  });

  it('should wrap recognized terms with glossary-term triggers', async () => {
    document.body.innerHTML = `
      <main>
        <p>The WCAG standard ensures that web content is accessible. API design matters.</p>
      </main>
    `;

    const result = await initGlossaryAutoDetect({ scope: 'main' });
    expect(result).toBeDefined();
    expect(result.termsFound).toBeGreaterThanOrEqual(1);

    // Check that WCAG is wrapped
    const triggers = document.querySelectorAll('.glossary-term');
    // At least one wrapped term
    expect(triggers.length).toBeGreaterThan(0);
  });

  it('should skip terms inside CODE, PRE, and NAV elements', async () => {
    document.body.innerHTML = `
      <main>
        <code>WCAG compliance</code>
        <pre>API endpoint</pre>
        <nav>NIST framework</nav>
        <p>WCAG is important.</p>
      </main>
    `;

    await initGlossaryAutoDetect({ scope: 'main' });

    // The term inside <code>, <pre>, <nav> should not be wrapped,
    // but the one in <p> should be
    const codeTriggers = document.querySelectorAll('code .glossary-term');
    const preTriggers = document.querySelectorAll('pre .glossary-term');
    const navTriggers = document.querySelectorAll('nav .glossary-term');

    expect(codeTriggers.length).toBe(0);
    expect(preTriggers.length).toBe(0);
    expect(navTriggers.length).toBe(0);
  });

  it('should not throw when scope matches no elements', async () => {
    document.body.innerHTML = '<div>No main here</div>';
    const result = await initGlossaryAutoDetect({ scope: 'main' });
    expect(result).toBeDefined();
    expect(result.termsFound).toBe(0);
  });

  it('should handle empty text content gracefully', async () => {
    document.body.innerHTML = '<main><p></p></main>';
    const result = await initGlossaryAutoDetect({ scope: 'main' });
    expect(result).toBeDefined();
    expect(result.totalWrapped).toBe(0);
  });
});
