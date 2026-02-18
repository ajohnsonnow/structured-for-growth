/**
 * @file installPrompt.js — PWA Install Prompt UX (P5.2.7)
 *
 * Captures the browser's "beforeinstallprompt" event and shows
 * a friendly install banner at a natural pause point, instead of
 * the browser's generic prompt nobody reads.
 */
// sanitize – innerHTML writes use static trusted markup only (no user input)

/** @type {BeforeInstallPromptEvent|null} */
let _deferredPrompt = null;

/** @type {boolean} */
let _installed = false;

/* ─── capture the browser event before it disappears ─────────────── */

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault(); // stop the browser's mini-bar
  _deferredPrompt = /** @type {BeforeInstallPromptEvent} */ (e);
  showInstallBanner();
});

window.addEventListener('appinstalled', () => {
  _installed = true;
  _deferredPrompt = null;
  hideInstallBanner();
  console.log('[PWA] App installed successfully');
});

/* ─── banner UI ───────────────────────────────────────────────────── */

/**
 * Creates and shows the install banner if it doesn't already exist.
 */
function showInstallBanner() {
  if (_installed) {
    return;
  }
  if (document.getElementById('pwa-install-banner')) {
    return;
  }

  // Don't nag on first visit — wait until second page view
  const visits = parseInt(sessionStorage.getItem('sfg-visit-count') || '0', 10) + 1;
  sessionStorage.setItem('sfg-visit-count', String(visits));
  if (visits < 2) {
    return;
  }

  const banner = document.createElement('div');
  banner.id = 'pwa-install-banner';
  banner.setAttribute('role', 'alert');
  banner.setAttribute('aria-live', 'polite');
  banner.innerHTML = `
    <div class="install-banner__inner">
      <div class="install-banner__text">
        <strong>Install Structured for Growth</strong>
        <span>Get faster access with an app on your device — works offline too.</span>
      </div>
      <div class="install-banner__actions">
        <button class="install-banner__btn install-banner__btn--install" aria-label="Install app">
          Install
        </button>
        <button class="install-banner__btn install-banner__btn--dismiss" aria-label="Dismiss install prompt">
          Not now
        </button>
      </div>
    </div>
  `;

  // Inject minimal styles
  if (!document.getElementById('pwa-install-styles')) {
    const style = document.createElement('style');
    style.id = 'pwa-install-styles';
    style.textContent = `
      #pwa-install-banner {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 9999;
        background: #1e293b;
        color: #f1f5f9;
        padding: 1rem;
        transform: translateY(100%);
        animation: pwa-slide-up 0.4s ease forwards;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      @keyframes pwa-slide-up {
        to { transform: translateY(0); }
      }
      .install-banner__inner {
        max-width: 960px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
      }
      .install-banner__text strong {
        display: block;
        font-size: 1rem;
        margin-bottom: 0.25rem;
      }
      .install-banner__text span {
        font-size: 0.875rem;
        color: #94a3b8;
      }
      .install-banner__actions {
        display: flex;
        gap: 0.5rem;
        flex-shrink: 0;
      }
      .install-banner__btn {
        padding: 0.625rem 1.25rem;
        border: none;
        border-radius: 6px;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        min-height: 44px;
        min-width: 44px;
        transition: background 0.2s;
      }
      .install-banner__btn--install {
        background: #2563eb;
        color: #fff;
      }
      .install-banner__btn--install:hover { background: #1d4ed8; }
      .install-banner__btn--dismiss {
        background: transparent;
        color: #94a3b8;
      }
      .install-banner__btn--dismiss:hover { color: #e2e8f0; }
      .install-banner__btn:focus-visible {
        outline: 3px solid #2563eb;
        outline-offset: 2px;
      }
      @media (prefers-reduced-motion: reduce) {
        #pwa-install-banner { animation: none; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }

  // Wire up buttons
  banner.querySelector('.install-banner__btn--install').addEventListener('click', triggerInstall);
  banner.querySelector('.install-banner__btn--dismiss').addEventListener('click', dismissBanner);

  document.body.appendChild(banner);
}

/**
 * Actually trigger the browser install dialog.
 */
async function triggerInstall() {
  if (!_deferredPrompt) {
    return;
  }

  _deferredPrompt.prompt();
  const { outcome } = await _deferredPrompt.userChoice;
  console.log(`[PWA] Install prompt outcome: ${outcome}`);
  _deferredPrompt = null;
  hideInstallBanner();
}

/**
 * User clicked "Not now" — hide and don't show again this session.
 */
function dismissBanner() {
  hideInstallBanner();
  sessionStorage.setItem('sfg-install-dismissed', '1');
}

function hideInstallBanner() {
  const banner = document.getElementById('pwa-install-banner');
  if (banner) {
    banner.style.animation = 'none';
    banner.style.transform = 'translateY(100%)';
    banner.style.transition = 'transform 0.3s ease';
    setTimeout(() => banner.remove(), 350);
  }
}

/* ─── public API ──────────────────────────────────────────────────── */

/**
 * Check if the app can be installed.
 * @returns {boolean}
 */
export function canInstall() {
  return _deferredPrompt !== null && !_installed;
}

/**
 * Check if the app is already installed (or running standalone).
 * @returns {boolean}
 */
export function isInstalled() {
  return (
    _installed ||
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

/**
 * Programmatically show the install prompt (e.g. from a settings page button).
 */
export { triggerInstall as promptInstall };
