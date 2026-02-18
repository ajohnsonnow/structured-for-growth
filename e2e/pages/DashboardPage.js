/**
 * E2E Page Object — Dashboard Page
 *
 * Encapsulates all dashboard interactions: login, CRUD,
 * navigation between views, and data verification.
 */
import { BasePage } from './BasePage.js';

export class DashboardPage extends BasePage {
  constructor(page) {
    super(page);
    // Login modal
    this.loginEmail = page.locator('#loginEmail');
    this.loginPassword = page.locator('#loginPassword');
    this.loginButton = page.locator('#loginBtn, button:has-text("Login")');
    this.loginModal = page.locator('#loginModal');

    // Navigation
    this.sidebar = page.locator('.sidebar, nav[role="navigation"]');
    this.dashboardView = page.locator('[data-view="dashboard"]');
    this.clientsView = page.locator('[data-view="clients"]');
    this.projectsView = page.locator('[data-view="projects"]');

    // Dashboard stats
    this.statsCards = page.locator('.stats-card, .stat-card, .metric-card');

    // Client management
    this.clientModal = page.locator('#clientModal');
    this.addClientBtn = page.locator(
      'button:has-text("Add Client"), button:has-text("New Client")'
    );
  }

  async goto() {
    await super.goto('/dashboard.html');
  }

  async login(email = 'admin@structuredforgrowth.com', password = 'Admin123!@#$') {
    // Wait for login modal to appear
    await this.loginModal.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

    if (await this.loginEmail.isVisible()) {
      await this.loginEmail.fill(email);
      await this.loginPassword.fill(password);
      await this.loginButton.click();
      // Wait for dashboard to load
      await this.page
        .waitForResponse((r) => r.url().includes('/api/auth/login'), { timeout: 5000 })
        .catch(() => {});
      await this.page.waitForTimeout(1000);
    }
  }

  async navigateToView(viewName) {
    await this.page.click(`[data-view="${viewName}"], a:has-text("${viewName}")`);
    await this.page.waitForTimeout(500);
  }

  getStatsCount() {
    return this.statsCards.count();
  }

  isLoggedIn() {
    // Check for auth indicators
    const logoutBtn = this.page.locator('button:has-text("Logout"), .logout-btn');
    return logoutBtn.isVisible().catch(() => false);
  }
}
