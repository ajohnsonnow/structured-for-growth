/**
 * Lighthouse CI Configuration (P5.1.7)
 *
 * Performance budgets for the platform.
 * These are the "speed limits" — if a page loads slower than
 * these thresholds, the CI build warns or fails.
 *
 * Standards: Web Vitals, ISO 25010 Performance, Lighthouse
 */
module.exports = {
  ci: {
    collect: {
      // Test all static HTML pages
      url: [
        'http://localhost:5173/',
        'http://localhost:5173/dashboard.html',
        'http://localhost:5173/templates.html',
        'http://localhost:5173/compliance.html',
        'http://localhost:5173/portal.html',
        'http://localhost:5173/docs.html',
        'http://localhost:5173/mbai.html',
        'http://localhost:5173/glossary.html',
        'http://localhost:5173/skills.html',
      ],
      numberOfRuns: 3,
      startServerCommand: 'npm run dev:client',
      settings: {
        preset: 'desktop',
        // Throttling to simulate real-world conditions
        throttling: {
          cpuSlowdownMultiplier: 2,
        },
      },
    },
    assert: {
      assertions: {
        // Performance score ≥ 90
        'categories:performance': ['warn', { minScore: 0.9 }],
        // Accessibility score ≥ 95
        'categories:accessibility': ['error', { minScore: 0.95 }],
        // Best practices ≥ 90
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        // SEO ≥ 90
        'categories:seo': ['warn', { minScore: 0.9 }],

        // Core Web Vitals
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }], // 2s
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }], // 2.5s
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }], // 0.1
        'total-blocking-time': ['warn', { maxNumericValue: 300 }], // 300ms
        interactive: ['warn', { maxNumericValue: 3500 }], // 3.5s

        // Bundle size limits
        'resource-summary:script:size': ['warn', { maxNumericValue: 300000 }], // 300KB JS
        'resource-summary:stylesheet:size': ['warn', { maxNumericValue: 100000 }], // 100KB CSS
        'resource-summary:total:size': ['warn', { maxNumericValue: 1000000 }], // 1MB total

        // Accessibility specifics
        'color-contrast': 'error',
        'document-title': 'error',
        'html-has-lang': 'error',
        'meta-viewport': 'error',
      },
    },
    upload: {
      // Store results locally (switch to Lighthouse CI Server in production)
      target: 'filesystem',
      outputDir: './.lighthouseci',
    },
  },
};
