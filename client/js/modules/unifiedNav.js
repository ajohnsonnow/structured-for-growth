/**
 * Unified Navigation Component (P6.2)
 * ────────────────────────────────────
 * Single source of truth for navigation across ALL pages.
 *
 * Replaces 4 different nav patterns (index, sub-pages, portal, dashboard)
 * with one JS-driven component that:
 *
 *  • Renders a consistent nav bar on every page
 *  • Groups "Resources" items into an accessible mega-menu dropdown
 *  • Detects current page and sets aria-current="page"
 *  • Builds breadcrumbs on sub-pages
 *  • Injects a consistent footer
 *  • Supports keyboard navigation (Arrow keys, Escape, Tab trapping)
 *  • Adapts to mobile with a full-screen overlay menu
 *  • Respects prefers-reduced-motion
 *
 * Usage:
 *   import { initUnifiedNav } from './modules/unifiedNav.js';
 *   initUnifiedNav();   // call on DOMContentLoaded
 */

import { icon } from './icons.js';

// ─── Navigation Structure ─────────────────────────────────────────
// This is THE navigation model. Edit here → every page updates.

/** @typedef {{ label: string, href: string, icon?: string }} NavLink */
/** @typedef {{ label: string, icon?: string, children: NavLink[] }} NavGroup */
/** @typedef {NavLink | NavGroup} NavItem */

/** @type {NavItem[]} */
const NAV_ITEMS = [
  { label: 'Home', href: '/', icon: 'home' },
  { label: 'Portfolio', href: '/#portfolio', icon: 'briefcase' },
  { label: 'Services', href: '/#services', icon: 'layers' },
  {
    label: 'Resources',
    icon: 'book-open',
    children: [
      { label: 'Templates', href: '/templates.html', icon: 'layout' },
      { label: 'Compliance KB', href: '/compliance', icon: 'shield-check' },
      { label: 'MBAi Methodology', href: '/mbai', icon: 'cpu' },
      { label: 'Skills Web', href: '/skills', icon: 'git-merge' },
      { label: 'Documentation', href: '/docs', icon: 'file-text' },
      { label: 'Glossary', href: '/glossary', icon: 'book-open' },
    ],
  },
  { label: 'Contact', href: '/#contact', icon: 'mail' },
];

/** Utility nav (right side) */
const UTILITY_ITEMS = [
  { label: 'Client Portal', href: '/portal', icon: 'log-in', highlight: true },
];

/** Breadcrumb label overrides */
const PAGE_TITLES = {
  '/': 'Home',
  '/templates.html': 'Templates',
  '/compliance': 'Compliance',
  '/mbai': 'MBAi',
  '/docs': 'Documentation',
  '/portal': 'Client Portal',
  '/dashboard': 'Dashboard',
  '/glossary': 'Glossary',
};

// ─── Helpers ──────────────────────────────────────────────────────

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const MOBILE_BP = 768;
const isMobile = () => window.innerWidth <= MOBILE_BP;

/**
 * Determine if a nav href matches the current page.
 * Handles hash links (/#portfolio) and path links (/compliance).
 * @param {string} href
 * @returns {boolean}
 */
function isCurrentPage(href) {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const clean = href.split('#')[0].replace(/\/$/, '') || '/';
  return path === clean;
}

/**
 * Get the current page path (normalized).
 * @returns {string}
 */
function currentPath() {
  return window.location.pathname.replace(/\/$/, '') || '/';
}

// ─── Render Functions ─────────────────────────────────────────────

/**
 * Build a single nav link <li>.
 * @param {NavLink} item
 * @param {boolean} isCurrent
 * @returns {string}
 */
function renderNavLink(item, isCurrent) {
  const ariaCurrent = isCurrent ? ' aria-current="page"' : '';
  const activeClass = isCurrent ? ' active' : '';
  const highlightClass = item.highlight ? ' nav-highlight' : '';
  const iconHtml = item.icon ? icon(item.icon, { size: 16, class: 'nav-icon' }) : '';

  return `<li role="none">
    <a href="${item.href}" class="nav-link${activeClass}${highlightClass}" role="menuitem"${ariaCurrent}>
      ${iconHtml}<span>${item.label}</span>
    </a>
  </li>`;
}

/**
 * Build a dropdown/mega-menu group <li>.
 * @param {NavGroup} group
 * @returns {string}
 */
