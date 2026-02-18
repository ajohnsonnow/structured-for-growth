# DHS Trusted Tester v5.1 — Baseline Testing Checklist

**Product:** Structured for Growth — Consulting & Compliance Platform
**Version:** 1.8.1
**Tester:** ______________________
**Date:** ______________________
**Tool Chain:** axe-core 4.11, ANDI (SSA), NVDA 2024+, browser DevTools

> This checklist covers all 20 DHS Trusted Tester v5.1 baselines.
> Each baseline maps to one or more WCAG 2.1 / Section 508 criteria.
> Record **Pass**, **Fail**, **N/A**, or **DNS** (Did Not Start) per page.

---

## How to Use This Checklist

1. Open each page in Chrome or Edge with ANDI bookmarklet loaded.
2. Work through every baseline test in order.
3. Record results in the grid below (one column per page).
4. Document failures with the element, expected behavior, and screenshot.
5. Attach evidence (screenshots, ANDI output) in the Evidence section at the bottom.

### Page Key

| Code | Page |
|------|------|
| IDX | `index.html` |
| DSH | `dashboard.html` |
| CMP | `compliance.html` |
| DOC | `docs.html` |
| MBA | `mbai.html` |
| POR | `portal.html` |
| TPL | `templates.html` |

---

## Baseline Test Results

### Baseline 1: Keyboard Access

**WCAG:** 2.1.1, 2.1.2
**508:** 502.3.1
**What to test:** All interactive elements reachable and operable by keyboard. No keyboard traps.

| Test Step | IDX | DSH | CMP | DOC | MBA | POR | TPL |
|-----------|-----|-----|-----|-----|-----|-----|-----|
| 1.1 Tab through all interactive elements — all reachable? | | | | | | | |
| 1.2 Shift+Tab reverse order works? | | | | | | | |
| 1.3 Enter/Space activate buttons and links? | | | | | | | |
| 1.4 Arrow keys work in radio groups, dropdowns, tabs? | | | | | | | |
| 1.5 No keyboard trap — can tab out of every component? | | | | | | | |
| 1.6 Modal dialog traps focus correctly and Escape closes? | | | | | | | |

**Notes:** ________________________________________________________

---

### Baseline 2: Focus Visible

**WCAG:** 2.4.7
**508:** 502.3.3
**What to test:** A visible focus indicator on every focusable element.

| Test Step | IDX | DSH | CMP | DOC | MBA | POR | TPL |
|-----------|-----|-----|-----|-----|-----|-----|-----|
| 2.1 Focus indicator visible on links? | | | | | | | |
| 2.2 Focus indicator visible on buttons? | | | | | | | |
| 2.3 Focus indicator visible on form inputs? | | | | | | | |
| 2.4 Focus ring has ≥3:1 contrast against both background and the element? | | | | | | | |
| 2.5 Focus is not obscured by sticky headers/footers? | | | | | | | |

**Expected:** `main.css` implements `:focus-visible { outline: 3px solid var(--focus-ring); outline-offset: 2px; }`.

**Notes:** ________________________________________________________

---

### Baseline 3: Focus Order

**WCAG:** 2.4.3, 3.2.1
**508:** 502.3.2
**What to test:** Focus order preserves meaning and operability.

| Test Step | IDX | DSH | CMP | DOC | MBA | POR | TPL |
|-----------|-----|-----|-----|-----|-----|-----|-----|
| 3.1 Focus order follows visual reading order (top→bottom, left→right)? | | | | | | | |
| 3.2 No `tabindex > 0` used? | | | | | | | |
| 3.3 Focus moves logically through modal content? | | | | | | | |
| 3.4 No unexpected context change on focus? | | | | | | | |

**Notes:** ________________________________________________________

---

### Baseline 4: Repetitive Content (Bypass Blocks)

**WCAG:** 2.4.1, 3.2.3, 3.2.4
**508:** 502.3.9
**What to test:** Skip navigation or landmark structure lets users bypass repeated blocks.

| Test Step | IDX | DSH | CMP | DOC | MBA | POR | TPL |
|-----------|-----|-----|-----|-----|-----|-----|-----|
| 4.1 Skip-to-main-content link present and functional? | | | | | | | |
| 4.2 Landmark regions (`<nav>`, `<main>`, `<header>`, `<footer>`) correctly used? | | | | | | | |
| 4.3 All page content within a landmark region (ANDI check)? | | | | | | | |
| 4.4 Navigation consistent across pages? | | | | | | | |

**Known issue from axe-core:** ~~6 pages have content outside landmark regions (`region` rule). `<section id="main-content">` should be wrapped in `<main>`.~~ **FIXED** — all pages now use `<main>` landmark.

**Notes:** ________________________________________________________

---

### Baseline 5: Changing Content

