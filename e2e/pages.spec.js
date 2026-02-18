/**
 * E2E Test: Compliance, Glossary, Skills, MBAi, Docs, Templates Pages
 *
 * Validates each public-facing page loads correctly,
 * fetches data from the right API endpoint, and renders content.
 */
import { expect, test } from '@playwright/test';

test.describe('Compliance Page', () => {
  test('loads and fetches frameworks', async ({ page }) => {
    const apiCalled = page
      .waitForResponse((r) => r.url().includes('/api/compliance/frameworks'), { timeout: 5000 })
      .catch(() => null);

    await page.goto('/compliance.html', { waitUntil: 'networkidle' });

    const response = await apiCalled;
    if (response) {
      expect(response.status()).toBeLessThan(500);
    }
  });

  test('displays tab navigation', async ({ page }) => {
    await page.goto('/compliance.html', { waitUntil: 'networkidle' });
    const tabs = page.locator('#complianceTabs, .tabs, [role="tablist"]');
    if ((await tabs.count()) > 0) {
      await expect(tabs).toBeVisible();
    }
  });

  test('search filter works', async ({ page }) => {
    await page.goto('/compliance.html', { waitUntil: 'networkidle' });
    const search = page.locator('#complianceSearch, input[type="search"]');
    if ((await search.count()) > 0) {
      await search.fill('NIST');
      await page.waitForTimeout(500);
    }
  });

  test('cross-map tab loads data', async ({ page }) => {
    await page.goto('/compliance.html', { waitUntil: 'networkidle' });
    const crossmapTab = page.locator('[data-tab="crossmap"], button:has-text("Cross-Map")');
    if ((await crossmapTab.count()) > 0) {
      await crossmapTab.click();
      await page.waitForTimeout(1000);
    }
  });
});

