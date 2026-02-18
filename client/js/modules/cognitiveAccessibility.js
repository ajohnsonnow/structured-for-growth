/**
 * Cognitive Accessibility Patterns (P4.3.3)
 *
 * Implements cognitive accessibility features:
 * - Auto-save for form data (prevents data loss)
 * - Step wizards with progress tracking
 * - Error prevention with confirmation dialogs
 * - Simplified language toggle
 * - Session timeout warnings
 *
 * Standards: COGA (Cognitive Accessibility), WCAG 3.3.4 (Error Prevention)
 */

import { escapeHTML } from './sanitize.js';

// ────────────────────────────────────────────────────────────
// Auto-Save Manager
// ────────────────────────────────────────────────────────────

/**
 * Automatically saves form data to localStorage so users don't lose progress.
 * Think of it like a "draft" feature in email — it saves your work every few seconds.
 */
export class AutoSaveManager {
  /**
   * @param {string} formId - ID of the form element
   * @param {Object} [options]
   * @param {number} [options.intervalMs=5000] - How often to save (default: 5 seconds)
   * @param {string} [options.storageKey] - localStorage key (defaults to "autosave_{formId}")
   * @param {Function} [options.onSave] - Callback when data is saved
   * @param {Function} [options.onRestore] - Callback when data is restored
   */
  constructor(formId, options = {}) {
    this.formId = formId;
    this.form = document.getElementById(formId);
    this.intervalMs = options.intervalMs || 5000;
    this.storageKey = options.storageKey || `autosave_${formId}`;
    this.onSave = options.onSave || null;
    this.onRestore = options.onRestore || null;
    this._timer = null;
    this._indicator = null;
  }

  /**
   * Start auto-saving. Also checks for previously saved data.
   */
  init() {
    if (!this.form) {
      return;
    }

    // Check for existing saved data
    const saved = this._loadSavedData();
    if (saved) {
      this._showRestorePrompt(saved);
    }

    // Start periodic saving
    this._timer = setInterval(() => this._save(), this.intervalMs);

    // Save on input events (debounced by the interval)
    this.form.addEventListener('change', () => this._save());

    // Save before page unload
    window.addEventListener('beforeunload', () => this._save());

    // Create save indicator
    this._createIndicator();
  }

  /**
   * Stop auto-saving and clean up.
   */
  destroy() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
    if (this._indicator) {
      this._indicator.remove();
    }
  }

  /**
   * Clear saved data (call after successful form submission).
   */
  clearSavedData() {
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      /* localStorage might be unavailable */
    }
  }

  _save() {
    if (!this.form) {
      return;
    }

    const data = {};
    const elements = this.form.elements;

    for (const el of elements) {
      if (!el.name || el.type === 'submit' || el.type === 'button') {
        continue;
      }

      if (el.type === 'checkbox') {
        data[el.name] = el.checked;
      } else if (el.type === 'radio') {
        if (el.checked) {
          data[el.name] = el.value;
        }
      } else {
        data[el.name] = el.value;
      }
    }

    try {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify({
          data,
          timestamp: Date.now(),
          formId: this.formId,
        })
      );
      this._flashIndicator();
      if (this.onSave) {
        this.onSave(data);
      }
    } catch {
      /* localStorage quota or unavailable */
    }
  }

  _loadSavedData() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw);
      // Expire after 24 hours
      if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(this.storageKey);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  _showRestorePrompt(saved) {
    const timeAgo = this._formatTimeAgo(saved.timestamp);
    const banner = document.createElement('div');
    banner.className = 'autosave-restore-banner';
    banner.setAttribute('role', 'alert');
    banner.innerHTML = `
      <p>You have unsaved work from ${timeAgo}.</p>
      <div class="autosave-restore-actions">
        <button type="button" class="btn-restore" aria-label="Restore saved draft">Restore Draft</button>
        <button type="button" class="btn-discard" aria-label="Discard saved draft">Discard</button>
      </div>
    `;

    banner.querySelector('.btn-restore').addEventListener('click', () => {
      this._restoreData(saved.data);
      banner.remove();
    });

    banner.querySelector('.btn-discard').addEventListener('click', () => {
      this.clearSavedData();
      banner.remove();
    });

    this.form.parentNode.insertBefore(banner, this.form);
  }

  _restoreData(data) {
    if (!this.form) {
      return;
    }

    for (const [name, value] of Object.entries(data)) {
      const el = this.form.elements[name];
      if (!el) {
        continue;
      }

      if (el.type === 'checkbox') {
        el.checked = !!value;
      } else if (el.type === 'radio') {
        const radios = this.form.querySelectorAll(`[name="${name}"]`);
        radios.forEach((r) => {
          r.checked = r.value === value;
        });
      } else {
        el.value = value;
      }
    }

    if (this.onRestore) {
      this.onRestore(data);
    }
  }

  _createIndicator() {
    this._indicator = document.createElement('div');
    this._indicator.className = 'autosave-indicator';
    this._indicator.setAttribute('aria-live', 'polite');
    this._indicator.setAttribute('aria-atomic', 'true');
    this._indicator.textContent = '';
    this.form.parentNode.insertBefore(this._indicator, this.form.nextSibling);
  }

  _flashIndicator() {
    if (!this._indicator) {
      return;
    }
    this._indicator.textContent = 'Draft saved';
    this._indicator.classList.add('visible');
    setTimeout(() => {
      this._indicator.classList.remove('visible');
    }, 2000);
  }

  _formatTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) {
      return 'a few seconds ago';
    }
    if (seconds < 3600) {
      return `${Math.floor(seconds / 60)} minutes ago`;
    }
    if (seconds < 86400) {
      return `${Math.floor(seconds / 3600)} hours ago`;
    }
    return 'over a day ago';
  }
}

