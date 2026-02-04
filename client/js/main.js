// Main JavaScript Module
import { initNavigation } from './modules/navigation.js';
import { initContactForm } from './modules/contactForm.js';
import { initSmoothScroll } from './modules/smoothScroll.js';

// Initialize all modules when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initContactForm();
    initSmoothScroll();
    
    // Add scroll animations
    initScrollAnimations();
});

// Scroll animations for elements
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
}
