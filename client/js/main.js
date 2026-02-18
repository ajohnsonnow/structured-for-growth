// Main JavaScript Module
import { initContactForm } from './modules/contactForm.js';
import { initGlossaryAutoDetect } from './modules/glossaryAutoDetect.js';
import { initGlossaryTooltips } from './modules/glossaryTooltip.js';
import { initIcons } from './modules/icons.js';
import { initNavigation } from './modules/navigation.js';
import { initSmoothScroll } from './modules/smoothScroll.js';
import { initThemeToggle } from './modules/themeToggle.js';
import { initUnifiedNav } from './modules/unifiedNav.js';

// Initialize all modules when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Legacy navigation (kept as fallback until all pages migrate)
  initNavigation();

  // Phase 6: Unified nav, icons, tooltips, theme toggle
  initUnifiedNav({ renderNav: true, renderFooter: true, renderBreadcrumbs: true });
  initIcons();
  initThemeToggle();
  initGlossaryTooltips();
  initGlossaryAutoDetect({ scope: 'main, [role="main"], .content, article' });

  initContactForm();
  initSmoothScroll();

  // Add scroll animations
  initScrollAnimations();
});

// Scroll animations for elements
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all sections
  document.querySelectorAll('section').forEach((section) => {
    observer.observe(section);
  });
}
