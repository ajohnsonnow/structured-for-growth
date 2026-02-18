# Client-Side JavaScript Audit Report

**Project:** Structured for Growth
**Audit Date:** 2025-01-XX
**Scope:** All files under `client/js/`, `client/sw.js`, `client/scripts/`
**Total Files Audited:** 26 (8 page entry points, 15 modules, 1 script, 1 service worker, 1 data file)
**Total Lines of Code:** ~12,500+

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [File-by-File Audit](#3-file-by-file-audit)
4. [Cross-Cutting Concerns](#4-cross-cutting-concerns)
   - [Security](#41-security)
   - [Accessibility](#42-accessibility)
   - [Performance](#43-performance)
   - [Error Handling](#44-error-handling)
   - [Memory Management & Event Cleanup](#45-memory-management--event-cleanup)
   - [Browser Compatibility](#46-browser-compatibility)
   - [Code Quality & JSDoc](#47-code-quality--jsdoc)
   - [Module Architecture & Circular Dependencies](#48-module-architecture--circular-dependencies)
5. [Critical Issues (Must Fix)](#5-critical-issues-must-fix)
6. [High-Priority Issues](#6-high-priority-issues)
7. [Medium-Priority Issues](#7-medium-priority-issues)
8. [Low-Priority / Best Practices](#8-low-priority--best-practices)
9. [Recommendations Summary](#9-recommendations-summary)

---

## 1. Executive Summary

The client-side JavaScript codebase is a **vanilla ES Modules multi-page application** with no framework dependency. It demonstrates strong accessibility awareness (ARIA, focus trapping, screen reader announcements) and includes sophisticated features like PWA offline support, CUI markings, and cognitive accessibility helpers.

**Strengths:**
- Excellent ARIA implementation across navigation, tooltips, and modals
- Well-structured module system with clear separation of concerns
- Comprehensive PWA support (Service Worker, IndexedDB, background sync)
- Good JSDoc coverage in module files
- CUI/CMMC compliance-aware features

**Critical Weaknesses:**
- **Pervasive XSS vulnerabilities** via `innerHTML` with unsanitized data (14+ locations)
- **`dashboard.js` is a 2,451-line monolith** with ~40 `window.xxx` global function exports
- **JWT tokens stored in `localStorage`** (vulnerable to XSS exfiltration)
- **No Content Security Policy enforcement** in client-side code
- **Event listeners on `document`/`window` are never cleaned up** across multiple modules

---

## 2. Architecture Overview

```
Entry Points (page-specific):
  main.js ──────── Public site (index.html)
  dashboard.js ─── Admin CMS (dashboard.html)
  portal.js ────── Client portal (portal.html)
  compliance.js ── Compliance KB (compliance.html)
  docs.js ──────── Documentation (docs.html)
  mbai.js ──────── MBAi methodology (mbai.html)
  templates.js ─── Template gallery (templates.html)
  glossary-page.js  Glossary (glossary.html)

Shared Modules (client/js/modules/):
  cognitiveAccessibility.js   AutoSaveManager, StepWizard, confirmAction, SessionTimeoutWarning, auditTouchTargets
  contactForm.js              Form validation & submission
  cuiBanner.js                CUI marking banner component
  cuiConfig.js                CUI configuration UI panel
  glossaryAutoDetect.js       DOM scanning for glossary terms
  glossaryTooltip.js          Accessible tooltip system
  icons.js                    SVG icon system (60+ icons)
  installPrompt.js            PWA install prompt
  navigation.js               Responsive nav with ARIA
  offlineIndicator.js         Online/offline status toast
  offlineStore.js             IndexedDB offline persistence
  pdfExport.js                PDF/UA export via print
  smoothScroll.js             Anchor smooth scrolling
  themeToggle.js              Dark/light mode toggle
  unifiedNav.js               Unified navigation component

Other:
  sw.js ──────────── Service Worker
  templateData.js ── Template data (3,224 lines)
  scripts/value-calculator.js ── ROI calculator
```

**Import Graph (main.js):**
```
main.js
 ├── contactForm.js
 ├── glossaryAutoDetect.js
 ├── glossaryTooltip.js
 ├── icons.js
 ├── navigation.js
 ├── smoothScroll.js
 ├── themeToggle.js
 └── unifiedNav.js
```

**No circular dependencies detected.** Each module exports initialization functions and has no cross-module runtime dependencies.

---

## 3. File-by-File Audit

### 3.1 `client/js/main.js` (51 lines)

**Purpose:** Entry point for public-facing pages. Imports 8 modules.

| Criterion | Rating | Notes |
|-----------|--------|-------|
| JSDoc | ❌ None | No module-level or function-level documentation |
| Error Handling | ⚠️ Partial | `initGlossaryTooltips().then(...)` has no `.catch()` |
| Accessibility | ✅ Good | Delegates to well-structured modules |

**Issues:**
- **Line 20:** `initScrollAnimations()` is defined locally with an `IntersectionObserver` but has no JSDoc and no disconnect/cleanup
- **Lines 7-8:** Both `initNavigation()` and `initUnifiedNav()` are called — potential behavioral duplication (both create mobile menu, keyboard handlers, scroll-spy). `navigation.js` and `unifiedNav.js` both bind `document`-level keydown and resize listeners, meaning two separate Escape key handlers and two resize debounce timers run concurrently.
- **Line 15:** No `.catch()` on the promise chain: `initGlossaryTooltips().then(initGlossaryAutoDetect)`

### 3.2 `client/js/dashboard.js` (2,451 lines)

**Purpose:** Full CMS admin dashboard — auth, CRUD for clients/projects/users, messaging, campaigns, backup/restore, demo data.

| Criterion | Rating | Notes |
|-----------|--------|-------|
| JSDoc | ❌ None | Zero JSDoc across 2,451 lines |
| Error Handling | ⚠️ Weak | Many `try/catch` blocks but they use `showNotification('error', ...)` with no logging |
| Accessibility | ❌ Poor | `alert()` for user feedback, no ARIA on dynamic content |
| Security | ❌ Critical | XSS via innerHTML, tokens in localStorage |

**Critical Issues:**

- **Line 1:** `let authToken = localStorage.getItem('authToken')` — JWT in localStorage is accessible to any XSS payload. Should use httpOnly cookies.
- **Lines 280, 310, 340, etc.:** Extensive use of `innerHTML` with unsanitized server data:
  ```js
  // Example pattern throughout:
  card.innerHTML = `<h3>${client.company}</h3><p>${client.contactName}</p>`;
  ```
  Client company names, contact names, project titles, message contents, campaign names — all inserted via innerHTML without sanitization. An attacker who controls any of these fields can execute arbitrary JavaScript.
- **~40 functions exported via `window.xxx = function()`** pattern (lines throughout): `window.openClientModal`, `window.handleClientSubmit`, `window.deleteClient`, `window.switchView`, etc. These pollute the global namespace and are callable from the console or any injected script.
- **Line ~2100:** `prompt('Enter new name:', item.name)` — uses `prompt()` for user input, inaccessible to screen readers.
- **Lines ~400-500:** `displayClients()` — builds card grid entirely via string concatenation + innerHTML.
- **Lines ~950-1050:** `displayConversations()` and `displayThread()` — message content rendered via innerHTML. If a message contains `<script>` or event handlers, they execute.
- **Line ~1800:** `exportDatabaseDirect()` creates a Blob download, which is fine, but `restoreFromBackup()` at line ~1850 parses uploaded JSON with `JSON.parse()` and sends it without validating the structure.
- **No module imports** — this is a standalone script, not part of the ES module system.

### 3.3 `client/js/portal.js` (355 lines)

**Purpose:** Client-facing portal with auth, project viewing, billing, estimates.

| Criterion | Rating | Notes |
|-----------|--------|-------|
| JSDoc | ❌ None | No documentation |
| Error Handling | ⚠️ Mixed | Try/catch on fetches, but uses `alert()` for errors |
| Accessibility | ⚠️ Partial | Focus trap on login modal, but stub functions use `alert()` |
| Security | ❌ High Risk | `portalToken` in localStorage, innerHTML with server data |

**Issues:**
- **Line 1:** `let portalToken = localStorage.getItem('portalToken')` — same localStorage JWT risk.
- **Lines ~180-200:** `displayClientInfo()`, `displayProjects()`, `displayPaymentInfo()` — all use innerHTML with server-returned data.
- **Lines ~310-320:** `approveEstimate()` and `requestChanges()` are placeholder stubs: `alert('Estimate approval coming soon...')`. These are broken UX and inaccessible.
- **Line ~80:** `showLoginModal()` has a good focus trap implementation.

### 3.4 `client/js/compliance.js` (402 lines)

**Purpose:** Compliance Knowledge Base page.

| Criterion | Rating | Notes |
|-----------|--------|-------|
| JSDoc | ❌ None | |
| Error Handling | ⚠️ | Catches fetch errors, logs to console |
| Security | ⚠️ | innerHTML with API data |

**Issues:**
- **Lines ~200-250:** `renderFrameworkGrid()`, `renderStats()`, `renderTemplates()` — all use innerHTML with data from `/api/compliance/frameworks`. If the API is compromised, XSS is possible.
- **Lines ~30-160:** `COMPLIANCE_TEMPLATES` array (31 objects) is hardcoded — this static data is fine.
- **Line ~300:** `showFrameworkModal()` renders modal content via innerHTML.

### 3.5 `client/js/docs.js` (325 lines)

**Purpose:** Documentation page with tabbed interface.

| Criterion | Rating | Notes |
|-----------|--------|-------|
| JSDoc | ❌ None | |
| Error Handling | ✅ | Try/catch on manifest fetch |
| Security | ⚠️ | `esc()` helper only escapes `<` and `&` — incomplete |

**Issues:**
- **Line ~15:** `function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }` — Does NOT escape `>`, `"`, or `'`. Attribute injection is possible if data appears in HTML attributes.
- **Line ~240:** Ctrl+K shortcut for search focus — good UX but no collision detection with browser shortcuts.

### 3.6 `client/js/mbai.js` (336 lines)

**Purpose:** MBAi Methodology page.

| Criterion | Rating | Notes |
|-----------|--------|-------|
| JSDoc | ❌ None | |
| Error Handling | ⚠️ | Fetches wrapped in try/catch |
| Security | ⚠️ | innerHTML with API data |

**Issues:**
- **Line ~300:** Default case in `renderTemplateBody()` uses `JSON.stringify(tpl, null, 2)` inside a `<pre>` tag via innerHTML. If `tpl` contains HTML entities, they could be interpreted.
- **Lines ~150-280:** Eight specialized renderers (renderSBSC, renderCircular, etc.) all use string concatenation + innerHTML.

### 3.7 `client/js/templates.js` (2,265 lines)

**Purpose:** Template gallery with interactive demos.

| Criterion | Rating | Notes |
|-----------|--------|-------|
| JSDoc | ❌ None | |
| Error Handling | ⚠️ | Demo code has minimal error handling |
| Security | ❌ High | innerHTML everywhere, window.xxx globals, simulated encryption |
| Accessibility | ⚠️ | Some demos use inline `onclick` and `onmouseover` |

**Issues:**
- **Throughout:** ~30+ demo configurations, each building HTML via string concatenation + innerHTML. While demo data is mostly hardcoded, the pattern is dangerous if any user input enters the pipeline.
- **Lines ~1300-1420:** Demo configs use `window.saveStateForm`, `window.clearStateForm`, `window.undoState`, `window.redoState`, `window.crudCreate`, `window.crudUpdate`, `window.crudDelete`, `window.storageSet`, `window.storageGet`, `window.storageRemove`, `window.storageClear`, `window.simulateLoad`, `window.simulateLoadError`, `window.validateEmail`, `window.validatePhone`, `window.validatePassword`, `window.apiClientGet`, `window.apiClientPost`, `window.apiClientError`, `window.previewEmailTemplate`, `window.sendDemoEmail`, `window.handleDebounceInput`, `window.handleThrottleMove`, `window.formatDemoDate`, `window.formatDuration` — **26+ global function declarations** from demo configs.
- **Line ~1395:** `window.crudUpdate` uses `prompt('Enter new name:', item.name)` — inaccessible.
- **Line ~525:** `simEncrypt()` does simple XOR — labeled "AES-256-GCM" in the UI, which could be misleading to users who think this is real encryption.
- **Line ~2215:** Duplicate `initMobileMenu()` function — this file defines its own mobile menu handler that conflicts with `unifiedNav.js`'s version.
- **Lines ~300-350:** `buildCodePreviewDemo()` — HTML-escapes template code with `.replace(/</g, '&lt;')` etc., which is correct, but then passes `template.title` unescaped into the HTML string.
- **Line ~2195:** `card.onclick = () => openTemplateModal(template)` uses `onclick` property instead of `addEventListener`.

### 3.8 `client/js/glossary-page.js` (327 lines)

**Purpose:** Interactive glossary with search, filters, alphabetical index, deep-linking.

| Criterion | Rating | Notes |
|-----------|--------|-------|
| JSDoc | ⚠️ Partial | Some functions documented |
| Error Handling | ✅ | Proper try/catch |
| Accessibility | ✅ Good | ARIA attributes, hash navigation, debounced search |
| Security | ⚠️ | innerHTML with API data, `highlightMatch` wraps in `<mark>` |

**Issues:**
- **Lines ~130-150:** `highlightMatch()` inserts `<mark>` tags into search terms but doesn't escape the surrounding text.
- **Line ~50:** `renderTermList()` uses innerHTML with terms from the glossary API.
- **Line ~200:** 200ms debounce on search — good performance practice.

### 3.9 `client/sw.js` (329 lines)

**Purpose:** Service Worker — offline caching, background sync, push notifications.

| Criterion | Rating | Notes |
|-----------|--------|-------|
| JSDoc | ⚠️ Partial | Some inline comments |
| Error Handling | ⚠️ Mixed | `cache.addAll()` errors caught but logged only |
| Security | ⚠️ | Static cache version string |

**Issues:**
- **Line 1-3:** Cache versions are static strings (`sfg-v1-static`, `sfg-v1-dynamic`, `sfg-v1-api`). No automated cache-busting mechanism. Deploying updates requires manually changing these strings.
- **Line ~50:** `APP_SHELL` array precaches 14 URLs. If any fails, `cache.addAll()` fails entirely but is caught silently.
- **Line ~120:** `networkFirstWithOfflineFallback()` — returns `offline.html` as fallback, which is good.
- **Line ~200:** Background sync uses IndexedDB directly (separate from `offlineStore.js` module), creating a parallel database `sfg-sync` alongside the main `sfg-offline` database. This is a maintenance concern.
- **Line ~280:** Push notification `notificationclick` handler uses `clients.openWindow()` — correct.

### 3.10 `client/scripts/value-calculator.js` (165 lines)

**Purpose:** ROI value proposition calculator based on Fernhill project data.

| Criterion | Rating | Notes |
|-----------|--------|-------|
| JSDoc | ⚠️ | Class has block comment but no JSDoc |
| Error Handling | ✅ | Null checks on DOM elements |
| Security | ✅ | No innerHTML, uses textContent |

**Issues:**
- **Line ~145:** `new ValueCalculator()` is instantiated immediately on DOM load. No way to destroy or reinitialize.
- **Line 165:** Exports `ValueCalculator` and `CONFIG` as ES modules, suggesting it's intended for import, but the script also self-initializes.

---

### 3.11-3.25 Module Files

#### `cognitiveAccessibility.js` (611 lines) ✅ Best-documented module

**Purpose:** AutoSaveManager, StepWizard, confirmAction dialog, SessionTimeoutWarning, auditTouchTargets.

| Criterion | Rating | Notes |
|-----------|--------|-------|
| JSDoc | ✅ Excellent | Full JSDoc on all exports |
| Error Handling | ✅ | Validation on inputs |
| Accessibility | ✅ Excellent | WCAG 2.2.1 timing, WCAG 3.3.4 error prevention |

**Issues:**
- **Lines 470-490:** `SessionTimeoutWarning.start()` adds `mousedown`, `keydown`, `scroll`, `touchstart` listeners to `document` but has no corresponding cleanup in `destroy()` — those listeners persist forever.
- **Line 430:** `confirmAction()` — the `cleanup()` function tries to focus `document.activeElement` which at that point IS the button being clicked, not the original trigger. The focus restoration logic is incorrect.
- **Line 560:** `auditTouchTargets()` is a runtime audit tool — excellent for development but has no guard against production use.

#### `contactForm.js` (~115 lines) ✅

**Purpose:** Form validation and async submission.

| Criterion | Rating |
|-----------|--------|
| JSDoc | ⚠️ Partial |
| Error Handling | ✅ Good |
| Security | ✅ | No innerHTML |

**Issues:**
- **Line ~30:** Email regex validation: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` — permissive but standard. Does not prevent homograph attacks.
- Loading state management is well-implemented (`.btn-text` / `.btn-loading` pattern).

#### `cuiBanner.js` (251 lines) ✅

**Purpose:** CUI marking header/footer banners.

| Criterion | Rating |
|-----------|--------|
| JSDoc | ✅ Good |
| Accessibility | ✅ | `role="banner"`, `aria-label`, print styles |

**Issues:**
- **Line ~240:** `static portionMark(text, category)` returns innerHTML string with unescaped `text` parameter. If caller passes user input, XSS is possible.

#### `cuiConfig.js` (343 lines) ✅

**Purpose:** CUI configuration panel with form controls.

| Criterion | Rating |
|-----------|--------|
| JSDoc | ✅ Good |
| Accessibility | ✅ | Fieldsets, legends, labels |

**Issues:**
- **Line ~330:** `_escapeHtml()` uses `div.textContent/innerHTML` pattern — correct but creates DOM elements on every call. Could use a static map for perf.
- No significant issues found.

#### `glossaryAutoDetect.js` (283 lines) ✅

**Purpose:** Scans DOM for recognized terms, wraps with `<abbr>`.

| Criterion | Rating |
|-----------|--------|
| JSDoc | ✅ Good |
| Performance | ⚠️ | TreeWalker + regex over entire DOM |

**Issues:**
- **Lines ~120-180:** `buildTermRegex()` sorts terms by length and builds a single alternation regex. For large glossaries (100+ terms), this creates a very large regex pattern that could be slow.
- **Line ~60:** `SKIP_TAGS` set includes 18 elements — comprehensive.
- **Line ~200:** `maxOccurrences` parameter defaults to 1 — prevents over-annotation.

#### `glossaryTooltip.js` (349 lines) ✅

**Purpose:** Accessible tooltip system.

| Criterion | Rating |
|-----------|--------|
| JSDoc | ✅ Good |
| Accessibility | ✅ Excellent | `role="tooltip"`, `aria-describedby`, keyboard support, mobile bottom-sheet |

**Issues:**
- **Lines 300-320:** `initGlossaryTooltips()` adds `keydown` and `mousedown` handlers to `document`, plus `scroll` and `resize` to `window` — **never cleaned up**.
- **Line ~230:** Hover delay of 300ms — good for preventing accidental triggers.
- **Lines ~250-260:** `mouseleave` handler has a 200ms delay to allow cursor to move to tooltip — well-implemented.

#### `icons.js` (264 lines) ✅

**Purpose:** SVG icon system with 60+ icons.

| Criterion | Rating |
|-----------|--------|
| JSDoc | ✅ Good |
| Accessibility | ✅ | Conditional `aria-hidden` vs `role="img" aria-label` |

**Issues:**
- **Line ~215:** `icon()` function builds SVG via string concatenation. The `ariaLabel` parameter is inserted directly into an attribute: `aria-label="${ariaLabel}"`. If `ariaLabel` contains `"` characters, it breaks the attribute.
- **Line ~250:** `initIcons()` sets `el.innerHTML = svg` — the SVG is self-generated so this is safe, but it replaces any existing children.

#### `installPrompt.js` (207 lines) ✅

**Purpose:** PWA install prompt with banner UI.

| Criterion | Rating |
|-----------|--------|
| JSDoc | ✅ Good |
| Accessibility | ✅ | `aria-live`, `role="region"`, keyboard-dismissable |

**Issues:**
- **Lines ~50-60:** Checks `localStorage.getItem('sfg-visits')` to show banner on 2nd visit. Counter logic is correct.
- `prefers-reduced-motion` support — good.

#### `navigation.js` (~227 lines) ⚠️ Potentially redundant

**Purpose:** Responsive nav with mobile drawer.

| Criterion | Rating |
|-----------|--------|
| JSDoc | ⚠️ Partial |
| Accessibility | ✅ | ARIA expanded/hidden, focus trapping, Escape key |

**Issues:**
- **This entire module overlaps with `unifiedNav.js`** — both handle mobile menus, keyboard navigation, scroll-spy, and resize handlers. `main.js` calls both `initNavigation()` and `initUnifiedNav()`, meaning two sets of event listeners are active on the same DOM elements.
- **Lines ~100-120:** Escape key handler on `document` is never removed.
- **Lines ~180-200:** Scroll-spy uses `requestAnimationFrame` — good throttling.

#### `offlineIndicator.js` (~144 lines) ✅

**Purpose:** Online/offline status toast notification.

| Criterion | Rating |
|-----------|--------|
| JSDoc | ✅ Good |
| Accessibility | ✅ | `role="status"`, `aria-live="polite"`, `prefers-reduced-motion` |

**Issues:**
- **Line ~100:** `onConnectivityChange()` returns an unsubscribe function — excellent cleanup pattern.
- **Lines ~20-30:** `online`/`offline` event listeners on `window` are added in `init()` but never removed.

#### `offlineStore.js` (351 lines) ✅

**Purpose:** IndexedDB wrapper for offline data persistence.

| Criterion | Rating |
|-----------|--------|
| JSDoc | ✅ Good |
| Error Handling | ✅ | Promise-based with reject on errors |

**Issues:**
- **Line ~280:** `offlineFetch()` calls `res.json()` without checking `res.ok` first for non-GET requests. If the server returns a non-JSON error response (e.g., 500 with HTML), this will throw an unhandled JSON parse error.
- **Line ~200:** `cachePurgeExpired()` uses an IDB index `expires` — well-implemented.
- `replayQueue()` is available but there's no automatic call on reconnection from this module (that's handled by SW background sync).

#### `pdfExport.js` (~240 lines) ✅

**Purpose:** PDF/UA export via `window.open()` + `print()`.

| Criterion | Rating |
|-----------|--------|
| JSDoc | ✅ Good |
| Accessibility | ✅ | PDF/UA compliance, heading hierarchy, table headers |

**Issues:**
- **Lines ~100-150:** `exportToPdf()` builds an entire HTML document as a string. Uses `document.documentElement.getAttribute('lang')` for lang attribute — good i18n.
- **Lines ~200-230:** `downloadAsHtml()` fallback if popup is blocked — good error recovery.
- **Line ~50:** CUI markings in PDF output — good compliance feature.

#### `smoothScroll.js` (~31 lines) ⚠️

**Purpose:** Simple anchor smooth scrolling.

| Criterion | Rating |
|-----------|--------|
| JSDoc | ❌ None |
| Accessibility | ❌ | Does NOT check `prefers-reduced-motion` |

**Issues:**
- **Line ~15:** Hard-codes `behavior: 'smooth'` without checking `window.matchMedia('(prefers-reduced-motion: reduce)')`. Users who prefer reduced motion should get instant scrolling. This violates WCAG 2.3.3.
- **Lines ~10-25:** Click handlers are added to all `a[href^="#"]` but never removed.

#### `themeToggle.js` (~175 lines) ✅

**Purpose:** Dark/light mode toggle.

| Criterion | Rating |
|-----------|--------|
| JSDoc | ⚠️ Partial |
| Accessibility | ✅ | Screen reader announcement via `aria-live` region, OS theme change detection |

**Issues:**
- **Line ~80:** Creates a `#theme-announcement` div for screen reader announcements — good.
- **Line ~120:** Listens to `matchMedia('(prefers-color-scheme: dark)')` changes — good OS integration.
- **Line ~50:** Stores theme in localStorage as `sfg-theme` — no expiry, persists forever.

#### `unifiedNav.js` (640 lines) ✅ Primary navigation module

**Purpose:** Single source of truth for all page navigation.

| Criterion | Rating |
|-----------|--------|
| JSDoc | ✅ Good | Public `initUnifiedNav()` has full JSDoc |
| Accessibility | ✅ Excellent | `role="menubar"`, `aria-current`, focus trapping, skip link, live announcer, BreadcrumbList JSON-LD |
| Performance | ✅ | Resize debounce, `requestAnimationFrame` scroll-spy |

**Issues:**
- **Lines 300-400:** `initMegaMenu()` adds `mouseenter`, `mouseleave`, `click`, `keydown` event listeners to every dropdown trigger and link — these are never cleaned up. Not an issue on static pages, but prevents garbage collection if nav is dynamically replaced.
- **Lines ~500-550:** `initMobileMenu()` adds `keydown` on `document` for tab trapping — never removed.
- **Line ~580:** Resize listener closes mobile menu when transitioning to desktop — good responsive behavior.
- **Line ~480:** `scrollY` is captured before scroll lock, restored after — prevents iOS scroll jump. Well-implemented.

---

## 4. Cross-Cutting Concerns

### 4.1 Security

#### XSS via innerHTML (CRITICAL)

The most pervasive security issue. The following files use `innerHTML` with data from external sources (APIs or user input) without sanitization:

| File | Location | Data Source |
|------|----------|-------------|
| `dashboard.js` | ~15+ locations | `/api/clients`, `/api/projects`, `/api/users`, `/api/messages`, `/api/campaigns` |
| `portal.js` | ~5 locations | `/api/portal/data` |
| `compliance.js` | ~5 locations | `/api/compliance/*` |
| `mbai.js` | ~10 locations | `/api/templates` |
| `glossary-page.js` | ~3 locations | `/api/glossary` |
| `docs.js` | ~5 locations | `docs-manifest.json` |
| `templates.js` | ~30 locations | Mostly static, but `template.title` unescaped |
| `cuiBanner.js` | `portionMark()` | Caller-supplied text |
| `icons.js` | `icon()` | `ariaLabel` parameter |

**Recommendation:** Introduce a shared `sanitizeHtml()` utility or use `textContent` for untrusted data. Consider adopting DOMPurify.

#### JWT in localStorage

| File | Storage Key |
|------|-------------|
| `dashboard.js` | `authToken` |
| `portal.js` | `portalToken` |

Both tokens are readable by any JavaScript on the page, including XSS payloads. **Recommendation:** Use httpOnly, Secure, SameSite cookies for JWT storage.

### 4.2 Accessibility

**Strengths (many):**
- Focus trapping in modals (`portal.js`, `unifiedNav.js`)
- `aria-live` regions for dynamic announcements (`themeToggle.js`, `offlineIndicator.js`, `cognitiveAccessibility.js`)
- Skip link and landmark roles (`unifiedNav.js`)
- Keyboard navigation (Escape, ArrowUp/Down, Tab trapping)
- `prefers-reduced-motion` support in `installPrompt.js`, `offlineIndicator.js`, `unifiedNav.js`
- CUI banners with print styles (`cuiBanner.js`)
- PDF/UA compliance (`pdfExport.js`)
- Touch target audit utility (`cognitiveAccessibility.js`)
- WCAG 2.2.1 session timeout warning (`cognitiveAccessibility.js`)
- BreadcrumbList Schema.org JSON-LD (`unifiedNav.js`)

**Weaknesses:**
- `smoothScroll.js` does NOT respect `prefers-reduced-motion`
- `dashboard.js` uses `alert()` (4+ locations) and `prompt()` (1 location) — inaccessible
- `templates.js` uses `prompt()` in CRUD demo
- `portal.js` uses `alert()` for stub functions
- `templates.js` uses inline `onclick`/`onmouseover` HTML attributes in demo configs instead of `addEventListener`
- `dashboard.js` has no ARIA on dynamically rendered content (cards, tables, modals)

### 4.3 Performance

**Good patterns:**
- Debounced search in `glossary-page.js` (200ms)
- `requestAnimationFrame` scroll-spy in `unifiedNav.js` and `navigation.js`
- Resize debouncing in `unifiedNav.js`
- `IntersectionObserver` for scroll animations in `main.js`
- Service Worker caching strategies (cache-first for statics, network-first for API)

**Concerns:**
- `glossaryAutoDetect.js` runs a TreeWalker + regex over the entire DOM on page load. For pages with thousands of text nodes, this could be slow.
- `dashboard.js` rebuilds entire card grids on every filter/search via innerHTML — no virtual DOM or diffing.
- `templates.js` at 2,265 lines is loaded even when only viewing a single template. No code splitting or lazy loading.
- `templateData.js` at 3,224 lines is imported eagerly by `templates.js`. Large initial bundle.

### 4.4 Error Handling

| Pattern | Files Using It |
|---------|---------------|
| `try/catch` + notification | `dashboard.js`, `portal.js` |
| `try/catch` + `console.error` | `compliance.js`, `mbai.js`, `docs.js`, `glossary-page.js` |
| `.catch()` on promises | Rare — `main.js` notably missing it |
| `if (!element) return` guard | Most modules (good) |
| No error handling | `smoothScroll.js`, `templates.js` demos |

**Missing:**
- No global `window.onerror` or `window.onunhandledrejection` handler for catching uncaught errors
- `offlineStore.js` `offlineFetch()` calls `res.json()` without `res.ok` check
- Service Worker `cache.addAll()` failure is silently caught

### 4.5 Memory Management & Event Cleanup

**Pattern:** Most modules add event listeners to `document` or `window` during initialization but provide **no cleanup/destroy mechanism**. This is acceptable for a multi-page application where each page load creates a fresh JS context, but it prevents these modules from being used in SPA-like contexts or dynamic content.

| Module | Leaked Listeners |
|--------|-----------------|
| `navigation.js` | `document keydown`, `window resize`, `window scroll` |
| `unifiedNav.js` | `document keydown`, `document click`, `window resize`, `window scroll` |
| `glossaryTooltip.js` | `document keydown`, `document mousedown`, `window scroll`, `window resize` |
| `themeToggle.js` | `matchMedia change` |
| `offlineIndicator.js` | `window online`, `window offline` |
| `cognitiveAccessibility.js` | `document mousedown`, `document keydown`, `document scroll`, `document touchstart` (SessionTimeoutWarning) |
| `main.js` | `IntersectionObserver` never disconnected |

**Recommendation:** Each module's init function should return a cleanup/destroy function.

### 4.6 Browser Compatibility

- **ES Modules (`import`/`export`):** Requires modern browsers. No fallback provided for IE11 or legacy browsers. ✅ Acceptable for modern apps.
- **`IntersectionObserver`:** Used in `main.js`. Supported in all modern browsers.
- **`navigator.clipboard.writeText()`:** Used in `templates.js`. Requires HTTPS and user gesture. Falls back gracefully.
- **`navigator.storage.estimate()`:** Used in `offlineStore.js`. Not supported in all browsers; guarded with `if` check.
- **`crypto.randomUUID()`:** Not used (custom hash functions in demos).
- **IndexedDB:** Used in `offlineStore.js` and `sw.js`. Well-supported.
- **Service Worker:** Feature-detected at registration.
- **`prefers-color-scheme`:** Well-supported; fallback to dark mode default.
- **`Intl.NumberFormat`:** Used in `value-calculator.js`. Well-supported.

No significant compatibility issues detected.

### 4.7 Code Quality & JSDoc

| File | Lines | JSDoc | Rating |
|------|-------|-------|--------|
| `main.js` | 51 | ❌ None | Poor |
| `dashboard.js` | 2,451 | ❌ None | Poor |
| `portal.js` | 355 | ❌ None | Poor |
| `compliance.js` | 402 | ❌ None | Poor |
| `docs.js` | 325 | ❌ None | Poor |
| `mbai.js` | 336 | ❌ None | Poor |
| `templates.js` | 2,265 | ❌ None | Poor |
| `glossary-page.js` | 327 | ⚠️ Partial | Fair |
| `sw.js` | 329 | ⚠️ Partial | Fair |
| `value-calculator.js` | 165 | ⚠️ Partial | Fair |
| `cognitiveAccessibility.js` | 611 | ✅ Full | Excellent |
| `contactForm.js` | 115 | ⚠️ Partial | Fair |
| `cuiBanner.js` | 251 | ✅ Good | Good |
| `cuiConfig.js` | 343 | ✅ Good | Good |
| `glossaryAutoDetect.js` | 283 | ✅ Good | Good |
| `glossaryTooltip.js` | 349 | ✅ Good | Good |
| `icons.js` | 264 | ✅ Good | Good |
| `installPrompt.js` | 207 | ✅ Good | Good |
| `navigation.js` | 227 | ⚠️ Partial | Fair |
| `offlineIndicator.js` | 144 | ✅ Good | Good |
| `offlineStore.js` | 351 | ✅ Good | Good |
| `pdfExport.js` | 240 | ✅ Good | Good |
| `smoothScroll.js` | 31 | ❌ None | Poor |
| `themeToggle.js` | 175 | ⚠️ Partial | Fair |
| `unifiedNav.js` | 640 | ✅ Good | Good |
| `templateData.js` | 3,224 | ❌ None | N/A (data) |

**Pattern:** Page-level scripts have zero JSDoc. Module files are well-documented (9 of 15 rated Good or Excellent).

### 4.8 Module Architecture & Circular Dependencies

**No circular dependencies detected.** The dependency graph is acyclic:

```
main.js ──→ [8 modules, no inter-dependencies]
templates.js ──→ templateData.js, navigation.js
Other page scripts ──→ (no module imports, standalone)
```

**Architectural concerns:**
1. `dashboard.js` (2,451 lines) and `templates.js` (2,265 lines) are monoliths that should be broken into smaller modules.
2. `dashboard.js` and `portal.js` do not use the module system at all — they're standalone scripts with no imports.
3. `templates.js` defines its own `initMobileMenu()` that conflicts with `unifiedNav.js`.
4. `sw.js` has its own IndexedDB code separate from `offlineStore.js`, creating two parallel implementations.

---

## 5. Critical Issues (Must Fix)

| # | Issue | Files | Impact |
|---|-------|-------|--------|
| C1 | **innerHTML with unsanitized server data** | `dashboard.js`, `portal.js`, `compliance.js`, `mbai.js`, `glossary-page.js`, `docs.js` | XSS — any compromised API response or stored payload executes arbitrary JS in the user's browser |
| C2 | **JWT tokens in localStorage** | `dashboard.js:1`, `portal.js:1` | Token theft via XSS. Attacker can exfiltrate auth tokens and impersonate users |
| C3 | **`dashboard.js` exports ~40 functions to `window`** | `dashboard.js` | Functions callable from devtools or XSS; combined with C1, enables privilege escalation |

## 6. High-Priority Issues

| # | Issue | Files | Impact |
|---|-------|-------|--------|
| H1 | **No global error handler** | All | Unhandled promise rejections and runtime errors are silently lost |
| H2 | **`docs.js` `esc()` function is incomplete** | `docs.js:~15` | Only escapes `<` and `&`, missing `>`, `"`, `'` — attribute injection possible |
| H3 | **`smoothScroll.js` ignores `prefers-reduced-motion`** | `smoothScroll.js:~15` | WCAG 2.3.3 violation — can cause vestibular discomfort |
| H4 | **Dual navigation initialization** | `main.js:7-8` | `initNavigation()` + `initUnifiedNav()` creates duplicate event listeners, potential DOM conflicts |
| H5 | **`offlineStore.js` `offlineFetch()` doesn't check `res.ok`** | `offlineStore.js:~280` | Non-JSON error responses cause unhandled parse errors |
| H6 | **Service Worker cache version is static** | `sw.js:1-3` | Deployments may serve stale cached content indefinitely |

## 7. Medium-Priority Issues

| # | Issue | Files | Impact |
|---|-------|-------|--------|
| M1 | **`dashboard.js` is 2,451-line monolith** | `dashboard.js` | Unmaintainable, not testable, no separation of concerns |
| M2 | **`templates.js` is 2,265-line monolith** | `templates.js` | Same concerns as M1 |
| M3 | **`alert()` and `prompt()` used for user interaction** | `dashboard.js`, `portal.js`, `templates.js` | Blocks thread, inaccessible to screen readers, inconsistent UX |
| M4 | **`icons.js` `icon()` doesn't escape `ariaLabel`** | `icons.js:~215` | `"` in aria-label breaks SVG attribute |
| M5 | **`cuiBanner.js` `portionMark()` doesn't escape input** | `cuiBanner.js:~240` | XSS if caller passes untrusted text |
| M6 | **`confirmAction()` focus restore is broken** | `cognitiveAccessibility.js:~430` | After dialog closes, focus may not return to the original trigger element |
| M7 | **`templates.js` duplicates `initMobileMenu()`** | `templates.js:~2215` | Conflicts with `unifiedNav.js` version |
| M8 | **`SessionTimeoutWarning` leaks event listeners** | `cognitiveAccessibility.js:~470` | `destroy()` method clears timers but doesn't remove `document`-level activity listeners |
| M9 | **Two separate IndexedDB implementations** | `sw.js`, `offlineStore.js` | `sfg-sync` and `sfg-offline` databases serve overlapping purposes |
| M10 | **No `.catch()` on promise chain** | `main.js:15` | `initGlossaryTooltips().then(initGlossaryAutoDetect)` — uncaught rejections |

## 8. Low-Priority / Best Practices

| # | Issue | Files | Impact |
|---|-------|-------|--------|
| L1 | Page-level scripts lack JSDoc | All page entry points | Developer experience, maintainability |
| L2 | No module cleanup/destroy functions | Most modules | Prevents SPA usage, minor memory concern |
| L3 | `templateData.js` (3,224 lines) loaded eagerly | `templates.js` | Larger initial bundle |
| L4 | `value-calculator.js` self-initializes AND exports | `value-calculator.js:145` | Side effect on import |
| L5 | `card.onclick = ...` instead of `addEventListener` | `templates.js:~2195` | Only one handler can be attached |
| L6 | Inline event attributes in demo HTML | `templates.js` demos | `onclick`, `oninput`, `onmouseover` in HTML strings |
| L7 | `themeToggle.js` theme stored without expiry | `themeToggle.js:~50` | Minor — localStorage persists forever |
| L8 | `glossaryAutoDetect.js` may be slow on large DOMs | `glossaryAutoDetect.js:~120` | TreeWalker + large regex on every text node |

---

## 9. Recommendations Summary

### Immediate (Security)
1. **Introduce a shared `sanitizeHtml()` utility** — use DOMPurify or a minimal escaper that covers `<`, `>`, `&`, `"`, `'`. Apply to ALL innerHTML insertions that contain external data.
2. **Move JWT storage to httpOnly cookies** — configure the server to set tokens as httpOnly, Secure, SameSite=Strict cookies.
3. **Add a global error boundary:** `window.addEventListener('unhandledrejection', ...)` and `window.onerror` to catch and log errors.

### Short-Term (Architecture)
4. **Refactor `dashboard.js`** into ES modules: separate auth, clients, projects, users, messages, campaigns, and backup modules.
5. **Remove dual navigation init** — either remove `initNavigation()` from `main.js` or consolidate into `unifiedNav.js`.
6. **Fix `esc()` in `docs.js`** to escape all five HTML special characters.
7. **Add `prefers-reduced-motion` check to `smoothScroll.js`.**
8. **Add `.catch()` to promise chains** in `main.js`.

### Medium-Term (Quality)
9. **Add JSDoc to all page-level scripts.**
10. **Replace `alert()`/`prompt()` with `confirmAction()` from `cognitiveAccessibility.js`.**
11. **Fix `confirmAction()` focus restore** — store `document.activeElement` before creating the dialog, restore it after.
12. **Unify IndexedDB usage** — refactor `sw.js` to use `offlineStore.js` patterns or share a common database.
13. **Implement cache-busting** for Service Worker — derive cache names from build hash or version file.
14. **Add `.catch()` and `res.ok` checks** to `offlineFetch()`.

### Long-Term (Maintainability)
15. **Code-split `templates.js`** — lazy-load demo configs.
16. **Add cleanup/destroy functions** to all module init functions.
17. **Move templates demos away from `window.xxx` globals** — use event delegation or scoped handlers.
18. **Consider a lightweight templating approach** (tagged template literals with auto-escaping) to replace raw innerHTML string building.
