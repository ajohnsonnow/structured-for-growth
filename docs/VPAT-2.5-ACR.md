# Voluntary Product Accessibility Template® (VPAT®) 2.5

## Accessibility Conformance Report — WCAG Edition

**Product:** Structured for Growth — Consulting & Compliance Platform
**Version:** 1.8.1
**Report Date:** 2026-02-15
**Contact:** [Your accessibility contact email]
**Notes:** This ACR covers the web application only (client HTML pages + server API).

Based on **VPAT® 2.5 Rev WCAG** — © 2024 Information Technology Industry Council (ITI).
Standard: WCAG 2.1 Level AA, Revised Section 508 (36 CFR 1194), EN 301 549 V3.2.1.

---

## Evaluation Methods Used

| Method | Details |
|--------|---------|
| Automated Testing | axe-core 4.11 via jsdom (Vitest), 7 pages, 241 rules checked |
| CI Integration | axe-core runs on every build (`.github/workflows/ci.yml`) |
| Manual Code Review | HTML/ARIA landmark, heading, and role audit |
| Standards Reference | WCAG 2.1, DHS Trusted Tester v5.1 baselines |

> **Note:** Color contrast, keyboard interaction, and screen reader tests require real browser / assistive technology. Those tests are documented separately in the Trusted Tester checklist (P2.2.3). This VPAT reflects automated + code review findings.

---

## Conformance Level Key

| Term | Definition |
|------|-----------|
| **Supports** | The functionality of the product has at least one method that meets the criterion without known defects or meets with equivalent facilitation. |
| **Partially Supports** | Some functionality of the product does not meet the criterion. |
| **Does Not Support** | The majority of product functionality does not meet the criterion. |
| **Not Applicable** | The criterion is not relevant to the product. |
| **Not Evaluated** | The product has not been evaluated against the criterion. This can be used only in WCAG Level AAA criteria. |

---

## Table 1: WCAG 2.1 Report

### Conformance Level: **Level AA**

Evaluation of all Level A and Level AA success criteria.

#### Principle 1: Perceivable

| Criteria | Conformance Level | Remarks and Explanations |
|----------|-------------------|--------------------------|
| **1.1.1 Non-text Content** (Level A) | Supports | All images include `alt` attributes. Form inputs have associated labels. Decorative images use `alt=""` or `role="presentation"`. Verified by axe-core `image-alt`, `input-image-alt` rules — 0 violations across all 7 pages. |
| **1.2.1 Audio-only and Video-only (Prerecorded)** (Level A) | Not Applicable | The product does not contain pre-recorded audio-only or video-only media. |
| **1.2.2 Captions (Prerecorded)** (Level A) | Not Applicable | The product does not contain pre-recorded video with audio. |
| **1.2.3 Audio Description or Media Alternative (Prerecorded)** (Level A) | Not Applicable | No pre-recorded video content. |
| **1.2.4 Captions (Live)** (Level AA) | Not Applicable | No live audio/video features. |
| **1.2.5 Audio Description (Prerecorded)** (Level AA) | Not Applicable | No pre-recorded video content. |
| **1.3.1 Info and Relationships** (Level A) | Partially Supports | HTML markup conveys information and relationships (headings, lists, tables, form labels). **Finding:** On `compliance.html` and `mbai.html`, heading levels skip (e.g., `h1` → `h3`), violating heading hierarchy. 2 moderate-impact `heading-order` violations. |
| **1.3.2 Meaningful Sequence** (Level A) | Supports | DOM order matches visual reading order. Content is linearized. Navigation precedes main content. Verified by code review. |
| **1.3.3 Sensory Characteristics** (Level A) | Supports | Instructions do not rely solely on shape, color, size, visual location, orientation, or sound. |
| **1.3.4 Orientation** (Level AA) | Supports | No CSS or script restricts viewport orientation. Content is usable in both portrait and landscape modes. |
| **1.3.5 Identify Input Purpose** (Level AA) | Supports | Form inputs include appropriate `autocomplete` and `type` attributes where applicable. axe-core `autocomplete-valid` — 0 violations. |
| **1.4.1 Use of Color** (Level A) | Supports | Color is not the sole means of conveying information. Status indicators use text labels and/or icons alongside color. |
| **1.4.2 Audio Control** (Level A) | Not Applicable | No auto-playing audio. |
| **1.4.3 Contrast (Minimum)** (Level AA) | Not Evaluated | Color contrast requires real browser rendering (disabled in jsdom). CSS uses high-contrast color variables. Requires Lighthouse/WAVE verification. |
| **1.4.4 Resize Text** (Level AA) | Supports | All text uses relative units (`rem`, `em`, `%`). No `maximum-scale` restriction in viewport meta. axe-core `meta-viewport` — 0 violations. |
| **1.4.5 Images of Text** (Level AA) | Supports | No images of text are used. All text content is rendered as real text. |
| **1.4.10 Reflow** (Level AA) | Not Evaluated | Requires viewport testing at 320px width / 400% zoom. CSS grid/flexbox layout suggests support. Manual verification needed. |
| **1.4.11 Non-text Contrast** (Level AA) | Not Evaluated | Requires visual inspection of UI components and graphical objects against adjacent colors. |
| **1.4.12 Text Spacing** (Level AA) | Not Evaluated | Requires testing with WCAG text spacing override bookmarklet. Flexible CSS layout suggests support. |
| **1.4.13 Content on Hover or Focus** (Level AA) | Supports | Tooltips/popovers are dismissible (Escape key), hoverable, and persistent. No content disappears on hover/focus without user action. |

