/**
 * @file offlineIndicator.js — Online/Offline Status Indicator (P5.2.9)
 *
 * A small, accessible toast that slides in when the user goes offline
 * and disappears when connectivity returns. Also exposes an API so
 * other modules can react to connectivity changes.
 */

/** @type {Set<(online: boolean) => void>} */
const _listeners = new Set();

/** @type {HTMLElement|null} */
let _indicator = null;

/* ─── initialise ──────────────────────────────────────────────────── */

export function initOfflineIndicator() {
  // Inject styles once
  if (!document.getElementById('offline-indicator-styles')) {
    const style = document.createElement('style');
    style.id = 'offline-indicator-styles';
    style.textContent = `
      .sfg-connectivity {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.625rem 1rem;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 0.875rem;
        font-weight: 600;
        transform: translateY(-100%);
        transition: transform 0.35s ease, background 0.3s;
      }
      .sfg-connectivity--visible {
        transform: translateY(0);
      }
      .sfg-connectivity--offline {
        background: #fef2f2;
        color: #991b1b;
        border-bottom: 2px solid #fca5a5;
      }
      .sfg-connectivity--online {
        background: #f0fdf4;
        color: #166534;
        border-bottom: 2px solid #86efac;
      }
      .sfg-connectivity__dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .sfg-connectivity--offline .sfg-connectivity__dot { background: #ef4444; }
      .sfg-connectivity--online  .sfg-connectivity__dot { background: #22c55e; }

      @media (prefers-reduced-motion: reduce) {
        .sfg-connectivity { transition: none; }
      }
    `;
    document.head.appendChild(style);
  }

  // Create the indicator element
  _indicator = document.createElement('div');
  _indicator.className = 'sfg-connectivity';
  _indicator.setAttribute('role', 'status');
  _indicator.setAttribute('aria-live', 'polite');
  _indicator.setAttribute('aria-atomic', 'true');
  _indicator.innerHTML = `
    <span class="sfg-connectivity__dot" aria-hidden="true"></span>
    <span class="sfg-connectivity__text"></span>
  `;
  document.body.appendChild(_indicator);

  // Wire up events
  window.addEventListener('online', () => handleChange(true));
  window.addEventListener('offline', () => handleChange(false));

  // Show initial state if already offline
  if (!navigator.onLine) {
    handleChange(false);
  }
}

/* ─── internal ────────────────────────────────────────────────────── */

/** @type {number|null} */
let _hideTimer = null;

/**
 * @param {boolean} online
 */
function handleChange(online) {
  if (!_indicator) {
    return;
  }

  clearTimeout(_hideTimer);

  const text = _indicator.querySelector('.sfg-connectivity__text');

  if (online) {
    _indicator.className = 'sfg-connectivity sfg-connectivity--online sfg-connectivity--visible';
    text.textContent = 'Back online — syncing changes…';

    // Auto-hide after 4 seconds
    _hideTimer = setTimeout(() => {
      _indicator.classList.remove('sfg-connectivity--visible');
    }, 4000);
  } else {
    _indicator.className = 'sfg-connectivity sfg-connectivity--offline sfg-connectivity--visible';
    text.textContent = 'You are offline — changes will sync when reconnected';
  }

  // Notify subscribers
  for (const fn of _listeners) {
    try {
      fn(online);
    } catch {
      /* swallow listener errors */
    }
  }
}

/* ─── public API ──────────────────────────────────────────────────── */

/**
 * Subscribe to connectivity changes.
 * @param {(online: boolean) => void} callback
 * @returns {() => void} Unsubscribe function
 */
export function onConnectivityChange(callback) {
  _listeners.add(callback);
  return () => _listeners.delete(callback);
}

/**
 * Check current connectivity status.
 * @returns {boolean}
 */
export function isOnline() {
  return navigator.onLine;
}
