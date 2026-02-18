/**
 * Theme Toggle Module (P6.3)
 * ──────────────────────────
 * Dark / light mode switching with:
 *   - localStorage persistence
 *   - prefers-color-scheme auto-detection
 *   - Smooth transition (avoids FOUC)
 *   - Accessible toggle button injected into nav utilities
 *
 * Usage:
 *   import { initThemeToggle } from './modules/themeToggle.js';
 *   initThemeToggle();
 */
// sanitize – innerHTML writes use static SVG constants only (no user input)

const STORAGE_KEY = 'sfg-theme';

/**
 * SVG icons for the toggle button.
 * Kept inline to avoid dependency on the icon system module.
 */
const SUN_SVG = `<svg class="icon-sun" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;

const MOON_SVG = `<svg class="icon-moon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

/**
 * Resolves the initial theme based on localStorage → OS preference → default.
 * @returns {'dark'|'light'}
 */
function resolveInitialTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }

  if (window.matchMedia?.('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  return 'dark'; // default
}

/**
 * Apply theme to DOM without transition flash.
 * @param {'dark'|'light'} theme
 */
function applyTheme(theme) {
  const html = document.documentElement;

  if (theme === 'light') {
    html.setAttribute('data-theme', 'light');
  } else {
    html.removeAttribute('data-theme');
  }

  // Update any toggle buttons on the page
  document.querySelectorAll('.theme-toggle').forEach((btn) => {
    const isDark = theme === 'dark';
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  });
}

/**
 * Toggle between dark and light mode.
 * @returns {'dark'|'light'} The new active theme.
 */
function toggleTheme() {
  const current =
    document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  const next = current === 'dark' ? 'light' : 'dark';

  applyTheme(next);
  localStorage.setItem(STORAGE_KEY, next);

  // Announce to screen readers
  const announcement = document.getElementById('theme-announcement');
  if (announcement) {
    announcement.textContent = `Switched to ${next} mode`;
  }

  return next;
}

/**
 * Create the toggle button element.
 * @returns {HTMLButtonElement}
 */
function createToggleButton() {
  const btn = document.createElement('button');
  btn.className = 'theme-toggle';
  btn.type = 'button';
  btn.innerHTML = `${SUN_SVG}${MOON_SVG}`;

  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');

  btn.addEventListener('click', () => toggleTheme());
  return btn;
}

/**
 * Initialize theme toggle system.
 *
 * 1. Reads stored/OS preference and applies immediately.
 * 2. Injects toggle button(s) into .nav-utilities containers.
 * 3. Listens for OS preference changes.
 *
 * @param {Object} [options]
 * @param {string} [options.insertSelector='.nav-utilities'] CSS selector for button insertion.
 */
export function initThemeToggle(options = {}) {
  const { insertSelector = '.nav-utilities' } = options;

  // 1. Apply theme immediately (before paint)
  const initialTheme = resolveInitialTheme();
  applyTheme(initialTheme);

  // 2. Add live region for announcements
  if (!document.getElementById('theme-announcement')) {
    const liveRegion = document.createElement('div');
    liveRegion.id = 'theme-announcement';
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
  }

  // 3. Inject toggle buttons
  const targets = document.querySelectorAll(insertSelector);
  targets.forEach((container) => {
    if (!container.querySelector('.theme-toggle')) {
      container.appendChild(createToggleButton());
    }
  });

  // 4. If no container found, add a floating toggle
  if (targets.length === 0) {
    const existing = document.querySelector('.theme-toggle');
    if (!existing) {
      const btn = createToggleButton();
      btn.style.cssText = 'position:fixed;bottom:1rem;right:1rem;z-index:9999;';
      document.body.appendChild(btn);
    }
  }

  // 5. Listen for OS theme changes (when no explicit user choice)
  const mql = window.matchMedia('(prefers-color-scheme: light)');
  mql.addEventListener('change', (e) => {
    // Only auto-switch if user hasn't manually set a preference
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      applyTheme(e.matches ? 'light' : 'dark');
    }
  });
}

export { applyTheme, resolveInitialTheme, toggleTheme };