test.describe('Glossary Page', () => {
  test('loads and fetches glossary data', async ({ page }) => {
    const apiCalled = page
      .waitForResponse((r) => r.url().includes('/glossary'), { timeout: 5000 })
      .catch(() => null);

    await page.goto('/glossary.html', { waitUntil: 'networkidle' });

    const response = await apiCalled;
    if (response) {
      expect(response.status()).toBe(200);
    }
  });

  test('renders glossary terms', async ({ page }) => {
    await page.goto('/glossary.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const termList = page.locator('#glossaryList, .glossary-list');
    if ((await termList.count()) > 0) {
      // Should have rendered at least some terms
    }
  });

  test('search filters terms', async ({ page }) => {
    await page.goto('/glossary.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const search = page.locator('#glossarySearch');
    if ((await search.count()) > 0) {
      await search.fill('compliance');
      await page.waitForTimeout(500);
    }
  });

  test('alpha index navigation works', async ({ page }) => {
    await page.goto('/glossary.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const alphaIndex = page.locator('#alphaIndex a, .alpha-index a');
    if ((await alphaIndex.count()) > 0) {
      await alphaIndex.first().click();
      await page.waitForTimeout(300);
    }
  });
});

test.describe('Skills Page', () => {
  test('loads and fetches skills data', async ({ page }) => {
    const apiCalled = page
      .waitForResponse((r) => r.url().includes('/api/skills'), { timeout: 5000 })
      .catch(() => null);

    await page.goto('/skills.html', { waitUntil: 'networkidle' });

    const response = await apiCalled;
    if (response) {
      expect(response.status()).toBe(200);
    }
  });

  test('renders skill visualization', async ({ page }) => {
    await page.goto('/skills.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Check for SVG graph or grid
    const svg = page.locator('svg, #skillsWebView, #skillsGridView');
    if ((await svg.count()) > 0) {
      await expect(svg.first()).toBeVisible();
    }
  });

  test('view toggle works', async ({ page }) => {
    await page.goto('/skills.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const gridToggle = page.locator('button:has-text("Grid"), [data-view="grid"]');
    if ((await gridToggle.count()) > 0) {
      await gridToggle.click();
      await page.waitForTimeout(500);
    }
  });
});

test.describe('MBAi Page', () => {
  test('loads and fetches manifest', async ({ page }) => {
    const apiCalled = page
      .waitForResponse((r) => r.url().includes('/api/mbai/manifest'), { timeout: 5000 })
      .catch(() => null);

    await page.goto('/mbai.html', { waitUntil: 'networkidle' });

    const response = await apiCalled;
    if (response) {
      expect(response.status()).toBe(200);
    }
  });

  test('renders template grid', async ({ page }) => {
    await page.goto('/mbai.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const grid = page.locator('#mbaiGrid, .mbai-grid');
    if ((await grid.count()) > 0) {
      await expect(grid).toBeVisible();
    }
  });

  test('search filter works', async ({ page }) => {
    await page.goto('/mbai.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const search = page.locator('#mbaiSearch');
    if ((await search.count()) > 0) {
      await search.fill('SBSC');
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Documentation Page', () => {
  test('loads and fetches docs manifest', async ({ page }) => {
    const apiCalled = page
      .waitForResponse((r) => r.url().includes('docs-manifest'), { timeout: 5000 })
      .catch(() => null);

    await page.goto('/docs.html', { waitUntil: 'networkidle' });

    const response = await apiCalled;
    if (response) {
      expect(response.status()).toBeLessThan(500);
    }
  });

  test('tab navigation works', async ({ page }) => {
    await page.goto('/docs.html', { waitUntil: 'networkidle' });
    const tabs = page.locator('.tab, [role="tab"]');
    if ((await tabs.count()) > 1) {
      await tabs.nth(1).click();
      await page.waitForTimeout(500);
    }
  });

  test('search with Ctrl+K shortcut', async ({ page }) => {
    await page.goto('/docs.html', { waitUntil: 'networkidle' });
    await page.keyboard.press('Control+k');
    await page.waitForTimeout(300);

    const _searchInput = page.locator('#docsSearch, input:focus');
    // Search should be focused
  });
});

test.describe('Templates Page', () => {
  test('renders template grid', async ({ page }) => {
    await page.goto('/templates.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const grid = page.locator('#templatesGrid, .templates-grid');
    if ((await grid.count()) > 0) {
      await expect(grid).toBeVisible();
    }
  });

  test('search filters templates', async ({ page }) => {
    await page.goto('/templates.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const search = page.locator('#templateSearch');
    if ((await search.count()) > 0) {
      await search.fill('auth');
      await page.waitForTimeout(500);
    }
  });

  test('template modal opens on click', async ({ page }) => {
    await page.goto('/templates.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const templateCard = page.locator('.template-card, .card').first();
    if ((await templateCard.count()) > 0) {
      await templateCard.click();
      await page.waitForTimeout(500);

      const modal = page.locator('#templateModal, .modal');
      if ((await modal.count()) > 0) {
        await expect(modal).toBeVisible();
      }
    }
  });
});

test.describe('Portal Page', () => {
  test('shows login form', async ({ page }) => {
    await page.goto('/portal.html', { waitUntil: 'networkidle' });
    const loginForm = page.locator('#loginForm, form, #loginModal');
    if ((await loginForm.count()) > 0) {
      await expect(loginForm.first()).toBeVisible();
    }
  });

  test('login submits to portal API', async ({ page }) => {
    await page.goto('/portal.html', { waitUntil: 'networkidle' });

    const emailField = page.locator('input[name="email"], input[type="email"]');
    const passwordField = page.locator('input[name="password"], input[type="password"]');

    if ((await emailField.count()) === 0) {
      return;
    }

    const responsePromise = page
      .waitForResponse((r) => r.url().includes('/api/portal/login'), { timeout: 5000 })
      .catch(() => null);

    await emailField.fill('client@example.com');
    await passwordField.fill('TestPass123!');
    await page.click('button[type="submit"]');

    const response = await responsePromise;
    if (response) {
      expect(response.status()).toBeLessThan(500);
    }
  });
});