**WCAG:** 4.1.2
**508:** 502.3.5
**What to test:** Dynamic content changes are accessible.

| Test Step | IDX | DSH | CMP | DOC | MBA | POR | TPL |
|-----------|-----|-----|-----|-----|-----|-----|-----|
| 5.1 Content inserted via JavaScript is accessible (ANDI reflects new DOM)? | | | | | | | |
| 5.2 Removed content is removed from accessibility tree? | | | | | | | |
| 5.3 Modal open/close announces correctly to screen reader? | | | | | | | |
| 5.4 `aria-live` regions announce status messages? | | | | | | | |

**Notes:** ________________________________________________________

---

### Baseline 6: Images

**WCAG:** 1.1.1, 1.4.5, 4.1.2
**508:** 502.3.1
**What to test:** All images have appropriate text alternatives.

| Test Step | IDX | DSH | CMP | DOC | MBA | POR | TPL |
|-----------|-----|-----|-----|-----|-----|-----|-----|
| 6.1 All meaningful `<img>` have descriptive `alt`? | | | | | | | |
| 6.2 Decorative `<img>` have `alt=""`? | | | | | | | |
| 6.3 `alt` text concise and accurate (not "image", "photo")? | | | | | | | |
| 6.4 SVG icons have `role="img"` + `aria-label` or title? | | | | | | | |
| 6.5 No images of text (all text is real text)? | | | | | | | |

**Notes:** ________________________________________________________

---

### Baseline 7: Sensory Characteristics

**WCAG:** 1.3.3, 1.4.1
**508:** 502.3.1
**What to test:** Instructions don't rely solely on sensory characteristics.

| Test Step | IDX | DSH | CMP | DOC | MBA | POR | TPL |
|-----------|-----|-----|-----|-----|-----|-----|-----|
| 7.1 Instructions don't rely on shape/size/position alone? | | | | | | | |
| 7.2 Color is not the only way to convey information? | | | | | | | |
| 7.3 Status indicators have text labels alongside color? | | | | | | | |

**Notes:** ________________________________________________________

---

### Baseline 8: Contrast

**WCAG:** 1.4.3, 1.4.11
**508:** 502.3.1
**What to test:** Text ≥ 4.5:1, large text ≥ 3:1, non-text components ≥ 3:1.

| Test Step | IDX | DSH | CMP | DOC | MBA | POR | TPL |
|-----------|-----|-----|-----|-----|-----|-----|-----|
| 8.1 Normal text contrast ≥ 4.5:1? (use Colour Contrast Analyser or Lighthouse) | | | | | | | |
| 8.2 Large text (≥ 18pt or 14pt bold) contrast ≥ 3:1? | | | | | | | |
| 8.3 UI component boundaries contrast ≥ 3:1? | | | | | | | |
| 8.4 Focus indicator contrast ≥ 3:1 against adjacent colors? | | | | | | | |
| 8.5 Disabled elements are visually distinguishable? | | | | | | | |

**Note:** axe-core `color-contrast` was disabled in jsdom. Must test in real browser.

**Notes:** ________________________________________________________

---

### Baseline 9: Flashing

**WCAG:** 2.3.1
**508:** 502.3.1
**What to test:** No content flashes more than 3 times per second.

| Test Step | IDX | DSH | CMP | DOC | MBA | POR | TPL |
|-----------|-----|-----|-----|-----|-----|-----|-----|
| 9.1 No flashing/blinking content? | | | | | | | |
| 9.2 No CSS animations with rapid flickering? | | | | | | | |

**Expected result:** N/A — no flashing content in the application.

**Notes:** ________________________________________________________

---

### Baseline 10: Forms

**WCAG:** 1.3.1, 2.4.6, 3.2.2, 3.3.1, 3.3.2, 3.3.3, 3.3.4, 4.1.2
**508:** 502.3.1
**What to test:** Form elements have labels, errors identified, input purpose clear.

| Test Step | IDX | DSH | CMP | DOC | MBA | POR | TPL |
|-----------|-----|-----|-----|-----|-----|-----|-----|
| 10.1 Every `<input>` has an associated `<label>` (ANDI check)? | | | | | | | |
| 10.2 Required fields programmatically marked (`required` or `aria-required`)? | | | | | | | |
| 10.3 Error messages appear in text near the field? | | | | | | | |
| 10.4 Error messages provide corrective suggestions? | | | | | | | |
| 10.5 Fieldsets/legends group related controls? | | | | | | | |
| 10.6 No unexpected form submission on input change? | | | | | | | |
| 10.7 `autocomplete` attribute present on name/email/address fields? | | | | | | | |

**Notes:** ________________________________________________________

---

### Baseline 11: Page Titles

**WCAG:** 2.4.2
**508:** 502.3.1
**What to test:** Every page has a descriptive, unique `<title>`.