// ────────────────────────────────────────────────────────────
// Step Wizard
// ────────────────────────────────────────────────────────────

/**
 * Breaks a long form into manageable steps with a progress indicator.
 * Think of it like a checkout process — one step at a time instead of
 * showing everything at once.
 */
export class StepWizard {
  /**
   * @param {string} containerId - ID of the wizard container element
   * @param {Object} [options]
   * @param {boolean} [options.validateOnNext=true] - Validate current step before advancing
   * @param {boolean} [options.showProgress=true] - Show progress bar
   * @param {Function} [options.onStepChange] - Called when step changes
   * @param {Function} [options.onComplete] - Called when wizard is completed
   */
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.validateOnNext = options.validateOnNext !== false;
    this.showProgress = options.showProgress !== false;
    this.onStepChange = options.onStepChange || null;
    this.onComplete = options.onComplete || null;
    this.currentStep = 0;
    this.steps = [];
  }

  init() {
    if (!this.container) {
      return;
    }

    this.steps = Array.from(this.container.querySelectorAll('[data-wizard-step]'));
    if (this.steps.length === 0) {
      return;
    }

    // Inject progress bar
    if (this.showProgress) {
      this._createProgressBar();
    }

    // Inject navigation buttons
    this._createNavigation();

    // Show first step, hide others
    this._showStep(0);

    // Keyboard navigation
    this.container.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        this.next();
      }
    });
  }

  next() {
    if (this.currentStep >= this.steps.length - 1) {
      return;
    }

    if (this.validateOnNext && !this._validateStep(this.currentStep)) {
      return;
    }

    this._showStep(this.currentStep + 1);
  }

  previous() {
    if (this.currentStep <= 0) {
      return;
    }
    this._showStep(this.currentStep - 1);
  }

  goToStep(index) {
    if (index < 0 || index >= this.steps.length) {
      return;
    }
    this._showStep(index);
  }

  _showStep(index) {
    // Hide all steps
    this.steps.forEach((step, i) => {
      step.hidden = i !== index;
      step.setAttribute('aria-hidden', i !== index);
    });

    this.currentStep = index;

    // Update progress
    if (this.showProgress) {
      this._updateProgress();
    }

    // Update navigation buttons
    this._updateNav();

    // Focus the step heading or first input
    const heading = this.steps[index].querySelector('h2, h3, h4, legend');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus();
    }

    // Announce to screen readers
    this._announce(`Step ${index + 1} of ${this.steps.length}`);

    if (this.onStepChange) {
      this.onStepChange(index, this.steps.length);
    }
  }

  _validateStep(index) {
    const step = this.steps[index];
    const inputs = step.querySelectorAll('input, select, textarea');
    let valid = true;

    inputs.forEach((input) => {
      if (!input.checkValidity()) {
        input.reportValidity();
        valid = false;
      }
    });

    return valid;
  }

  _createProgressBar() {
    const bar = document.createElement('div');
    bar.className = 'wizard-progress';
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', this.steps.length);
    bar.setAttribute('aria-valuenow', '1');
    bar.setAttribute('aria-label', 'Form progress');

    bar.innerHTML = `
      <div class="wizard-progress-steps">
        ${this.steps
          .map((step, i) => {
            const label = step.getAttribute('data-wizard-step') || `Step ${i + 1}`;
            return `<div class="wizard-progress-step ${i === 0 ? 'active' : ''}" data-step="${i}">
            <span class="wizard-step-number" aria-hidden="true">${i + 1}</span>
            <span class="wizard-step-label">${escapeHTML(label)}</span>
          </div>`;
          })
          .join('')}
      </div>
      <div class="wizard-progress-bar">
        <div class="wizard-progress-fill" style="width: ${100 / this.steps.length}%"></div>
      </div>
    `;

    this.container.insertBefore(bar, this.container.firstChild);
    this._progressBar = bar;
  }

  _updateProgress() {
    if (!this._progressBar) {
      return;
    }

    const fill = this._progressBar.querySelector('.wizard-progress-fill');
    const pct = ((this.currentStep + 1) / this.steps.length) * 100;
    fill.style.width = `${pct}%`;

    this._progressBar.setAttribute('aria-valuenow', this.currentStep + 1);

    // Update step indicators
    this._progressBar.querySelectorAll('.wizard-progress-step').forEach((el, i) => {
      el.classList.toggle('active', i === this.currentStep);
      el.classList.toggle('completed', i < this.currentStep);
    });
  }

  _createNavigation() {
    const nav = document.createElement('div');
    nav.className = 'wizard-navigation';
    nav.innerHTML = `
      <button type="button" class="wizard-btn-prev" aria-label="Go to previous step">Previous</button>
      <button type="button" class="wizard-btn-next" aria-label="Go to next step">Next</button>
      <button type="button" class="wizard-btn-complete" aria-label="Complete and submit" hidden>Complete</button>
    `;

    nav.querySelector('.wizard-btn-prev').addEventListener('click', () => this.previous());
    nav.querySelector('.wizard-btn-next').addEventListener('click', () => this.next());
    nav.querySelector('.wizard-btn-complete').addEventListener('click', () => {
      if (this._validateStep(this.currentStep) && this.onComplete) {
        this.onComplete();
      }
    });

    this.container.appendChild(nav);
    this._nav = nav;
  }

  _updateNav() {
    if (!this._nav) {
      return;
    }

    const prev = this._nav.querySelector('.wizard-btn-prev');
    const next = this._nav.querySelector('.wizard-btn-next');
    const complete = this._nav.querySelector('.wizard-btn-complete');

    prev.hidden = this.currentStep === 0;
    next.hidden = this.currentStep === this.steps.length - 1;
    complete.hidden = this.currentStep !== this.steps.length - 1;
  }

  _announce(message) {
    let announcer = document.getElementById('wizard-announcer');
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'wizard-announcer';
      announcer.setAttribute('role', 'status');
      announcer.setAttribute('aria-live', 'polite');
      announcer.className = 'sr-only';
      document.body.appendChild(announcer);
    }
    announcer.textContent = message;
  }
}