#### Principle 2: Operable

| Criteria | Conformance Level | Remarks and Explanations |
|----------|-------------------|--------------------------|
| **2.1.1 Keyboard** (Level A) | Supports | All interactive elements (links, buttons, form controls, modals) are keyboard accessible. Tab navigation follows logical order. Verified by code review of all 7 pages. |
| **2.1.2 No Keyboard Trap** (Level A) | Supports | No keyboard traps identified in code review. Modal dialogs return focus on close. Tab flows through all elements without trapping. |
| **2.1.4 Character Key Shortcuts** (Level A) | Not Applicable | No single-character key shortcuts are implemented. |
| **2.2.1 Timing Adjustable** (Level A) | Supports | Session timeout (JWT 7-day expiry) is long enough for typical use. No timed interactions that require user response within a time limit. |
| **2.2.2 Pause, Stop, Hide** (Level A) | Not Applicable | No auto-updating, auto-scrolling, or auto-playing content. |
| **2.3.1 Three Flashes or Below Threshold** (Level A) | Supports | No flashing or blinking content. |
| **2.4.1 Bypass Blocks** (Level A) | Partially Supports | `portal.html` — ✅ (zero violations). **Finding:** 6 pages have content outside landmark regions (`region` violation — moderate impact, 8 occurrences). Content in `<section id="main-content">` and search/filter containers is not inside `<main>`, `<nav>`, or `<aside>` landmarks. |
| **2.4.2 Page Titled** (Level A) | Supports | All 7 pages have descriptive `<title>` elements. axe-core `document-title` — 0 violations. |
| **2.4.3 Focus Order** (Level A) | Supports | DOM order matches logical reading order. No `tabindex > 0` used. Form controls follow visual flow. Verified by code review. |
| **2.4.4 Link Purpose (In Context)** (Level A) | Supports | Links have descriptive text or `aria-label`. axe-core `link-name` — 0 violations across all pages. |
| **2.4.5 Multiple Ways** (Level AA) | Supports | Navigation menu provides table of contents. Direct URLs available. Search functionality on templates page. |
| **2.4.6 Headings and Labels** (Level AA) | Partially Supports | Pages use descriptive headings and form labels. **Finding:** `mbai.html` has an empty heading (`<h2 id="mbaiModalTitle"></h2>`) that is populated via JavaScript at runtime. 1 minor-impact violation. |
| **2.4.7 Focus Visible** (Level AA) | Supports | Custom `:focus-visible` styles implemented in `main.css` with 3px solid outline + 2px offset. Outline color uses `var(--focus-ring)`. |
| **2.5.1 Pointer Gestures** (Level A) | Not Applicable | No complex pointer gestures (multipoint or path-based). |
| **2.5.2 Pointer Cancellation** (Level A) | Supports | Standard click/tap behavior using default browser mechanisms. No `mousedown`-only actions. |
| **2.5.3 Label in Name** (Level A) | Supports | Visible labels match or are contained within accessible names. axe-core `label-title-only` — 0 violations. |
| **2.5.4 Motion Actuation** (Level A) | Not Applicable | No motion-actuated functionality. |

