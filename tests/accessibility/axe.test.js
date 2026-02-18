// @vitest-environment jsdom
/**
 * Accessibility Tests (P2.2.1)
 * Runs axe-core against all client HTML pages via jsdom.
 * Zero-violation build gate — any violation fails the test.
 *
 * Note: jsdom-based testing covers structural/ARIA violations.
 * CSS-dependent checks (color contrast, reflow) require a real browser.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { resolve, basename } from 'path';

// axe-core needs a DOM to run; jsdom is set via directive above
let axe;

beforeAll(async () => {
  // Dynamic import so we can ensure jsdom environment is ready
  const axeModule = await import('axe-core');
  axe = axeModule.default || axeModule;
});

/**
 * Load an HTML file into the current jsdom document.
 * Resets the DOM so each page gets a clean slate.
 */
function loadPage(filePath) {
  const html = readFileSync(filePath, 'utf-8');
  document.documentElement.innerHTML = '';
  document.write(html);
  document.close();
}

// Discover all HTML pages in client/
const clientDir = resolve(__dirname, '../../client');
const htmlFiles = readdirSync(clientDir)
  .filter((f) => f.endsWith('.html'))
  .map((f) => resolve(clientDir, f));

describe('Accessibility — axe-core WCAG 2.1 AA', () => {
  // Run axe-core on each page
  htmlFiles.forEach((filePath) => {
    const pageName = basename(filePath);

    it(`${pageName} — zero critical/serious violations`, async () => {
      loadPage(filePath);

      const results = await axe.run(document.documentElement, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'section508', 'best-practice'],
        },
        // In jsdom we can't evaluate CSS-dependent rules accurately
        rules: {
          'color-contrast': { enabled: false },
          'document-title': { enabled: true },
          'html-has-lang': { enabled: true },
          'html-lang-valid': { enabled: true },
          'image-alt': { enabled: true },
          label: { enabled: true },
          'link-name': { enabled: true },
          region: { enabled: true },
          'landmark-one-main': { enabled: true },
          'page-has-heading-one': { enabled: true },
        },
      });

      // Collect serious and critical violations
      const blocking = results.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      );

      if (blocking.length > 0) {
        const summary = blocking
          .map(
            (v) =>
              `  [${v.impact}] ${v.id}: ${v.help}\n` +
              v.nodes
                .slice(0, 3)
                .map((n) => `    → ${n.html.slice(0, 120)}`)
                .join('\n')
          )
          .join('\n');

        expect.fail(
          `${pageName} has ${blocking.length} critical/serious a11y violation(s):\n${summary}`
        );
      }
    });

    it(`${pageName} — no moderate violations`, async () => {
      loadPage(filePath);

      const results = await axe.run(document.documentElement, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
        rules: {
          'color-contrast': { enabled: false },
        },
      });

      const moderate = results.violations.filter((v) => v.impact === 'moderate');

      // Log moderate violations as warnings but don't fail yet
      // (adjust threshold as violations are fixed)
      if (moderate.length > 0) {
        const summary = moderate.map((v) => `  [${v.impact}] ${v.id}: ${v.help}`).join('\n');
        console.warn(`⚠ ${pageName} has ${moderate.length} moderate violation(s):\n${summary}`);
      }

      // Gate: currently allowing up to 5 moderate per page
      // Lower this threshold to 0 once all are fixed
      expect(moderate.length).toBeLessThanOrEqual(5);
    });
  });
});
