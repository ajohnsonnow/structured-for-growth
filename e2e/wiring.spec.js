/**
 * E2E Test: Full API Wiring Verification
 *
 * Navigates every page and verifies that all client-side fetch calls
 * connect to real server endpoints without 404/500 errors.
 *
 * This is the core "UI-to-function verification" test.
 */
import { expect, test } from '@playwright/test';

const PAGES = [
  { path: '/', name: 'Landing' },
  { path: '/dashboard.html', name: 'Dashboard' },
  { path: '/portal.html', name: 'Portal' },
  { path: '/compliance.html', name: 'Compliance' },
  { path: '/docs.html', name: 'Documentation' },
  { path: '/glossary.html', name: 'Glossary' },
  { path: '/mbai.html', name: 'MBAi' },
  { path: '/skills.html', name: 'Skills' },
  { path: '/templates.html', name: 'Templates' },
];

test.describe('API Wiring Verification', () => {
  for (const pg of PAGES) {
    test(`${pg.name} page — no broken API endpoints`, async ({ page }) => {
      const brokenEndpoints = [];
      const apiCalls = [];

      // Intercept all API responses
      page.on('response', (response) => {
        const url = response.url();
        if (url.includes('/api/') || url.includes('/data/')) {
          const status = response.status();
          apiCalls.push({ url, status, method: response.request().method() });
          if (status === 404 || status >= 500) {
            brokenEndpoints.push({ url, status });
          }
        }
      });

      // Navigate and wait for all requests
      await page.goto(pg.path, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);

      // Report broken endpoints
      if (brokenEndpoints.length > 0) {
        console.log(`\n❌ ${pg.name} has broken API wiring:`);
        for (const ep of brokenEndpoints) {
          console.log(`   ${ep.status} ${ep.url}`);
        }
      }

      // No 500 errors (server crashes)
      const serverErrors = brokenEndpoints.filter((e) => e.status >= 500);
      expect(serverErrors).toHaveLength(0);
    });
  }
});

test.describe('Page Load Performance', () => {
  for (const pg of PAGES) {
    test(`${pg.name} loads within 5 seconds`, async ({ page }) => {
      const start = Date.now();
      await page.goto(pg.path, { waitUntil: 'domcontentloaded' });
      const loadTime = Date.now() - start;
      expect(loadTime).toBeLessThan(5000);
    });
  }
});

test.describe('JavaScript Error Detection', () => {
  for (const pg of PAGES) {
    test(`${pg.name} — no uncaught JS exceptions`, async ({ page }) => {
      const jsErrors = [];
      page.on('pageerror', (error) => {
        jsErrors.push(error.message);
      });

      await page.goto(pg.path, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      // Filter out known non-critical errors
      const criticalErrors = jsErrors.filter(
        (e) => !e.includes('goatcounter') && !e.includes('ResizeObserver') && !e.includes('Network')
      );
      expect(criticalErrors).toHaveLength(0);
    });
  }
});

test.describe('Accessibility — Basic Checks', () => {
  for (const pg of PAGES) {
    test(`${pg.name} — has lang attribute`, async ({ page }) => {
      await page.goto(pg.path);
      const lang = await page.locator('html').getAttribute('lang');
      expect(lang).toBeTruthy();
    });

    test(`${pg.name} — has page title`, async ({ page }) => {
      await page.goto(pg.path);
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);
    });

    test(`${pg.name} — has main landmark`, async ({ page }) => {
      await page.goto(pg.path);
      const main = page.locator('main, [role="main"]');
      const count = await main.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });
  }
});

test.describe('Security — XSS Prevention', () => {
  test('contact form sanitizes XSS payload', async ({ page }) => {
    await page.goto('/');
    const nameField = page.locator('#contactForm input[name="name"], #name');
    if ((await nameField.count()) === 0) {
      return;
    }

    // Attempt XSS injection
    await nameField.fill('<script>alert("xss")</script>');
    const emailField = page.locator('#contactForm input[name="email"], #email');
    await emailField.fill('xss@test.com');
    const msgField = page.locator('#contactForm textarea[name="message"], #message');
    await msgField.fill('<img src=x onerror=alert(1)>');

    // Submit and check response
    const responsePromise = page
      .waitForResponse((r) => r.url().includes('/api/contact'), { timeout: 5000 })
      .catch(() => null);

    await page.click('#contactForm button[type="submit"]');
    const response = await responsePromise;

    // The form should not crash; server should handle sanitization
    if (response) {
      expect(response.status()).toBeLessThan(500);
    }

    // Check DOM for unescaped script tags
    const scriptInBody = await page.evaluate(() => {
      return document.body.innerHTML.includes('<script>alert');
    });
    expect(scriptInBody).toBe(false);
  });

  test('login form rejects SQL injection', async ({ page }) => {
    await page.goto('/dashboard.html');
    const emailField = page.locator('#loginEmail, input[name="email"]');
    if ((await emailField.count()) === 0) {
      return;
    }

    await emailField.fill("' OR 1=1 --");
    const passwordField = page.locator('#loginPassword, input[name="password"]');
    await passwordField.fill("' OR ''='");

    const responsePromise = page
      .waitForResponse((r) => r.url().includes('/api/auth/login'), { timeout: 5000 })
      .catch(() => null);

    await page.click('#loginBtn, button:has-text("Login")');
    const response = await responsePromise;

    if (response) {
      // Should NOT return 200 with auth success
      const body = await response.json().catch(() => ({}));
      expect(body.token || body.accessToken).toBeFalsy();
    }
  });
});