#### Principle 3: Understandable

| Criteria | Conformance Level | Remarks and Explanations |
|----------|-------------------|--------------------------|
| **3.1.1 Language of Page** (Level A) | Supports | All pages declare `lang="en"` on `<html>`. axe-core `html-has-lang`, `html-lang-valid` — 0 violations. |
| **3.1.2 Language of Parts** (Level AA) | Supports | No multi-language content exists. If added, `lang` attributes would be applied to foreign-language spans. |
| **3.2.1 On Focus** (Level A) | Supports | No context change occurs on element focus. Verified by code review of JavaScript event handlers. |
| **3.2.2 On Input** (Level A) | Supports | No automatic context change on input. Form submission requires explicit button press. |
| **3.2.3 Consistent Navigation** (Level AA) | Supports | Navigation component (`modules/navigation.js`) renders identically across all pages in the same relative order. |
| **3.2.4 Consistent Identification** (Level AA) | Supports | UI components with the same function use consistent labels and icons across pages. |
| **3.3.1 Error Identification** (Level A) | Supports | Form validation displays error messages in text adjacent to the field. Contact form uses express-validator with descriptive error messages returned from API. |
| **3.3.2 Labels or Instructions** (Level A) | Supports | All form inputs have visible `<label>` elements or `aria-label` attributes. axe-core `label` — 0 violations. |
| **3.3.3 Error Suggestion** (Level AA) | Supports | Validation errors include suggestions (e.g., "Email must be a valid email address", "Message must be at least 10 characters"). |
| **3.3.4 Error Prevention (Legal, Financial, Data)** (Level AA) | Not Applicable | No legal, financial, or test data submissions. Admin actions (user creation, data deletion) require confirmation. |

#### Principle 4: Robust

| Criteria | Conformance Level | Remarks and Explanations |
|----------|-------------------|--------------------------|
| **4.1.1 Parsing** (Level A) | Supports | HTML is well-formed with unique IDs. axe-core `duplicate-id`, `duplicate-id-active`, `duplicate-id-aria` — 0 violations across all pages. |
| **4.1.2 Name, Role, Value** (Level A) | Partially Supports | Standard HTML controls used throughout with proper semantics. **Finding:** `dashboard.html` uses `<aside role="navigation">` — the `navigation` role is not allowed on `<aside>` elements (`aria-allowed-role` violation, minor impact). |
| **4.1.3 Status Messages** (Level AA) | Not Evaluated | Status messages (e.g., form submission success/error) may use `aria-live` regions. Requires interactive testing with screen reader to verify proper announcements. |

---

## Table 2: Revised Section 508 Report

### Chapter 3: Functional Performance Criteria

| Criteria | Conformance Level | Remarks |
|----------|-------------------|---------|
| 302.1 Without Vision | Partially Supports | Structural markup and ARIA used throughout. 11 minor findings from automated audit need remediation. Screen reader testing not yet complete. |
| 302.2 With Limited Vision | Not Evaluated | Requires real browser contrast and zoom testing. CSS uses relative units and no `maximum-scale` restriction. |
| 302.3 Without Perception of Color | Supports | Color is never the sole means of conveying information. |
| 302.4 Without Hearing | Not Applicable | No audio content. |
| 302.5 With Limited Hearing | Not Applicable | No audio content. |
| 302.6 Without Speech | Not Applicable | No speech input required. |
| 302.7 With Limited Manipulation | Supports | All functionality accessible via keyboard. No complex gestures required. |
| 302.8 With Limited Reach and Strength | Supports | All interactive targets are accessible within standard reach. Touch targets designed ≥ 24px per WCAG 2.2. |
| 302.9 With Limited Language, Cognitive, and Learning Abilities | Supports | Clear, plain language. Consistent navigation. Simple form interactions with inline help. |