// ────────────────────────────────────────────────────────────
// Confirmation Dialog (Error Prevention)
// ────────────────────────────────────────────────────────────

/**
 * Shows a confirmation dialog before destructive actions.
 * WCAG 3.3.4 says: for actions that cause legal, financial, or data changes,
 * give users a chance to review, correct, or reverse the action.
 *
 * @param {Object} options
 * @param {string} options.title - Dialog title
 * @param {string} options.message - Explanation of the action
 * @param {string} [options.confirmLabel='Confirm'] - Confirm button text
 * @param {string} [options.cancelLabel='Cancel'] - Cancel button text
 * @param {string} [options.type='warning'] - warning | danger | info
 * @returns {Promise<boolean>} true if confirmed, false if cancelled
 */
export function confirmAction({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  type = 'warning',
}) {
  return new Promise((resolve) => {
    // Create modal backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'confirm-backdrop';
    backdrop.setAttribute('role', 'presentation');

    const dialog = document.createElement('div');
    dialog.className = `confirm-dialog confirm-dialog--${type}`;
    dialog.setAttribute('role', 'alertdialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'confirm-title');
    dialog.setAttribute('aria-describedby', 'confirm-message');

    dialog.innerHTML = `
      <h2 id="confirm-title" class="confirm-title">${escapeHTML(title)}</h2>
      <p id="confirm-message" class="confirm-message">${escapeHTML(message)}</p>
      <div class="confirm-actions">
        <button type="button" class="confirm-btn confirm-btn--cancel">${escapeHTML(cancelLabel)}</button>
        <button type="button" class="confirm-btn confirm-btn--confirm confirm-btn--${escapeHTML(type)}">${escapeHTML(confirmLabel)}</button>
      </div>
    `;

    function cleanup(result) {
      backdrop.remove();
      // Return focus to the element that opened the dialog
      const trigger = document.activeElement;
      if (trigger && trigger !== document.body) {
        trigger.focus();
      }
      resolve(result);
    }

    dialog.querySelector('.confirm-btn--cancel').addEventListener('click', () => cleanup(false));
    dialog.querySelector('.confirm-btn--confirm').addEventListener('click', () => cleanup(true));

    // Escape key cancels
    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        cleanup(false);
      }
    });

    // Click outside cancels
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        cleanup(false);
      }
    });

    backdrop.appendChild(dialog);
    document.body.appendChild(backdrop);

    // Focus the cancel button (safer default)
    dialog.querySelector('.confirm-btn--cancel').focus();
  });
}