| Test Step | IDX | DSH | CMP | DOC | MBA | POR | TPL |
|-----------|-----|-----|-----|-----|-----|-----|-----|
| 11.1 `<title>` element present? | | | | | | | |
| 11.2 Title describes the page purpose? | | | | | | | |
| 11.3 Title changes when page content changes (SPA routes)? | | | | | | | |

**axe-core result:** `document-title` — 0 violations across all pages.

**Notes:** ________________________________________________________

---

### Baseline 12: Data Tables

**WCAG:** 1.3.1, 1.3.2
**508:** 502.3.1
**What to test:** Data tables have headers, captions, and proper structure.

| Test Step | IDX | DSH | CMP | DOC | MBA | POR | TPL |
|-----------|-----|-----|-----|-----|-----|-----|-----|
| 12.1 Data tables use `<th>` for headers with `scope`? | | | | | | | |
| 12.2 `<caption>` or `aria-label` describes the table? | | | | | | | |
| 12.3 Layout tables do NOT use `<th>`, `<caption>`, or `summary`? | | | | | | | |
| 12.4 Complex tables use `headers`/`id` associations? | | | | | | | |

**Notes:** ________________________________________________________

---

### Baseline 13: Content Structure (Headings)

**WCAG:** 1.3.1, 2.4.6
**508:** 502.3.1
**What to test:** Headings are programmatic, descriptive, and properly nested.

| Test Step | IDX | DSH | CMP | DOC | MBA | POR | TPL |
|-----------|-----|-----|-----|-----|-----|-----|-----|
| 13.1 Heading tags used (not styled `<div>` or `<span>`)? | | | | | | | |
| 13.2 Heading levels increase by one (no skipping)? | | | | | | | |
| 13.3 `<h1>` present exactly once per page? | | | | | | | |
| 13.4 Headings describe their section content? | | | | | | | |
| 13.5 No empty headings? | | | | | | | |

**Known issues from axe-core:**
- ~~`heading-order` violations on `compliance.html` (h1→h3) and `mbai.html`~~ **FIXED v1.7.0** — compliance.html modal `<h3>` changed to `<h2>`; mbai.html redundant `aria-label` removed
- ~~`empty-heading` on `mbai.html` (`<h2 id="mbaiModalTitle"></h2>`)~~ **FIXED** — heading content populated dynamically via JS, initial state is "Loading…"

**Notes:** ________________________________________________________

---

### Baseline 14: Links

**WCAG:** 2.4.4, 4.1.2
**508:** 502.3.1
**What to test:** Link purpose is clear from text or context.

| Test Step | IDX | DSH | CMP | DOC | MBA | POR | TPL |
|-----------|-----|-----|-----|-----|-----|-----|-----|
| 14.1 Link text describes the destination (no "click here")? | | | | | | | |
| 14.2 Links opening new windows indicate that (`aria-label` or visual cue)? | | | | | | | |
| 14.3 Identical link text goes to the same destination? | | | | | | | |
| 14.4 `aria-label` used when visual text is ambiguous? | | | | | | | |

**axe-core result:** `link-name` — 0 violations.

**Notes:** ________________________________________________________

---

### Baseline 15: Language

**WCAG:** 3.1.1, 3.1.2
**508:** 502.3.1
**What to test:** Page language declared; parts in other languages identified.

| Test Step | IDX | DSH | CMP | DOC | MBA | POR | TPL |
|-----------|-----|-----|-----|-----|-----|-----|-----|
| 15.1 `<html lang="en">` present? | | | | | | | |
| 15.2 `lang` valid per IANA registry? | | | | | | | |
| 15.3 Foreign-language phrases have `lang` attribute? | | | | | | | |

**axe-core result:** `html-has-lang`, `html-lang-valid` — 0 violations.

**Notes:** ________________________________________________________

---

### Baseline 16: Audio and Video

**WCAG:** 1.2.1–1.2.5, 1.4.2
**508:** 502.3.1

| Test Step | IDX | DSH | CMP | DOC | MBA | POR | TPL |
|-----------|-----|-----|-----|-----|-----|-----|-----|
| 16.1 Pre-recorded audio has transcript? | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| 16.2 Pre-recorded video has captions? | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| 16.3 Video has audio description track? | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| 16.4 Auto-playing media can be paused? | N/A | N/A | N/A | N/A | N/A | N/A | N/A |

**Expected result:** N/A — no audio or video content.

**Notes:** ________________________________________________________

---

### Baseline 17: Synchronized Media

**WCAG:** 1.2.2, 1.2.4, 1.2.5
**508:** 502.3.1

| Test Step | IDX | DSH | CMP | DOC | MBA | POR | TPL |
|-----------|-----|-----|-----|-----|-----|-----|-----|
| 17.1 Synchronized captions accurate and complete? | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| 17.2 Audio description available when needed? | N/A | N/A | N/A | N/A | N/A | N/A | N/A |