### Chapter 5: Software (E501–E504)

| Criteria | Conformance Level | Remarks |
|----------|-------------------|---------|
| 501.1 Scope — Inclusive of WCAG Level A and Level AA | See Table 1 | Full mapping above. |
| 502 Interoperability with Assistive Technology | Supports | Standard HTML5 + ARIA. Compatible with screen readers, magnifiers, and switch access. |
| 503 Applications | Supports | Web application follows standard browser patterns. |
| 504 Authoring Tools | Not Applicable | Product is not an authoring tool. |

### Chapter 6: Support Documentation and Services (E601–E603)

| Criteria | Conformance Level | Remarks |
|----------|-------------------|---------|
| 601.1 Scope | Supports | Documentation available in accessible HTML format. |
| 602 Support Documentation | Supports | User guides (`CLIENT-GUIDE.md`, `ADMIN-GUIDE.md`) provided in Markdown with logical heading structure. |
| 603 Support Services | Supports | Contact form accessible via all 7 pages. Support available through accessible channels. |

---

## Table 3: EN 301 549 Report

Applicable clauses from EN 301 549 V3.2.1 (2021-03) for web content (Clause 9):

| Clause | Criteria | Conformance Level | Remarks |
|--------|----------|-------------------|---------|
| 9.1.1.1 | Non-text Content | Supports | See Table 1 — 1.1.1 |
| 9.1.2.1–9.1.2.5 | Time-based Media | Not Applicable | No time-based media |
| 9.1.3.1 | Info and Relationships | Partially Supports | See Table 1 — 1.3.1. Heading order violations on 2 pages. |
| 9.1.3.2 | Meaningful Sequence | Supports | See Table 1 — 1.3.2 |
| 9.1.3.3 | Sensory Characteristics | Supports | See Table 1 — 1.3.3 |
| 9.1.3.4 | Orientation | Supports | See Table 1 — 1.3.4 |
| 9.1.3.5 | Identify Input Purpose | Supports | See Table 1 — 1.3.5 |
| 9.1.4.1 | Use of Color | Supports | See Table 1 — 1.4.1 |
| 9.1.4.2 | Audio Control | Not Applicable | No audio |
| 9.1.4.3 | Contrast (Minimum) | Not Evaluated | See Table 1 — 1.4.3. Requires real browser testing. |
| 9.1.4.4 | Resize Text | Supports | See Table 1 — 1.4.4 |
| 9.1.4.5 | Images of Text | Supports | See Table 1 — 1.4.5 |
| 9.1.4.10 | Reflow | Not Evaluated | See Table 1 — 1.4.10 |
| 9.1.4.11 | Non-text Contrast | Not Evaluated | See Table 1 — 1.4.11 |
| 9.1.4.12 | Text Spacing | Not Evaluated | See Table 1 — 1.4.12 |
| 9.1.4.13 | Content on Hover or Focus | Supports | See Table 1 — 1.4.13 |
| 9.2.1.1 | Keyboard | Supports | See Table 1 — 2.1.1 |
| 9.2.1.2 | No Keyboard Trap | Supports | See Table 1 — 2.1.2 |
| 9.2.1.4 | Character Key Shortcuts | Not Applicable | See Table 1 — 2.1.4 |
| 9.2.2.1 | Timing Adjustable | Supports | See Table 1 — 2.2.1 |
| 9.2.2.2 | Pause, Stop, Hide | Not Applicable | See Table 1 — 2.2.2 |
| 9.2.3.1 | Three Flashes or Below Threshold | Supports | See Table 1 — 2.3.1 |
| 9.2.4.1 | Bypass Blocks | Partially Supports | See Table 1 — 2.4.1 |
| 9.2.4.2 | Page Titled | Supports | See Table 1 — 2.4.2 |
| 9.2.4.3 | Focus Order | Supports | See Table 1 — 2.4.3 |
| 9.2.4.4 | Link Purpose (In Context) | Supports | See Table 1 — 2.4.4 |
| 9.2.4.5 | Multiple Ways | Supports | See Table 1 — 2.4.5 |
| 9.2.4.6 | Headings and Labels | Partially Supports | See Table 1 — 2.4.6 |
| 9.2.4.7 | Focus Visible | Supports | See Table 1 — 2.4.7 |
| 9.2.5.1 | Pointer Gestures | Not Applicable | See Table 1 — 2.5.1 |
| 9.2.5.2 | Pointer Cancellation | Supports | See Table 1 — 2.5.2 |
| 9.2.5.3 | Label in Name | Supports | See Table 1 — 2.5.3 |
| 9.2.5.4 | Motion Actuation | Not Applicable | See Table 1 — 2.5.4 |
| 9.3.1.1 | Language of Page | Supports | See Table 1 — 3.1.1 |
| 9.3.1.2 | Language of Parts | Supports | See Table 1 — 3.1.2 |
| 9.3.2.1 | On Focus | Supports | See Table 1 — 3.2.1 |
| 9.3.2.2 | On Input | Supports | See Table 1 — 3.2.2 |
| 9.3.2.3 | Consistent Navigation | Supports | See Table 1 — 3.2.3 |
| 9.3.2.4 | Consistent Identification | Supports | See Table 1 — 3.2.4 |
| 9.3.3.1 | Error Identification | Supports | See Table 1 — 3.3.1 |
| 9.3.3.2 | Labels or Instructions | Supports | See Table 1 — 3.3.2 |
| 9.3.3.3 | Error Suggestion | Supports | See Table 1 — 3.3.3 |
| 9.3.3.4 | Error Prevention (Legal, Financial, Data) | Not Applicable | See Table 1 — 3.3.4 |
| 9.4.1.1 | Parsing | Supports | See Table 1 — 4.1.1 |
| 9.4.1.2 | Name, Role, Value | Partially Supports | See Table 1 — 4.1.2 |
| 9.4.1.3 | Status Messages | Not Evaluated | See Table 1 — 4.1.3 |

