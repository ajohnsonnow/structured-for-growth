# Comprehensive Development Plan: Structured for Growth

> **Prepared:** February 14, 2026
> **Updated:** February 15, 2026 — v2.1 Web Presence Redesign Edition
> **Version:** 2.1
> **Scope:** Complete gap analysis and development roadmap covering agentic software development, government/military standards, technical writing, accessibility, security, full-stack engineering,
> PWA, mobile (iOS/Android), desktop apps, IDE tooling, coding language standards, glossary/tooltip dictionary, header/navigation redesign, web presence redesign, and industry best practices
> **Status:** FOR REVIEW — Pending approval before development begins

---

## Executive Summary

This plan synthesizes deep research across **twelve domains** and a **full codebase audit** of the
structured-for-growth platform (v1.8.1). It identifies **192 specific development items** organized
into **19 work streams** across **6 priority phases**.

### Current State Strengths

- **Compliance framework coverage is strong** — 12 frameworks, OSCAL catalogs, cross-mapping, 33 templates
- **Documentation quality is high** — 5 substantial docs totaling 8,000+ lines covering USACE, NIST, WCAG, CUI, agentic AI
- **Template library is extensive** — 3,190 lines across 9+ categories
- **Authentication and basic security exist** — JWT, bcrypt, Helmet, rate limiting, express-validator
- **Pre-deploy audit tooling exists** — audit.js with history tracking

### Critical Gaps — Status as of v1.8.1

> **Note:** Many gaps identified in the original audit (v1.4.8) have been resolved. Items marked ✅ are complete.

1. ✅ ~~ZERO test coverage~~ — **511 tests** across **48 files** (Vitest), 80% coverage thresholds, ESLint, Prettier, Husky, lint-staged, GitHub Actions CI/CD
2. ✅ ~~No CUI marking implementation~~ — CUI banner/portion marking system implemented (v1.5.0)
3. ✅ ~~CSP disabled~~ — Content Security Policy enabled with strict directives (v1.5.0)
4. ✅ ~~No SBOM generation~~ — CycloneDX SBOM via `npm run sbom` (v1.5.0)
5. ✅ ~~dashboard.html and portal.html fail Section 508~~ — ARIA landmarks, skip-nav, focus management added (v1.5.0, v1.7.0)
6. ✅ ~~No structured logging or monitoring~~ — Winston structured logging, error monitoring, request IDs (v1.6.0)
7. ✅ ~~No VPAT/ACR~~ — VPAT 2.5 Accessibility Conformance Report created (v1.8.0)

---

## Table of Contents