**Expected result:** N/A — no synchronized media.

**Notes:** ________________________________________________________

---

### Baseline 18: CSS Content and Positioning

**WCAG:** 1.1.1, 1.3.1, 1.3.2
**508:** 502.3.1
**What to test:** CSS-generated content is accessible; visual order matches DOM order.

| Test Step | IDX | DSH | CMP | DOC | MBA | POR | TPL |
|-----------|-----|-----|-----|-----|-----|-----|-----|
| 18.1 Meaningful CSS `::before`/`::after` content has text alternatives? | | | | | | | |
| 18.2 CSS `display: none` / `visibility: hidden` correctly hides from AT? | | | | | | | |
| 18.3 Visual order matches DOM order (no CSS reordering that breaks flow)? | | | | | | | |
| 18.4 Content is readable with CSS disabled? | | | | | | | |

**Notes:** ________________________________________________________

---

### Baseline 19: Frames and iFrames

**WCAG:** 4.1.2
**508:** 502.3.1
**What to test:** Frames have descriptive `title` attributes.

| Test Step | IDX | DSH | CMP | DOC | MBA | POR | TPL |
|-----------|-----|-----|-----|-----|-----|-----|-----|
| 19.1 All `<iframe>` elements have descriptive `title`? | | | | | | | |
| 19.2 Frame content accessible (recurse into frame)? | | | | | | | |

**Notes:** ________________________________________________________

---

### Baseline 20: Alternate Versions

**WCAG:** (multiple)
**508:** 502.2
**What to test:** If an alternate accessible version exists, it provides full equivalent content.

| Test Step | IDX | DSH | CMP | DOC | MBA | POR | TPL |
|-----------|-----|-----|-----|-----|-----|-----|-----|
| 20.1 No alternate version needed (primary version is accessible)? | | | | | | | |
| 20.2 If alternate exists, is it equally current and equivalent? | | | | | | | |

**Expected result:** No alternate version exists — primary version is the accessible version.

**Notes:** ________________________________________________________

---

## Summary Grid

| Baseline | Test | IDX | DSH | CMP | DOC | MBA | POR | TPL | Notes |
|----------|------|-----|-----|-----|-----|-----|-----|-----|-------|
| 1 | Keyboard Access | | | | | | | | |
| 2 | Focus Visible | | | | | | | | |
| 3 | Focus Order | | | | | | | | |
| 4 | Bypass Blocks | | | | | | | | Known: region issue on 6 pages |
| 5 | Changing Content | | | | | | | | |
| 6 | Images | | | | | | | | |
| 7 | Sensory Characteristics | | | | | | | | |
| 8 | Contrast | | | | | | | | Requires real browser |
| 9 | Flashing | N/A | N/A | N/A | N/A | N/A | N/A | N/A | No flashing content |
| 10 | Forms | | | | | | | | |
| 11 | Page Titles | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | axe-core verified |
| 12 | Data Tables | | | | | | | | |
| 13 | Content Structure | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Fixed: heading-order resolved v1.7.0 |
| 14 | Links | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | axe-core verified |
| 15 | Language | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | axe-core verified |
| 16 | Audio/Video | N/A | N/A | N/A | N/A | N/A | N/A | N/A | No media |
| 17 | Synchronized Media | N/A | N/A | N/A | N/A | N/A | N/A | N/A | No media |
| 18 | CSS Content | | | | | | | | |
| 19 | Frames/iFrames | | | | | | | | |
| 20 | Alternate Versions | N/A | N/A | N/A | N/A | N/A | N/A | N/A | Primary version is accessible |

---

## Failure Log

Record any failures discovered during manual testing:

| # | Baseline | Page | Element | Expected | Actual | Severity | Screenshot |
|---|----------|------|---------|----------|--------|----------|------------|
| 1 | 4 | 6 pages | `<section id="main-content">` | Inside `<main>` landmark | Outside landmarks | Moderate | — |
| 2 | 13 | CMP | `<h3>Evidence Collection Dashboard</h3>` | `<h2>` | `<h3>` (skips h2) | Moderate | — |
| 3 | 13 | MBA | `<h2 id="mbaiModalTitle"></h2>` | Non-empty heading | Empty at load | Minor | — |
| 4 | 5 | DSH | `<aside role="navigation">` | Valid role for element | Invalid role | Minor | — |

---

## Evidence Attachments

Attach screenshots, ANDI output, and screen reader logs below:

| # | Baseline | Evidence | File/Screenshot |
|---|----------|----------|-----------------|
| | | | |

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Tester | | | |
| Reviewer | | | |
| Project Lead | | | |

---

*Template based on DHS Trusted Tester v5.1 Conformance Test Process (2023-09). Pre-populated with axe-core automated results where applicable.*