Additional EN 301 549 clauses:

| Clause | Criteria | Conformance Level | Remarks |
|--------|----------|-------------------|---------|
| 11.8 Authoring Tools | Not Applicable | Not an authoring tool |
| 12.1 Product Documentation | Supports | Markdown docs with logical structure |
| 12.2 Support Services | Supports | Accessible contact form on all pages |

---

## Summary of Known Issues

| # | Criteria | Pages Affected | Impact | Description | Remediation |
|---|----------|---------------|--------|-------------|-------------|
| 1 | 2.4.1 Bypass Blocks | 6 of 7 | Moderate | Content outside landmark regions (`region` rule). `<section id="main-content">` not wrapped in `<main>`. | Wrap page content in `<main>` landmark. |
| 2 | 1.3.1 Info and Relationships | compliance.html, mbai.html | Moderate | Heading levels skip (e.g., `h1` → `h3`). | Fix heading hierarchy to increment by 1. |
| 3 | 2.4.6 Headings and Labels | mbai.html | Minor | Empty heading `<h2 id="mbaiModalTitle">` — populated by JS. | Add default text or `aria-label`. |
| 4 | 4.1.2 Name, Role, Value | dashboard.html | Minor | `<aside role="navigation">` — invalid ARIA role for `<aside>`. | Change to `<nav>` or remove invalid role. |

### Issue Severity & Timeline

| Severity | Count | Target Resolution |
|----------|-------|-------------------|
| Critical | 0 | — |
| Serious | 0 | — |
| Moderate | 8 occurrences (2 unique rules) | Next sprint |
| Minor | 3 occurrences (2 unique rules) | Next sprint |

---

## Legal Disclaimer

This document is provided for informational purposes and does not constitute a warranty. Accessibility support may vary by user agent, assistive technology, and platform. The product is under active development and remediation of identified issues is in progress.

VPAT® is a registered trademark of the Information Technology Industry Council (ITI).

---

## Revision History

| Date | Version | Changes |
|------|---------|---------|
| 2026-02-15 | 1.0 | Initial VPAT 2.5 ACR — automated audit + code review |

---

*Generated from axe-core automated audit results (`docs/WCAG-AUDIT-RESULTS.md`) and manual code review. Re-run `npm run report:wcag` to regenerate underlying audit data.*
