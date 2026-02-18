/**
 * Navigation Module
 * ─────────────────
 * World-class responsive nav with:
 *  • Slide-in mobile drawer with backdrop
 *  • ARIA expanded/hidden states
 *  • Keyboard navigation (Escape to close, Tab trapping)
 *  • Body scroll lock when menu is open
 *  • Resize handler (auto-close on desktop widths)
 *  • Smooth anchor scrolling with active tracking
 *  • prefers-reduced-motion respect
 */
export function initNavigation() {
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!navMenu || !mobileToggle) {
    return;
  }

  // ── Create backdrop overlay ──
  let backdrop = document.querySelector('.nav-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    navbar.parentNode.insertBefore(backdrop, navbar.nextSibling);
  }

  // ── State helpers ──
  let scrollY = 0;
  const MOBILE_BP = 768;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function isMobile() {
    return window.innerWidth <= MOBILE_BP;
  }

  function isMenuOpen() {
    return navMenu.classList.contains('active');
  }

  function openMenu() {
    // Save scroll position & lock body
    scrollY = window.scrollY;
    document.body.classList.add('nav-open');
    document.body.style.top = `-${scrollY}px`;

    navMenu.classList.add('active');
    mobileToggle.classList.add('active');
    backdrop.classList.add('active');

    // ARIA
    mobileToggle.setAttribute('aria-expanded', 'true');
    navMenu.setAttribute('aria-hidden', 'false');

    // Focus first nav link after transition
    const firstLink = navMenu.querySelector('.nav-link');
    if (firstLink) {
      setTimeout(() => firstLink.focus(), prefersReducedMotion ? 0 : 300);
    }
  }

  function closeMenu(restoreFocus = true) {
    navMenu.classList.remove('active');
    mobileToggle.classList.remove('active');
    backdrop.classList.remove('active');

    // Unlock body & restore scroll
    document.body.classList.remove('nav-open');
    document.body.style.top = '';
    window.scrollTo(0, scrollY);

    // ARIA
    mobileToggle.setAttribute('aria-expanded', 'false');
    navMenu.setAttribute('aria-hidden', 'true');

    if (restoreFocus) {
      mobileToggle.focus();
    }
  }

  // ── Set initial ARIA state ──
  mobileToggle.setAttribute('aria-expanded', 'false');
  mobileToggle.setAttribute('aria-controls', 'nav-menu');
  navMenu.id = navMenu.id || 'nav-menu';
  navMenu.setAttribute('aria-hidden', isMobile() ? 'true' : 'false');
  navMenu.setAttribute('role', 'navigation');
  navMenu.setAttribute('aria-label', 'Main navigation');

  // ── Toggle handler ──
  mobileToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isMenuOpen()) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // ── Backdrop click closes menu ──
  backdrop.addEventListener('click', () => closeMenu());

  // ── Click outside closes menu ──
  document.addEventListener('click', (e) => {
    if (
      isMenuOpen() &&
      !navMenu.contains(e.target) &&
      !mobileToggle.contains(e.target) &&
      !backdrop.contains(e.target)
    ) {
      closeMenu();
    }
  });

  // ── Keyboard navigation ──
  document.addEventListener('keydown', (e) => {
    if (!isMenuOpen()) {
      return;
    }

    // Escape closes
    if (e.key === 'Escape') {
      e.preventDefault();
      closeMenu();
      return;
    }

    // Tab trapping inside mobile menu
    if (e.key === 'Tab') {
      const focusable = [mobileToggle, ...navMenu.querySelectorAll('a, button')];
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

  // ── Close on resize past mobile breakpoint ──
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!isMobile() && isMenuOpen()) {
        closeMenu(false);
      }
      navMenu.setAttribute('aria-hidden', isMobile() ? (isMenuOpen() ? 'false' : 'true') : 'false');
    }, 150);
  });

  // ── Link click handlers ──
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      // Close mobile menu on any link click
      if (isMobile() && isMenuOpen()) {
        closeMenu(false);
      }

      const href = link.getAttribute('href');

      // Anchor links - smooth scroll
      if (href && href.startsWith('#')) {
        e.preventDefault();

        // Update active state
        navLinks.forEach((l) => {
          if (!l.classList.contains('nav-highlight')) {
            l.classList.remove('active');
          }
        });
        link.classList.add('active');

        // Scroll to section
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
          });
        }
      }
    });
  });

  // ── Scroll-spy for anchor links (main page only) ──
  const sections = document.querySelectorAll('section[id]');
  if (sections.length > 0) {
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
          if (href && href.startsWith('#')) {
            link.classList.remove('active');
            if (href === `#${current}`) {
              link.classList.add('active');
            }
          }
        });
        ticking = false;
      });
    });
  }
}