function renderNavGroup(group) {
  // Check if any child is current
  const anyChildCurrent = group.children.some((c) => isCurrentPage(c.href));
  const groupIconHtml = group.icon ? icon(group.icon, { size: 16, class: 'nav-icon' }) : '';

  const childItems = group.children
    .map((child) => {
      const current = isCurrentPage(child.href);
      const childIcon = child.icon ? icon(child.icon, { size: 18, class: 'dropdown-icon' }) : '';
      return `<li role="none">
        <a href="${child.href}" class="dropdown-link${current ? ' active' : ''}" role="menuitem"${current ? ' aria-current="page"' : ''}>
          ${childIcon}<span>${child.label}</span>
        </a>
      </li>`;
    })
    .join('\n');

  return `<li role="none" class="nav-dropdown">
    <button
      class="nav-link dropdown-trigger${anyChildCurrent ? ' active' : ''}"
      role="menuitem"
      aria-haspopup="true"
      aria-expanded="false"
      type="button"
    >
      ${groupIconHtml}<span>${group.label}</span>
      ${icon('chevron-down', { size: 14, class: 'dropdown-chevron' })}
    </button>
    <ul class="dropdown-menu" role="menu" aria-label="${group.label} submenu">
      ${childItems}
    </ul>
  </li>`;
}

/**
 * Build the full navigation HTML.
 * @returns {string}
 */
function buildNavHTML() {
  const mainItems = NAV_ITEMS.map((item) => {
    if ('children' in item) {
      return renderNavGroup(item);
    }
    return renderNavLink(item, isCurrentPage(item.href));
  }).join('\n');

  const utilItems = UTILITY_ITEMS.map((item) => renderNavLink(item, isCurrentPage(item.href))).join(
    '\n'
  );

  return `
    <a href="#main-content" class="skip-link">Skip to content</a>
    <div id="liveAnnouncer" class="sr-only" aria-live="polite" aria-atomic="true"></div>
    <nav class="navbar site-nav" role="navigation" aria-label="Main navigation">
      <div class="container nav-inner">
        <div class="nav-brand">
          <a href="/" aria-label="Structured For Growth - Home">
            <h1 class="nav-brand-name">Structured <span class="highlight">For Growth</span></h1>
          </a>
          <span class="nav-byline nav-brand-tagline">Agentic Solutions that Scale</span>
        </div>

        <ul class="nav-menu nav-primary" id="nav-menu" role="menubar">
          ${mainItems}
          <li class="nav-separator" role="separator" aria-hidden="true"></li>
          ${utilItems}
        </ul>

        <button class="mobile-menu-toggle" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="nav-menu" type="button">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
    <div class="nav-backdrop" aria-hidden="true"></div>`;
}

/**
 * Build breadcrumb HTML for current page.
 * @returns {string} Empty string on home page.
 */
function buildBreadcrumbHTML() {
  const path = currentPath();
  if (path === '/') {
    return '';
  }

  const pageTitle = PAGE_TITLES[path] || path.replace(/^\//, '').replace(/\.html$/, '');

  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: window.location.origin + '/' },
      { '@type': 'ListItem', position: 2, name: pageTitle, item: window.location.href },
    ],
  };

  return `
    <nav class="breadcrumb-nav" aria-label="Breadcrumb">
      <ol class="breadcrumb" itemscope itemtype="https://schema.org/BreadcrumbList">
        <li class="breadcrumb-item" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
          <a href="/" itemprop="item"><span itemprop="name">Home</span></a>
          <meta itemprop="position" content="1">
        </li>
        <li class="breadcrumb-item active" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem" aria-current="page">
          <span itemprop="name">${pageTitle}</span>
          <meta itemprop="position" content="2">
        </li>
      </ol>
    </nav>
    <script type="application/ld+json">${JSON.stringify(breadcrumbData)}</script>`;
}

/**
 * Build consistent footer HTML.
 * @returns {string}
 */
function buildFooterHTML() {
  return `
    <footer class="footer site-footer" role="contentinfo">
      <div class="container footer-inner">
        <div class="footer-content footer-grid">
          <div class="footer-section footer-col footer-brand">
            <h3>Structured For Growth</h3>
            <p>Content Engineering Excellence</p>
            <p class="footer-glossary-badge">${icon('book-open', { size: 16 })} <a href="/glossary">210+ terms defined</a></p>
          </div>

          <div class="footer-section footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/#portfolio">Portfolio</a></li>
              <li><a href="/#services">Services</a></li>
              <li><a href="/#contact">Contact</a></li>
            </ul>
          </div>

          <div class="footer-section footer-col">
            <h4>Resources</h4>
            <ul>
              <li><a href="/templates.html">Template Library</a></li>
              <li><a href="/compliance">Compliance KB</a></li>
              <li><a href="/mbai">MBAi Methodology</a></li>
              <li><a href="/docs">Documentation</a></li>
              <li><a href="/glossary">Glossary</a></li>
            </ul>
          </div>

          <div class="footer-section footer-col">
            <h4>Access</h4>
            <ul>
              <li><a href="/portal">Client Portal</a></li>
              <li><a href="/dashboard">Admin Login</a></li>
            </ul>
          </div>
        </div>

        <div class="footer-bottom">
          <p>&copy; ${new Date().getFullYear()} Structured For Growth. All rights reserved.</p>
        </div>
      </div>
    </footer>`;
}

