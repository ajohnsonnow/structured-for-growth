/**
 * CUI Banner Component (P2.1)
 *
 * Client-side component for displaying CUI markings on pages.
 * Renders banner, portion markings, and designation indicators.
 *
 * Usage:
 *   import { CuiBanner } from './modules/cuiBanner.js';
 *   const banner = new CuiBanner({ type: 'CUI', categories: ['CTI'] });
 *   banner.mount(document.body);
 */
// sanitize – see this.escapeHtml(); all interpolated values are escaped

/**
 * CUI category display names
 */
const CATEGORY_LABELS = {
  CTI: 'Controlled Technical Information',
  EXPT: 'Export Controlled',
  NOFORN: 'Not Releasable to Foreign Nationals',
  PCII: 'Protected Critical Infrastructure Information',
  SSI: 'Sensitive Security Information',
  PRVCY: 'Privacy',
  PII: 'Personally Identifiable Information',
  PHI: 'Protected Health Information',
  LES: 'Law Enforcement Sensitive',
  PROPIN: 'Proprietary Business Information',
  SBD: 'Source Selection',
};

/**
 * Distribution statement display text
 */
const DISTRIBUTION_LABELS = {
  A: 'Approved for public release; distribution is unlimited.',
  B: 'Distribution authorized to U.S. Government agencies only.',
  C: 'Distribution authorized to U.S. Government agencies and their contractors.',
  D: 'Distribution authorized to the Department of Defense and U.S. DoD contractors only.',
  E: 'Distribution authorized to DoD Components only.',
  F: 'Further dissemination only as directed by the controlling DoD office.',
  X: 'Distribution authorized to U.S. Government agencies and private individuals or enterprises eligible to obtain export-controlled technical data.',
};

export class CuiBanner {
  /**
   * @param {object} config
   * @param {boolean} config.enabled - Whether CUI marking is active
   * @param {string} config.type - 'CUI' or 'CUI//SP' (Specified)
   * @param {string[]} config.categories - CUI category codes
   * @param {string[]} config.dissemination - Dissemination control codes
   * @param {string} config.distributionStatement - Distribution statement letter
   * @param {string} config.controlledBy - Controlling organization
   * @param {string} config.poc - Point of contact
   */
  constructor(config = {}) {
    this.config = {
      enabled: config.enabled ?? false,
      type: config.type || 'CUI',
      categories: config.categories || [],
      dissemination: config.dissemination || [],
      distributionStatement: config.distributionStatement || 'A',
      controlledBy: config.controlledBy || '',
      poc: config.poc || '',
    };

    this.headerEl = null;
    this.footerEl = null;
  }

  /**
   * Generate the banner marking string
   * @returns {string}
   */
  getBannerText() {
    let text = this.config.type;
    if (this.config.categories.length > 0) {
      text += '//' + this.config.categories.join('/');
    }
    if (this.config.dissemination.length > 0) {
      text += '//' + this.config.dissemination.join('/');
    }
    return text;
  }

  /**
   * Create the banner bar element
   * @param {'header'|'footer'} position
   * @returns {HTMLElement}
   */
  createBannerElement(position) {
    const el = document.createElement('div');
    el.className = `cui-banner cui-banner--${position}`;
    el.setAttribute('role', 'banner');
    el.setAttribute('aria-label', `CUI ${position} marking`);

    el.style.cssText = `
      background-color: #006400;
      color: #ffffff;
      text-align: center;
      padding: 4px 16px;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      font-weight: bold;
      letter-spacing: 1px;
      position: ${position === 'header' ? 'sticky' : 'fixed'};
      ${position === 'header' ? 'top: 0' : 'bottom: 0'};
      left: 0;
      right: 0;
      z-index: 99999;
      user-select: none;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    `;

    el.textContent = this.getBannerText();
    return el;
  }

  /**
   * Create a designation indicator block
   * @returns {HTMLElement}
   */
  createDesignationBlock() {
    const el = document.createElement('div');
    el.className = 'cui-designation-block';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'CUI Designation Indicator');

    el.style.cssText = `
      border: 2px solid #006400;
      padding: 12px 16px;
      margin: 16px 0;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.6;
      background: #f5fff5;
    `;

    const distText = DISTRIBUTION_LABELS[this.config.distributionStatement] || '';
    const categoryNames = this.config.categories.map((c) => CATEGORY_LABELS[c] || c).join(', ');

    el.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 8px; color: #006400;">
        CUI DESIGNATION INDICATOR
      </div>
      <div><strong>Controlled By:</strong> ${this.escapeHtml(this.config.controlledBy || 'Not specified')}</div>
      <div><strong>CUI Category:</strong> ${this.escapeHtml(categoryNames || this.config.type)}</div>
      <div><strong>Distribution:</strong> ${this.escapeHtml(distText)}</div>
      <div><strong>POC:</strong> ${this.escapeHtml(this.config.poc || 'Not specified')}</div>
    `;

    return el;
  }

  /**
   * Mount banners to the page
   * @param {HTMLElement} container - Usually document.body
   */
  mount(container = document.body) {
    if (!this.config.enabled) {
      return;
    }

    // Remove existing banners
    this.unmount();

    // Create and insert header banner
    this.headerEl = this.createBannerElement('header');
    container.insertBefore(this.headerEl, container.firstChild);

    // Create and insert footer banner
    this.footerEl = this.createBannerElement('footer');
    container.appendChild(this.footerEl);

    // Add body padding to account for banners
    container.style.paddingTop = '28px';
    container.style.paddingBottom = '28px';

    // Add print styles
    this.addPrintStyles();
  }

  /**
   * Remove banners from the page
   */
  unmount() {
    if (this.headerEl) {
      this.headerEl.remove();
      this.headerEl = null;
    }
    if (this.footerEl) {
      this.footerEl.remove();
      this.footerEl = null;
    }
  }

  /**
   * Add print-specific styles
   */
  addPrintStyles() {
    if (document.getElementById('cui-print-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'cui-print-styles';
    style.textContent = `
      @media print {
        .cui-banner {
          position: fixed !important;
          background-color: #006400 !important;
          color: #ffffff !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .cui-banner--header {
          top: 0 !important;
        }
        .cui-banner--footer {
          bottom: 0 !important;
        }
        @page {
          margin-top: 40px;
          margin-bottom: 40px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Generate a portion marking span
   * @param {string} text - Text to mark
   * @param {string} category - CUI category code
   * @returns {string} HTML string with portion marking
   */
  static portionMark(text, category = 'CUI') {
    return `<span class="cui-portion" style="font-weight:600;">(${category}) ${text}</span>`;
  }

  /**
   * Escape HTML entities
   * @param {string} str
   * @returns {string}
   */
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

export default CuiBanner;