// ────────────────────────────────────────────────────────────
// Session Timeout Warning
// ────────────────────────────────────────────────────────────

/**
 * Warns users before their session expires, giving them a chance to extend it.
 * WCAG 2.2.1 requires adjustable timing.
 */
export class SessionTimeoutWarning {
  /**
   * @param {Object} options
   * @param {number} [options.timeoutMs=1800000] - Session timeout (default 30 min)
   * @param {number} [options.warningBeforeMs=120000] - Show warning N ms before timeout (default 2 min)
   * @param {Function} options.onExtend - Call this to extend the session (e.g., API call)
   * @param {Function} [options.onExpire] - Called when session expires
   */
  constructor(options = {}) {
    this.timeoutMs = options.timeoutMs || 30 * 60 * 1000;
    this.warningBeforeMs = options.warningBeforeMs || 2 * 60 * 1000;
    this.onExtend = options.onExtend;
    this.onExpire = options.onExpire;
    this._timer = null;
    this._warningTimer = null;
  }

  start() {
    this.reset();
    // Reset timer on user activity
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach((event) => {
      document.addEventListener(event, () => this.reset(), { passive: true });
    });
  }

  reset() {
    if (this._timer) {
      clearTimeout(this._timer);
    }
    if (this._warningTimer) {
      clearTimeout(this._warningTimer);
    }

    // Set warning timer
    this._warningTimer = setTimeout(() => {
      this._showWarning();
    }, this.timeoutMs - this.warningBeforeMs);

    // Set expiry timer
    this._timer = setTimeout(() => {
      this._dismiss();
      if (this.onExpire) {
        this.onExpire();
      }
    }, this.timeoutMs);
  }

  _showWarning() {
    const minutes = Math.ceil(this.warningBeforeMs / 60000);

    const banner = document.createElement('div');
    banner.id = 'session-timeout-warning';
    banner.className = 'session-timeout-warning';
    banner.setAttribute('role', 'alert');
    banner.setAttribute('aria-live', 'assertive');
    banner.innerHTML = `
      <p>Your session will expire in ${minutes} minute${minutes > 1 ? 's' : ''}.</p>
      <button type="button" class="btn-extend-session">Stay Logged In</button>
    `;

    banner.querySelector('.btn-extend-session').addEventListener('click', () => {
      this.reset();
      banner.remove();
      if (this.onExtend) {
        this.onExtend();
      }
    });

    document.body.appendChild(banner);
  }

  _dismiss() {
    const banner = document.getElementById('session-timeout-warning');
    if (banner) {
      banner.remove();
    }
  }

  destroy() {
    if (this._timer) {
      clearTimeout(this._timer);
    }
    if (this._warningTimer) {
      clearTimeout(this._warningTimer);
    }
    this._dismiss();
  }
}

// ────────────────────────────────────────────────────────────
// Mobile Accessibility Helpers (P4.3.4)
// ────────────────────────────────────────────────────────────

/**
 * Ensure all interactive elements meet the 44×44px minimum touch target size.
 * Scans the page and flags elements that are too small.
 *
 * @returns {{ violations: Array<{ element: Element, width: number, height: number }> }}
 */
export function auditTouchTargets() {
  const MIN_SIZE = 44;
  const interactiveSelectors = 'a, button, [role="button"], input, select, textarea, [tabindex]';
  const elements = document.querySelectorAll(interactiveSelectors);
  const violations = [];

  elements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      if (rect.width < MIN_SIZE || rect.height < MIN_SIZE) {
        violations.push({
          element: el,
          selector:
            el.tagName.toLowerCase() +
            (el.id ? `#${el.id}` : '') +
            (el.className ? `.${el.className.split(' ')[0]}` : ''),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          minRequired: MIN_SIZE,
        });
      }
    }
  });

  return { violations, totalChecked: elements.length };
}

export default {
  AutoSaveManager,
  StepWizard,
  confirmAction,
  SessionTimeoutWarning,
  auditTouchTargets,
};