// ─── Mega-Menu Keyboard Navigation (WAI-ARIA APG) ─────────────────

/**
 * Initialize mega-menu dropdown behaviour + keyboard support.
 * Follows WAI-ARIA Authoring Practices Guide (APG) Menu pattern.
 */
function initMegaMenu() {
  const dropdowns = document.querySelectorAll('.nav-dropdown');

  dropdowns.forEach((dropdown) => {
    const trigger = dropdown.querySelector('.dropdown-trigger');
    const menu = dropdown.querySelector('.dropdown-menu');
    const links = menu.querySelectorAll('.dropdown-link');

    if (!trigger || !menu) {
      return;
    }

    let closeTimer = null;

    function open() {
      clearTimeout(closeTimer);
      // Close any other open dropdowns first
      document.querySelectorAll('.nav-dropdown.open').forEach((d) => {
        if (d !== dropdown) {
          closeDropdown(d);
        }
      });
      dropdown.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
    }

    function close() {
      dropdown.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    }

    function closeDropdown(dd) {
      dd.classList.remove('open');
      dd.querySelector('.dropdown-trigger')?.setAttribute('aria-expanded', 'false');
    }

    // Mouse: open on hover (desktop), close with delay
    dropdown.addEventListener('mouseenter', () => {
      if (!isMobile()) {
        open();
      }
    });

    dropdown.addEventListener('mouseleave', () => {
      if (!isMobile()) {
        closeTimer = setTimeout(close, 200);
      }
    });

    // Click toggle (mobile + desktop fallback)
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('open');
      if (isOpen) {
        close();
      } else {
        open();
        // Focus first link
        const first = links[0];
        if (first) {
          setTimeout(() => first.focus(), prefersReducedMotion ? 0 : 100);
        }
      }
    });

    // Keyboard: Enter/Space open, Escape close, arrow keys navigate
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
        const first = links[0];
        if (first) {
          setTimeout(() => first.focus(), 50);
        }
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        open();
        const first = links[0];
        if (first) {
          setTimeout(() => first.focus(), 50);
        }
      }
      if (e.key === 'Escape') {
        close();
        trigger.focus();
      }
    });

    // Arrow key navigation within dropdown
    links.forEach((link, idx) => {
      link.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const next = links[idx + 1] || links[0];
          next.focus();
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prev = links[idx - 1] || links[links.length - 1];
          prev.focus();
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          close();
          trigger.focus();
        }
        if (e.key === 'Tab' && !e.shiftKey && idx === links.length - 1) {
          close();
        }
        if (e.key === 'Tab' && e.shiftKey && idx === 0) {
          close();
        }
      });
    });
  });

  // Click outside closes all dropdowns
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-dropdown')) {
      document.querySelectorAll('.nav-dropdown.open').forEach((dd) => {
        dd.classList.remove('open');
        dd.querySelector('.dropdown-trigger')?.setAttribute('aria-expanded', 'false');
      });
    }
  });
}

// ─── Mobile Menu (Full-Screen Overlay) ────────────────────────────

function initMobileMenu() {
  const toggle = document.querySelector('.mobile-menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const backdrop = document.querySelector('.nav-backdrop');

  if (!toggle || !navMenu) {
    return;
  }

  let scrollY = 0;

  function isOpen() {
    return navMenu.classList.contains('active');
  }

  function openMenu() {
    scrollY = window.scrollY;
    document.body.classList.add('nav-open');
    document.body.style.top = `-${scrollY}px`;

    navMenu.classList.add('active');
    toggle.classList.add('active');
    if (backdrop) {
      backdrop.classList.add('active');
    }

    toggle.setAttribute('aria-expanded', 'true');
    navMenu.setAttribute('aria-hidden', 'false');

    const firstLink = navMenu.querySelector('.nav-link, .dropdown-trigger');
    if (firstLink) {
      setTimeout(() => firstLink.focus(), prefersReducedMotion ? 0 : 300);
    }
  }

  function closeMenu(restoreFocus = true) {
    navMenu.classList.remove('active');
    toggle.classList.remove('active');
    if (backdrop) {
      backdrop.classList.remove('active');
    }

    document.body.classList.remove('nav-open');
    document.body.style.top = '';
    window.scrollTo(0, scrollY);

    toggle.setAttribute('aria-expanded', 'false');
    navMenu.setAttribute('aria-hidden', 'true');

    // Close any open dropdowns
    document.querySelectorAll('.nav-dropdown.open').forEach((dd) => {
      dd.classList.remove('open');
      dd.querySelector('.dropdown-trigger')?.setAttribute('aria-expanded', 'false');
    });

    if (restoreFocus) {
      toggle.focus();
    }
  }

  // Initial state
  navMenu.setAttribute('aria-hidden', isMobile() ? 'true' : 'false');

  // Toggle
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    isOpen() ? closeMenu() : openMenu();
  });

  // Backdrop
  if (backdrop) {
    backdrop.addEventListener('click', () => closeMenu());
  }

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (!isOpen()) {
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      closeMenu();
      return;
    }

    // Tab trapping
    if (e.key === 'Tab') {
      const focusable = [toggle, ...navMenu.querySelectorAll('a, button')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // Resize: close on desktop
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!isMobile() && isOpen()) {
        closeMenu(false);
      }
      navMenu.setAttribute('aria-hidden', isMobile() ? (isOpen() ? 'false' : 'true') : 'false');
    }, 150);
  });

  // Nav link clicks close mobile menu
  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (isMobile() && isOpen()) {
        closeMenu(false);
      }
    });
  });
}

