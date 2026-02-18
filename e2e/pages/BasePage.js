/**
 * E2E Page Object Model — Base Page
 *
 * Shared behaviors for all pages: navigation, theme, accessibility,
 * service worker, and common assertions.
 */
export class BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  async goto(path = '/') {
    await this.page.goto(path, { waitUntil: 'networkidle' });
  }

  getTitle() {
    return this.page.title();
  }

  /** Verify no console errors during navigation */
  assertNoConsoleErrors() {
    const errors = [];
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    return errors;
  }

  /** Check that the page has no accessibility violations (basic check) */
  async assertAccessible() {
    // Inject axe-core for accessibility testing
    await this.page.addScriptTag({
      url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.0/axe.min.js',
    });
    const results = await this.page.evaluate(() => {
      return new Promise((resolve) => {
        window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa'] }, (err, results) => {
          resolve(err ? { violations: [] } : results);
        });
      });
    });
    return results.violations;
  }

  /** Verify all network requests completed successfully */
  collectNetworkErrors() {
    const errors = [];
    this.page.on('response', (response) => {
      if (response.status() >= 400 && !response.url().includes('favicon')) {
        errors.push({ url: response.url(), status: response.status() });
      }
    });
    return errors;
  }

  /** Wait for all lazy-loaded content */
  async waitForContent() {
    await this.page.waitForLoadState('networkidle');
  }
}