1. [Phase 1: Foundation (Weeks 1–4) — CRITICAL](#phase-1-foundation-weeks-14--critical)
2. [Phase 2: Government Readiness (Weeks 5–10)](#phase-2-government-readiness-weeks-510)
3. [Phase 3: Enterprise Maturity (Weeks 11–18)](#phase-3-enterprise-maturity-weeks-1118)
4. [Phase 4: Advanced Capabilities (Weeks 19–26)](#phase-4-advanced-capabilities-weeks-1926)
5. [Phase 5: Platform Expansion (Weeks 27–36)](#phase-5-platform-expansion-weeks-2736)
6. [Phase 6: Web Presence Redesign (Weeks 37–42)](#phase-6-web-presence-redesign-weeks-3742)
7. [Work Stream Details](#work-stream-details)

   - [WS-1: Testing & CI/CD Infrastructure](#ws-1-testing--cicd-infrastructure)
   - [WS-2: Section 508 & Accessibility](#ws-2-section-508--accessibility)
   - [WS-3: Security Hardening](#ws-3-security-hardening)
   - [WS-4: CUI Marking & Classification](#ws-4-cui-marking--classification)
   - [WS-5: Technical Documentation](#ws-5-technical-documentation)
   - [WS-6: Compliance Engine Enhancement](#ws-6-compliance-engine-enhancement)
   - [WS-7: Observability & Audit](#ws-7-observability--audit)
   - [WS-8: Supply Chain Security](#ws-8-supply-chain-security)
   - [WS-9: Agentic AI Capabilities](#ws-9-agentic-ai-capabilities)
   - [WS-10: USACE/DoD Integration Features](#ws-10-usacedod-integration-features)
   - [WS-11: Full-Stack Architecture & Code Quality](#ws-11-full-stack-architecture--code-quality)
   - [WS-12: Progressive Web App (PWA)](#ws-12-progressive-web-app-pwa)
   - [WS-13: Mobile Application Development](#ws-13-mobile-application-development)
   - [WS-14: Desktop Application Development](#ws-14-desktop-application-development)
   - [WS-15: IDE & Developer Tooling](#ws-15-ide--developer-tooling)
   - [WS-16: Coding Language Standards & Best Practices](#ws-16-coding-language-standards--best-practices)
   - [WS-17: Glossary & Tooltip Dictionary System](#ws-17-glossary--tooltip-dictionary-system)
   - [WS-18: Header & Navigation Redesign](#ws-18-header--navigation-redesign)
   - [WS-19: Web Presence Redesign](#ws-19-web-presence-redesign)
8. [Standards Reference Matrix](#standards-reference-matrix)
9. [Risk Register](#risk-register)
10. [Success Metrics](#success-metrics)
11. [Appendix A: Effort Summary](#appendix-a-effort-summary)
12. [Appendix B: Research Sources](#appendix-b-research-sources)

---

## Phase 1: Foundation (Weeks 1–4) — CRITICAL

> **Goal:** Establish the engineering foundation required before ANY feature work.
> Without Phase 1, nothing else can be built with confidence.

## P1.1 — Testing Infrastructure [WS-1]

| ID | Item | Priority | Effort | Standard |
| ---- | ------ | ---------- | -------- | ---------- |
| 1.1.1 | Install and configure Vitest (already have vite.config.js) | P0 | 2h | NIST SSDF PW.8 |
| 1.1.2 | Add eslint + prettier with configs | P0 | 2h | OWASP Secure Coding |
| 1.1.3 | Write unit tests for all server routes (auth, clients, compliance, contact, campaigns, projects, messages, portal, backup, demo, mbai) | P0 | 16h | MIL-STD-498 STD/STR |
| 1.1.4 | Write unit tests for client-side modules (navigation, contactForm, smoothScroll) | P0 | 4h | NIST SSDF PW.8 |
| 1.1.5 | Add integration tests for critical workflows (auth flow, client CRUD, compliance lookup) | P0 | 8h | OWASP ASVS L2 |
| 1.1.6 | Configure GitHub Actions CI pipeline (lint → test → build → audit) | P0 | 4h | NIST SSDF PO.3 |
| 1.1.7 | Add pre-commit hooks (husky + lint-staged) | P1 | 2h | NIST SSDF PS.1 |
| 1.1.8 | Code coverage reporting with threshold (≥80%) | P1 | 2h | CMMI VER |

## P1.2 — Critical Security Fixes [WS-3]

| ID | Item | Priority | Effort | Standard |
| ---- | ------ | ---------- | -------- | ---------- |
| 1.2.1 | Enable and configure Content Security Policy (CSP) | P0 | 4h | OWASP A05, NIST SC-18 |
| 1.2.2 | Remove hardcoded JWT fallback secret; fail fast if not set | P0 | 1h | OWASP A07, NIST IA-5 |
| 1.2.3 | Add CSRF protection (csurf or double-submit cookie) | P0 | 3h | OWASP A01 |
| 1.2.4 | Configure cookie security flags (httpOnly, secure, sameSite) | P0 | 1h | OWASP A07 |
| 1.2.5 | Add request body size limits (express.json limit) | P1 | 1h | OWASP API4 |
| 1.2.6 | Add graceful shutdown handling (SIGTERM/SIGINT) | P1 | 2h | Cloud-native best practice |

## P1.3 — Essential Accessibility Fixes [WS-2]

| ID | Item | Priority | Effort | Standard |
| ---- | ------ | ---------- | -------- | ---------- |
| 1.3.1 | Fix dashboard.html: add skip-nav, ARIA landmarks on nav/sidebar, replace emoji-only icons with sr-only labels | P0 | 4h | Section 508 E205, WCAG 2.4.1 |
| 1.3.2 | Fix portal.html: add skip-nav, ARIA landmarks, role="navigation" | P0 | 3h | Section 508 E205, WCAG 1.3.1 |
| 1.3.3 | Add aria-live regions for dynamic content updates on all pages | P0 | 4h | WCAG 4.1.3 |
| 1.3.4 | Fix modal focus management (trap focus, return focus on close) | P0 | 4h | WCAG 2.4.3, APG Dialog |
| 1.3.5 | Keyboard-test all interactive elements across all pages | P1 | 4h | WCAG 2.1.1, Trusted Tester #1 |
| 1.3.6 | Verify color contrast on all pages (4.5:1 normal, 3:1 large text) | P1 | 3h | WCAG 1.4.3 |

## P1.4 — Essential Documentation [WS-5]

| ID | Item | Priority | Effort | Standard |
| ---- | ------ | ---------- | -------- | ---------- |
| 1.4.1 | Create CHANGELOG.md following Keep a Changelog format | P0 | 2h | SemVer, Release Notes best practice |
| 1.4.2 | Create CONTRIBUTING.md with code style, PR process, review requirements | P1 | 3h | Open source best practice |
| 1.4.3 | ✅ Add ESLint + Prettier configuration — Migrated to ESLint flat config (`eslint.config.js`) for v10 | P0 | 1h | Code quality |

---

## Phase 2: Government Readiness (Weeks 5–10)

> **Goal:** Achieve the minimum requirements for federal procurement eligibility and USACE client readiness.

## P2.1 — CUI Marking System [WS-4]

| ID | Item | Priority | Effort | Standard |
| ---- | ------ | ---------- | -------- | ---------- |
| 2.1.1 | Build CUI banner marking component (configurable: CUI Basic, CUI Specified, category, dissemination controls) | P0 | 8h | 32 CFR 2002, NARA CUI Registry |
| 2.1.2 | Build CUI portion marking component (inline paragraph-level marking) | P0 | 6h | 32 CFR 2002.20 |
| 2.1.3 | Build CUI designation indicator block component (Controlled By, Category, Distribution, POC) | P0 | 4h | 32 CFR 2002 |
| 2.1.4 | Add CUI metadata fields to document/template data model (category, subcategory, dissemination control, designating agency) | P0 | 4h | CUI Registry |
| 2.1.5 | Build CUI header/footer marking for print/PDF output | P1 | 6h | DoD Manual 5200.01 |
| 2.1.6 | Create CUI marking configuration UI (select category, subcategory, dissemination controls from registry data) | P1 | 8h | NARA CUI Registry |
| 2.1.7 | Add Distribution Statement component (A through F, plus X) per DoD Directive 5230.24 | P1 | 4h | DoD Dir 5230.24 |

## P2.2 — VPAT & Accessibility Compliance [WS-2]

| ID | Item | Priority | Effort | Standard |
| ---- | ------ | ---------- | -------- | ---------- |
| 2.2.1 | Install and configure axe-core in CI pipeline (zero-violation build gate) | P0 | 3h | DHS Trusted Tester |
| 2.2.2 | Run full WCAG 2.1 AA automated audit (axe-core + Lighthouse) and document results | P0 | 4h | WCAG 2.1 AA |
| 2.2.3 | Conduct manual Trusted Tester baseline testing (20 baseline tests) | P0 | 16h | DHS Trusted Tester v5.1 |
| 2.2.4 | Create VPAT 2.5 Rev (Accessibility Conformance Report) | P0 | 12h | VPAT 2.5, FAR 39.2 |
| 2.2.5 | Fix all P0/P1 findings from accessibility audit | P0 | 20h | Section 508 |
| 2.2.6 | Add WCAG 2.2 proactive support (focus-not-obscured, target size ≥24px, accessible auth, redundant entry) | P1 | 12h | WCAG 2.2 AA |

## P2.3 — Supply Chain Security [WS-8]

| ID | Item | Priority | Effort | Standard |
| ---- | ------ | ---------- | -------- | ---------- |
| 2.3.1 | Add SBOM generation to build (CycloneDX format via @cyclonedx/bom) | P0 | 3h | EO 14028, OMB M-22-18 |
| 2.3.2 | Configure Dependabot or Renovate for automated dependency updates | P0 | 2h | NIST SP 800-53 RA-5, SI-2 |
| 2.3.3 | Add npm audit step to CI pipeline (fail on critical/high) | P0 | 1h | OWASP A06 |
| 2.3.4 | Generate SBOM artifact on every release and attach to GitHub release | P1 | 2h | NTIA SBOM minimum elements |
| 2.3.5 | Add license compliance check (license-checker or similar) | P1 | 2h | DFARS 252.227 |

## P2.4 — NIST SP 800-171 Documentation [WS-6]

| ID | Item | Priority | Effort | Standard |
| ---- | ------ | ---------- | -------- | ---------- |
| 2.4.1 | Create System Security Plan (SSP) template for the platform | P0 | 16h | NIST SP 800-171 3.12.4 |
| 2.4.2 | Create Plan of Action & Milestones (POA&M) template | P0 | 4h | NIST SP 800-171 3.12.2 |
| 2.4.3 | Self-assess against all 110 NIST SP 800-171 controls and document status | P1 | 24h | CMMC Level 2 |
| 2.4.4 | Calculate preliminary SPRS score | P1 | 4h | DFARS 252.204-7019 |

## P2.5 — API Documentation [WS-5]

| ID | Item | Priority | Effort | Standard |
| ---- | ------ | ---------- | -------- | ---------- |
| 2.5.1 | Document all API endpoints in OpenAPI 3.0 spec (routes: auth, clients, compliance, contact, campaigns, projects, messages, portal, backup, demo, mbai) | P0 | 12h | OpenAPI 3.0, IEEE 1063 |
| 2.5.2 | Serve Swagger UI at /api-docs endpoint | P1 | 3h | Developer documentation |
| 2.5.3 | Add request/response examples to every endpoint | P1 | 8h | API documentation |

---

## Phase 3: Enterprise Maturity (Weeks 11–18)

> **Goal:** Build robust operational capabilities and demonstrate enterprise-grade maturity.

## P3.1 — Observability & Structured Logging [WS-7]

| ID | Item | Priority | Effort | Standard |
| ---- | ------ | ---------- | -------- | ---------- |
| 3.1.1 | Replace console.log/error with structured logger (winston or pino) with JSON output | P0 | 6h | NIST AU-2, AU-3 |
| 3.1.2 | Add request ID middleware (correlation IDs for every HTTP request) | P0 | 3h | OWASP A09 |
| 3.1.3 | Add HTTP access logging middleware (method, URL, status, duration, IP, user) | P0 | 3h | NIST AU-3 |
| 3.1.4 | Implement security event logging (auth attempts, role changes, data access) | P0 | 6h | NIST AU-2, OMB M-21-31 |
| 3.1.5 | Add log rotation and retention policy (configurable, default 90 days) | P1 | 3h | GRS 3.2 |
| 3.1.6 | Build admin audit log viewer with search/filter in dashboard | P1 | 8h | DoD 5015.02-STD |
| 3.1.7 | Add error monitoring integration (Sentry or equivalent) | P2 | 4h | Operational excellence |

## P3.2 — Advanced Security [WS-3]

| ID | Item | Priority | Effort | Standard |
| ---- | ------ | ---------- | -------- | ---------- |
| 3.2.1 | Add SAST scanning to CI (CodeQL or Semgrep) | P0 | 4h | NIST SSDF PW.7, CMMC |
| 3.2.2 | Add DAST scanning for staging environment (OWASP ZAP) | P1 | 6h | FedRAMP ConMon |
| 3.2.3 | Implement session management best practices (expiry, refresh token rotation, revocation) | P0 | 8h | OWASP A07, ASVS L2 |
| 3.2.4 | Add custom error classes with error codes | P1 | 4h | API best practices |
| 3.2.5 | Implement MFA support (TOTP via speakeasy or similar) | P1 | 12h | NIST IA-2, OMB M-22-09 |
| 3.2.6 | Add security headers audit script (verify Helmet config) | P2 | 2h | OWASP A05 |

## P3.3 — Records Management Features [WS-10]

| ID | Item | Priority | Effort | Standard |
| ---- | ------ | ---------- | -------- | ---------- |
<!-- markdownlint-disable-next-line MD013 -->
| 3.3.1 | Add document metadata schema (Dublin Core + government extensions: CUI category, retention schedule, distribution statement, originator, classification) | P0 | 8h | 36 CFR 1236, Dublin Core, NARA |
| 3.3.2 | Build retention schedule engine (time-based and event-based disposition) | P1 | 12h | DoD 5015.02-STD, GRS |
| 3.3.3 | Add legal hold capability (suspend disposition for specific records) | P1 | 6h | DoD 5015.02-STD |
| 3.3.4 | Build dispostion action logging (destroy, transfer, archive events) | P1 | 4h | 36 CFR 1224, NARA |
| 3.3.5 | Add document version control with diff tracking | P2 | 12h | MIL-HDBK-61A CM |

## P3.4 — Compliance Engine Enhancement [WS-6]

| ID | Item | Priority | Effort | Standard |
| ---- | ------ | ---------- | -------- | ---------- |
| 3.4.1 | Build evidence tracking backend (persist evidence records with timestamps, attachments, assessor) | P0 | 12h | FedRAMP, CMMC L2 |
| 3.4.2 | Add automated compliance gap scoring (% complete per framework, per control family) | P1 | 8h | SPRS methodology |
| 3.4.3 | Add compliance assessment scheduling and reminders | P1 | 6h | FedRAMP ConMon |
| 3.4.4 | Add NIST SP 800-53 Rev 5 framework (full 800+ controls for FedRAMP path) | P1 | 8h | NIST SP 800-53 Rev 5 |
| 3.4.5 | Add NIST SP 800-171 Rev 3 framework (97 requirements) | P1 | 6h | NIST SP 800-171 Rev 3 |
| 3.4.6 | Export assessment results as POA&M (standard format) | P2 | 6h | NIST SP 800-171 |

## P3.5 — Technical Writing Tooling [WS-5]

| ID | Item | Priority | Effort | Standard |
| ---- | ------ | ---------- | -------- | ---------- |
| 3.5.1 | Configure vale (prose linter) with Microsoft, write-good, and government styles | P1 | 4h | Microsoft Style Guide, plain language |
| 3.5.2 | Add markdownlint configuration | P1 | 1h | Markdown best practices |
| 3.5.3 | Add readability scoring to documentation CI (Flesch-Kincaid target ≤ grade 8 for public content) | P2 | 4h | Plain Writing Act |
| 3.5.4 | Create project style sheet (terminology, abbreviations, voice/tone) | P2 | 6h | GPO Style Manual |
| 3.5.5 | Create Architecture Decision Records (ADR) template and first 5 ADRs | P2 | 8h | ADR best practice |

---

## Phase 4: Advanced Capabilities (Weeks 19–26)

> **Goal:** Differentiate with agentic AI features and deep USACE/DoD integration.

## P4.1 — Agentic AI Integration [WS-9]

| ID | Item | Priority | Effort | Standard |
| ---- | ------ | ---------- | -------- | ---------- |
| 4.1.1 | Design multi-agent architecture for compliance assistance (orchestrator + specialist agents) | P1 | 16h | NIST AI RMF |
| 4.1.2 | Build AI guardrails layer (input validation, output filtering, prompt injection defense) | P0 | 12h | OWASP LLM Top 10 |
| 4.1.3 | Implement AI-assisted document generation (templates → filled documents using LLM) | P1 | 20h | Responsible AI principles |
| 4.1.4 | Add AI-powered compliance gap analysis (analyze system description → map to controls) | P1 | 20h | NIST AI RMF |
| 4.1.5 | Build AI conversation audit trail (log all prompts, responses, tool calls, tokens) | P0 | 8h | NIST AU-2, AI observability |
| 4.1.6 | Implement human-in-the-loop approval for AI-generated content | P0 | 8h | ISO 42001, Responsible AI |
| 4.1.7 | Add AI cost tracking and token usage monitoring | P1 | 6h | FinOps |
| 4.1.8 | Create AI model evaluation framework (accuracy, safety, bias testing) | P2 | 16h | NIST AI RMF |

## P4.2 — USACE/DoD Integration [WS-10]

| ID | Item | Priority | Effort | Standard |
| ---- | ------ | ---------- | -------- | ---------- |
| 4.2.1 | Build USACE document template library (ER format, EP format, ETL format, ERDC TR format) | P1 | 16h | ER 25-1-100, EP 25-1-100 |
| 4.2.2 | Build Standard Form 298 (Report Documentation Page) generator | P1 | 8h | ANSI Z39.18 |
| 4.2.3 | Add Distribution Statement selector (A–F, X) with proper marking output | P1 | 4h | DoD Dir 5230.24 |
| 4.2.4 | Build DrChecks-compatible comment/response export format | P2 | 12h | ER 1110-1-8159 |
| 4.2.5 | Add MIL-STD-498 document type templates (SDP, SRS, SDD, STP, STR, SVD, SUM) | P1 | 16h | MIL-STD-498 DIDs |
| 4.2.6 | Build CDRL management tracker (DD Form 1423 fields, status tracking) | P2 | 12h | DFARS |
| 4.2.7 | Add NEPA document template support (EIS structure, EA structure, FONSI) | P2 | 12h | CEQ 40 CFR 1500–1508 |

## P4.3 — Advanced Accessibility [WS-2]

| ID | Item | Priority | Effort | Standard |
| ---- | ------ | ---------- | -------- | ---------- |
| 4.3.1 | Build accessibility dashboard (conformance metrics, trend tracking, remediation status) | P2 | 16h | Accessibility Program Management |
| 4.3.2 | Add PDF/UA-compliant document export | P1 | 12h | ISO 14289 (PDF/UA) |
| 4.3.3 | Implement cognitive accessibility patterns (auto-save, step wizards, error prevention) | P2 | 12h | COGA, WCAG 3.3.4 |
| 4.3.4 | Mobile accessibility audit and fixes (44px touch targets, reflow, orientation) | P1 | 8h | WCAG 2.5.5, 1.4.10 |

## P4.4 — Zero Trust & FedRAMP Path [WS-3]

| ID | Item | Priority | Effort | Standard |
| ---- | ------ | ---------- | -------- | ---------- |
| 4.4.1 | Design Zero Trust architecture model (identity-centric, per-request authorization) | P2 | 12h | NIST SP 800-207 |
| 4.4.2 | Add PIV/CAC authentication support (client certificate auth) | P2 | 16h | OMB M-22-09, HSPD-12 |
| 4.4.3 | Build FedRAMP SSP template generator (auto-populate from platform config) | P2 | 20h | FedRAMP SSP Template |
| 4.4.4 | Add continuous monitoring dashboard (vulnerability status, POA&M, scan results) | P2 | 16h | FedRAMP ConMon |

---

## Phase 5: Platform Expansion (Weeks 27–36)

> **Goal:** Extend the platform across delivery channels (PWA, mobile, desktop), establish world-class developer tooling, and codify coding standards for every language in the stack.

## P5.1 — Full-Stack Architecture Modernization [WS-11]

| ID | Item | Priority | Effort | Standard |
| ---- | ------ | ---------- | -------- | ---------- |
| 5.1.1 | Design and implement API versioning strategy (v1/ prefix, deprecation headers) | P0 | 8h | REST maturity, Twelve-Factor |
| 5.1.2 | Migrate all routes to OpenAPI 3.0 contract-first design with Swagger UI | P1 | 16h | OpenAPI 3.0, IEEE 1016 |
| 5.1.3 | Implement database migration framework (Knex or Prisma) replacing raw SQL | P0 | 12h | Twelve-Factor, ISO 25010 |
| 5.1.4 | Add centralized error handling middleware with RFC 7807 Problem Details | P1 | 6h | RFC 7807, OWASP |
| 5.1.5 | Add Zod/Joi input validation schemas for all request payloads | P1 | 10h | OWASP Input Validation |
| 5.1.6 | Implement health check endpoints (/healthz, /readyz, /livez) | P1 | 4h | Kubernetes probes, 12-Factor |
| 5.1.7 | Establish performance budgets (Lighthouse CI ≥90, bundle size limits) | P2 | 8h | Web Vitals, ISO 25010 |
| 5.1.8 | Implement database connection pooling and query optimization | P1 | 6h | ISO 25010 Performance |
| 5.1.9 | Evaluate and configure monorepo tooling (Nx or Turborepo) | P2 | 8h | IEEE 730 |
| 5.1.10 | Add environment-based configuration management (dotenv-vault or similar) | P0 | 4h | Twelve-Factor Config |

## P5.2 — Progressive Web App (PWA) [WS-12]

| ID | Item | Priority | Effort | Standard |
| ---- | ------ | ---------- | -------- | ---------- |
| 5.2.1 | Create Web App Manifest with icons (192/512/maskable), theme, display, shortcuts | P0 | 4h | W3C Web App Manifest |
| 5.2.2 | Implement Service Worker with Workbox (precaching, runtime caching strategies) | P0 | 12h | W3C Service Workers |
| 5.2.3 | Build offline fallback page with cached core content | P1 | 6h | Workbox, PWA checklist |
| 5.2.4 | Implement IndexedDB offline data store for checklists and templates | P1 | 10h | W3C IndexedDB |
| 5.2.5 | Add background sync for queued form submissions | P1 | 8h | W3C Background Sync |
| 5.2.6 | Set up push notification infrastructure (VAPID keys, subscription management) | P2 | 10h | W3C Push API |
| 5.2.7 | Implement app install prompt UX (beforeinstallprompt handling) | P1 | 4h | Chrome PWA criteria |
| 5.2.8 | Add update notification flow ("New version available — refresh") | P1 | 4h | Service Worker lifecycle |
| 5.2.9 | Build offline status indicator UI component | P1 | 3h | UX best practices |
| 5.2.10 | Add Lighthouse PWA audit to CI pipeline (score ≥90 gate) | P0 | 4h | Google Lighthouse |

## P5.3 — Mobile Application Development [WS-13]

| ID | Item | Priority | Effort | Standard |
| ---- | ------ | ---------- | -------- | ---------- |
| 5.3.1 | Select cross-platform framework (React Native vs Flutter) and create project scaffold | P0 | 8h | ISO 25010, OWASP MASVS |
| 5.3.2 | Implement mobile authentication (biometric login, secure token storage in keychain/keystore) | P0 | 12h | OWASP MASVS-AUTH |
| 5.3.3 | Build offline-first data sync engine with conflict resolution | P1 | 16h | OWASP MASVS-STORAGE |
| 5.3.4 | Create mobile UI component library (44pt+ touch targets, gesture navigation) | P1 | 12h | Apple HIG, Material Design 3 |
| 5.3.5 | Implement camera-based document capture with OCR integration | P2 | 12h | Mobile UX patterns |
| 5.3.6 | Set up mobile push notifications (APNs + FCM) | P1 | 8h | W3C Push, platform APIs |
| 5.3.7 | Perform mobile accessibility audit and remediation (Dynamic Type, VoiceOver, TalkBack) | P0 | 10h | WCAG 2.1 mobile, Section 508 |
| 5.3.8 | Prepare App Store / Play Store submission (metadata, screenshots, review reqs) | P1 | 8h | App Store Guidelines, Play Policies |
| 5.3.9 | Implement mobile security hardening (cert pinning, root detection, obfuscation) | P0 | 10h | OWASP MASVS-RESILIENCE |
| 5.3.10 | Set up mobile CI/CD pipeline (Fastlane or EAS Build) | P1 | 8h | CI/CD best practices |

## P5.4 — Desktop Application Development [WS-14]

| ID | Item | Priority | Effort | Standard |
| ---- | ------ | ---------- | -------- | ---------- |
| 5.4.1 | Select desktop framework (Tauri preferred, Electron fallback) and scaffold project | P0 | 8h | Tauri Security Model |
| 5.4.2 | Implement auto-update mechanism with differential updates and code signing verification | P0 | 10h | Windows WACK, macOS Gatekeeper |
| 5.4.3 | Build native file system integration (open/save dialogs, file watchers, drag-drop) | P1 | 8h | ISO 25010 Usability |
| 5.4.4 | Add system tray / menu bar integration with notification badges | P2 | 6h | Platform HIG |
| 5.4.5 | Implement native printing with CUI marking in print layout | P1 | 8h | 32 CFR 2002, CUI Printing |
| 5.4.6 | Build offline-first architecture with local SQLite database | P0 | 10h | Twelve-Factor, local-first |
| 5.4.7 | Create cross-platform installer pipeline (Windows MSIX, macOS DMG, Linux AppImage) | P1 | 12h | Platform packaging standards |
| 5.4.8 | Obtain code signing certificates (Windows Authenticode, Apple Developer ID) | P0 | 4h | Platform trust requirements |
| 5.4.9 | Implement desktop security hardening (context isolation, CSP, no remote code exec) | P0 | 8h | Electron/Tauri Security |
| 5.4.10 | Add OS-level accessibility support (UI Automation, macOS Accessibility API) | P1 | 8h | Section 508 desktop, WCAG |

## P5.5 — IDE & Developer Tooling [WS-15]

| ID | Item | Priority | Effort | Standard |
| ---- | ------ | ---------- | -------- | ---------- |
| 5.5.1 | Create VS Code workspace configuration (.vscode/settings.json, extensions.json, launch.json) | P0 | 4h | VS Code workspace API |
| 5.5.2 | Create EditorConfig for cross-IDE consistency | P0 | 2h | EditorConfig spec |
| 5.5.3 | Build Dev Container definition (devcontainer.json + Dockerfile) | P1 | 8h | Dev Containers spec |
| 5.5.4 | Document recommended extensions with justifications | P1 | 3h | DX best practices |
| 5.5.5 | Create debug configurations for server, client, and tests | P1 | 4h | DAP |
| 5.5.6 | Create task runner configurations (tasks.json for build, lint, test) | P1 | 3h | VS Code Tasks API |
| 5.5.7 | Build code snippet library for project patterns (routes, middleware, tests, components) | P2 | 6h | DX best practices |
| 5.5.8 | Document AI coding assistant configuration guidelines (Copilot, Cursor rules) | P2 | 4h | AI-assisted dev |
| 5.5.9 | Standardize Git hooks (husky + lint-staged + commitlint with Conventional Commits) | P0 | 4h | Conventional Commits 1.0 |
| 5.5.10 | Create TypeScript migration plan (progressive JS → TS with strict mode) | P1 | 8h | TypeScript strict mode |

## P5.6 — Coding Language Standards [WS-16]

| ID | Item | Priority | Effort | Standard |
| ---- | ------ | ---------- | -------- | ---------- |
| 5.6.1 | Write JavaScript/TypeScript style guide and strict ESLint config (no-any, explicit-return-types) | P0 | 8h | ECMAScript 2024, TS 5.x |
| 5.6.2 | Write Python style guide and configure Black + Ruff + mypy strict | P1 | 6h | PEP 8, PEP 484 |
| 5.6.3 | Write SQL coding standards and configure SQLFluff | P1 | 4h | SQL style guide |
| 5.6.4 | Write HTML/CSS standards and configure Stylelint + W3C Validator | P0 | 4h | W3C, Stylelint, BEM |
| 5.6.5 | Write Shell/PowerShell scripting standards with ShellCheck + PSScriptAnalyzer | P1 | 4h | POSIX, ShellCheck |
| 5.6.6 | Create naming convention reference document (camelCase JS, snake_case Python, etc.) | P0 | 3h | Language conventions |
| 5.6.7 | Document error handling patterns per language (Result types, try/catch, error boundaries) | P1 | 6h | Language best practices |
| 5.6.8 | Document code documentation standards per language (JSDoc, docstrings, rustdoc) | P1 | 4h | JSDoc, PEP 257 |
| 5.6.9 | Create code review checklist per language | P1 | 4h | IEEE 730 SQA |
| 5.6.10 | Create language-specific security checklist (injection, type coercion, memory safety) | P0 | 6h | OWASP, CWE Top 25 |

---

## Phase 6: Web Presence Redesign (Weeks 37–42)

> **Goal:** Transform the web presence from a functional prototype into a polished, enterprise-grade experience. Add an interactive glossary system that makes every acronym and term self-documenting.
> Completely redesign the navigation system to handle 9+ top-level pages gracefully on all devices. Redesign every page for visual consistency, modern UX patterns, and conversion optimization.

## P6.1 — Glossary & Tooltip Dictionary System [WS-17]

| ID | Item | Priority | Effort | Standard |
| ---- | ------ | ---------- | -------- | ---------- |
| 6.1.1 | Design glossary data model (term, acronym, definition, category, related terms, sources) | P0 | 4h | Information Architecture |
<!-- markdownlint-disable-next-line MD013 -->
| 6.1.2 | Build master glossary dictionary (JSON/YAML) — all acronyms from compliance, MBAi, templates, docs (est. 200+ terms: OSCAL, CUI, NIST, VPAT, WCAG, SBOM, CMMC, etc.) | P0 | 12h | Plain Writing Act, GPO Style |
| 6.1.3 | Build tooltip component (hover on desktop, tap on mobile) with accessible ARIA markup (role=tooltip, aria-describedby, Escape to dismiss) | P0 | 8h | WAI-ARIA 1.2, WCAG 1.3.1 |
| 6.1.4 | Implement auto-detection — scan page content and auto-wrap recognized acronyms/terms with tooltip triggers (no manual markup per page) | P0 | 10h | DX best practices |
| 6.1.5 | Build dedicated Glossary page (/glossary) — searchable, filterable by category, alphabetical index, deep-linkable anchors (#term-name) | P1 | 8h | Information Architecture |
| 6.1.6 | Mobile tooltip UX — bottom sheet or inline expand pattern (not hover-dependent), touch-friendly dismiss, doesn't block scrolling | P0 | 6h | Apple HIG, Material Design |
| 6.1.7 | Glossary admin CRUD in dashboard (add/edit/delete terms, bulk import from CSV/JSON) | P2 | 8h | Content management |
| 6.1.8 | Add glossary term count badge to nav and footer ("200+ terms defined") | P2 | 2h | UX credibility signals |
| 6.1.9 | Implement keyboard navigation for tooltips (Tab to focus, Enter/Space to open, Escape to close) | P0 | 4h | WCAG 2.1.1, 2.1.2 |
| 6.1.10 | Add print stylesheet support (tooltips render as parenthetical definitions in print/PDF) | P1 | 3h | Print accessibility |

## P6.2 — Header & Navigation Redesign [WS-18]

| ID | Item | Priority | Effort | Standard |
| ---- | ------ | ---------- | -------- | ---------- |
<!-- markdownlint-disable-next-line MD013 -->
| 6.2.1 | Audit current nav inconsistencies (index.html has 9 items with hash + path links; templates/compliance/mbai/docs have 6 items with path-only links; dashboard has separate nav; portal has no shared nav) | P0 | 4h | UX audit |
<!-- markdownlint-disable-next-line MD013 -->
| 6.2.2 | Design unified navigation architecture — primary nav (Home, Services, Portfolio, Templates, Compliance, MBAi, Docs, Glossary) + utility nav (Client Portal, Dashboard/Login) across all pages | P0 | 6h | IA best practices |
<!-- markdownlint-disable-next-line MD013 -->
| 6.2.3 | Implement mega-menu / dropdown pattern for grouped items (e.g., "Resources" → Templates, Compliance, MBAi, Docs, Glossary) to reduce top-level count from 9+ to 5–6 | P0 | 12h | Navigation patterns, WCAG |
| 6.2.4 | Build accessible mega-menu with keyboard nav (arrow keys between groups, Tab within group, Escape to close, aria-haspopup, aria-expanded) | P0 | 8h | WAI-ARIA APG Menu Pattern |
| 6.2.5 | Create consistent nav partial/component (single source of truth; currently nav HTML is duplicated across 7 files with slight differences) | P0 | 6h | DRY, component architecture |
| 6.2.6 | Redesign mobile hamburger menu — replace slide-in drawer with modern full-screen overlay pattern, add search, add section dividers, add category grouping | P1 | 8h | Mobile nav patterns |
| 6.2.7 | Add breadcrumb navigation on sub-pages (Templates, Compliance, Docs, MBAi, Portal) with proper schema.org BreadcrumbList markup | P1 | 4h | Schema.org, SEO |
| 6.2.8 | Add active page indicator with proper aria-current="page" (currently uses class toggle; some pages missing) | P0 | 3h | WCAG, WAI-ARIA |

## P6.3 — Web Presence Visual Redesign [WS-19]

| ID | Item | Priority | Effort | Standard |
| ---- | ------ | ---------- | -------- | ---------- |
<!-- markdownlint-disable-next-line MD013 -->
| 6.3.1 | Create design system documentation (color palette, typography scale, spacing tokens, component library) — codify existing CSS variables into a formal system | P0 | 8h | Design Systems, Atomic Design |
<!-- markdownlint-disable-next-line MD013 -->
| 6.3.2 | Audit and redesign index.html layout — hero section, portfolio grid, services grid, methodology section, value calculator, contact form, footer (currently 616 lines, single long scroll with no visual breaks) | P0 | 16h | Landing page best practices |
| 6.3.3 | Redesign templates.html — improve category nav, add visual card previews, enhance search with tag filtering, add "recently added" and "popular" sections | P1 | 10h | Content discovery UX |
| 6.3.4 | Redesign compliance.html — enhance framework cards with visual progress indicators, improve evidence tab UX, add compliance score dashboard | P1 | 10h | Dashboard UX patterns |
<!-- markdownlint-disable-next-line MD013 -->
| 6.3.5 | Redesign mbai.html — improve pillar visualization (replace emoji icons with proper SVG icons throughout site), enhance template categorization, add interactive MBAi methodology diagram | P1 | 10h | Visual design, data viz |
<!-- markdownlint-disable-next-line MD013 -->
| 6.3.6 | Redesign docs.html — add sidebar table of contents, improve API reference table with expandable rows, add code copy buttons, enhance search | P1 | 8h | Documentation UX, Docusaurus patterns |
| 6.3.7 | Redesign portal.html — improve login UX (add "remember me", forgot password flow), enhance dashboard layout, add project timeline visualization | P2 | 10h | Portal UX patterns |
| 6.3.8 | Replace all emoji icons (📊👥📁💬📧🔑📜⚙️🏠🎨🔧🔐🚀📚🛡️) with professional SVG icon system (Lucide, Heroicons, or custom) across all pages | P0 | 8h | Visual design maturity |
| 6.3.9 | Implement consistent footer across all pages (currently only index.html has full footer; other pages have minimal/no footer) | P0 | 4h | UX consistency |
| 6.3.10 | Add page transition animations (view transitions API or CSS-based) for smooth navigation between pages | P2 | 6h | View Transitions API |
| 6.3.11 | Implement dark/light mode toggle with system preference detection and localStorage persistence | P1 | 6h | prefers-color-scheme, UX |
| 6.3.12 | Add Open Graph / Twitter Card meta tags to all pages (og:title, og:description, og:image, twitter:card) for professional social sharing | P1 | 3h | Open Graph, SEO |
| 6.3.13 | Add structured data (schema.org JSON-LD) — Organization, WebSite, SoftwareApplication, BreadcrumbList, FAQ | P1 | 4h | Schema.org, SEO |
| 6.3.14 | Implement CSS architecture refactor — split main.css (1,252 lines) into modular partials using CSS custom properties + CSS layers or a build tool | P0 | 8h | CSS Architecture, ITCSS |

---

## Work Stream Details

## WS-1: Testing & CI/CD Infrastructure

**Why this matters (in plain English):** You wouldn't build a bridge without inspecting the welds. Tests are the inspection system for software — without them, every change risks breaking something.
Government contracts often require documented test evidence (MIL-STD-498 STR, FedRAMP SAR).

> **Status (v1.8.1):** ✅ COMPLETE — 511 tests across 48 files, Vitest + v8 coverage at 80% thresholds, ESLint v10 flat config, Prettier, Husky + lint-staged pre-commit hooks, GitHub Actions CI/CD
> pipeline.

**Standards covered:** NIST SSDF SP 800-218 (PW.7, PW.8), MIL-STD-498 (STP, STD, STR), OWASP ASVS, CMMI VER/VAL, ISO 9001 Clause 8.6

**Deliverables:**

- Vitest configuration with coverage
- ESLint + Prettier configuration
- 120+ unit tests across server and client
- 20+ integration tests
- GitHub Actions CI/CD pipeline
- Pre-commit hooks (husky + lint-staged)
- Test coverage reports

---

## WS-2: Section 508 & Accessibility

**Why this matters:** Federal law (Section 508 of the Rehabilitation Act) requires all ICT sold to, or used by, the federal government to be accessible. Without a VPAT, government procurement officers
literally cannot purchase your product — it's disqualified at the gate. Your current platform has two pages (dashboard and portal) with significant accessibility gaps.

**Standards covered:** Revised Section 508 (2018), WCAG 2.1 AA, WCAG 2.2, WAI-ARIA 1.2, DHS Trusted Tester v5.1, Plain Writing Act, COGA recommendations, OMB M-24-08

**Deliverables:**

- All pages WCAG 2.1 AA conformant
- VPAT 2.5 Rev ACR document
- axe-core in CI/CD pipeline
- Screen reader testing documentation (JAWS, NVDA, VoiceOver)
- Focus management for all dynamic UI
- PDF/UA document export
- Accessibility conformance dashboard

---

## WS-3: Security Hardening

**Why this matters:** Government systems are under constant attack. A single breach involving CUI triggers DFARS 252.204-7012 incident reporting obligations within 72 hours, potential CMMC
decertification, and reputational damage. Your current CSP is disabled (like removing the lock from your front door) and you have a hardcoded fallback JWT secret (like writing your password on a
sticky note).

**Standards covered:** OWASP Top 10 (2021), OWASP ASVS L2, OWASP API Security Top 10, NIST SP 800-53 Rev 5 (AC, AU, IA, SC families), NIST SSDF SP 800-218, CMMC Level 2, FedRAMP Moderate, NIST SP
800-207 (Zero Trust)

**Deliverables:**

- CSP enabled and configured
- JWT security hardened (no fallback secret, rotation)
- CSRF protection
- MFA support (TOTP)
- SAST + DAST in CI/CD
- Session management hardened
- Security headers audit

---

## WS-4: CUI Marking & Classification

**Why this matters:** If your platform handles, displays, or generates ANY content that falls under the CUI program (32 CFR Part 2002), every page, document, and export must carry proper markings.
USACE generates enormous volumes of CUI (engineering data, personnel info, critical infrastructure data). Without CUI marking capability, your platform cannot be used for CUI workflows — period.

**Standards covered:** 32 CFR Part 2002, NARA CUI Registry (20+ categories), DoD Manual 5200.01, DoD Directive 5230.24 (Distribution Statements), NIST SP 800-171 (MP-3 Media Marking)

**Deliverables:**

- CUI banner marking component
- CUI portion marking component
- CUI designation indicator block
- Distribution Statement component (A–F, X)
- CUI metadata in document model
- CUI-compliant print/PDF output
- CUI configuration UI

---

## WS-5: Technical Documentation

**Why this matters:** Government contracts (especially DoD) specify documentation deliverables by Data Item Description (DID). Missing a required document means failing a CDRL review, which can halt
contract payments. Beyond compliance, excellent documentation is what makes your platform "the smartest and most wise resource" — it's how clients trust you know what you're doing.

**Standards covered:** MIL-STD-498 (15 DIDs), IEEE 1063, Plain Writing Act, GPO Style Manual, Microsoft Style Guide, OpenAPI 3.0, Keep a Changelog, ADR, DITA principles, NARA records metadata

**Deliverables:**

- CHANGELOG.md
- CONTRIBUTING.md
- OpenAPI 3.0 spec + Swagger UI
- Architecture Decision Records (5+)
- Vale prose linting configuration
- Readability scoring in CI
- Project style sheet
- MIL-STD-498 document templates

---

## WS-6: Compliance Engine Enhancement

**Why this matters:** Your compliance framework is already strong (12 frameworks, OSCAL, cross-mapping). But evidence tracking is UI-only (no persistence), there's no automated scoring, and continuous
monitoring needs improvement.

> **Status (v1.8.1):** NIST SP 800-53 Rev 5 (322 controls) and 800-171 Rev 3 (115 requirements) added in v1.7.0. Evidence tracking backend, scoring, and POA&M export remain open.

**Standards covered:** NIST SP 800-53 Rev 5, NIST SP 800-171 Rev 2/3, CMMC 2.0, FedRAMP, OSCAL, SPRS scoring

**Deliverables:**

- Evidence tracking backend with persistence
- Compliance gap scoring engine
- Assessment scheduling
- NIST 800-53 Rev 5 framework (full)
- NIST 800-171 Rev 3 framework
- POA&M export
- SPRS score calculator

---

## WS-7: Observability & Audit

**Why this matters:** OMB M-21-31 defines three tiers of logging maturity for federal systems. Currently your platform is at "Tier 0" — you have no structured logging, no request IDs, no security
event logging. For FedRAMP authorization, you need to demonstrate continuous monitoring including audit log review. For incident response (required within 72 hours under DFARS), you need logs that
tell you what happened.

**Standards covered:** NIST SP 800-53 AU family (AU-2, AU-3, AU-6, AU-8, AU-9, AU-11, AU-12), OMB M-21-31, DoD 5015.02-STD, FedRAMP ConMon, FISMA

**Deliverables:**

- Structured JSON logging (winston/pino)
- Request ID middleware
- HTTP access logging
- Security event logging
- Log rotation + retention
- Admin audit log viewer
- Error monitoring integration

---

## WS-8: Supply Chain Security

**Why this matters:** Executive Order 14028 made SBOMs a federal procurement requirement. If you want to sell to the government, you need to produce an SBOM on demand. OMB M-22-18 requires software
producers to self-attest to secure development practices. Without these, you're not eligible for federal contracts.

**Standards covered:** EO 14028, OMB M-22-18, NTIA SBOM minimum elements, CycloneDX/SPDX, SLSA, NIST SP 800-53 SA-11, OWASP A06

**Deliverables:**

- SBOM generation (CycloneDX) in build pipeline
- Dependabot/Renovate configuration
- npm audit in CI with fail-on-critical
- SBOM artifact in releases
- License compliance check

---

## WS-9: Agentic AI Capabilities

**Why this matters:** AI-assisted compliance, document generation, and gap analysis are differentiators that transform your platform from a reference library into an active assistant. But agentic AI
in government contexts demands guardrails (prompt injection is like SQL injection for AI), audit trails (every AI action must be logged), and human oversight (AI can't make compliance decisions
autonomously).

**Standards covered:** NIST AI RMF, ISO 42001, OWASP LLM Top 10, EU AI Act considerations, Microsoft Responsible AI principles, MITRE ATLAS

**Deliverables:**

- Multi-agent architecture design
- AI guardrails layer (input/output validation, content filtering)
- AI-assisted document generation
- AI compliance gap analysis
- AI conversation audit trail
- Human-in-the-loop approval workflows
- AI cost/token monitoring
- AI evaluation framework

---

## WS-10: USACE/DoD Integration Features

**Why this matters:** USACE is one of the largest federal engineering organizations. Their document formats (ER, EP, ETL, ERDC TR), review systems (DrChecks), environmental documentation (NEPA), and
records management requirements are SPECIFIC and NON-NEGOTIABLE. If your templates don't match their format, they won't adopt the platform.

**Standards covered:** USACE ER/EP series, ER 25-1-100, ER 1110-1-8159 (DrChecks), ANSI Z39.18 (SF 298), MIL-STD-498, CDRL/DD 1423, DoD Dir 5230.24, CEQ NEPA regs, MIL-HDBK-61A, DoD 5015.02-STD

**Deliverables:**

- USACE document template library
- SF 298 generator
- Distribution Statement selector
- DrChecks export format
- MIL-STD-498 document templates
- CDRL tracker
- NEPA document templates
- Records management engine
- Document version control with diff

---

## WS-11: Full-Stack Architecture & Code Quality

**Why this matters (in plain English):** Think of full-stack architecture like the plumbing and wiring of a building. If it's messy, every repair costs 10x more and every new room takes forever to
build. Right now the platform uses vanilla HTML/JS on the front end and Express+SQLite on the back end — that works for a prototype, but scaling to enterprise and government clients requires clean
separation of concerns, API contracts, proper database design, and developer-quality tooling. This work stream upgrades the plumbing from DIY to commercial grade.

**Standards covered:** Twelve-Factor App methodology, OpenAPI 3.0, JSON:API / REST maturity model (Richardson), OWASP Secure Coding Practices, ISO/IEC 25010 (software quality model), ISO/IEC 12207
(software lifecycle), IEEE 730 (SQA), IEEE 1016 (software design), NIST SSDF SP 800-218, ESLint/Prettier/EditorConfig, SemVer 2.0, Conventional Commits

**Deliverables:**

- Formal API versioning strategy (URL prefix or header-based)
- OpenAPI 3.0 contract-first API design for all routes
- Database migration framework (Knex/Prisma) replacing raw SQL
- Input validation and serialization layer (Zod/Joi schemas)
- Centralized error handling middleware (RFC 7807 Problem Details)
- Environment-based configuration management (12-Factor Config)
- Code quality gates (ESLint strict ruleset, Prettier, EditorConfig)
- Monorepo tooling evaluation (Nx/Turborepo) for multi-package support
- Performance budgets (Lighthouse CI, bundle size limits)
- API rate limiting with configurable tiers
- Health check and readiness probe endpoints (/healthz, /readyz)
- Database connection pooling and query optimization

---

## WS-12: Progressive Web App (PWA)

**Why this matters:** A PWA lets users install and use your platform like a native app — even without internet. For field engineers at USACE job sites, ship crews, or deployed military personnel,
connectivity is unreliable or nonexistent. A PWA with offline support means compliance checklists, document templates, and reference data remain available. It also eliminates app store distribution
barriers — users just "Add to Home Screen."

**Standards covered:** W3C Web App Manifest, W3C Service Workers API, W3C Push API, W3C Background Sync, W3C Badging API, Google Lighthouse PWA audit, Workbox best practices, OWASP PWA Security, Web
Content Accessibility Guidelines (applied to PWA install/offline UX)

**Deliverables:**

- Web App Manifest (manifest.json) with proper icons, theme, shortcuts
- Service Worker with Workbox (precaching, runtime caching, background sync)
- Offline fallback page with cached core content
- Cache-first strategy for static assets, network-first for API calls
- IndexedDB offline data store for compliance checklists and templates
- Background sync for queued form submissions
- Push notification infrastructure (VAPID key setup, subscription management)
- App install prompt UX (beforeinstallprompt handling)
- Lighthouse PWA score ≥90 in CI pipeline
- Update notification ("New version available — refresh")
- Offline indicator UI component
- PWA asset generation pipeline (icons 192/512, maskable, splash screens)

---

## WS-13: Mobile Application Development

**Why this matters:** Government and military users operate in mobile-first environments — tablets in field offices, phones at construction sites, classified mobile devices in secure facilities. A
responsive web app alone doesn't cut it: native mobile apps provide biometric authentication (Face ID, fingerprint), push notifications, camera-based document scanning, and compliance with OWASP
Mobile Application Security Verification Standard (MASVS). This work stream covers both the cross-platform mobile build AND the rigorous security/accessibility standards required for government mobile
apps.

**Standards covered:** OWASP MASVS v2.0, OWASP MASTG, Apple Human Interface Guidelines (HIG), Material Design 3, WCAG 2.1 mobile accessibility, Section 508 mobile ICT, Apple App Store Review
Guidelines, Google Play Developer Policies, NIAP Protection Profile for Application Software, DoD Mobile Device Policy, NIST SP 800-124 Rev 2 (mobile device management)

**Deliverables:**

- Cross-platform mobile framework selection and architecture (React Native or Flutter)
- Mobile-specific authentication (biometric login, secure keychain/keystore token storage)
- Offline-first mobile data sync engine (conflict resolution, queue management)
- Mobile-optimized UI component library (touch targets ≥44pt, gesture navigation)
- Camera-based document capture and OCR integration
- Mobile push notification system (APNs + FCM)
- Mobile accessibility audit and remediation (dynamic type, VoiceOver/TalkBack)
- App Store / Play Store submission pipeline (metadata, screenshots, review prep)
- Mobile-specific security hardening (certificate pinning, root/jailbreak detection, obfuscation)
- Mobile CI/CD pipeline (Fastlane or EAS Build)
- Mobile crash reporting and analytics integration
- Responsive layout validation across device breakpoints (phone, tablet, foldable)

---

## WS-14: Desktop Application Development

**Why this matters:** Many government workstations operate in restricted environments where web browsers are locked down, extensions are prohibited, and network access may be air-gapped. A desktop
application allows your platform to run natively on Windows (the dominant DoD OS), macOS, and Linux — with local file system access for document management, native printing for CUI-marked documents,
system tray integration for notifications, and offline operation without a browser. Electron or Tauri can wrap your existing web app while adding native capabilities — Tauri is preferred for smaller
binary size and better security posture (Rust backend, no bundled Chromium).

**Standards covered:** ISO/IEC 25010 (usability, reliability, security), NIST SP 800-53 CM family (configuration management), Windows App Certification Kit (WACK), macOS App Sandbox, XDG Base
Directory Spec (Linux), Freedesktop.org standards, Windows MSIX/Squirrel packaging, macOS notarization/Gatekeeper, Linux AppImage/Flatpak/Snap, Electron Security Checklist, Tauri Security Model, WCAG
2.1 desktop accessibility, Section 508 desktop software

**Deliverables:**

- Desktop framework selection and architecture (Tauri preferred; Electron as fallback)
- Auto-update mechanism (differential updates, code signing verification)
- Native file system integration (open/save dialogs, file watchers, drag-and-drop)
- System tray / menu bar integration with notification badges
- Native printing support with CUI marking in print layout
- Offline-first architecture with local SQLite database
- Cross-platform installer pipeline (Windows MSIX/NSIS, macOS DMG, Linux AppImage)
- Code signing certificates (Windows Authenticode, Apple Developer ID)
- Desktop-specific security hardening (context isolation, CSP, no remote code execution)
- OS-level accessibility support (Windows UI Automation, macOS Accessibility API)
- Crash reporting and telemetry (opt-in, privacy-respecting)
- Deep linking / protocol handler registration (structured-for-growth://)

---

## WS-15: IDE & Developer Tooling

**Why this matters:** Developer experience (DX) directly impacts code quality, team velocity, and onboarding time. A standardized IDE setup means every developer on the team — whether using VS Code,
Windsurf, or JetBrains — gets the same linting rules, formatting, debugging configurations, AI assistance, and extension recommendations. This eliminates "works on my machine" problems, enforces
coding standards automatically, and reduces the cognitive load on new contributors.

**Standards covered:** EditorConfig, VS Code Workspace Recommendations, ESLint Flat Config, Prettier, Dev Containers (devcontainer.json), Language Server Protocol (LSP), Debug Adapter Protocol (DAP),
VS Code Extension API, JetBrains code style XML, .gitattributes line endings, .nvmrc/.node-version, TypeScript strict mode, Python Black/Ruff/mypy

**Deliverables:**

- VS Code workspace configuration (.vscode/settings.json, extensions.json, launch.json)
- EditorConfig for cross-IDE consistency
- Dev Container definition (devcontainer.json + Dockerfile) for reproducible environments
- Recommended extensions list with justifications (ESLint, Prettier, axe-linter, GitLens, etc.)
- Debug configurations for server, client, and tests
- Task runner configuration (VS Code tasks.json for build, lint, test)
- Code snippets for project patterns (route handler, middleware, test template, component)
- AI coding assistant configuration guidelines (Copilot, Codeium, Cursor rules)
- Git hooks standardization (husky + lint-staged + commitlint)
- TypeScript migration plan (progressive JS → TS conversion with strict mode target)
- Workspace documentation (CONTRIBUTING.md section on IDE setup)
- Multi-root workspace configuration for monorepo support

---

## WS-16: Coding Language Standards & Best Practices

**Why this matters:** The platform currently uses JavaScript — but the ecosystem is moving toward TypeScript for type safety, and future modules (mobile, desktop, AI) may require Python, Rust, Swift,
or Kotlin. Establishing language-specific coding standards NOW prevents a Tower of Babel problem later. This work stream defines the "how we write code" rules for every language the platform will
touch, including linting, formatting, naming conventions, error handling patterns, and documentation standards. Think of it as the grammar book for every programming language your team speaks.

**Standards covered:** ECMAScript 2024+, TypeScript 5.x strict mode, Node.js best practices (Goldbergyoni), Python PEP 8/PEP 484/PEP 257, Rust Edition 2024/Clippy, Go Effective Go/staticcheck, Swift
API Design Guidelines, Kotlin Coding Conventions, SQL style guide (SQL Fluff), HTML/CSS (W3C Validator, Stylelint, BEM), Shell (ShellCheck, POSIX), Semantic Versioning 2.0.0, Conventional Commits
1.0.0, JSDoc/TSDoc/docstrings

**Deliverables:**

- JavaScript/TypeScript style guide and ESLint configuration (strict, no-any, explicit-return-types)
- Python style guide and tooling (Black + Ruff + mypy strict)
- SQL coding standards and linting (SQLFluff configuration)
- HTML/CSS standards and linting (Stylelint + W3C Validator integration)
- Shell/PowerShell scripting standards (ShellCheck, PSScriptAnalyzer)
- Naming convention reference (camelCase JS, snake_case Python, PascalCase types, UPPER_SNAKE constants)
- Error handling patterns per language (Result types, try/catch conventions, error boundaries)
- Documentation standards per language (JSDoc, docstrings, rustdoc, godoc)
- Code review checklist per language
- Language-specific security checklist (injection prevention, memory safety, type coercion)
- Performance patterns per language (async patterns, memory management, lazy evaluation)
- Versioning and dependency management strategy (package-lock, requirements.txt, Cargo.lock)

---

## WS-17: Glossary & Tooltip Dictionary System

**Why this matters (in plain English):** Your platform is packed with acronyms — OSCAL, CUI, NIST, VPAT, WCAG, SBOM, CMMC, FISMA, FedRAMP, CDRL, NEPA, DITA, and hundreds more. For a first-time visitor
(or even an experienced compliance officer crossing domains), these are barriers to understanding. A glossary with hover-to-define tooltips transforms your site from "intimidating wall of jargon" into
"the smartest resource I've ever used — it explains itself." On mobile (where hover doesn't exist), a tap-to-expand pattern provides the same experience. This is the feature that makes your platform
feel like a mentor, not a textbook.

**Standards covered:** WAI-ARIA 1.2 (tooltip role, aria-describedby), WCAG 2.1 (1.3.1 Info and Relationships, 2.1.1 Keyboard, 4.1.2 Name/Role/Value), Plain Writing Act (define terms on first use),
Apple HIG (popovers), Material Design (tooltips), ISO/IEC 25010 (usability/learnability), Schema.org DefinedTerm/DefinedTermSet

**Deliverables:**

- Glossary data model and master dictionary (200+ terms, JSON format)
- Accessible tooltip component (desktop hover, mobile tap, keyboard navigable)
- Auto-detection engine (scans page text, auto-wraps recognized terms — no manual markup)
- Dedicated searchable Glossary page (/glossary) with categories, A-Z index, deep links
- Mobile bottom-sheet / inline-expand tooltip UX
- Dashboard glossary admin (CRUD, bulk import)
- Print stylesheet tooltip rendering (parenthetical definitions)
- Schema.org DefinedTerm structured data for SEO

---

## WS-18: Header & Navigation Redesign

**Why this matters:** Right now, the navigation is fractured. index.html has 9 menu items mixing hash-links (#portfolio, #services) with page-links (/compliance, /mbai). The inner pages (templates,
compliance, mbai, docs) have 6 items. The dashboard has a completely different nav bar. The portal has no shared nav at all. The nav HTML is duplicated across 7 files with subtle differences (some
have `role="navigation"` and skip links, dashboard.html has neither). As the platform adds Glossary, PWA features, and more docs, this flat menu will overflow on tablet widths (already wrapping at
1024px). This needs a unified, scalable navigation architecture — one source of truth, with dropdown/mega-menu grouping, consistent across every page.

**Current audit findings:**

- **7 separate nav implementations** — index.html, templates.html, compliance.html, mbai.html, docs.html (consistent 6-item); dashboard.html (different layout, no ARIA roles); portal.html (no nav at
  all)
- **index.html has 9 items** (Home, Portfolio, Services, Templates, Contact = hash links; Compliance, MBAi, Docs, Client Portal = page links) — too many for a flat menu
- **No dropdown/mega-menu** — every item is top-level, causing wrap at ~1024px
- **dashboard.html missing**: skip-link, `role="navigation"`, `aria-label`, menubar ARIA pattern
- **No breadcrumbs** on any sub-page
- **No aria-current="page"** — active state is CSS-only, not semantic
- **No consistent footer** — index.html has full footer; other pages have none

**Standards covered:** WAI-ARIA APG Navigation Menubar Pattern, WAI-ARIA APG Disclosure Pattern, WCAG 2.4.5 (Multiple Ways), WCAG 2.4.8 (Location), WCAG 3.2.3 (Consistent Navigation), Schema.org
BreadcrumbList, Mobile-first responsive design, Component-based architecture (DRY)

**Deliverables:**

- Unified navigation component (single source of truth for all pages)
- Mega-menu / dropdown architecture with accessible keyboard navigation
- Consistent nav across ALL pages (index, templates, compliance, mbai, docs, portal, dashboard, glossary)
- Breadcrumb navigation with schema.org markup
- aria-current="page" on all active page links
- Mobile full-screen overlay menu with grouped sections
- Skip links on every page (dashboard and portal currently missing)
- Dashboard nav upgraded with proper ARIA roles

---

## WS-19: Web Presence Redesign

**Why this matters:** The platform's visual design is functional but has "first iteration" characteristics — emoji icons (📊👥📁💬) instead of proper SVG icon system, 616-line single-scroll homepage
without visual section breaks, no design system documentation, CSS variables exist but aren't organized into a formal design token system, some pages have footers and some don't, no dark/light mode
toggle (everything is forced dark), no Open Graph meta tags (shared links to Twitter/LinkedIn show no preview), and no structured data for SEO. For a platform positioning itself as "the smartest and
most wise resource," the visual layer needs to match the intellectual depth of the content.

**Current audit findings:**

- **Emoji icons throughout all pages** — dashboard sidebar uses emoji (📊👥📁💬📧🔑📜⚙️🏠), services section uses emoji, MBAi pillars use emoji. These render inconsistently across OS/browser and look
  unprofessional
- **index.html is 616 lines** with portfolio (5 projects), services (7 cards), methodology (3 pillars + 8 templates CTA), template library (5 categories), value calculator, contact form, footer — all
  in one long scroll with no secondary navigation or section anchoring beyond hash links
- **CSS architecture**: main.css is 1,252 lines (monolithic), plus 7 page-specific CSS files totaling 4,673 lines — no CSS partials, no build pipeline, no CSS layers
- **No design system documentation** — 80+ CSS variables defined but not documented
- **No Open Graph / Twitter Cards** — only index.html has a meta description; no og:image, og:title, twitter:card on any page
- **No structured data (schema.org)** — no JSON-LD on any page
- **Dark theme only** — no light mode option, no `prefers-color-scheme` media query
- **No page transitions** — hard navigation between pages (no View Transitions API or SPA routing)
- **Footer inconsistency** — index.html has a full footer with 3 sections + admin link; templates.html, compliance.html, mbai.html, docs.html have no footer at all
- **GoatCounter analytics only on index.html** — missing from all sub-pages

**Standards covered:** Atomic Design methodology, Design Tokens (W3C draft), CSS Layers, View Transitions API (W3C), Open Graph Protocol, Schema.org (Organization, WebSite, SoftwareApplication, FAQ),
prefers-color-scheme, Web Content Accessibility Guidelines (color contrast in both themes), Google Lighthouse Performance/SEO/Best Practices, Core Web Vitals

**Deliverables:**

- Formal design system with documented tokens (colors, typography, spacing, shadows, breakpoints)
- Professional SVG icon system (Lucide/Heroicons) replacing all emoji
- Homepage redesign — sectioned layout with visual breaks, scroll-linked nav, above-the-fold optimization
- Every page redesigned for visual consistency and modern UX
- Consistent footer on all pages
- Dark/light mode with system preference + manual toggle
- Open Graph + Twitter Card meta tags on every page
- Schema.org JSON-LD structured data
- CSS architecture refactored to modular partials
- Page transition animations (View Transitions API)
- GoatCounter analytics on all pages
- Responsive image strategy (srcset, lazy loading, WebP/AVIF)

---

## Standards Reference Matrix

| Standard | Primary Domain | Phases | Required For |
| ---------- | --------------- | -------- | ------------- |
| **Section 508** (29 U.S.C. § 794d) | Accessibility | 1, 2, 4 | All federal sales |
| **WCAG 2.1 AA** | Accessibility | 1, 2 | Section 508 baseline |
| **WCAG 2.2** | Accessibility | 2, 4 | Forward compliance |
| **WAI-ARIA 1.2** | Accessibility | 1, 2 | Dynamic content |
| **32 CFR Part 2002** | CUI | 2 | Any CUI handling |
| **NIST SP 800-171** | Security | 2, 3 | DoD contractor CUI |
| **NIST SP 800-53 Rev 5** | Security | 3 | FedRAMP |
| **CMMC 2.0** | Security | 2, 3 | DoD contracts |
| **OWASP Top 10** | Security | 1, 3 | Industry standard |
| **OWASP ASVS** | Security | 1, 3 | AppSec verification |
| **FedRAMP** | Security | 3, 4 | Cloud for federal |
| **NIST AI RMF** | AI | 4 | AI governance |
| **ISO 42001** | AI | 4 | AI management system |
| **NIST SSDF SP 800-218** | Dev practices | 1, 2, 3, 5 | Secure development |
| **EO 14028** | Supply chain | 2 | Federal software |
| **MIL-STD-498** | Documentation | 4 | DoD contracts |
| **NIST SP 800-207** | Architecture | 4 | Zero Trust |
| **OMB M-22-09** | Architecture | 4 | Federal Zero Trust |
| **Plain Writing Act** | Documentation | 1, 3 | Federal content |
| **DoD 5015.02-STD** | Records | 3 | DoD records |
| **NARA 36 CFR 12xx** | Records | 3 | Federal records |
| **GPO Style Manual** | Documentation | 3 | Gov publications |
| **ISO 9001** | Quality | 3 | Contract-dependent |
| **USACE ER/EP** | Integration | 4 | USACE work |
| **DHS Trusted Tester** | Accessibility | 2 | A11y verification |
| **Twelve-Factor App** | Architecture | 5 | Cloud-native design |
| **OpenAPI 3.0** | API Design | 3, 5 | API documentation |
| **ISO/IEC 25010** | Software Quality | 5 | Quality attributes |
| **ISO/IEC 12207** | Software Lifecycle | 5 | Process maturity |
| **IEEE 730** | Quality Assurance | 5 | SQA planning |
| **IEEE 1016** | Software Design | 5 | Design documentation |
| **W3C Web App Manifest** | PWA | 5 | Installable PWA |
| **W3C Service Workers** | PWA | 5 | Offline support |
| **W3C Push API** | PWA | 5 | Push notifications |
| **OWASP MASVS 2.0** | Mobile Security | 5 | Mobile app security |
| **OWASP MASTG** | Mobile Testing | 5 | Mobile security testing |
| **Apple HIG** | Mobile UX | 5 | iOS compliance |
| **Material Design 3** | Mobile UX | 5 | Android UX |
| **NIST SP 800-124 Rev 2** | Mobile Security | 5 | Gov mobile devices |
| **Tauri Security Model** | Desktop Security | 5 | Desktop app security |
| **Electron Security Checklist** | Desktop Security | 5 | Desktop app security |
| **XDG Base Directory** | Desktop (Linux) | 5 | Linux compliance |
| **Conventional Commits 1.0** | Dev Tooling | 5 | Commit standards |
| **EditorConfig** | Dev Tooling | 5 | Cross-IDE consistency |
| **ECMAScript 2024+** | Coding Standards | 5 | JS/TS development |
| **TypeScript Strict Mode** | Coding Standards | 5 | Type safety |
| **PEP 8 / PEP 484** | Coding Standards | 5 | Python development |
| **SemVer 2.0.0** | Versioning | 1, 5 | Release management |
| **RFC 7807** | API Standards | 5 | Error responses |
| **WAI-ARIA APG Menubar** | Navigation | 6 | Accessible mega-menu |
| **Schema.org BreadcrumbList** | SEO/Navigation | 6 | Sub-page breadcrumbs |
| **Schema.org DefinedTerm** | Glossary/SEO | 6 | Glossary structured data |
| **Open Graph Protocol** | Social/SEO | 6 | Social sharing previews |
| **View Transitions API** | UX | 6 | Page transitions |
| **Atomic Design** | Design System | 6 | Component architecture |
| **CSS Layers (W3C)** | CSS Architecture | 6 | Modular CSS |
| **Core Web Vitals** | Performance/SEO | 6 | Google ranking factors |

---

## Risk Register

| Risk | Impact | Likelihood | Mitigation |
| ------ | -------- | ----------- | ------------ |
| ✅ ~~No test coverage~~ | ~~Critical~~ | ~~Resolved~~ | 511 tests, 80% coverage thresholds |
| ✅ ~~CSP disabled~~ | ~~Critical~~ | ~~Resolved~~ | CSP enabled v1.5.0 |
| ✅ ~~No VPAT~~ | ~~Critical~~ | ~~Resolved~~ | VPAT 2.5 ACR created v1.8.0 |
| ✅ ~~Hardcoded JWT secret~~ | ~~Critical~~ | ~~Resolved~~ | Fail-fast in production v1.5.0 |
| ✅ ~~No SBOM~~ | ~~High~~ | ~~Resolved~~ | CycloneDX `npm run sbom` v1.5.0 |
| CUI data without markings = regulatory violation | Critical | Medium | Phase 2 — WS-4 |
| ✅ ~~No structured logging~~ | ~~High~~ | ~~Resolved~~ | Winston + error monitoring v1.6.0 |
| AI without guardrails = prompt injection risk | High | Medium | Phase 4 — WS-9 |
| USACE format mismatch = client rejection | Medium | Medium | Phase 4 — WS-10 |
| Scope creep across 192 items | Medium | High | Phased approach, weekly reviews |
| Multi-platform fragmentation (PWA + mobile + desktop) | High | Medium | Phase 5 — shared core, platform-specific shells |
| Mobile app store rejection (policy violations, missing metadata) | Medium | Medium | Phase 5 — WS-13, app review prep |
| Desktop auto-update bypass = unsigned code execution | Critical | Low | Phase 5 — WS-14, code signing certs |
| TypeScript migration breaks existing JS workflows | Medium | Medium | Phase 5 — WS-15, progressive migration |
| Language standard drift across polyglot codebase | Medium | High | Phase 5 — WS-16, automated linting enforcement |
| Offline data sync conflicts (PWA/mobile/desktop) | High | Medium | Phase 5 — conflict resolution patterns |
| Nav overflow as pages grow (Glossary, Pricing, Blog) | Medium | High (existing) | Phase 6 — WS-18 mega-menu architecture |
| Inconsistent UX across pages erodes trust | Medium | High (existing) | Phase 6 — WS-19 unified design system |
| Tooltip auto-detection false positives (wrong terms matched) | Low | Medium | Phase 6 — WS-17 whitelist/exclusion config |
| Dark/light mode color contrast failures | Medium | Medium | Phase 6 — WS-19 dual-theme WCAG testing |

---

## Success Metrics

| Metric | Current | Phase 1 Target | Phase 2 Target | Phase 4 Target | Phase 5 Target | Phase 6 Target |
| -------- | --------- | --------------- | --------------- | --------------- | --------------- | --------------- |
| Test coverage | 0% | ≥80% | ≥85% | ≥90% | ≥90% all platforms | ≥90% |
| Automated a11y violations | Unknown | ≤5 non-critical | 0 critical, ≤3 serious | 0 violations | 0 (web + mobile + desktop) | 0 (both themes) |
| VPAT conformance | None | N/A | ≥85% "Supports" | ≥95% "Supports" | ≥95% all channels | ≥95% |
| OWASP Top 10 gaps | 3+ (CSP, CSRF, logging) | 0 critical | 0 | 0 | 0 (incl. MASVS, LLM Top 10) | 0 |
| NIST 800-171 controls met | Unknown | N/A | ≥70/110 | ≥100/110 | ≥100/110 | ≥100/110 |
| CUI marking capability | None | N/A | Full implementation | Full + print/PDF | Full + desktop native print | Full + tooltips in print |
| SBOM generation | None | N/A | Automated per release | Automated + VEX | All platforms (web + desktop) | All platforms |
| Compliance frameworks | 10 | 10 | 12 (add 800-53, 800-171r3) | 12+ | 12+ | 12+ |
| Documentation pages | 5 | 8 (add CHANGELOG, CONTRIBUTING, OpenAPI) | 10+ | 15+ | 20+ (all platform guides) | 22+ (+ Glossary) |
| CI/CD pipeline | None | Lint → Test → Build | + SAST + a11y + SBOM | + DAST + monitoring | + mobile CI + desktop CI | + Lighthouse CI |
| Structured log coverage | 0% | N/A | N/A | 100% of routes | 100% all platforms | 100% |
| USACE templates | 0 | 0 | 0 | 7+ document types | 7+ document types | 7+ |
| Lighthouse PWA score | N/A | N/A | N/A | N/A | ≥90 | ≥90 |
| Mobile app MASVS compliance | N/A | N/A | N/A | N/A | L1 full, L2 partial | L1 full |
| Desktop installer coverage | N/A | N/A | N/A | N/A | Windows + macOS + Linux | All 3 |
| ESLint/Prettier compliance | 0% | 100% | 100% | 100% | 100% (all languages linted) | 100% |
| TypeScript migration | 0% JS→TS | N/A | N/A | N/A | ≥50% strict TS | ≥50% |
| Dev Container ready | No | No | No | No | Yes (one-click onboarding) | Yes |
| Glossary terms defined | 0 | N/A | N/A | N/A | N/A | ≥200 terms |
| Nav consistency (shared component) | 0/7 pages | N/A | N/A | N/A | N/A | 8/8 pages (single source) |
| Pages with full footer | 1/7 | N/A | N/A | N/A | N/A | 8/8 pages |
| Open Graph meta tags | 0/7 pages | N/A | N/A | N/A | N/A | 8/8 pages |
| Emoji icons remaining | 30+ | N/A | N/A | N/A | N/A | 0 (all SVG) |
| Lighthouse Performance score | Unknown | N/A | N/A | N/A | N/A | ≥90 all pages |
| Schema.org structured data | 0 types | N/A | N/A | N/A | N/A | 5+ types |

---

## Appendix A: Effort Summary

| Phase | Items | Estimated Effort | Calendar |
| ------- | ------- | ----------------- | ---------- |
| Phase 1 (Foundation) | 23 | ~95 hours | Weeks 1–4 |
| Phase 2 (Gov Readiness) | 25 | ~195 hours | Weeks 5–10 |
| Phase 3 (Enterprise) | 29 | ~235 hours | Weeks 11–18 |
| Phase 4 (Advanced) | 23 | ~305 hours | Weeks 19–26 |
| Phase 5 (Platform Expansion) | 60 | ~480 hours | Weeks 27–36 |
| Phase 6 (Web Presence Redesign) | 32 | ~235 hours | Weeks 37–42 |
| **Total** | **192** | **~1,545 hours** | **~42 weeks** |

---

## Appendix B: Research Sources

The following deep research was conducted to produce this plan:

1. **Agentic Software Development** — Multi-agent architecture patterns, AutoGen/Semantic Kernel/LangChain, AI safety/guardrails, Responsible AI (NIST AI RMF, ISO 42001), MLOps/LLMOps, agent testing,
API design, state management, error handling, observability. Results documented in [AGENTIC-SOFTWARE-DEVELOPMENT-REPORT.md](AGENTIC-SOFTWARE-DEVELOPMENT-REPORT.md).

2. **Government & Military Standards** — USACE ER/EP series, ERDC publication standards, NEPA documentation, MIL-STD-498, MIL-STD-40051, DIDs, CDRL, TDP, Federal Plain Language, OMB A-130, NIST SP
800-53 documentation, FedRAMP documentation, FISMA, NARA records management, DoD 5015.02-STD, retention schedules, MIL-HDBK-61A configuration management, ISO 9001, CMMI. Results documented in
[GOVERNMENT-STANDARDS-COMPLIANCE-REPORT.md](GOVERNMENT-STANDARDS-COMPLIANCE-REPORT.md).

3. **Technical Writing Standards** — IEEE 1063/830, DITA, S1000D, ASD-STE100, Microsoft/Google/GPO style guides, information architecture, topic-based authoring, single-source publishing, content
strategy, documentation-as-code, vale/textlint/markdownlint, readability scoring, Docs-as-Code, OpenAPI, ADRs, editorial workflows. Results documented in
[TECHNICAL-WRITING-AND-ACCESSIBILITY-REPORT.md](TECHNICAL-WRITING-AND-ACCESSIBILITY-REPORT.md).

4. **Section 508 & Accessibility** — Revised Section 508 (2018), WCAG 2.1/2.2, VPAT 2.5, DHS Trusted Tester v5.1, axe-core/WAVE/Lighthouse/Pa11y/ARC, JAWS/NVDA/VoiceOver testing, WAI-ARIA 1.2, SPA
accessibility, COGA cognitive accessibility, mobile accessibility, shift-left accessibility, champions programs, remediation planning, monitoring governance.

5. **Security, CUI & Data Protection** — CUI program (32 CFR 2002), NIST CSF 2.0, NIST SP 800-171 Rev 2/3, CMMC 2.0, OWASP Top 10/ASVS/API Security, FedRAMP, SBOM (EO 14028), SLSA, NIST Privacy
Framework, PIAs/SORNs, NIST SSDF SP 800-218, SAST/DAST/SCA, Zero Trust (NIST SP 800-207, DoD ZTA).

6. **Codebase Audit** — Full audit of all HTML pages, server code, middleware, routes, client JS, compliance data, templates, documentation, logs, and package.json against all standards above.

7. **Full-Stack Software Development** — Frontend/backend architecture patterns, Twelve-Factor App methodology, database design (relational, NoSQL, migrations), REST/GraphQL API design, OpenAPI 3.0,
authentication patterns (JWT, OAuth 2.0, OIDC), DevOps/CI-CD pipelines, code quality (linting, formatting, static analysis), performance optimization (caching, CDN, lazy loading, code splitting),
monorepo tooling (Nx, Turborepo), error handling (RFC 7807), health checks, rate limiting, configuration management.

8. **Progressive Web App (PWA) Development** — W3C Web App Manifest, Service Workers API, Workbox strategies (precaching, runtime caching, stale-while-revalidate), IndexedDB offline storage,
Background Sync API, Push API (VAPID), Badging API, install prompt UX (beforeinstallprompt), cache versioning, update flows, Lighthouse PWA audit criteria, PWA security (HTTPS, CSP, SRI), app
distribution (web, TWA, Microsoft Store).

9. **Mobile Application Development (iOS & Android)** — Native development (Swift/SwiftUI, Kotlin/Jetpack Compose), cross-platform frameworks (React Native, Flutter, .NET MAUI, Kotlin Multiplatform),
OWASP MASVS v2.0 (AUTH, STORAGE, NETWORK, PLATFORM, CODE, RESILIENCE), OWASP MASTG, Apple Human Interface Guidelines, Material Design 3, mobile-specific accessibility (Dynamic Type, VoiceOver,
TalkBack, switch control), biometric authentication, secure keychain/keystore, certificate pinning, app store submission/review, Fastlane CI/CD, mobile crash reporting.

10. **IDE & Developer Tooling** — VS Code workspace configuration, EditorConfig, Dev Containers (devcontainer.json), AI-assisted development (Copilot, Cursor, Windsurf, Codeium), Language Server
Protocol, Debug Adapter Protocol, extension recommendations, task/launch configurations, Git hooks (husky, lint-staged, commitlint), JetBrains code style integration, remote development (SSH, WSL,
containers), snippet libraries, team standardization patterns.

11. **Coding Language Best Practices** — JavaScript/TypeScript (ESLint strict, ECMAScript 2024+, TypeScript 5.x strict mode, Node.js best practices), Python (PEP 8, PEP 484, Black, Ruff, mypy), Rust
(Edition 2024, Clippy, cargo-audit), Go (Effective Go, staticcheck, govulncheck), C# (.NET conventions, Roslyn analyzers), Swift (API Design Guidelines, SwiftLint), Kotlin (Coding Conventions,
detekt), SQL (SQLFluff, style guides), HTML/CSS (W3C Validator, Stylelint, BEM), Shell (ShellCheck, POSIX compliance), Semantic Versioning, Conventional Commits, JSDoc/TSDoc/docstring standards.

12. **Desktop Application Development** — Framework comparison (Electron, Tauri, WPF, WinUI 3, .NET MAUI, Qt, GTK, SwiftUI, Avalonia, Flutter Desktop), auto-update mechanisms (Squirrel,
electron-updater, Tauri updater), native file system integration, system tray/menu bar, cross-platform packaging (MSIX, DMG, AppImage, Flatpak, Snap), code signing (Authenticode, Apple Developer ID,
notarization), desktop security (context isolation, sandbox, CSP, no remote code execution), OS-level accessibility (UI Automation, macOS Accessibility API, ATK/AT-SPI), deep linking/protocol
handlers, crash reporting, local-first architecture.

13. **Web Presence & UX Audit (February 2026)** — Complete codebase review of all 7 HTML pages (index.html 616 lines, dashboard.html 927 lines, templates.html 135 lines, compliance.html 213 lines,
mbai.html 142 lines, docs.html 165 lines, portal.html 180 lines), all 8 CSS files (5,925 total lines), all 10 JS files (8,729 total lines), navigation system (7 separate nav implementations with
inconsistencies), header/menu architecture (flat 9-item menu overflowing at 1024px, no dropdowns, no mega-menu), visual design audit (emoji icons, missing footers, no design system documentation,
dark-only theme, no Open Graph/structured data, no analytics on sub-pages), glossary/tooltip needs assessment (200+ undefined acronyms across compliance, MBAi, and documentation content).

---

_This plan is a living document. It should be reviewed and updated at the end of each phase. Items may be reprioritized based on client requirements, contract obligations, or emerging standards._