// ─── Scroll Spy (Home page only) ──────────────────────────────────

function initScrollSpy() {
  if (currentPath() !== '/') {
    return;
  }

  const sections = document.querySelectorAll('section[id]');
  if (sections.length === 0) {
    return;
  }

  const navLinks = document.querySelectorAll(
    '.nav-menu .nav-link[href^="#"], .nav-menu .nav-link[href^="/#"]'
  );

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) {
      return;
    }
    ticking = true;
    requestAnimationFrame(() => {
      let current = '';
      sections.forEach((section) => {
        const top = section.offsetTop;
        if (window.pageYOffset >= top - 200) {
          current = section.getAttribute('id');
        }
      });

      navLinks.forEach((link) => {
        const href = link.getAttribute('href');
        link.classList.remove('active');
        link.removeAttribute('aria-current');
        if (href === `#${current}` || href === `/#${current}`) {
          link.classList.add('active');
        }
      });
      ticking = false;
    });
  });
}

// ─── Public Init ──────────────────────────────────────────────────

/**
 * Initialize the unified navigation system.
 * Call once on DOMContentLoaded.
 *
 * @param {Object} [options]
 * @param {boolean} [options.renderNav=true] - Inject nav HTML (set false for dashboard/portal with custom nav)
 * @param {boolean} [options.renderFooter=true] - Inject footer HTML
 * @param {boolean} [options.renderBreadcrumbs=true] - Inject breadcrumbs on sub-pages
 */
export function initUnifiedNav(options = {}) {
  const { renderNav = true, renderFooter = true, renderBreadcrumbs = true } = options;

  // ── Inject Nav ──
  if (renderNav) {
    // Find or create nav target
    const existingNav = document.querySelector('nav.navbar');
    const existingSkip = document.querySelector('.skip-link');
    const existingAnnouncer = document.getElementById('liveAnnouncer');

    const navHTML = buildNavHTML();

    if (existingNav) {
      // Replace existing nav (and skip-link + announcer if they exist)
      if (existingSkip) {
        existingSkip.remove();
      }
      if (existingAnnouncer) {
        existingAnnouncer.remove();
      }
      const existingBackdrop = document.querySelector('.nav-backdrop');
      if (existingBackdrop) {
        existingBackdrop.remove();
      }

      existingNav.insertAdjacentHTML('beforebegin', navHTML);
      existingNav.remove();
    } else {
      document.body.insertAdjacentHTML('afterbegin', navHTML);
    }
  }

  // ── Inject Breadcrumbs ──
  if (renderBreadcrumbs) {
    const breadcrumbHTML = buildBreadcrumbHTML();
    if (breadcrumbHTML) {
      const main = document.querySelector('main, #main-content');
      if (main) {
        main.insertAdjacentHTML('afterbegin', breadcrumbHTML);
      }
    }
  }

  // ── Inject Footer ──
  if (renderFooter) {
    const existingFooter = document.querySelector('footer.footer');
    const footerHTML = buildFooterHTML();

    if (existingFooter) {
      existingFooter.outerHTML = footerHTML;
    } else {
      // Insert before closing </body> scripts
      const main = document.querySelector('main, #main-content');
      if (main) {
        main.insertAdjacentHTML('afterend', footerHTML);
      }
    }
  }

  // ── Initialize behaviours ──
  if (renderNav) {
    initMegaMenu();
    initMobileMenu();
    initScrollSpy();
  }
}

export default { initUnifiedNav };
