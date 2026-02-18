# Comprehensive Research Report: Technical Writer-Editor Best Practices & Section 508 Compliance

**Prepared:** February 14, 2026  
**Scope:** Industry standards, documentation architecture, quality metrics, government standards, Section 508 compliance, WCAG 2.1/2.2, accessibility testing, accessible document formats, and federal accessibility requirements.  
**Application Context:** Web application (structured-for-growth)

---

## TABLE OF CONTENTS

- [TOPIC 1: Technical Writer-Editor Best Practices](#topic-1-technical-writer-editor-best-practices)
  - [1. Technical Writing Standards & Style Guides](#1-industry-standards-for-technical-writing)
    - [1.1–1.7 ISO/IEEE/DITA/S1000D/STE Standards](#11-dita-darwin-information-typing-architecture)
    - [1.8 Microsoft Writing Style Guide](#18-microsoft-writing-style-guide)
    - [1.9 Google Developer Documentation Style Guide](#19-google-developer-documentation-style-guide)
    - [1.10 Chicago Manual of Style](#110-chicago-manual-of-style-for-technical-publications)
    - [1.11 Apple Style Guide](#111-apple-style-guide)
    - [1.12 AP Stylebook](#112-associated-press-ap-stylebook)
    - [1.13 APA Publication Manual](#113-apa-publication-manual-7th-edition)
    - [1.14 IEEE Standards for Technical Documentation](#114-ieee-standards-for-technical-documentation)
  - [2. Documentation Architecture](#2-documentation-architecture)
    - [2.1–2.10 IA, CMS, Single-Source, Topic-Based, Structured, Reuse, Version Control, Docs-as-Code, OpenAPI, README](#21-information-architecture-patterns)
    - [2.11 AsyncAPI Documentation](#211-asyncapi-documentation-standard)
    - [2.12 Changelog and Release Notes Best Practices](#212-changelog-and-release-notes-best-practices)
  - [3. Quality Metrics for Documentation](#3-quality-metrics-for-documentation)
    - [3.1–3.6 Readability, Coverage, Time-to-First-Success, Task Completion, Search, Translation](#31-readability-scores)
    - [3.7 User Satisfaction Measurement](#37-user-satisfaction-measurement)
    - [3.8 Time-to-Resolution Metrics](#38-time-to-resolution-metrics)
    - [3.9 Content Freshness and Accuracy Tracking](#39-content-freshness-and-accuracy-tracking)
  - [4. Government Technical Writing Standards](#4-government-technical-writing-standards)
    - [4.1–4.5 Plain Language, GPO, DoD Standards, TMCR, IETMs](#41-federal-plain-language-guidelines)
    - [4.6 CUI Marking Requirements](#46-cui-marking-requirements)
    - [4.7 Classification Marking Standards](#47-classification-marking-standards)
    - [4.8 Government Report Formats](#48-government-report-formats-dd-forms-sf-forms)
    - [4.9 Controlled Correspondence Procedures](#49-controlled-correspondence-procedures)
    - [4.10 Military Writing Standards (AR 25-50)](#410-military-writing-standards-ar-25-50)
  - [5. Technical Editor Best Practices](#5-technical-editor-best-practices)
    - [5.1 Levels of Editing](#51-levels-of-editing)
    - [5.2 Editorial Workflows and Review Cycles](#52-editorial-workflows-and-review-cycles)
    - [5.3 Style Sheet Development and Maintenance](#53-style-sheet-development-and-maintenance)
    - [5.4 Consistency Checking](#54-consistency-checking)
    - [5.5 Fact-Checking and Verification Processes](#55-fact-checking-and-verification-processes)
    - [5.6 Version Control for Documents](#56-version-control-for-documents)
    - [5.7 Collaborative Editing Workflows](#57-collaborative-editing-workflows)
  - [6. Content Strategy](#6-content-strategy)
    - [6.1 Content Auditing Methodologies](#61-content-auditing-methodologies)
    - [6.2 Content Governance Frameworks](#62-content-governance-frameworks)
    - [6.3 Taxonomy and Metadata Standards](#63-taxonomy-and-metadata-standards)
    - [6.4 Search Optimization for Documentation](#64-search-optimization-for-documentation)
    - [6.5 Content Lifecycle Management](#65-content-lifecycle-management)
    - [6.6 Localization and Internationalization Readiness](#66-localization-and-internationalization-il10n-readiness)
  - [7. Structured Data & Metadata](#7-structured-data--metadata)
    - [7.1 Dublin Core Metadata Standard](#71-dublin-core-metadata-standard)
    - [7.2 Schema.org for Web Content](#72-schemaorg-for-web-content)
    - [7.3 Document Metadata for Government Records](#73-document-metadata-for-government-records)
    - [7.4 OSCAL (Open Security Controls Assessment Language)](#74-oscal-open-security-controls-assessment-language)
- [TOPIC 2: Section 508 Compliance and Accessibility](#topic-2-section-508-compliance-and-accessibility)
  - [1. Section 508 (Rehabilitation Act)](#1-section-508-rehabilitation-act)
  - [2. WCAG 2.1/2.2 Compliance](#2-wcag-2122-compliance)
  - [3. Accessibility Testing](#3-accessibility-testing)
  - [4. Accessible Document Formats](#4-accessible-document-formats)
  - [5. DoD & Federal Accessibility Requirements](#5-dod--federal-accessibility-requirements)

---

# TOPIC 1: Technical Writer-Editor Best Practices

## 1. Industry Standards for Technical Writing

### 1.1 DITA (Darwin Information Typing Architecture)

**What it is:** DITA is an OASIS-approved XML-based open standard for structuring, developing, managing, and publishing technical content. Maintained by the OASIS DITA Technical Committee, the current approved standard is DITA 1.3 (approved December 2015, with Errata 02 approved June 2018). DITA defines a set of document types (topics) for authoring and organizing content, with built-in support for content reuse through specialization, conref (content reference), and key-based referencing.

**Why it matters:**
- Enables single-source publishing — write once, publish to multiple formats (HTML, PDF, EPUB, etc.)
- Built-in content reuse reduces redundancy and maintenance overhead
- Specialization allows domain-specific extensions without breaking the base architecture
- Industry-wide adoption across defense, aerospace, IT, and medical device sectors
- Facilitates translation and localization through structured markup

**Key requirements:**
- Content organized into typed topics: Concept, Task, Reference, Glossary, Troubleshooting
- DITA maps define topic organization and hierarchy
- Content references (`conref`, `conkeyref`) for reuse
- Conditional processing attributes (`audience`, `platform`, `product`) for filtering
- Relationship tables for linking between topics
- Specialization constraints for domain-specific vocabulary

**Web application implementation guidance:**
- Adopt topic-based thinking: break documentation into discrete, self-contained topics
- Use structured HTML5 with semantic elements that parallel DITA typing (e.g., `<article>` for topics, `<section>` for subtopics)
- Implement metadata tagging on content blocks using `data-*` attributes to support filtering
- If not using DITA XML directly, mirror DITA principles: typed content, maps for navigation, and content reuse mechanisms
- Consider Lightweight DITA (LwDITA) for web-native authoring in XDITA (XML), HDITA (HTML5), or MDITA (Markdown)

---

### 1.2 S1000D (International Specification for Technical Publications)

**What it is:** S1000D is an international specification for the procurement and production of technical publications, originally developed for defense/aerospace but now used across industries. It uses a Common Source DataBase (CSDB) model and defines Data Modules as the smallest self-contained units of information.

**Why it matters:**
- Mandated by many defense procurement contracts worldwide (NATO nations)
- Ensures interoperability of technical data across suppliers and nations
- Supports Interactive Electronic Technical Manuals (IETMs)
- Covers the full lifecycle of technical publications from planning to delivery

**Key requirements:**
- Data Module Code (DMC) identification system for granular content tracking
- Applicability filtering for product variants
- Business Rules Exchange (BREX) for validation
- Publication modules for assembly and delivery
- Support for five levels of IETM presentation (Level 1 through Level 5)
- Common Source DataBase management

**Web application implementation guidance:**
- Adopt modular content architecture: each documentation unit should be independently addressable via URL
- Implement a content identification/numbering scheme for traceability
- Use applicability metadata to show/hide content based on user context (product version, role, etc.)
- For defense-related projects, plan content structure around Data Module concepts from the outset
- Implement versioning and change tracking at the content module level

---

### 1.3 ASD-STE100 (Simplified Technical English)

**What it is:** ASD-STE100 is a controlled language specification developed by the AeroSpace and Defence Industries Association of Europe (ASD). It restricts vocabulary and grammar rules to improve clarity, reduce ambiguity, and aid translation. The specification consists of Writing Rules (Part 1) and a Dictionary (Part 2) of approximately 900 approved general words.

**Why it matters:**
- Reduces ambiguity in safety-critical documentation
- Improves comprehension for non-native English speakers
- Reduces translation costs by 20-40% through consistent terminology
- Mandatory in many aerospace and defense contracts
- Proven to reduce reading errors and improve task completion

**Key requirements:**
- Maximum sentence length: 20 words (procedural), 25 words (descriptive)
- One instruction per sentence
- Use approved words from the STE dictionary only (technical names exempted)
- Active voice mandatory in procedures
- No more than one level of subordination in paragraphs
- Consistent use of approved verb forms
- No "empty" verbs (e.g., use "adjust" not "make an adjustment")

**Web application implementation guidance:**
- Set writing guidelines that limit sentence length (20–25 words)
- Maintain a controlled vocabulary/terminology database for UI labels, error messages, and help text
- Use active voice in all procedural content (steps, instructions)
- Implement readability checks in your CI/CD pipeline using linters (e.g., `vale`, `textlint`)
- Create a style dictionary specific to your application domain
- One action per instruction in any step-by-step procedures

---

### 1.4 ISO/IEC/IEEE 26511 — Requirements for Managers of Information for Users

**What it is:** Part of the ISO/IEC/IEEE 2651x family of standards for information development. ISO/IEC/IEEE 26511 specifies requirements for managers who direct the information development process, including planning, managing, and improving information for users of systems, software, and services.

**Why it matters:**
- Provides a framework for managing documentation projects professionally
- Defines roles, responsibilities, and processes for information development
- Establishes requirements for information development plans
- Supports continuous improvement of documentation quality

**Key requirements:**
- Information management plan covering scope, schedule, resources, and quality
- User analysis and task analysis requirements
- Content quality assurance processes
- Metrics for measuring documentation effectiveness
- Configuration management for documentation assets
- Risk management for documentation projects

**Web application implementation guidance:**
- Create an Information Development Plan for each major release
- Define documentation roles (writer, reviewer, approver) in your project management system
- Integrate documentation milestones into sprint/release planning
- Track documentation metrics (coverage, freshness, user feedback) in dashboards
- Establish a documentation change control process aligned with code change management

---

### 1.5 ISO/IEC/IEEE 26512 — Requirements for Acquirers and Suppliers of Information for Users

**What it is:** Defines requirements for the acquisition and supply of information (documentation) as part of software and systems procurement. It establishes expectations for both buyers (acquirers) and sellers (suppliers) regarding documentation deliverables.

**Why it matters:**
- Ensures documentation quality requirements are part of contracts and SLAs
- Defines acceptance criteria for documentation deliverables
- Provides a shared framework between client and vendor for documentation expectations

**Key requirements:**
- Documentation requirements in Requests for Proposal (RFPs)
- Acceptance criteria and quality thresholds
- Delivery format specifications
- Review and approval procedures
- Intellectual property and rights management for documentation

**Web application implementation guidance:**
- Include documentation requirements in any vendor procurement specifications
- Define documentation deliverables (user guides, API docs, release notes) in contracts
- Specify acceptance criteria: readability scores, accessibility compliance, format requirements
- Require VPATs or ACRs for documentation tools procured
- Include documentation maintenance requirements in SLAs

---

### 1.6 ISO/IEC/IEEE 26513 — Requirements for Testers and Reviewers of Information for Users

**What it is:** Specifies processes for testing and reviewing information for users. It defines methods for evaluating documentation quality including usability testing, technical accuracy reviews, and editorial reviews.

**Why it matters:**
- Formalizes documentation quality assurance
- Provides structured review methodologies
- Ensures documentation is tested with actual users
- Defines criteria for documentation pass/fail decisions

**Key requirements:**
- Technical accuracy review procedures
- Usability testing with representative users
- Editorial review checklists (grammar, style, consistency)
- Accessibility review requirements
- Test reporting and defect tracking
- Documentation validation against source material

**Web application implementation guidance:**
- Implement peer review for all documentation (treat docs like code — pull request reviews)
- Conduct usability testing on help content and onboarding flows
- Create editorial checklists specific to your style guide
- Run automated checks (link validation, spelling, style compliance) in CI
- Track documentation defects in the same issue tracker as code defects
- Perform accessibility reviews on all published documentation

---

### 1.7 ISO/IEC/IEEE 26514 — Design and Development of Information for Users

**What it is:** The most directly applicable standard in the 2651x family. It provides comprehensive requirements and recommendations for the design and development of information (documentation) for users of systems, software, and services. Covers the full lifecycle from analysis through design, development, and evaluation.

**Why it matters:**
- Provides the most detailed guidance on creating user-facing documentation
- Covers user analysis, task analysis, information design, and evaluation
- Applicable to all forms of user information: embedded help, manuals, online help, tutorials
- Internationally recognized standard for documentation quality

**Key requirements:**
- User and task analysis before writing
- Information architecture design
- Style guide adherence
- Consistent terminology
- Appropriate content types (conceptual, procedural, reference)
- Content testing and evaluation
- Accessibility requirements for documentation
- Localization and internationalization considerations

**Web application implementation guidance:**
- Conduct user research before designing help systems — who are the users, what tasks do they perform?
- Design information architecture based on user tasks, not system structure
- Create and maintain a project style guide (or adopt Google/Microsoft)
- Use consistent terminology throughout the application and its documentation
- Provide multiple content types: getting-started guides, how-to procedures, reference docs, troubleshooting
- Test documentation with real users before release
- Plan for internationalization from the start (externalize strings, support RTL)

---

### 1.8 Microsoft Writing Style Guide

**What it is:** Microsoft's comprehensive guide to writing style and terminology for all communication about technology — apps, websites, documentation, and white papers. Publicly available at learn.microsoft.com/en-us/style-guide/. It replaced the older "Microsoft Manual of Style" book and is continuously updated.

**Why it matters:**
- De facto industry standard for technical documentation style
- Covers voice, tone, grammar, formatting, accessibility, and global communication
- Used as a reference by the Google Developer Documentation Style Guide
- Free and continuously updated
- Extensive guidance on bias-free communication and inclusive language

**Key requirements:**
- Warm, relaxed, crisp, and clear voice
- Second person ("you") for addressing users
- Active voice preferred
- Present tense for most instructions
- Bias-free and inclusive language
- Accessibility in writing (alt text, heading structure, plain language)
- Global-ready writing (avoid idioms, culturally specific references)
- Specific conventions for UI elements, code, commands, and file paths

**Web application implementation guidance:**
- Adopt as primary style reference for all user-facing text (UI strings, help, error messages)
- Follow Microsoft conventions for describing UI interactions ("select," not "click on")
- Use their accessibility writing guidelines for alt text and ARIA labels
- Apply bias-free communication guidelines to all content
- Use their global communication guidelines if serving international audiences
- Reference their word list for consistent technology terminology

---

### 1.9 Google Developer Documentation Style Guide

**What it is:** Google's editorial guidelines for writing clear and consistent technical documentation, targeted at software developers and technical practitioners. Available at developers.google.com/style. It provides detailed guidance on tone, grammar, formatting, HTML usage, code samples, and API documentation.

**Why it matters:**
- Purpose-built for developer-facing documentation
- Openly licensed (Creative Commons Attribution 4.0)
- Extremely detailed guidance on formatting code, API references, and command-line content
- Establishes a reference hierarchy: project style → Google guide → Chicago Manual of Style / Microsoft guide
- Includes specific guidance on accessibility, inclusive language, and global audiences

**Key requirements:**
- Conversational but professional tone
- Active voice, present tense, second person
- Specific code formatting conventions (inline code, code blocks, placeholders)
- Heading structure and list formatting standards
- Link text that is descriptive, not "click here"
- Accessibility requirements for images, tables, and multimedia
- Markdown vs. HTML guidance
- Semantic HTML tagging requirements

**Web application implementation guidance:**
- Use as primary reference for developer documentation (API docs, README, SETUP guides)
- Follow their code sample formatting standards
- Apply their heading hierarchy rules (sentence case, no terminal punctuation)
- Use their link text guidelines ("For more information, see [Configuring widgets]" rather than "click here")
- Follow their HTML semantic tagging guidance for web-published docs
- Adopt their image alt text and figure caption conventions

---

### 1.10 Chicago Manual of Style (for Technical Publications)

**What it is:** The authoritative reference for American English style, grammar, and usage, published by the University of Chicago Press. Now in its 18th edition. While not specifically a technical writing guide, it serves as the foundational style reference for grammar, punctuation, citation, and usage questions not covered by technology-specific guides (both Google and Microsoft reference it as a fallback).

**Why it matters:**
- Ultimate authority on American English grammar and usage
- Referenced by both Google and Microsoft style guides as a fallback
- Provides definitive guidance on citation, bibliography, and attribution
- Covers complex grammar, punctuation, and usage questions exhaustively

**Key requirements:**
- Serial (Oxford) comma usage
- Number style rules (spell out one through nine, use numerals for 10 and above — note: technical writing often overrides this)
- Citation and attribution formats
- Capitalization rules (title case vs. sentence case)
- Hyphenation and compound word rules
- Lists and enumeration formatting

**Web application implementation guidance:**
- Use as the fallback reference for grammar and usage questions not addressed by your primary tech style guide
- Follow its serial comma guidance for consistency
- Adopt its capitalization rules for headings (unless project style overrides)
- Use its citation format for any third-party content attribution in docs
- Reference for complex punctuation questions (em dashes, en dashes, colons with lists, etc.)

---

### 1.11 Apple Style Guide

**What it is:** Apple's official style guide for writing about Apple products, technologies, and developer documentation. Available to Apple Developer Program members and applied across Apple's developer documentation at developer.apple.com. The guide enforces Apple-specific terminology, capitalization, and tone, and has influenced broader technology writing conventions. It is regularly updated to reflect new product names, technologies, and interface paradigms (e.g., SwiftUI, visionOS, spatial computing).

**Why it matters:**
- Defines authoritative terminology for the Apple ecosystem (macOS, iOS, iPadOS, watchOS, visionOS, tvOS)
- Sets conventions widely adopted outside Apple (e.g., "tap" vs. "click" for touch interfaces, "select" for general actions)
- Covers multi-platform documentation patterns relevant to any cross-platform product
- Emphasizes respect for user intelligence — avoids condescension while remaining accessible
- Provides guidance on referring to hardware, software, and services consistently

**Key requirements:**
- **Terminology precision:** Use official Apple product names exactly (e.g., "iPhone," never "iphone" or "I-phone"; "macOS," not "MacOS")
- **Action verbs for UI:** "Tap" for touch, "click" for mouse, "select" for either
- **Possessives:** Avoid "your" before Apple product names — say "the iPhone" not "your iPhone" in generic contexts
- **Contractions:** Allowed and encouraged for conversational tone
- **Articles:** Capitalize "the" only at the start of a sentence when preceding a product name
- **Inclusive language:** Gender-neutral pronouns, avoid ableist language
- **Code references:** Use monospace for code, method names in camelCase without parentheses in prose
- **Interface elements:** Bold UI element names, use exact on-screen text

**Web application implementation guidance:**
- Adopt Apple's multi-platform terminology model: define device-specific action verbs (tap, click, select) and apply them consistently based on platform context
- Mirror Apple's approach to API documentation structure: declaration, overview, parameters, return value, discussion, see also
- Use Apple's inclusive language guidelines as a supplement to Microsoft/Google's guidelines
- For cross-platform web applications, adopt the platform-agnostic verb "select" as default
- Reference Apple Style Guide when documenting features that interact with Apple ecosystems

**Tools:**
- Apple Developer Documentation portal (developer.apple.com/documentation)
- Xcode documentation authoring tools (DocC)
- Swift-DocC for API documentation generation

---

### 1.12 Associated Press (AP) Stylebook

**What it is:** The Associated Press Stylebook and Briefing on Media Law, commonly known as the AP Stylebook. The authoritative style reference for journalism and public-facing communications, maintained by the Associated Press since 1953. Updated annually (currently the 57th edition). While designed for news writing, its conventions are widely adopted for press releases, marketing content, blog posts, case studies, and any public-facing business communications.

**Why it matters:**
- Standard for press releases, case studies, client-facing reports, and marketing content produced by consulting firms
- Familiar to communications professionals, public affairs offices, and government public information officers
- Widely adopted for business writing outside pure technical documentation
- Governs conventions for numbers, dates, titles, abbreviations that often conflict with other style guides — requiring explicit style decisions
- Essential reference for any content that may be repurposed for media consumption

**Key requirements:**
- **Numbers:** Spell out one through nine; use figures for 10 and above (differs from CMOS)
- **Dates:** Month Day, Year format (Feb. 14, 2026); abbreviate months with six or more letters
- **Titles:** Capitalize formal titles before names, lowercase after ("President Smith" but "Smith, the president")
- **Abbreviations:** State abbreviations use AP style (not postal codes) in text — "Calif." not "CA"
- **Serial comma:** NOT used (differs from CMOS and most tech writing guides)
- **Web/Internet:** Lowercase "internet," "web," "website" (updated in 2016)
- **Time:** Use figures with a.m./p.m. (lowercase, periods)
- **Percent:** Use the % sign with figures
- **Quotation marks:** Periods and commas inside; semicolons and colons outside
- **Headlines:** Only capitalize first word and proper nouns (sentence case)

**Web application implementation guidance:**
- Use AP Style for client-facing communications, proposals, and marketing content
- When platform generates reports or case studies for external audiences, follow AP conventions
- Create a style decision matrix that specifies when to use AP Style vs. tech style guides:
  - **Technical documentation, help, developer docs:** Microsoft/Google style guide
  - **Press releases, case studies, blog posts, proposals:** AP Stylebook
  - **Government documents:** GPO Style Manual
  - **Formal reports and analysis:** CMOS or APA
- Implement style-switching capability in content templates
- Train content creators on the key differences between AP and technical style

**Tools:**
- AP Stylebook Online (apstylebook.com) — subscription-based web reference
- AP Lingofy — browser extension for AP style checking
- Vale linter with AP style rules package
- Grammarly (supports AP style checking in premium)

---

### 1.13 APA Publication Manual (7th Edition)

**What it is:** The Publication Manual of the American Psychological Association, 7th Edition (2019). The standard style guide for academic and professional writing in the social sciences, education, business, and many STEM fields. It provides comprehensive guidance on manuscript structure, citation format, bias-free language, tables and figures, and statistical presentation. APA style is widely required for research reports, white papers, program evaluations, and analysis documents in both academic and government contexts.

**Why it matters:**
- Required style for research reports, program evaluations, and analysis documents in many government contracts
- Provides the most rigorous citation and attribution system for source material
- Establishes standards for presenting statistical data, research findings, and evidence-based arguments
- Increasingly adopted in business for formal analytical reports and proposals
- Bias-free language guidelines are among the most comprehensive and progressive
- Critical for any consulting deliverables that include research, data analysis, or evidence-based recommendations

**Key requirements:**
- **Document structure:** Title page, abstract, body (introduction, method, results, discussion), references, appendices
- **In-text citations:** Author-date system — (Smith, 2024) for paraphrase; (Smith, 2024, p. 15) for direct quote
- **Reference list:** Alphabetical by author surname; hanging indent; DOI or URL for electronic sources
- **Headings:** Five levels of heading hierarchy with specific formatting:
  - Level 1: Centered, Bold, Title Case
  - Level 2: Left-Aligned, Bold, Title Case
  - Level 3: Left-Aligned, Bold Italic, Title Case
  - Level 4: Indented, Bold, Title Case, Ending with Period. Text begins on same line.
  - Level 5: Indented, Bold Italic, Title Case, Ending with Period. Text begins on same line.
- **Numbers:** Use figures for 10 and above; spell out below 10 (with many exceptions for measurements, statistics, ages, etc.)
- **Bias-free language:** Guidelines for age, disability, gender, racial/ethnic identity, sexual orientation, socioeconomic status
- **Tables and figures:** Numbered, titled, noted; accessible formatting required
- **Statistical reporting:** Specific formats for p-values, effect sizes, confidence intervals

**Web application implementation guidance:**
- Use APA style for research deliverables, analysis reports, and evidence-based consulting documents
- Implement APA citation support in document templates (in-text citations + reference list generation)
- Create report templates that follow APA manuscript structure (abstract, headings, references)
- Apply APA's five-level heading hierarchy in formal analytical documents
- Use APA table and figure formatting conventions for data presentations in compliance reports
- Implement APA's bias-free language guidelines as part of content review checklist
- For platform-generated analytical reports, auto-format statistical output per APA conventions

**Tools:**
- Zotero, Mendeley, EndNote — reference management with APA format support
- Citation Machine / EasyBib — automated APA citation generation
- APA Style CENTRAL — official APA writing, citing, and learning resource
- Purdue OWL — comprehensive free APA formatting guide
- LaTeX `apa7` package for programmatic APA formatting
- Google Docs / Microsoft Word APA templates

---

### 1.14 IEEE Standards for Technical Documentation

**What it is:** The Institute of Electrical and Electronics Engineers (IEEE) publishes standards and guidelines that govern technical documentation for engineering, software, and systems development. Key documentation standards include IEEE 1063 (software user documentation), IEEE 26511-26515 (the joint ISO/IEC/IEEE series on information for users), IEEE 830 (software requirements specifications — now superseded by ISO/IEC/IEEE 29148), and the IEEE Editorial Style Manual for conference and journal submissions.

**Why it matters:**
- Sets formal requirements for software user documentation structure and content
- Defines standards for software requirements specifications used worldwide
- Provides journal/conference paper formatting standards widely used in engineering and CS
- Forms the basis for many government and defense contract documentation requirements
- IEEE citation style is standard in engineering, computer science, and technical fields
- Increasingly relevant as IEEE 2675-2021 covers DevOps documentation practices

**Key standards for technical documentation:**

| Standard | Title | Scope |
|----------|-------|-------|
| IEEE 1063-2001 | Standard for Software User Documentation | Structure, content, format for end-user docs |
| IEEE 26511 | Requirements for Managers of User Documentation | Managing documentation projects |
| IEEE 26512 | Requirements for Acquirers and Suppliers of User Documentation | Procurement of documentation |
| IEEE 26513 | Requirements for Testers and Reviewers of Documentation | Testing and reviewing documentation |
| IEEE 26514 | Requirements for Designers and Developers of User Documentation | Design and development process |
| IEEE 29148-2018 | Requirements Engineering (supersedes IEEE 830) | Requirements specification format |
| IEEE 1016-2009 | Software Design Descriptions | Architecture documentation |
| IEEE 2675-2021 | DevOps Standard | DevOps practices including docs-as-code |
| IEEE 828-2012 | Configuration Management in Systems and Software Engineering | CM for documentation assets |

**Key requirements (IEEE 1063 — Software User Documentation):**
- Documentation must include: identification data, introduction, information for use of the documentation, concept of operations, procedures, information on software commands, error messages, glossary
- Task orientation: documentation organized around user tasks, not software features
- Document must identify intended audience and required prerequisites
- Must include complete error message listing with explanations and recovery procedures
- Navigational aids: table of contents, index, cross-references
- Warnings, cautions, and notes must be clearly identified and placed before the relevant step

**IEEE Citation Style:**
- Numbered references in square brackets: [1], [2], [3]
- References listed in order of appearance (not alphabetical)
- Author initials before surname: J. K. Smith
- Article titles in quotation marks, book/journal titles in italics
- Include DOI where available

**Web application implementation guidance:**
- Use IEEE 1063 as a checklist for help system completeness:
  - ☐ Product identification and version
  - ☐ Introduction with purpose and scope
  - ☐ Concept of operations (how the system works conceptually)
  - ☐ Task-based procedures
  - ☐ Command/function reference
  - ☐ Error messages with explanations
  - ☐ Glossary of terms
  - ☐ Index or search
- Adopt IEEE 29148 for requirements documentation templates
- Use IEEE 1016 structure for architecture decision records (ADRs)
- Apply IEEE 2675 guidance for integrating documentation into DevOps pipelines
- Use IEEE citation style for any technical references in documentation
- Align documentation review processes with IEEE 26513 requirements

**Tools:**
- IEEE Author Center — templates and formatting tools
- LaTeX `IEEEtran` document class
- Overleaf IEEE templates
- IEEE Xplore for standards access
- DOORS (IBM) for IEEE 29148-compliant requirements management

---

## 2. Documentation Architecture

### 2.1 Information Architecture Patterns

**What it is:** Information Architecture (IA) is the structural design of shared information environments. For documentation, IA defines how content is organized, labeled, navigated, and searched. Common patterns include hierarchical (tree), hub-and-spoke, matrix, sequential, and database models.

**Why it matters:**
- Determines whether users can find and understand information
- Poor IA is the #1 cause of documentation failure regardless of content quality
- Directly impacts search effectiveness, task completion rates, and user satisfaction
- Affects scalability — good IA accommodates growth without reorganization

**Key requirements:**
- Clear taxonomy and categorization of content
- Consistent navigation patterns across documentation
- Effective labeling system (clear, predictable names)
- Multiple access paths (navigation, search, cross-references, indexes)
- User-centered organization (by task/goal, not by system structure)
- Scalable structure that accommodates new content without reorganization

**Web application implementation guidance:**
- Organize documentation by user task/goal, not by system module
- Implement breadcrumb navigation showing user's location in hierarchy
- Provide both navigation (browse) and search access to all content
- Use consistent labeling — same term for the same concept everywhere
- Create a documentation sitemap and review it with users
- Implement progressive disclosure: overview → details → reference
- For this project: organize by client journey (onboarding → compliance → templates → portal)

---

### 2.2 Content Management System Requirements

**What it is:** The system and processes for creating, storing, managing, and delivering documentation content. Can range from a full CMS (WordPress, Drupal, Contentful) to static site generators (Hugo, Docusaurus, MkDocs) to docs-as-code approaches (Markdown in Git).

**Why it matters:**
- Enables collaborative authoring and review workflows
- Provides version control and change tracking
- Supports content reuse and cross-referencing
- Enables multi-channel publishing (web, PDF, in-app help)
- Critical for maintaining content at scale

**Key requirements:**
- Version control with change tracking and history
- Role-based access control (author, reviewer, publisher)
- Workflow support (draft → review → approved → published)
- Search and metadata capabilities
- Multi-format output (HTML, PDF, etc.)
- Content reuse mechanisms (includes, templates, snippets)
- Integration with development tools (IDEs, CI/CD, issue trackers)

**Web application implementation guidance:**
- For this project's scale, a docs-as-code approach is recommended:
  - Markdown files in the Git repository alongside code
  - Static site generator for publishing (Docusaurus, VitePress, or MkDocs)
  - Pull request workflow for documentation review
  - CI/CD pipeline for automated publishing
- Maintain documentation in the same repository as code for synchronized versioning
- Use front matter metadata in Markdown files for categorization and filtering
- Implement automated link checking and style linting in the build pipeline

---

### 2.3 Single-Source Publishing

**What it is:** A methodology where content is authored once in a single source format and then published to multiple output formats and channels. The source content may be XML (DITA, DocBook), Markdown, or structured HTML, and output may include web pages, PDFs, in-app help, mobile docs, and print.

**Why it matters:**
- Eliminates content duplication and inconsistency
- Reduces maintenance effort — fix once, publish everywhere
- Ensures all channels have the same accurate information
- Reduces translation costs (translate once per content unit)

**Key requirements:**
- Format-neutral source content (separating content from presentation)
- Build/transformation pipeline that generates multiple outputs
- Conditional processing for audience/platform-specific content
- Consistent styling across outputs via templates/stylesheets
- Automated build and publish processes

**Web application implementation guidance:**
- Author documentation in Markdown (format-neutral)
- Use a build pipeline to generate HTML for the web and PDF for downloadable docs
- Apply conditional content using metadata flags (e.g., `[admin-only]` sections)
- Maintain presentation styling separately from content (CSS for web, PDF templates for print)
- Integrate with Vite build process for documentation output alongside the application

---

### 2.4 Topic-Based Authoring

**What it is:** A modular writing methodology where each piece of content is a self-contained "topic" that addresses a single subject and can stand alone. Topics are classified by type (concept, task, reference, troubleshooting) and assembled into deliverables via maps or navigation structures. Originated with DITA but applicable universally.

**Why it matters:**
- Enables content reuse — topics can appear in multiple publications
- Supports non-linear reading — users can jump to any topic
- Aligns with how users actually seek information (specific questions, not cover-to-cover reading)
- Simplifies maintenance — update one topic, update everywhere it appears
- Supports search-driven and task-driven access patterns

**Key requirements:**
- Each topic is self-contained (doesn't require reading other topics first)
- Topics are typed: Concept (what/why), Task (how-to), Reference (specifications/lists), Troubleshooting (problem/solution)
- Topics are assembled via navigation structures (maps, tables of contents)
- Titles are descriptive and task-oriented (e.g., "Configure email notifications" not "Email")
- Consistent structure within each topic type

**Web application implementation guidance:**
- Structure all documentation as discrete topics, one per page/section
- Use consistent templates for each topic type:
  - **Concept:** Title → Overview → Key points → Related links
  - **Task:** Title → Prerequisites → Steps → Result → What's next
  - **Reference:** Title → Description → Table/list of details → Notes
  - **Troubleshooting:** Title → Symptom → Cause → Solution
- Keep topics independent — use cross-references rather than sequential dependencies
- Use descriptive, task-oriented titles for all documentation pages

---

### 2.5 Structured Authoring

**What it is:** Writing content within a defined structure (schema) that separates content from formatting and enforces consistency through constrained authoring environments. Content conforms to a defined information model (e.g., DITA DTD, JSON Schema, Markdown with front matter templates) rather than being free-form.

**Why it matters:**
- Enforces consistency across all documentation
- Enables automated processing, transformation, and validation
- Supports content reuse and single-source publishing
- Facilitates search, filtering, and personalization
- Reduces training time for new authors

**Key requirements:**
- Defined content models/schemas for each content type
- Constrained authoring environment (templates, schemas, or structured editors)
- Metadata requirements for all content units
- Separation of content and presentation
- Validation against the schema before publication

**Web application implementation guidance:**
- Define Markdown templates with required front matter fields for each content type
- Example front matter schema:
  ```yaml
  ---
  title: "Required"
  type: "concept | task | reference | troubleshooting"
  audience: "admin | client | developer"
  lastReviewed: "YYYY-MM-DD"
  status: "draft | review | published"
  ---
  ```
- Validate documentation structure in CI/CD pipeline
- Use linting tools (markdownlint, vale) to enforce structure rules
- Create authoring templates for each content type

---

### 2.6 Content Reuse Strategies

**What it is:** Systematic approaches to writing content once and using it in multiple contexts. Strategies include transclusion (embedding content from one file into another), content references (pointing to shared content), variables/snippets (reusable text fragments), conditional content (different content for different audiences), and templating.

**Why it matters:**
- Reduces content duplication and inconsistency
- Cuts maintenance effort dramatically
- Ensures accuracy — single source of truth for repeated information
- Reduces translation volume and cost

**Key requirements:**
- Identify reusable content units (warnings, legal text, product names, common procedures)
- Maintain a shared content library (snippets, includes, partials)
- Use variables for product names, versions, URLs that may change
- Implement conditional content for audience-specific variations
- Track content reuse relationships (where is each snippet used?)

**Web application implementation guidance:**
- Create a `/docs/shared/` directory for reusable content snippets
- Use Markdown includes or partials for repeated content (e.g., security warnings, contact info)
- Define variables for product name, version, URLs in a central config file
- Use conditional rendering for admin vs. client content
- Document all reuse relationships so updates propagate intentionally

---

### 2.7 Version Control for Documentation

**What it is:** Applying software version control practices (Git) to documentation. Documentation files are tracked in a version control system with full history, branching, merging, and diff capabilities. Documentation versions are tied to product versions.

**Why it matters:**
- Complete audit trail of all documentation changes
- Ability to maintain documentation for multiple product versions simultaneously
- Enables collaborative editing with conflict resolution
- Supports rollback if errors are introduced
- Aligns documentation delivery with software release cycles

**Key requirements:**
- Documentation stored in a version control system (Git)
- Branching strategy aligned with product release branching
- Meaningful commit messages for documentation changes
- Tagging/labeling documentation versions to match product releases
- Diff tools that work with documentation formats

**Web application implementation guidance:**
- Store all documentation in the same Git repository as application code
- Use the same branching strategy (feature branches, main, release branches)
- Tag documentation versions with release tags
- Require pull request reviews for documentation changes
- Use meaningful commit messages: "docs: add compliance framework setup guide"
- Configure `.gitattributes` for proper diff handling of documentation files

---

### 2.8 Documentation as Code (Docs-as-Code)

**What it is:** A philosophy and methodology that applies software development practices to documentation: version control (Git), code review (pull requests), automated testing (linting, link checking), continuous integration/deployment (CI/CD), and issue tracking. Documentation is written in lightweight markup (Markdown, AsciiDoc, reStructuredText) and built through automated pipelines.

**Why it matters:**
- Developers are more likely to contribute to docs when processes match their workflow
- Automated quality checks catch errors before publication
- Documentation is always in sync with code when in the same repository
- Enables preview environments for documentation changes
- Reduces tooling overhead — same tools for code and docs

**Key requirements:**
- Lightweight markup format (Markdown recommended for web projects)
- Version control (Git)
- Automated build pipeline (static site generator)
- Automated quality checks (linting, link checking, spell checking)
- Pull request-based review workflow
- Continuous deployment to production
- Issue tracker integration for documentation work

**Web application implementation guidance:**
- This project is well-suited for docs-as-code:
  - Documentation already exists as Markdown files in `/docs/`
  - Git version control is already in use
  - Vite build pipeline can be extended for documentation
- Add markdownlint configuration (`.markdownlint.json`)
- Add vale linter for style checking (`.vale.ini`)
- Add link checking to the CI pipeline
- Create a `docs/` build step in the Vite configuration
- Set up automatic deployment of documentation with application deployments

---

### 2.9 API Documentation Standards (OpenAPI/Swagger)

**What it is:** OpenAPI Specification (OAS, formerly Swagger) is the industry-standard, language-agnostic interface description for RESTful APIs. It allows both humans and machines to understand API capabilities without access to source code. The specification defines endpoints, operations, parameters, authentication, request/response schemas, and more in a structured YAML or JSON format.

**Why it matters:**
- Machine-readable API descriptions enable automated tooling
- Auto-generation of interactive documentation (Swagger UI, Redoc)
- Auto-generation of client SDKs and server stubs
- Contract-first API design
- Industry standard expected by API consumers
- Enables automated API testing

**Key requirements:**
- OpenAPI 3.0+ specification document (YAML or JSON)
- Complete endpoint documentation (paths, methods, parameters)
- Request/response schema definitions
- Authentication and authorization documentation
- Error response documentation
- Example requests and responses
- Server information and base URLs
- Descriptions written in clear, task-oriented language

**Web application implementation guidance:**
- Create an OpenAPI specification file for all server routes (auth, clients, compliance, etc.)
- Use `swagger-jsdoc` to generate OpenAPI spec from JSDoc comments in route handlers
- Serve interactive API documentation using `swagger-ui-express`
- Include example requests and responses for every endpoint
- Document error codes and error response formats
- Add authentication requirements to the spec
- Validate the OpenAPI spec in CI to catch breaking changes
- Consider adding a `/docs/api` endpoint to serve interactive API documentation

---

### 2.10 README-Driven Development

**What it is:** A development methodology where the README file is written before any code. The README serves as the initial design document, defining what the project does, how to use it, and what the API looks like. By writing the README first, developers think through the user experience before implementation.

**Why it matters:**
- Forces clear thinking about design and user experience before coding
- README serves as the first point of contact for all users
- Identifies design problems early, before code is written
- Ensures documentation exists from day one
- Sets expectations for contributors

**Key requirements:**
- Project title and description (one paragraph)
- Installation/setup instructions
- Quick start / basic usage example
- API or feature documentation
- Configuration options
- Contributing guidelines
- License information
- Badges (build status, test coverage, version)

**Web application implementation guidance:**
- The project's existing README.md should include:
  - Clear project description and purpose
  - Prerequisites (Node.js version, database requirements)
  - Quick setup instructions (reference SETUP.md for detail)
  - Environment variable documentation
  - Available scripts (npm commands)
  - Architecture overview (client/server structure)
  - Deployment instructions (reference render.yaml)
  - Contributing guidelines
  - License
- Keep README concise; link to detailed docs in `/docs/` for deep dives

---

### 2.11 AsyncAPI Documentation Standard

**What it is:** AsyncAPI is an open-source specification for defining asynchronous APIs, analogous to what OpenAPI/Swagger does for REST APIs. AsyncAPI describes event-driven architectures (EDA), message brokers, WebSocket APIs, MQTT, AMQP, Kafka, and other asynchronous communication patterns. The specification (currently v3.0) provides a machine-readable format for documenting message channels, operations, message schemas, and server bindings.

**Why it matters:**
- Event-driven and asynchronous architectures are increasingly common in modern platforms
- Provides standardized documentation for WebSocket, Server-Sent Events (SSE), and message queue integrations
- Enables code generation for consumers and producers from documentation
- Ensures consistency between API implementation and documentation
- Complements OpenAPI — together they cover the full spectrum of API communication patterns
- Growing adoption in enterprise and government systems using microservices

**Key requirements:**
- **AsyncAPI document structure:**
  - `asyncapi` — version identifier
  - `info` — title, version, description, contact, license
  - `servers` — connection details for message brokers
  - `channels` — named communication channels with publish/subscribe operations
  - `operations` — actions that can be performed on channels
  - `components` — reusable schemas, messages, security schemes
- **Message schemas:** JSON Schema for message payload validation
- **Channel bindings:** Protocol-specific configuration (WebSocket, Kafka, AMQP)
- **Security schemes:** OAuth2, API keys, certificates for async connections
- **Traits:** Reusable operation and message traits for DRY documentation

**Web application implementation guidance:**
- Document any WebSocket connections (e.g., real-time dashboard updates, notifications) using AsyncAPI
- Create AsyncAPI definitions alongside OpenAPI specs for complete API documentation coverage
- Use AsyncAPI Generator to produce HTML documentation from AsyncAPI definitions
- Integrate AsyncAPI validation into CI/CD pipeline to ensure docs match implementation
- For the structured-for-growth platform, document any real-time features (notifications, live updates) in AsyncAPI format

**Tools:**
- AsyncAPI Studio — visual editor for AsyncAPI documents
- AsyncAPI Generator — documentation and code generation from specs
- AsyncAPI CLI — validation and bundling tool
- Spectral — linting for AsyncAPI documents (same tool used for OpenAPI)
- Microcks — API mocking that supports AsyncAPI

---

### 2.12 Changelog and Release Notes Best Practices

**What it is:** Changelogs and release notes are structured records of notable changes made to a project across versions. The "Keep a Changelog" convention (keepachangelog.com) is the most widely adopted standard, based on Semantic Versioning (SemVer). Release notes are the user-facing counterpart — translating technical changes into impact-oriented communications for end users, clients, and stakeholders.

**Why it matters:**
- Provides a historical record of all changes for audit and compliance purposes
- Enables users and clients to understand what changed between versions
- Essential for government contracts that require configuration management audit trails
- Supports rollback decisions by documenting what was introduced in each version
- Demonstrates professionalism and transparency in a consulting context
- Required by many compliance frameworks (SOC 2, FedRAMP, CMMC)

**Key requirements:**

**Changelog (Keep a Changelog format):**
- Human-readable, not auto-generated from git log
- Reverse chronological order (newest first)
- Grouped by version with release date
- Changes categorized:
  - `Added` — new features
  - `Changed` — changes to existing functionality
  - `Deprecated` — soon-to-be-removed features
  - `Removed` — removed features
  - `Fixed` — bug fixes
  - `Security` — vulnerability fixes
- `Unreleased` section at top for in-progress changes
- Version headers linked to diff comparisons
- Follow Semantic Versioning: MAJOR.MINOR.PATCH

**Release Notes (user-facing):**
- Written in plain language, not developer jargon
- Focus on user impact, not implementation details
- Include: what's new, what's improved, what's fixed, known issues, upgrade instructions
- Highlight breaking changes prominently
- Include screenshots or GIFs for visual changes
- Provide migration guides for breaking changes
- Date-stamped and version-identified

**Web application implementation guidance:**
- Maintain a `CHANGELOG.md` in the project root following Keep a Changelog format
- Generate user-facing release notes from changelog entries for the client portal
- Automate changelog validation in CI (e.g., require changelog update in PRs)
- Use conventional commits (`feat:`, `fix:`, `docs:`, `chore:`) to facilitate changelog generation
- Display release notes in the application (e.g., "What's New" modal or page)
- Archive release notes for compliance audit trail
- For government clients, include release notes in formal deliverable packages

**Tools:**
- Conventional Commits specification (conventionalcommits.org)
- standard-version / release-please — automated versioning and changelog generation
- changesets — changelog management for monorepos
- semantic-release — fully automated versioning and publishing
- GitHub Releases — integrated release notes with tag management
- Towncrier — fragment-based changelog generation

---

## 3. Quality Metrics for Documentation

### 3.1 Readability Scores

**What it is:** Quantitative measures of how easy text is to read, based on factors like sentence length, word length, and syllable count. Common metrics include Flesch-Kincaid Grade Level, Flesch Reading Ease, Gunning Fog Index, Coleman-Liau Index, SMOG Index, and Automated Readability Index (ARI).

**Why it matters:**
- Provides objective measurement of text complexity
- Ensures content is appropriate for the target audience
- Required by Federal Plain Language Guidelines for government-facing content
- Correlates with user comprehension and task completion
- Supports accessibility — simpler text benefits users with cognitive disabilities

**Key metrics and targets:**

| Metric | Formula Basis | Target for Technical Docs | Target for Public-Facing |
|--------|--------------|--------------------------|-------------------------|
| Flesch Reading Ease | Sentence length + syllables/word | 40-60 | 60-70 |
| Flesch-Kincaid Grade | Same as above, mapped to US grade | 8-12 | 6-8 |
| Gunning Fog | Sentence length + complex words | 10-14 | 8-10 |
| Coleman-Liau | Characters/word + sentences/100 words | 10-14 | 8-10 |
| SMOG | Polysyllabic words per 30 sentences | 10-14 | 6-8 |
| ARI | Characters/word + words/sentence | 8-12 | 6-8 |

**Web application implementation guidance:**
- Measure readability of all user-facing content (UI text, help pages, error messages)
- Target Flesch-Kincaid Grade Level of 8 or below for public-facing content
- For technical/developer docs, Grade Level 10-12 is acceptable
- Integrate readability scoring into CI/CD pipeline using tools like `textstat` (Python) or `readability-scores` (npm)
- Add a vale or textlint linter rule that flags sentences over 25 words
- Review and simplify content that scores above target thresholds

---

### 3.2 Documentation Coverage Metrics

**What it is:** Measures of how completely the documentation covers the product's features, APIs, and user tasks. Similar to code coverage in testing — what percentage of the product is documented?

**Why it matters:**
- Identifies documentation gaps before users encounter them
- Provides a completeness benchmark for release readiness
- Helps prioritize documentation effort
- Required for some compliance frameworks

**Key metrics:**

| Metric | Description | Target |
|--------|-------------|--------|
| Feature coverage | % of features with documentation | 100% for GA features |
| API coverage | % of endpoints documented | 100% |
| Task coverage | % of user tasks with procedures | 90%+ |
| Error coverage | % of error codes with explanations | 100% |
| New feature docs | All new features documented at release | 100% |
| Screenshot currency | % of screenshots matching current UI | 95%+ |

**Web application implementation guidance:**
- Create a feature inventory and track documentation status for each feature
- For API routes, auto-generate coverage reports from OpenAPI spec vs. actual routes
- Maintain a task inventory based on user stories and verify documentation exists for each
- Track documentation status in the same project board as development work
- Flag any feature as "not release-ready" if documentation is missing
- Automate API documentation coverage: compare route definitions to OpenAPI spec entries

---

### 3.3 Time-to-First-Success

**What it is:** The elapsed time from when a user begins a task (e.g., setting up the application, completing a workflow) to when they achieve their first successful outcome. This is a critical user experience metric for documentation.

**Why it matters:**
- Directly measures documentation effectiveness
- Short time-to-first-success correlates with user adoption and satisfaction
- Long times indicate onboarding friction, which increases support costs and churn
- Industry benchmark: users who don't succeed within 15-30 minutes are at high risk of abandonment

**Key requirements:**
- Define measurable "success" for key user journeys
- Measure time from first contact with documentation to success
- Track across different user personas (admin, client, developer)
- Benchmark against competitors or industry standards
- Identify and eliminate friction points

**Web application implementation guidance:**
- Define "first success" for each user type:
  - Admin: successfully create first client account
  - Client: access portal and view their dashboard
  - Developer: clone, install, and run the application locally
- Instrument documentation pages with analytics (time on page, abandonment rates)
- Conduct timed usability tests with documentation
- Set targets: developer setup < 15 minutes, admin onboarding < 30 minutes
- Optimize the critical path: SETUP.md → first running instance

---

### 3.4 Task Completion Rates

**What it is:** The percentage of users who successfully complete a defined task using the documentation without requiring external assistance (support tickets, chat, phone calls).

**Why it matters:**
- Most direct measure of documentation utility
- Low completion rates indicate documentation failures
- Directly impacts support costs — each failed self-service interaction costs $15-50+ in support
- Key metric for ROI of documentation investment

**Key metrics:**

| Metric | Target |
|--------|--------|
| Self-service completion rate | 80%+ |
| Documentation-assisted completion | 90%+ |
| Escalation rate (docs → support) | <10% |
| Task abandonment rate | <15% |

**Web application implementation guidance:**
- Track common user tasks and measure completion rates
- Implement "Was this helpful?" feedback on documentation pages
- Monitor support tickets for issues that should be resolved by documentation
- Create documentation for the top 20 support ticket causes
- A/B test documentation changes and measure impact on completion rates
- Add contextual help within the application at known friction points

---

### 3.5 Search Effectiveness

**What it is:** Metrics measuring how well users can find information through search, including search success rate (found useful result), null result rate (no results returned), refinement rate (had to modify query), and time-to-find.

**Why it matters:**
- 50-80% of documentation users start with search
- Poor search is the #1 documentation complaint across industries
- Maps directly to user satisfaction and task completion
- Critical for large documentation sets

**Key metrics:**

| Metric | Target |
|--------|--------|
| Search success rate | >85% |
| Null result rate | <5% |
| Average queries per session | <2 |
| Click-through rate on first result | >50% |
| Search abandonment rate | <10% |

**Web application implementation guidance:**
- Implement full-text search on all documentation (Lunr.js, Algolia DocSearch, or Pagefind for static sites)
- Log search queries to identify what users look for
- Analyze null results to identify content gaps or terminology mismatches
- Add synonyms and aliases for common search terms
- Ensure search results include relevant context (snippets, not just titles)
- Optimize documentation page titles and headings for searchability
- Implement "Did you mean?" suggestions for common misspellings

---

### 3.6 Translation Readiness Scores

**What it is:** A composite metric evaluating how ready content is for translation and localization. Considers factors like controlled vocabulary adherence, sentence complexity, cultural neutrality, string externalization, and formatting suitability.

**Why it matters:**
- Translation costs are directly proportional to content complexity
- Poorly written source content multiplies translation errors
- Internationalization issues found post-translation are 5-10x more expensive to fix
- Federal government requirements may mandate multilingual access

**Key metrics:**

| Metric | Target |
|--------|--------|
| STE compliance | 90%+ |
| Average sentence length | <20 words |
| Idiom/colloquialism count | 0 |
| Cultural reference count | 0 |
| String externalization | 100% of UI strings |
| Hard-coded text in images | 0 |
| Date/number format flexibility | 100% |

**Web application implementation guidance:**
- Externalize all user-facing strings into locale files (e.g., `en.json`, `es.json`)
- Avoid idioms, slang, and culturally specific references in UI text and docs
- Use complete sentences (not sentence fragments assembled from variables)
- Avoid text embedded in images — use CSS/HTML text overlay
- Use Unicode-compatible fonts
- Support right-to-left (RTL) layouts if Arabic/Hebrew may be needed
- Use ICU MessageFormat for pluralization and gender-aware strings
- Design UI with 30-40% text expansion room (English → German/French is typically 20-35% longer)

---

### 3.7 User Satisfaction Measurement

**What it is:** Systematic methods for measuring how satisfied users are with documentation quality, usefulness, and findability. Combines quantitative feedback mechanisms (ratings, surveys, NPS) with qualitative methods (interviews, usability studies, comment analysis) to assess documentation effectiveness from the user's perspective.

**Why it matters:**
- Direct indicator of documentation value — the user defines success
- Identifies gaps between what documentation provides and what users need
- Satisfaction scores correlate with product adoption, retention, and support costs
- Provides actionable feedback for continuous improvement
- Demonstrates documentation ROI to stakeholders
- Required by ISO/IEC/IEEE 26514 for measuring documentation quality

**Key metrics and methods:**

| Method | Metric | Target |
|--------|--------|--------|
| Page-level feedback ("Was this helpful?") | Helpfulness rate | ≥80% positive |
| CSAT survey (1–5 scale) | Average CSAT score | ≥4.0/5.0 |
| Net Promoter Score (NPS) | NPS score | ≥30 |
| System Usability Scale (SUS) for docs | SUS score | ≥68 (above average) |
| Support ticket deflection | Self-service resolution rate | ≥70% |
| Time-on-page + bounce rate | Engagement | Low bounce + moderate time |
| Qualitative comment analysis | Sentiment distribution | ≥75% positive/neutral |

**Implementation approaches:**
- **Inline feedback widgets:** Binary (thumbs up/down) or 1–5 star rating on every documentation page
- **Periodic surveys:** Quarterly documentation satisfaction surveys targeting key user segments
- **Exit surveys:** Brief survey when users leave documentation (what brought them, did they find it?)
- **Support ticket analysis:** Categorize support tickets to identify documentation-addressable issues
- **Session recording:** Tools like Hotjar or FullStory to observe how users navigate documentation
- **A/B testing:** Test different documentation approaches and measure success metrics

**Web application implementation guidance:**
- Add a "Was this page helpful? Yes / No" widget to all documentation pages
- Implement optional comment field when users rate "No" — collect specific improvement feedback
- Track helpfulness scores per page in analytics dashboard
- Set alerts for pages dropping below 70% helpfulness threshold
- Conduct quarterly documentation NPS surveys with client and admin users
- Cross-reference support tickets with documentation pages to identify content gaps
- Report documentation satisfaction metrics alongside product satisfaction metrics

**Tools:**
- Hotjar — feedback widgets, session recording, surveys
- UserTesting — remote usability testing with documentation
- SurveyMonkey / Typeform — structured documentation surveys
- Google Analytics events — page-level feedback tracking
- Pendo — in-app documentation analytics and feedback
- Docsearch analytics (Algolia) — search effectiveness metrics

---

### 3.8 Time-to-Resolution Metrics

**What it is:** The measurement of how long it takes users to find answers to their questions or resolve issues using documentation. Encompasses time-to-find (locating the right content), time-to-understand (comprehending the solution), and time-to-apply (implementing the solution). Combines analytics data with user testing observations.

**Why it matters:**
- Directly measures documentation efficiency — users value their time above all
- Long resolution times indicate navigation, findability, or clarity problems
- Correlates with support escalation — users who can't resolve quickly contact support
- Enables ROI calculation: (average support cost × tickets deflected) = documentation value
- Benchmarking enables objective comparison of documentation quality across versions
- Critical for gov/enterprise clients where time is billable

**Key metrics:**

| Metric | Definition | Target |
|--------|-----------|--------|
| Time-to-find | Time from entering docs to reaching the relevant page | <60 seconds |
| Time-to-understand | Time spent reading before taking action | <3 minutes for common tasks |
| Time-to-resolve | Total time from question to successful resolution | <5 minutes (common), <15 min (complex) |
| Pages per session | Number of pages visited before resolution | ≤3 for common tasks |
| Search-to-success | Time from first search query to successful resolution | <2 minutes |
| Escalation rate | Percentage of doc visitors who then contact support | <10% |

**Measurement approaches:**
- **Analytics instrumentation:** Track page sequences, time-on-page, and exit pages
- **Task-based usability testing:** Give users realistic tasks and measure completion time
- **Support ticket timestamps:** Measure time between "searched docs" and "filed ticket" events
- **Instrumented tutorials:** Track step completion times in interactive documentation
- **A/B testing:** Compare resolution times between different content structures

**Web application implementation guidance:**
- Instrument documentation with event tracking: page_view → search → result_click → feedback
- Calculate average pages-per-session for documentation section
- Identify "dead-end" pages (high time-on-page + high exit rate = confusion)
- Identify "bounce" pages (low time-on-page + high exit rate = wrong content)
- Set resolution time targets for key user journeys and track them in dashboards
- Use session replay to observe actual resolution paths and identify friction
- Report time-to-resolution improvements to demonstrate documentation investment value

**Tools:**
- Google Analytics 4 — user journey and event tracking
- Mixpanel — funnel analysis for documentation paths
- Heap — automatic event capture for documentation interactions
- Custom instrumentation — server-side logging of user documentation interactions
- Lighthouse — page performance metrics that affect time-to-access

---

### 3.9 Content Freshness and Accuracy Tracking

**What it is:** A systematic approach to monitoring, measuring, and maintaining the currency and correctness of documentation content over time. Content freshness measures how recently content was reviewed or updated. Content accuracy measures whether the information is factually correct and reflects the current state of the product, process, or regulation being documented.

**Why it matters:**
- Stale documentation is worse than no documentation — it actively misleads users
- Products evolve faster than documentation — content drift is inevitable without tracking
- Compliance requirements mandate regular review cycles (e.g., CUI review every 3 years, NIST controls updated annually)
- Inaccurate documentation creates liability, especially in government and regulated environments
- Content freshness is a factor in search engine ranking and user trust
- Documentation debt compounds like technical debt if not actively managed

**Key metrics:**

| Metric | Definition | Target |
|--------|-----------|--------|
| Content age | Days since last substantive update | <180 days for active features |
| Review date compliance | % of pages reviewed within required cycle | 100% |
| Staleness index | Ratio of pages not reviewed in >6 months | <10% |
| Accuracy score | % of pages verified correct in last audit | ≥95% |
| Broken link rate | % of links returning 404 or redirect | 0% |
| Screenshot currency | % of screenshots matching current UI | 100% |
| Version alignment | % of docs matching current software version | 100% |

**Content freshness categories:**

| Status | Criteria | Action |
|--------|----------|--------|
| 🟢 Fresh | Updated within last 90 days | None |
| 🟡 Aging | Updated 91–180 days ago | Schedule review |
| 🟠 Stale | Updated 181–365 days ago | Priority review |
| 🔴 Expired | Not updated in >365 days | Immediate review or archive |

**Implementation approach:**
1. **Metadata tracking:** Add `last-reviewed`, `last-updated`, `review-by`, and `owner` metadata to every documentation page
2. **Automated alerts:** Trigger notifications when content enters "aging" or "stale" status
3. **Broken link monitoring:** Automated scheduled scans for broken internal and external links
4. **Screenshot validation:** Compare screenshot content against current UI (manual or visual regression)
5. **Change-triggered reviews:** When code changes, automatically flag related documentation for review
6. **Periodic audits:** Quarterly comprehensive content accuracy audits

**Web application implementation guidance:**
- Add frontmatter metadata to all documentation files:
  ```yaml
  last-updated: 2026-02-14
  last-reviewed: 2026-02-14
  review-by: 2026-08-14
  owner: content-team
  status: fresh
  ```
- Build a documentation dashboard that displays freshness status for all pages
- Integrate documentation review triggers into PR workflows (code changes → flag related docs)
- Run weekly broken link checks using linkinator, broken-link-checker, or similar tools
- Display "Last updated" dates on all documentation pages for user transparency
- Archive or clearly mark deprecated content rather than deleting it
- Implement a "content owner" assignment system — every page has an accountable owner

**Tools:**
- linkinator / broken-link-checker — automated broken link detection
- GitHub Actions — scheduled content freshness audits
- vale — prose linting including custom freshness rules
- Custom scripts — metadata-based freshness dashboard generation
- Algolia Crawler — index freshness monitoring for search
- Percy / Chromatic — visual regression for screenshot validation

---

## 4. Government Technical Writing Standards

### 4.1 Federal Plain Language Guidelines

**What it is:** Guidelines established under the Plain Writing Act of 2010 (Public Law 111-274), which requires all federal agencies to use plain language in public-facing documents. The guidelines are maintained by the Plain Language Action and Information Network (PLAIN), a cross-agency group. As of 2025, guidance is available at digital.gov/guides/plain-language (migrated from plainlanguage.gov).

**Why it matters:**
- Legal requirement for all federal agencies
- Directly improves public comprehension and compliance
- Reduces support costs, errors, and complaints
- Essential for accessibility — plain language benefits users with cognitive disabilities
- Applies to regulations, letters, forms, notices, instructions, and web content

**Key requirements:**
- **Write for your audience:** Identify and address your specific reader
- **Organize information:** Put the most important information first
- **Use simple words and phrases:** Avoid jargon and legalese
- **Use short sentences:** Average 15-20 words per sentence
- **Use active voice:** "We will review your application" not "Your application will be reviewed"
- **Use headings:** Break content into scannable sections
- **Use lists:** Present steps and items as bulleted or numbered lists
- **Use tables:** Present complex information in tabular format
- **Use "you" and "we":** Address the reader directly
- **Minimize definitions:** Use common words that don't need defining
- **Test with real users:** Verify comprehension through usability testing

**Web application implementation guidance:**
- Apply plain language principles to all user-facing content:
  - Error messages: "Enter your email address" not "Invalid input in field EMAIL_ADDR"
  - Form labels: Clear, descriptive, in sentence case
  - Navigation: Task-oriented labels ("View your reports" not "Report Module")
  - Help text: Direct, actionable, jargon-free
- Write at an 8th-grade reading level for public-facing content
- Use the Hemingway App or similar tool to evaluate readability during writing
- Train all content contributors on plain language principles
- Test critical user flows with representative users

---

### 4.2 Government Publishing Office (GPO) Style Manual

**What it is:** The official style guide of the United States Government Publishing Office, used by all branches of the federal government. The current edition is the 2016 edition (31st edition). It covers capitalization, abbreviations, numerals, punctuation, tabular work, indexes, and specialized styling for congressional and legal publications.

**Why it matters:**
- Official style reference for all federal government publications
- Required for any documentation that will be published through federal channels
- Provides authoritative guidance on government-specific terminology and formatting
- Covers specialized formatting for legal, legislative, and regulatory content

**Key requirements:**
- Government-specific capitalization rules (e.g., "the President," "the Government")
- Abbreviation standards for agency names, titles, and state names
- Number formatting (units, measurements, currencies)
- Tabular formatting standards
- Indexing requirements
- Footnote and endnote formatting
- Bibliographic citation format

**Web application implementation guidance:**
- Reference for any documentation that will be submitted to or reviewed by federal clients
- Follow GPO standards for government abbreviations and terminology
- Use GPO number formatting rules when presenting data to government audiences
- Follow GPO table formatting standards for compliance reports and data presentations
- For government-facing portals, align visual style with U.S. Web Design System (USWDS) which uses GPO conventions

---

### 4.3 Department of Defense Standardization Program

**What it is:** The DoD Standardization Program establishes policies and procedures for developing, maintaining, and using defense and federal standards. Governed by DoD Directive 4120.24 and DoD Instruction 4120.24, the program covers Military Standards (MIL-STDs), Military Specifications (MIL-SPECs), Defense Standards, and Performance Specifications. For technical publications, key standards include MIL-STD-3031 (technical data, general style and format), MIL-STD-40051 (technical manual preparation), and MIL-STD-38784 (standard practice for technical manuals).

**Why it matters:**
- Mandatory for any technical documentation under DoD contracts
- Defines structure, format, and content requirements for Technical Manuals (TMs)
- Establishes data management and delivery requirements
- Compliance is verified through Technical Manual Contract Requirements (TMCR)

**Key requirements:**
- Technical manual structure following standard military format
- Warning, caution, and note formatting per MIL-STD conventions
- Part numbering and cross-referencing systems
- Illustration standards and requirements
- Verification and validation procedures
- Data item deliverable requirements (CDRLs)
- Configuration management of technical data

**Web application implementation guidance:**
- If serving DoD clients, structure documentation output to align with MIL-STD-40051 format
- Implement warning/caution/note styling that matches military conventions:
  - **WARNING:** Potential for personal injury or death
  - **CAUTION:** Potential for equipment damage
  - **NOTE:** Essential information
- Support export of documentation in formats compatible with DoD data delivery requirements
- Track documentation deliverables against Contract Data Requirements Lists (CDRLs)
- Maintain configuration control of all technical content

---

### 4.4 Technical Manual Contract Requirements (TMCR)

**What it is:** TMCRs are contract specifications that define the requirements for developing, validating, verifying, and delivering technical manuals under government contracts. They specify the format, content, quality, and delivery mechanisms for technical documentation. TMCRs typically reference MIL-STDs for formatting and S1000D or MIL-STD-40051 for content structure.

**Why it matters:**
- Defines contractual documentation obligations
- Non-compliance can result in contract violations and payment withholding
- Specifies acceptance criteria for documentation deliverables
- Critical for DoD and other federal contracts requiring technical data

**Key requirements:**
- Documentation Development Plan (DDP)
- Verification reviews at draft milestones (Preliminary, Pre-Final, Final)
- Validation through hands-on testing with user representatives
- Quality assurance requirements (editing, accuracy checks)
- Change management and update procedures
- Delivery format specifications (print, electronic, IETM)
- Data rights and intellectual property provisions

**Web application implementation guidance:**
- Create a Documentation Development Plan template for government clients
- Implement multi-stage review workflows (draft → preliminary review → revised draft → final review → publication)
- Support export of documentation in required delivery formats
- Maintain documentation change history for audit purposes
- Implement validation procedures: subject matter expert review + user testing
- Track documentation deliverable status against contract milestones

---

### 4.5 Interactive Electronic Technical Manuals (IETMs)

**What it is:** IETMs are digital technical manuals that provide interactive access to technical information. The DoD defines five classes (levels) of IETMs, ranging from simple page images (Class 1) to fully AI-integrated expert systems (Class 5). IETMs replace paper-based technical manuals with searchable, hyperlinked, context-sensitive electronic documentation.

**Why it matters:**
- Modern standard for technical manual delivery in defense and aerospace
- Enables dynamic content: search, filtering, hyperlinking, applicability
- Reduces information retrieval time by 50-80% compared to paper manuals
- Supports multimedia (video, animation, 3D models)
- Enables real-time updates and revision management

**IETM Classes:**

| Class | Description | Features |
|-------|-------------|----------|
| 1 | Page image | Scanned pages, basic search |
| 2 | Scrolling text | Text-searchable, hyperlinked |
| 3 | Linear structured | Database-driven, filtered, navigable |
| 4 | Hierarchical | Interactive, context-sensitive, applicability filtering |
| 5 | Integrated | AI-driven, expert system, CBT integration |

**Web application implementation guidance:**
- A modern web application naturally supports Class 3-4 IETM capabilities:
  - Full-text search
  - Hyperlinked cross-references
  - Dynamic filtering and navigation
  - Context-sensitive help
  - Applicability-based content display
- Build help system as a Class 3/4 IETM:
  - Implement search with faceted filtering
  - Provide context-sensitive help (link help to current application context)
  - Support dynamic content based on user role and configuration
  - Include multimedia (screenshots, video walkthroughs, interactive demos)
  - Track user interaction analytics

---

## 5. Technical Editor Best Practices

### 5.1 Levels of Editing

**What it is:** A tiered framework that defines the depth and scope of editorial review applied to a document. Originally codified by the Jet Propulsion Laboratory (JPL) and later refined by the Council of Science Editors, levels of editing ensure that the appropriate type and intensity of review is applied to each document based on its purpose, audience, visibility, and risk.

**Why it matters:**
- Not all documents require the same editorial investment — a quick internal README doesn't need the same rigor as a compliance report for a federal client
- Establishes clear expectations between authors and editors about what the review covers
- Prevents scope creep in editorial reviews, keeping releases on schedule
- Ensures safety-critical and compliance documentation receives the most rigorous treatment
- Provides a vocabulary for discussing editorial needs across teams

**Standard levels:**

| Level | Name | Scope | Typical Use |
|-------|------|-------|-------------|
| **Level 1** | Proofreading | Spelling, punctuation, capitalization, formatting consistency, page numbering | Final pass before publication |
| **Level 2** | Copy Editing (Light) | Level 1 + grammar, syntax, style guide compliance, inconsistencies | Standard internal documentation |
| **Level 3** | Copy Editing (Heavy) | Level 2 + sentence restructuring, clarity improvements, terminology standardization, parallelism | Client-facing documentation |
| **Level 4** | Substantive / Developmental Editing | Level 3 + reorganization, content gaps, logical flow, audience alignment, information architecture | New documentation, major revisions |
| **Level 5** | Comprehensive / Rewrite | Full revision of content, structure, and presentation — may involve rewriting entire sections | Legacy content modernization, failed documentation |

**Web application implementation guidance:**
- Assign editing levels to documentation types:
  - **P0 — Level 4-5:** Compliance reports, government deliverables, client-facing proposals, accessibility statements
  - **P1 — Level 3:** User guides, help content, API documentation, onboarding flows
  - **P2 — Level 2:** Internal developer docs, README, SETUP guides, changelogs
  - **P3 — Level 1:** Code comments, commit messages, internal notes
- Include the assigned editing level in the document front matter or PR template
- Build editorial checklists for each level to ensure consistent review depth
- Track time spent per editing level to calibrate resource planning

---

### 5.2 Editorial Workflows and Review Cycles

**What it is:** Formalized processes that govern how documentation moves from initial draft through editorial review, technical validation, and final approval to publication. A well-designed workflow defines roles, handoffs, gates, and feedback mechanisms at each stage.

**Why it matters:**
- Prevents publication of inaccurate, inconsistent, or incomplete documentation
- Establishes accountability — every document has an author, reviewer, and approver
- Enables parallel workstreams without bottlenecking on a single editor
- Required by ISO/IEC/IEEE 26513 for documentation testing and review
- Government contracts (TMCRs) mandate multi-stage review with formal sign-off
- Reduces rework by catching issues early in the pipeline

**Standard editorial workflow:**

```
[1. Draft] → [2. Self-Review] → [3. Peer Review] → [4. Technical Review (SME)]
     ↓              ↓                   ↓                      ↓
  Author         Author            Peer writer            SME / Dev
                                                              ↓
[5. Editorial Review] → [6. Approval Gate] → [7. Publication] → [8. Post-Pub Review]
        ↓                      ↓                    ↓                    ↓
   Editor/QA            Lead / Stakeholder      Automated Build     Analytics / Feedback
```

**Stage descriptions:**

| Stage | Owner | Activities | Gate Criteria |
|-------|-------|-----------|---------------|
| 1. Draft | Author | Write initial content following templates and style guide | Content exists for all required sections |
| 2. Self-Review | Author | Check against style guide, run linters, verify links | Passes markdownlint, vale, spell check |
| 3. Peer Review | Peer Writer | Review for clarity, completeness, audience appropriateness | Peer approves or requests changes |
| 4. Technical Review | SME / Developer | Verify technical accuracy, correct procedures, valid code samples | SME signs off on accuracy |
| 5. Editorial Review | Editor | Copy edit per assigned editing level, style guide compliance | Meets editing level standards |
| 6. Approval | Lead / Stakeholder | Final review for strategic alignment and release readiness | Formal approval recorded |
| 7. Publication | Automated / Publisher | Build, deploy, distribute | CI/CD pipeline passes, links valid |
| 8. Post-Pub Review | Analytics | Monitor feedback, track freshness, plan updates | Helpfulness score ≥80% |

**Web application implementation guidance:**
- Implement this workflow using GitHub Pull Requests:
  - **Draft PR:** Author creates branch and writes content
  - **Self-review:** Author runs pre-commit hooks (linting, link checking)
  - **Peer review:** Assign PR to a second writer for review
  - **SME review:** Assign PR to a developer or subject matter expert
  - **Editorial review:** Assign PR to editor (or use automated tools for style checking)
  - **Approval:** Required approvals before merge (configure in repository settings)
  - **Publication:** Merge triggers CI/CD deployment
- Use PR templates with checklists for each review type
- Configure branch protection rules requiring minimum reviewers
- Label PRs with `docs:` prefix and editing level (`edit-level:3`)
- Track editorial cycle time (time from draft to publication) as a process metric

---

### 5.3 Style Sheet Development and Maintenance

**What it is:** A project-specific style sheet (not a CSS stylesheet) is an editorial reference document that records all style decisions made for a specific project, publication, or organization. It supplements the primary style guide (e.g., Microsoft, Google, AP) with project-specific terminology, formatting conventions, and exceptions. Sometimes called a "house style guide" or "project style addendum."

**Why it matters:**
- No external style guide covers every decision needed for a specific project
- Ensures consistency across multiple authors, editors, and releases
- Reduces editorial review time — decisions are recorded, not re-debated
- Prevents style drift as team members change
- Serves as the single source of truth for "how we write things here"

**Key components of a project style sheet:**

| Section | Content | Examples |
|---------|---------|----------|
| **Terminology** | Approved/rejected terms, preferred spellings | "log in" (verb) vs. "login" (noun/adj); "email" not "e-mail" |
| **Product names** | Official capitalization and spelling | "structured-for-growth" (always lowercase, hyphenated) |
| **Abbreviations** | First-use expansion requirements, approved acronyms | Define on first use: "Mission-Based Artificial Intelligence (MBAI)" |
| **Capitalization** | Title case vs. sentence case decisions | Sentence case for all headings; Title Case for navigation labels |
| **UI terminology** | Standard verbs for UI interactions | "Select" (not "click"); "Enter" (not "type"); "Go to" (not "navigate to") |
| **Date/time** | Format standard | ISO 8601 in code/API; "February 14, 2026" in user-facing text |
| **Numbers** | Numeral rules and exceptions | Numerals for all measurements; spell out "one" through "nine" in prose |
| **Formatting** | Bold, italic, code formatting rules | Bold for UI elements; `code` for file names, commands, API endpoints |
| **Voice and tone** | Persona, formality level, point of view | Second person ("you"), present tense, professional but approachable |
| **Exceptions** | Documented deviations from primary style guide | We use the serial comma (override AP Style for marketing content) |

**Web application implementation guidance:**
- Create a `docs/STYLE-GUIDE.md` file in the repository
- Base it on Google Developer Documentation Style Guide (for developer docs) and Microsoft Writing Style Guide (for user-facing content)
- Populate with project-specific decisions as they arise
- Encode style rules into a vale configuration file (`.vale.ini`) for automated enforcement
- Review and update the style sheet quarterly or with each major release
- Include the style sheet as required reading for all documentation contributors
- Track unresolved style questions in a backlog and batch-decide them periodically

---

### 5.4 Consistency Checking

**What it is:** Systematic methods for ensuring that documentation is internally consistent and externally aligned with the product's actual behavior, terminology, and interface. Consistency checking encompasses terminology, formatting, cross-references, naming, numbering, and visual presentation.

**Why it matters:**
- Inconsistency undermines user trust and increases cognitive load
- Users interpret inconsistent terminology as referring to different things, causing confusion
- Required by ISO/IEC/IEEE 26514: "Terminology shall be used consistently throughout the information"
- Automated consistency checking scales to large documentation sets

**Key consistency dimensions:**

| Dimension | Description | Check Method |
|-----------|-------------|-------------|
| **Terminology** | Same concept uses same term everywhere | vale terminology rules, manual audit |
| **Capitalization** | Consistent casing for product names, features, UI elements | vale capitalization rules, grep |
| **Formatting** | Consistent code formatting, bold/italic usage, list style | markdownlint, vale formatting rules |
| **Cross-references** | All internal links valid, targets exist | linkinator, markdown-link-check |
| **Naming** | File naming conventions followed | File naming linter, directory audit |
| **Numbering** | Consistent numbered list formatting, figure/table numbering | Manual audit, custom linter rules |
| **Voice and tone** | Consistent POV (second person), tense (present), formality level | vale voice rules |
| **Visual** | Consistent screenshot dimensions, annotation style, diagram formatting | Manual audit |
| **API alignment** | Documentation matches actual API behavior | OpenAPI spec validation, integration tests |
| **UI alignment** | Documented UI labels match actual application labels | Manual audit, visual regression |

**Automated consistency tools:**

| Tool | Purpose | Integration |
|------|---------|-------------|
| **vale** | Prose linting: style, terminology, voice, tone | CLI, CI/CD, VS Code extension |
| **markdownlint** | Markdown formatting consistency | CLI, CI/CD, VS Code extension |
| **textlint** | Pluggable text linting (Japanese + English) | CLI, CI/CD |
| **cspell** | Spell checking with custom dictionaries | CLI, CI/CD, VS Code extension |
| **linkinator** | Broken link detection, internal + external | CLI, CI/CD |
| **alex** | Catch insensitive, inconsiderate writing | CLI, CI/CD |
| **write-good** | Naïve linter for English prose | CLI, VS Code extension |

**Web application implementation guidance:**
- Install vale and create `.vale.ini` with Google or Microsoft style package
- Install markdownlint and create `.markdownlint.json` with project rules
- Add both to pre-commit hooks and CI/CD pipeline
- Create a terminology file (vale `accept.txt` and `reject.txt`) for project-specific terms
- Run link checking weekly on all documentation (internal + external links)
- Conduct quarterly manual consistency audits covering dimensions not caught by automation
- Create a visual style reference for screenshots and diagrams

---

### 5.5 Fact-Checking and Verification Processes

**What it is:** Systematic processes for verifying the accuracy of technical information in documentation. This includes verifying procedures produce the described results, code samples execute correctly, configuration values are accurate, URLs are valid, version numbers are current, and screenshots match the current UI.

**Why it matters:**
- Inaccurate documentation causes user failures, support tickets, and lost trust
- Technical debt in documentation compounds over time as the product evolves
- Government contracts may require documented verification procedures (TMCRs specify validation testing)
- Code samples that don't work are the #1 developer documentation complaint
- Incorrect procedures in safety- or compliance-critical contexts can cause regulatory violations

**Verification process:**

| Verification Type | Method | Frequency |
|-------------------|--------|-----------|
| **Procedural accuracy** | Walk through every step as documented, confirm result | Every release |
| **Code sample testing** | Execute all code snippets in a clean environment | Every release, automated in CI |
| **Screenshot currency** | Compare screenshots to current UI | Every release |
| **Link validation** | Check all internal and external links | Weekly (automated) |
| **API accuracy** | Compare documented endpoints/params to actual API | Every release (automated) |
| **Configuration values** | Verify defaults, ranges, formats against code | Every release |
| **Version references** | Verify all version numbers are current | Every release |
| **Regulatory references** | Verify cited regulations are current and correctly quoted | Quarterly |
| **Contact info** | Verify phone numbers, emails, URLs are current | Monthly |

**Web application implementation guidance:**
- Implement automated code sample testing:
  - Extract code blocks from Markdown files
  - Execute them in a sandboxed environment during CI
  - Fail the build if any documented code sample doesn't work
- Implement automated link checking in CI (weekly for external, every PR for internal)
- Implement automated API doc verification: compare OpenAPI spec against actual route handlers
- Create a verification checklist for SME reviewers in PR templates
- Archive screenshots with metadata (page, version, date) for comparison
- Assign a "verification owner" to each documentation page who is responsible for accuracy
- Use Percy or Chromatic for automated screenshot comparison

---

### 5.6 Version Control for Documents

**What it is:** Applying Git or similar version control systems to documentation files, enabling full change history, branching, diffing, and collaborative editing. Goes beyond code-level version control to include documentation-specific practices for versioning, branching, tagging, and maintaining multiple documentation versions simultaneously.

**Why it matters:**
- Full audit trail of every documentation change (who changed what, when, and why)
- Ability to maintain documentation for multiple product versions simultaneously (v1 docs, v2 docs)
- Enables rollback of erroneous changes
- Supports compliance requirements for change tracking and configuration management (IEEE 828)
- Aligns documentation release cycles with software release cycles
- Enables branch-based review workflows (pull requests)

**Key practices:**

| Practice | Description | Implementation |
|----------|-------------|----------------|
| **Meaningful commits** | Descriptive commit messages for doc changes | Use conventional commits: `docs(api): add authentication endpoint reference` |
| **Branching strategy** | Docs branch mirrors code branch | Create `docs/feature-X` branches alongside `feature-X` code branches |
| **Tagging** | Tag documentation versions with releases | `git tag -a v2.1.0 -m "Release 2.1.0 documentation"` |
| **Multi-version support** | Maintain docs for supported product versions | Versioned docs directories or branches: `/docs/v1/`, `/docs/v2/` |
| **Diff-friendly formats** | Use plain text formats that diff well | Markdown (not Word, not PDF) as source format |
| **Changelog linking** | Link doc changes to changelog entries | Reference issue/PR numbers in commit messages |
| **Access control** | Protect production docs from unreviewed changes | Branch protection rules requiring PR approval |

**Web application implementation guidance:**
- All documentation sources live in Git alongside application code
- Use the same branch protection rules for docs as for code
- Require at least one reviewer for documentation PRs
- Use conventional commit prefixes: `docs:`, `docs(api):`, `docs(compliance):`
- Tag documentation with release versions
- If supporting multiple active versions, use versioned directories or a docs platform with version switching (Docusaurus, MkDocs with mike)
- Configure `.gitattributes` for Markdown: `*.md diff=markdown`

---

### 5.7 Collaborative Editing Workflows

**What it is:** Processes and tools that enable multiple contributors — writers, developers, SMEs, editors, reviewers — to work on documentation simultaneously or asynchronously without conflicts, confusion, or duplicated effort.

**Why it matters:**
- Modern documentation is a team effort: writers draft, developers verify, editors polish, SMEs validate
- Without structured collaboration, content is duplicated, contradictory, or lost
- Asynchronous collaboration is essential for distributed teams
- Clear ownership and responsibility prevents the "diffusion of responsibility" problem (nobody updates docs because everybody should)

**Collaboration models:**

| Model | Description | Best For |
|-------|-------------|----------|
| **Fork-and-PR** | Contributors fork/branch, make changes, submit pull request | Open-source docs, developer contributions |
| **Assigned ownership** | Each doc page has a single owner responsible for currency | Ongoing maintenance of stable documentation |
| **Pair writing** | Writer + SME collaborate in real-time to create content | Complex technical content requiring domain expertise |
| **Editorial board** | Committee reviews and approves changes to controlled docs | Compliance documentation, style guide changes |
| **Community contribution** | External users can suggest edits (e.g., "Edit this page" link) | Developer documentation, knowledge bases |

**Web application implementation guidance:**
- Use the fork-and-PR model as the primary workflow (already natural with Git)
- Assign ownership for each documentation page using front matter metadata:
  ```yaml
  owner: "@username"
  contributors: ["@writer1", "@dev2"]
  ```
- Add an "Edit this page on GitHub" link to documentation pages for community contributions
- Use GitHub Issues + labels to track documentation work:
  - `docs:new` — new documentation needed
  - `docs:update` — existing docs need updating
  - `docs:bug` — documentation is incorrect
  - `docs:enhancement` — docs could be improved
- Create a CONTRIBUTING.md with documentation contribution guidelines
- Use GitHub CODEOWNERS file to auto-assign documentation reviewers:
  ```
  /docs/ @docs-team
  /docs/api/ @docs-team @api-team
  ```
- For complex documentation requiring real-time collaboration, use shared drafts in Google Docs or HackMD before formalizing in Markdown

**Tools:**
- GitHub / GitLab — PR-based review workflow
- VS Code Live Share — real-time collaborative editing
- HackMD / CodiMD — collaborative Markdown editing
- Google Docs — real-time collaboration for early drafts
- Notion — collaborative knowledge base for internal docs
- Confluence — enterprise wiki with structured review workflows

---

## 6. Content Strategy

### 6.1 Content Auditing Methodologies

**What it is:** A content audit is a systematic inventory and evaluation of all existing documentation content. It catalogs what content exists, where it lives, who owns it, when it was last updated, what condition it's in, and whether it serves its intended purpose. Content audits are the foundation of any content strategy initiative.

**Why it matters:**
- You can't improve what you haven't inventoried — most organizations have no idea how much documentation they have
- Identifies redundant, outdated, or trivial (ROT) content that degrades the user experience
- Reveals content gaps — topics users need but documentation doesn't cover
- Provides the baseline for measuring content strategy effectiveness
- Required for compliance: configuration management standards (IEEE 828) require asset inventories
- Reduces maintenance burden by identifying content to consolidate or retire

**Audit types:**

| Audit Type | Purpose | Output |
|-----------|---------|--------|
| **Quantitative audit** | Inventory all content assets | Spreadsheet of all pages, files, URLs, metadata |
| **Qualitative audit** | Evaluate content quality and relevance | Quality scores, recommendations per asset |
| **Competitive audit** | Compare content against competitors | Gap analysis, opportunity identification |
| **SEO audit** | Evaluate search performance of content | Keyword rankings, traffic, engagement metrics |
| **Accessibility audit** | Evaluate content accessibility | VPAT/ACR, per-page conformance status |
| **ROT audit** | Identify Redundant, Outdated, Trivial content | Content disposition recommendations |

**Audit spreadsheet columns:**

| Field | Description |
|-------|-------------|
| URL / File path | Location of the content |
| Title | Page or document title |
| Content type | Concept, task, reference, troubleshooting |
| Owner | Person responsible for content |
| Last updated | Date of last substantive change |
| Last reviewed | Date of last accuracy review |
| Word count | Volume metric |
| Readability score | Flesch-Kincaid grade level |
| Traffic / Views | Usage metric (if available) |
| Feedback score | Helpfulness rating (if collected) |
| Status | Fresh / Aging / Stale / Expired |
| Disposition | Keep / Update / Consolidate / Archive / Delete |

**Web application implementation guidance:**
- Conduct an initial content audit of all `/docs/`, `/client/`, and `/data/` content
- Create a content inventory spreadsheet or database tracking all documentation assets
- Classify each asset: keep, update, consolidate, archive, or delete
- Schedule recurring audits: full audit annually, ROT audit quarterly
- Automate quantitative audit data collection (file listings, dates, word counts) with scripts
- Add content audit findings to the project backlog as actionable work items
- Track ROT ratio as a health metric: `(redundant + outdated + trivial assets) / total assets`

---

### 6.2 Content Governance Frameworks

**What it is:** A content governance framework defines the policies, standards, roles, responsibilities, processes, and metrics that govern the creation, management, quality, and lifecycle of all documentation content. It answers the questions: Who can create content? What standards must it meet? How is it reviewed? When is it updated? When is it retired?

**Why it matters:**
- Without governance, content quality degrades over time as contributors come and go
- Ensures consistent quality regardless of who authors content
- Establishes accountability — prevents "nobody owns the docs" syndrome
- Required for compliance frameworks: ISO 27001 (document control), CMMC (asset management), FedRAMP (CM-3 Configuration Change Control)
- Scales documentation operations from ad-hoc to managed

**Governance framework components:**

| Component | Description | Deliverable |
|-----------|-------------|-------------|
| **Content policy** | Rules governing content creation, publication, and retirement | Content policy document |
| **Roles and responsibilities** | Who does what: author, reviewer, approver, publisher, owner | RACI matrix |
| **Standards and style** | Writing standards, formatting rules, accessibility requirements | Style guide + linter config |
| **Review and approval** | Process for reviewing and approving content | Workflow documentation |
| **Publishing process** | How content moves from draft to production | CI/CD pipeline documentation |
| **Maintenance cadence** | How often content is reviewed and updated | Review schedule |
| **Metrics and reporting** | How content quality is measured and reported | Dashboard specifications |
| **Escalation process** | How exceptions, disputes, and urgent changes are handled | Escalation procedures |

**RACI matrix for documentation:**

| Activity | Author | Editor | SME | Lead | Publisher |
|----------|--------|--------|-----|------|-----------|
| Drafting | **R** | C | C | I | — |
| Style compliance | C | **R** | — | I | — |
| Technical accuracy | I | — | **R** | I | — |
| Accessibility | C | **R** | — | A | — |
| Approval | I | I | C | **R/A** | — |
| Publication | — | — | — | A | **R** |
| Maintenance | **R** | C | C | A | — |

*R = Responsible, A = Accountable, C = Consulted, I = Informed*

**Web application implementation guidance:**
- Document governance framework in `docs/ADMIN-GUIDE.md` or a dedicated `docs/GOVERNANCE.md`
- Define RACI for documentation activities and publish it
- Configure GitHub branch protection rules to enforce the approval process
- Use CODEOWNERS file to auto-assign reviewers
- Create issue templates for documentation requests (new content, updates, corrections)
- Track governance compliance metrics: % of docs with owners, % reviewed on schedule, % meeting style standards
- Review governance framework annually and update as the team and product evolve

---

### 6.3 Taxonomy and Metadata Standards

**What it is:** A taxonomy is a hierarchical classification system that organizes content into categories and subcategories. Metadata is structured information about content (author, date, type, audience, status, keywords) that enables search, filtering, navigation, and management. Together, taxonomy and metadata form the backbone of information architecture.

**Why it matters:**
- Enables users to find content through browse (taxonomy) and search (metadata)
- Powers faceted navigation and filtering (e.g., "show me all admin procedures")
- Enables content reuse by making content discoverable and classifiable
- Supports governance: metadata enables automated freshness tracking, ownership reporting, and compliance checks
- Required by government records management standards (NARA, Dublin Core)
- Facilitates localization by identifying content by language, locale, and translation status

**Recommended taxonomy structure:**

```
Documentation
├── Getting Started
│   ├── Installation
│   ├── Configuration
│   └── Quick Start
├── User Guides
│   ├── Dashboard
│   ├── Compliance
│   ├── Templates
│   └── Portal
├── Administration
│   ├── User Management
│   ├── System Configuration
│   └── Backup and Recovery
├── API Reference
│   ├── Authentication
│   ├── Endpoints
│   └── Error Codes
├── Compliance
│   ├── Frameworks
│   ├── Reports
│   └── Auditing
├── Development
│   ├── Architecture
│   ├── Contributing
│   └── Testing
└── Release Notes
    ├── Current Release
    └── Archive
```

**Metadata schema (front matter):**

```yaml
---
title: "Page Title"                    # Required: descriptive title
description: "Brief summary"          # Required: 1-2 sentence description
type: concept | task | reference | troubleshooting  # Required: topic type
audience:                              # Required: target audience(s)
  - admin
  - client
  - developer
category: getting-started | user-guide | admin | api | compliance | dev  # Required
tags:                                  # Optional: keyword tags
  - authentication
  - security
author: "@username"                    # Required: original author
owner: "@username"                     # Required: current content owner
created: 2026-02-14                    # Required: creation date
last-updated: 2026-02-14              # Required: last substantive update
last-reviewed: 2026-02-14             # Required: last accuracy review
review-by: 2026-08-14                 # Required: next review deadline
status: draft | review | published | deprecated  # Required: lifecycle status
version: "2.1.0"                      # Optional: product version alignment
locale: en-US                         # Required: content language/locale
---
```

**Web application implementation guidance:**
- Define and publish the taxonomy in the style guide
- Require metadata front matter on all Markdown documentation files
- Validate front matter in CI/CD pipeline (use a schema validator like `gray-matter` + custom script)
- Build navigation from taxonomy categories (auto-generate sidebar/menus from metadata)
- Implement metadata-powered search filtering on documentation pages
- Use tags for cross-cutting concerns (a page can be in one category but have multiple tags)
- Export metadata to a documentation dashboard for governance reporting

**Tools:**
- gray-matter (npm) — front matter parsing
- JSON Schema — metadata validation
- Algolia — metadata-powered faceted search
- custom scripts — taxonomy enforcement and reporting

---

### 6.4 Search Optimization for Documentation

**What it is:** The discipline of making documentation content maximally findable through both site search and external search engines. Encompasses content structure optimization, metadata enrichment, search engine configuration, synonym management, and query analytics.

**Why it matters:**
- 50-80% of documentation users begin with search, not navigation
- Poor search is the #1 complaint about documentation across industries
- Search effectiveness directly impacts time-to-resolution and self-service success rates
- Government accessibility requirements mandate multiple ways to find content (WCAG 2.4.5)
- Search analytics reveal what users need but can't find — the highest-value content gaps

**Search optimization techniques:**

| Technique | Description | Implementation |
|-----------|-------------|----------------|
| **Descriptive titles** | Page titles that match user mental models and query language | Write titles as the question users ask: "How to configure email notifications" |
| **Header optimization** | H2/H3 headings that serve as section search anchors | Use task-oriented, specific headings |
| **Synonym mapping** | Map alternative terms to canonical terms | Configure search index synonyms: "login" = "sign in" = "authentication" |
| **Front matter metadata** | Structured data that enriches search results | Populate `description`, `tags`, `keywords` in front matter |
| **Content structure** | First paragraph summarizes the page's purpose | Lead with a one-sentence summary answering "what and why" |
| **Link text** | Descriptive anchor text that aids search relevance | "configure SMTP settings" not "click here" |
| **Anchor links** | Deep links to specific sections within pages | Auto-generate anchor IDs for all headings |
| **Search analytics** | Track and analyze search queries and results | Log queries, null results, click-throughs |
| **Null result management** | Handle zero-result searches gracefully | Show suggestions, related topics, contact options for null results |

**Web application implementation guidance:**
- Implement client-side search using Pagefind, Lunr.js, or Fuse.js for documentation pages
- OR integrate Algolia DocSearch (free for open-source; paid for commercial)
- Configure synonyms for domain-specific terminology
- Analyze search query logs monthly to identify:
  - Top queries (ensure these land on the right pages)
  - Null-result queries (create content or add synonyms)
  - High-refinement queries (improve initial result relevance)
- Add structured data (Schema.org `TechArticle`, `HowTo`) to documentation pages for SEO
- Ensure every documentation page has a unique, descriptive `<title>` and `meta description`
- Implement "Did you mean?" fuzzy matching for common misspellings

**Tools:**
- Pagefind — static site search, minimal config, lightweight
- Algolia — hosted search with analytics, synonyms, relevance tuning
- Lunr.js — client-side full-text search for small to medium doc sets
- Fuse.js — lightweight fuzzy search
- Meilisearch — open-source alternative to Algolia
- Google Search Console — SEO performance for public documentation

---

### 6.5 Content Lifecycle Management

**What it is:** The end-to-end management of documentation content from creation through publication, maintenance, and eventual retirement. A content lifecycle defines the stages content passes through, the actions required at each stage, and the criteria for moving content between stages.

**Why it matters:**
- Content without lifecycle management becomes stale, inaccurate, and harmful
- Documentation debt compounds like technical debt if not actively managed
- Compliance frameworks require documented content management processes (ISO 27001 A.5.1, CMMC CM practices)
- Government records management laws (Federal Records Act, 44 USC Chapter 31) impose retention and disposition requirements
- Active lifecycle management keeps the documentation set lean, accurate, and trustworthy

**Content lifecycle stages:**

```
[1. Plan] → [2. Create] → [3. Review] → [4. Publish] → [5. Maintain] → [6. Retire]
    ↑                                                         |              |
    └─────────────────────── Feedback Loop ───────────────────┘              |
                                                                             ↓
                                                                       [7. Archive]
```

| Stage | Activities | Exit Criteria |
|-------|-----------|---------------|
| **1. Plan** | Identify need, define audience, scope content, assign author | Content plan approved |
| **2. Create** | Draft content following templates, style guide, and schema | Draft complete, passes linting |
| **3. Review** | Peer review, SME review, editorial review, accessibility check | All reviews passed, approved |
| **4. Publish** | Build, deploy, announce, index for search | Live on production, searchable |
| **5. Maintain** | Monitor feedback, update for product changes, periodic review | Content remains fresh (<180 days) |
| **6. Retire** | Content no longer relevant; mark deprecated, redirect, remove from nav | Deprecation notice published |
| **7. Archive** | Move to archive with retention metadata; accessible but not promoted | Archived per retention policy |

**Retention and disposition:**

| Content Type | Retention Period | Disposition |
|-------------|-----------------|-------------|
| Compliance reports | 7 years | Archive |
| Audit logs | Per regulatory requirement | Archive |
| Release notes | Lifetime of product | Archive |
| User guides (current) | Until product version EOL | Update or archive |
| Internal dev docs | 3 years post-EOL | Delete |
| Government deliverables | Per contract (typically 5-7 years) | Archive |

**Web application implementation guidance:**
- Define lifecycle stages in the documentation governance framework
- Use `status` metadata field to track lifecycle stage: `draft → review → published → deprecated → archived`
- Automate lifecycle transitions where possible:
  - Content not reviewed in 180 days → auto-flag as "needs review"
  - Content not updated in 365 days → auto-flag as "stale"
  - Deprecated content → auto-add deprecation banner after 30 days
- Create a deprecation process:
  1. Mark content as deprecated in front matter
  2. Add a visible deprecation notice with link to replacement (if any)
  3. Remove from navigation after 90 days
  4. Archive after 180 days
- Schedule quarterly content reviews with content owners
- Report lifecycle metrics: % published, % in review, % stale, % deprecated

---

### 6.6 Localization and Internationalization (i18n/L10n) Readiness

**What it is:** Internationalization (i18n) is the process of designing documentation and software so that it can be adapted to different languages, regions, and cultures without engineering changes. Localization (L10n) is the actual process of adapting content for a specific locale — translating text, adjusting formatting, and adapting cultural references.

**Why it matters:**
- Executive Order 13166 requires federal agencies to provide meaningful access to programs for persons with limited English proficiency (LEP)
- Global reach: even domestic platforms may serve multilingual populations
- Internationalization is 10x cheaper to implement at design time than to retrofit
- Well-internationalized content reduces translation costs by 30-50%
- ASD-STE100 (Simplified Technical English) principles reduce translation costs by 20-40%

**Internationalization best practices:**

| Practice | Description | Implementation |
|----------|-------------|----------------|
| **Externalize strings** | All user-facing text in locale files, not hard-coded | `en.json`, `es.json`, etc. with keyed strings |
| **Use ICU MessageFormat** | Handle plurals, gender, and number formatting correctly | `{count, plural, one {# item} other {# items}}` |
| **Avoid string concatenation** | Don't build sentences from fragments — word order varies by language | Use complete sentences with placeholders |
| **Design for text expansion** | Allow 30-40% more space for translated text | Flexible layouts, no fixed-width text containers |
| **Support bidirectional text** | Support RTL languages (Arabic, Hebrew, Farsi) | CSS `dir="auto"`, logical properties (`margin-inline-start`) |
| **Cultural neutrality** | Avoid idioms, metaphors, humor, sports references, cultural assumptions | "Complete" not "home run"; "successful" not "hit it out of the park" |
| **Date/time formatting** | Use locale-aware formatting, not hard-coded | `Intl.DateTimeFormat`, ISO 8601 for storage |
| **Number formatting** | Use locale-aware number formatting | `Intl.NumberFormat` (1,000.50 vs. 1.000,50) |
| **Currency** | Display in user's locale format | `Intl.NumberFormat` with `style: 'currency'` |
| **Images and icons** | Avoid text in images; use culturally neutral icons | Text overlays via CSS/HTML; review icon cultural meanings |
| **Color meanings** | Colors carry different meanings in different cultures | Don't rely solely on color for meaning (also an a11y requirement) |
| **Name fields** | Don't assume Western name format (given/family) | Single "Full Name" field, or culturally flexible fields |
| **Address formats** | Address formats vary dramatically by country | Use flexible address forms, not US-centric |

**Translation management process:**

```
[Source content (en-US)] → [Content freeze] → [Export to TMS] → [Translation] →
[Review by in-country reviewer] → [QA testing in context] → [Import translated content] →
[Publish localized version] → [Ongoing maintenance sync]
```

**Translation Memory (TM) and Terminology Management:**
- **Translation Memory:** Database of previously translated segments; reuse reduces cost and ensures consistency across updates
- **Terminology base (termbase):** Controlled vocabulary of approved translations for key terms; prevents inconsistent translation of product names, features, and technical terms
- **Machine Translation Post-Editing (MTPE):** Use MT for initial translation, then human post-editing for quality; cost-effective for large volumes

**Web application implementation guidance:**
- Externalize all UI strings into JSON locale files:
  ```
  client/locales/en.json   — English source
  client/locales/es.json   — Spanish translation
  ```
- Use a lightweight i18n library (i18next, FormatJS, or LitLocalize for web components)
- Use `lang` attribute on `<html>` and on any elements in a different language
- Design CSS layouts using flexbox/grid with logical properties for RTL support
- Use `Intl` APIs for date, time, number, and currency formatting
- Avoid hard-coded date/number formats in documentation — use ISO 8601 in code, locale-formatted in UI
- If serving federal clients, assess LEP requirements per EO 13166
- Keep documentation in STE-compliant English to reduce translation costs
- Integrate with a Translation Management System (TMS) if localizing:
  - **Crowdin** — cloud-based, integrates with GitHub
  - **Phrase (Memsource)** — enterprise TMS with API
  - **Lokalise** — developer-friendly, CI/CD integration
  - **Transifex** — open-source friendly
  - **Weblate** — open-source, self-hosted option

**Internationalization testing checklist:**
- [ ] All user-facing strings externalized (no hard-coded text in HTML/JS)
- [ ] Pseudo-localization passes (simulated language with expanded characters)
- [ ] Layout accommodates 40% text expansion without breaking
- [ ] RTL layout rendering correct (if applicable)
- [ ] Dates, times, numbers formatted per locale
- [ ] No text embedded in images
- [ ] Unicode characters display correctly (including CJK, Arabic, Devanagari)
- [ ] Sorting and comparison functions are locale-aware
- [ ] Error messages use externalized strings with correct translations
- [ ] `lang` attribute correct on `<html>` and on mixed-language content

---

## 7. Structured Data & Metadata

### 7.1 Dublin Core Metadata Standard

**What it is:** Dublin Core (DC) is a standardized set of 15 core metadata elements for describing digital and physical resources. Published as ISO 15836 and ANSI/NISO Z39.85, it is the most widely adopted metadata standard for cross-domain resource description. Originally developed at OCLC (Online Computer Library Center) in Dublin, Ohio, in 1995.

**Why it matters:**
- International standard (ISO 15836) for resource description metadata
- Required or recommended by many government data management policies (NARA, Data.gov)
- Interoperable — enables cross-system metadata exchange
- Simple enough for any organization to implement, powerful enough for complex requirements
- Foundation for more specialized metadata schemas

**The 15 Dublin Core elements:**

| Element | Description | Example Value |
|---------|-------------|---------------|
| `dc.title` | Name given to the resource | "System Administration Guide" |
| `dc.creator` | Entity primarily responsible for creating content | "Structured for Growth Technical Team" |
| `dc.subject` | Topic of the resource | "system administration; user management; configuration" |
| `dc.description` | Account of the resource | "Guide for administrators to configure and manage the platform" |
| `dc.publisher` | Entity responsible for making the resource available | "Structured for Growth" |
| `dc.contributor` | Entity that contributed to the resource | "John Smith; Jane Doe" |
| `dc.date` | Date associated with the resource (ISO 8601) | "2026-02-14" |
| `dc.type` | Nature or genre of the resource | "Text" (per DCMI Type Vocabulary) |
| `dc.format` | File format, physical medium, or dimensions | "text/html" or "application/pdf" |
| `dc.identifier` | Unambiguous reference to the resource | "https://example.com/docs/admin-guide" |
| `dc.source` | Related resource from which this is derived | "Internal knowledge base article KB-1234" |
| `dc.language` | Language of the resource (ISO 639) | "en-US" |
| `dc.relation` | Related resource | "https://example.com/docs/user-guide" |
| `dc.coverage` | Spatial or temporal topic of the resource | "Version 2.0; US Federal Government" |
| `dc.rights` | IP rights held in and over the resource | "© 2026 Structured for Growth. All rights reserved." |

**Web application implementation guidance:**
- Add Dublin Core metadata as `<meta>` tags in HTML documentation pages:
  ```html
  <meta name="DC.title" content="System Administration Guide">
  <meta name="DC.creator" content="Structured for Growth">
  <meta name="DC.date" content="2026-02-14">
  <meta name="DC.type" content="Text">
  <meta name="DC.format" content="text/html">
  <meta name="DC.language" content="en-US">
  <meta name="DC.rights" content="© 2026 Structured for Growth. All rights reserved.">
  ```
- Include Dublin Core metadata in PDF document properties for generated reports
- Map front matter metadata fields to Dublin Core elements for consistency
- Use Dublin Core-compatible metadata when submitting data to government portals (Data.gov)

---

### 7.2 Schema.org for Web Content

**What it is:** Schema.org is a collaborative, community-driven vocabulary for structured data markup on web pages. Founded by Google, Microsoft, Yahoo, and Yandex, it provides schemas (types and properties) that web pages can use to describe their content in a machine-readable way. Search engines use Schema.org markup to generate rich results (rich snippets, knowledge panels, etc.).

**Why it matters:**
- Improves search engine visibility through rich results (enhanced search listings)
- Machine-readable content description enables better discovery and indexing
- Supports accessibility: structured data helps assistive technology understand content context
- Required for Google rich results (how-to badges, FAQ accordions, breadcrumbs in search results)
- Industry standard: used by all major search engines

**Key Schema.org types for documentation:**

| Type | Purpose | Use Case |
|------|---------|----------|
| `TechArticle` | Technical writing about a topic | Technical documentation pages |
| `HowTo` | Step-by-step instructions | Task/procedure documentation |
| `FAQPage` | Frequently asked questions | FAQ pages, troubleshooting guides |
| `SoftwareApplication` | Software product description | Product landing page |
| `APIReference` | API documentation | API endpoint reference pages |
| `BreadcrumbList` | Navigation breadcrumbs | All documentation pages |
| `WebPage` | Generic web page | General documentation pages |
| `Article` | Article/blog post | Blog posts, announcements, release notes |

**Implementation (JSON-LD — recommended format):**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "How to Configure Compliance Frameworks",
  "description": "Step-by-step guide for configuring compliance frameworks in the Structured for Growth platform",
  "author": {
    "@type": "Organization",
    "name": "Structured for Growth"
  },
  "datePublished": "2026-02-14",
  "dateModified": "2026-02-14",
  "proficiencyLevel": "Beginner",
  "dependencies": "Node.js 18+, PostgreSQL 14+",
  "inLanguage": "en-US"
}
</script>
```

**Web application implementation guidance:**
- Add JSON-LD structured data to all public-facing documentation pages
- Use `TechArticle` for technical docs, `HowTo` for procedures, `FAQPage` for troubleshooting
- Add `BreadcrumbList` markup to all pages with breadcrumb navigation
- Test markup with Google's Rich Results Test (search.google.com/test/rich-results)
- Validate with Schema.org Validator (validator.schema.org)
- Automate JSON-LD generation from front matter metadata during build

---

### 7.3 Document Metadata for Government Records

**What it is:** Federal government agencies are required to manage electronic records per the Federal Records Act (44 USC Chapter 31), NARA regulations (36 CFR Chapter XII), and OMB Circular A-130. Government document metadata requirements go beyond Dublin Core to include records management, classification, retention, and access control metadata.

**Why it matters:**
- Legal requirement for any documentation that constitutes a federal record
- NARA mandates electronic records management for all federal agencies
- Government contracts may require specific metadata for deliverable documents
- Proper metadata enables records retention, disposition, and legal discovery
- CUI (Controlled Unclassified Information) marking is metadata-dependent

**Government metadata requirements:**

| Metadata Field | Standard | Description |
|----------------|----------|-------------|
| Title | Dublin Core | Official title of the document |
| Creator | Dublin Core | Authoring person or organization |
| Date | Dublin Core + NARA | Creation date, modification date, publication date |
| Format | Dublin Core | File format (MIME type) |
| Identifier | Dublin Core + NARA | Unique document ID (document number, FOIA case number) |
| Classification | ISOO | Unclassified, CUI, Confidential, Secret, Top Secret |
| CUI Category | 32 CFR Part 2002 | CUI category and subcategory if applicable |
| CUI Marking | CUI Registry | Specific CUI banner marking |
| Retention Schedule | NARA GRS / Agency-specific | Records retention schedule code |
| Disposition Authority | NARA | Authority for disposition (destroy, transfer, permanent) |
| Access Restrictions | Agency policy | Who can access (public, internal, restricted) |
| Distribution Statement | DoD 5230.24 | A through F distribution markings for defense documents |
| Privacy Act | 5 USC 552a | Whether document contains Privacy Act-protected information |
| FOIA Exemption | 5 USC 552 | Applicable FOIA exemption if not releasable |

**Web application implementation guidance:**
- If producing documents for government clients:
  - Include required metadata in all document properties (PDF metadata, HTML meta tags)
  - Implement CUI marking banners and portion marking as applicable
  - Add records management metadata to document templates
  - Support export of documents with embedded metadata
  - Maintain a metadata registry documenting all fields used
- For the structured-for-growth platform:
  - Add classification and CUI fields to compliance report templates
  - Include distribution statement options in document export
  - Implement metadata-based access control on the client portal
  - Log metadata changes in the audit trail

---

### 7.4 OSCAL (Open Security Controls Assessment Language)

**What it is:** OSCAL is a set of standardized, machine-readable formats developed by NIST for documenting and exchanging security control information. OSCAL provides XML, JSON, and YAML schemas for catalogs (control definitions), profiles (baseline selections), component definitions, system security plans (SSPs), assessment plans, assessment results, and plan of action and milestones (POA&Ms).

**Why it matters:**
- Being adopted as the standard format for FedRAMP authorization packages
- Enables automated processing of security documentation (currently manual, paper-based)
- Reduces effort for creating and maintaining compliance documentation (SSPs, SAR, POA&M)
- Machine-readable format enables automated compliance checking and continuous monitoring
- NIST actively developing and expanding OSCAL; adoption is growing across federal agencies
- Relevant to structured-for-growth's compliance module

**OSCAL document models:**

| Model | Purpose | Equivalent Traditional Document |
|-------|---------|-------------------------------|
| **Catalog** | Define security controls and objectives | NIST SP 800-53 control catalog |
| **Profile** | Select and customize controls for a baseline | FedRAMP baseline (Low, Moderate, High) |
| **Component Definition** | Describe security capabilities of a component | Vendor security documentation |
| **System Security Plan (SSP)** | Document system security implementation | FedRAMP SSP |
| **Assessment Plan (AP)** | Define assessment methodology | Security Assessment Plan |
| **Assessment Results (AR)** | Document assessment findings | Security Assessment Report (SAR) |
| **POA&M** | Track remediation of findings | Plan of Action & Milestones |

**Web application implementation guidance:**
- The project's `/data/compliance/oscal/` directory indicates OSCAL is already relevant
- Implement OSCAL-formatted output for compliance reports:
  - Export SSP data in OSCAL JSON format
  - Map internal compliance framework data to OSCAL catalog/profile models
  - Support import of OSCAL catalogs for framework definitions
- Use NIST's OSCAL tools for validation:
  - `oscal-cli` — NIST's official validation tool
  - Metaschema framework — schema definitions for OSCAL
- Integrate OSCAL export into the compliance reporting workflow
- Monitor OSCAL's evolution: FedRAMP is progressively requiring OSCAL format for authorization packages
- Store OSCAL data alongside traditional documentation in the compliance data directory

**Tools:**
- NIST OSCAL Reference Implementations: https://github.com/usnistgov/OSCAL
- oscal-cli — NIST command-line tool for OSCAL validation and conversion
- Trestle (IBM) — framework for managing OSCAL content
- Lula (Defense Unicorns) — compliance automation using OSCAL
- GovReady-Q — compliance platform with OSCAL support
- FedRAMP Automation Repository — OSCAL-formatted FedRAMP baselines

---

# TOPIC 2: Section 508 Compliance and Accessibility

## 1. Section 508 (Rehabilitation Act)

### 1.1 Revised Section 508 Standards (2017 Refresh)

**What it is:** On January 18, 2017, the U.S. Access Board published the final rule updating Section 508 Standards and Section 255 Guidelines. The rule became effective March 21, 2017, with a compliance date of January 18, 2018. This "refresh" replaced the original 2000 standards with a modernized, technology-neutral framework that incorporates WCAG 2.0 Level A and AA by reference.

**Why it matters:**
- Legal obligation for all federal agencies and contractors building ICT for the federal government
- Applies to all ICT that is procured, developed, maintained, or used by federal agencies
- Ensures comparable access for federal employees and public with disabilities
- Non-compliance can result in complaints, lawsuits, and procurement penalties
- Harmonized with international standards (EN 301 549, WCAG 2.0)

**Key requirements:**
- All web content must conform to WCAG 2.0 Level A and Level AA Success Criteria
- All non-web electronic documents must also conform to WCAG 2.0 Level AA (with word substitution)
- All software must conform to WCAG 2.0 Level AA plus Chapter 5 software requirements
- Functional Performance Criteria (Chapter 3) apply when technical requirements don't cover a feature
- Support documentation and services must be accessible (Chapter 6)
- Agencies must identify user needs for accessibility (E203.2)
- Undue burden determinations require written documentation and alternative means (E202.6)

**Regulatory structure:**
- **Appendix A:** Section 508 scoping (E101-E208)
- **Appendix B:** Section 255 scoping (C101-C205)
- **Appendix C:** Technical requirements (Chapters 3-7, shared)
- **Appendix D:** Original 2000 standards (for legacy ICT evaluation)

**Web application implementation guidance:**
- Conform to WCAG 2.0 Level AA as the minimum (consider WCAG 2.2 for future-proofing)
- Ensure all electronic documents (PDFs, Word docs) are accessible
- Ensure the web application meets software accessibility requirements (Chapter 5)
- Create a VPAT/ACR documenting conformance
- Document any exceptions or undue burden determinations in writing
- Plan for conformance testing before each release

---

### 1.2 WCAG 2.1 Level AA Incorporation

**What it is:** While the Revised 508 Standards formally incorporate WCAG 2.0, federal agencies are increasingly expected to meet WCAG 2.1 Level AA. OMB M-24-08 "Strengthening Digital Accessibility" (2024) encourages agencies to go beyond the minimum and adopt WCAG 2.1. WCAG 2.1 adds 17 new success criteria addressing mobile accessibility, low vision, and cognitive disabilities.

**Why it matters:**
- WCAG 2.1 AA is the current practical standard (even though 508 references 2.0)
- Addresses mobile accessibility gaps not covered by WCAG 2.0
- Better serves users with low vision and cognitive disabilities
- EN 301 549 (EU standard, referenced in VPAT 2.5 EU) incorporates WCAG 2.1

**New WCAG 2.1 Level AA requirements beyond 2.0:**
- 1.3.4 Orientation — content not restricted to portrait or landscape
- 1.3.5 Identify Input Purpose — input fields identify their purpose (autocomplete)
- 1.4.10 Reflow — content reflows at 400% zoom without horizontal scrolling
- 1.4.11 Non-text Contrast — 3:1 contrast for UI components and graphics
- 1.4.12 Text Spacing — no loss of content when text spacing is adjusted
- 1.4.13 Content on Hover or Focus — dismissible, hoverable, persistent
- 2.1.4 Character Key Shortcuts — can be turned off or remapped
- 2.5.1 Pointer Gestures — multipoint gestures have single-pointer alternatives
- 2.5.2 Pointer Cancellation — avoid accidental activation
- 2.5.3 Label in Name — visible label is included in accessible name
- 2.5.4 Motion Actuation — motion input has alternatives and can be disabled
- 4.1.3 Status Messages — status conveyed to assistive technology via roles

**Web application implementation guidance:**
- Do not restrict orientation (remove `orientation: portrait` CSS)
- Add `autocomplete` attributes to all form fields collecting user data
- Ensure content reflows at 320px width without horizontal scroll (responsive design)
- Ensure 3:1 contrast ratio for all UI components (borders, icons, form controls)
- Test that content remains when text spacing is dramatically increased
- Ensure hover/focus content (tooltips, dropdowns) is dismissible (Esc), hoverable, and persistent
- If using keyboard shortcuts, allow them to be disabled or remapped
- Ensure all pointer gestures have single-click alternatives
- Use ARIA `role="status"`, `role="alert"`, or `aria-live` for dynamic status messages

---

### 1.3 Electronic Content (E205)

**What it is:** Section E205 of the Revised 508 Standards defines scoping requirements for electronic content, including both public-facing content and non-public-facing official agency communications. All covered electronic content must conform to WCAG 2.0 Level A and Level AA.

**Why it matters:**
- Defines exactly which electronic content must be accessible
- Covers ALL public-facing content without exception
- Covers nine categories of non-public-facing official communications
- Applies WCAG to both web and non-web documents

**Covered content:**
- **E205.2 Public Facing:** ALL electronic content made available to the public
- **E205.3 Non-Public Facing (9 categories):**
  1. Emergency notifications
  2. Initial or final decisions adjudicating administrative claims
  3. Internal or external program or policy announcements
  4. Notices of benefits, program eligibility, employment opportunity, or personnel action
  5. Formal acknowledgement of receipt
  6. Survey questionnaires
  7. Templates or forms
  8. Educational or training materials
  9. Intranet content designed as a web page

**Web application implementation guidance:**
- All client-facing web pages, reports, and documents must be fully accessible
- Portal content, dashboard data, compliance reports — all must meet WCAG 2.0 AA
- Email notifications generated by the system must be accessible HTML email
- Exported documents (PDF reports) must be accessible (PDF/UA)
- Templates provided to clients must be accessible templates
- Training materials and help content must be accessible

---

### 1.4 Software (E207)

**What it is:** Section E207 defines requirements for software, requiring that user interface components and content of platforms and applications conform to WCAG 2.0 Level A and AA, plus the technical requirements in Chapter 5 (interoperability with assistive technology, platform accessibility features, authoring tools, etc.).

**Why it matters:**
- Web applications are "software" under 508 and must meet both WCAG and Chapter 5 requirements
- Chapter 5 adds requirements beyond WCAG for software interoperability
- Authoring tool requirements (Section 504) apply if the application is used to create content

**Additional Chapter 5 requirements (beyond WCAG):**
- **502 Interoperability with AT:** Software must support platform accessibility services (name, role, state, value, focus, text attributes, boundary of text, etc.)
- **503 Applications:** User preferences for platform features (color, contrast, font size, focus cursor, sounds) must be respected
- **504 Authoring Tools:** If the application enables content creation, it must support creating accessible content and preserve accessibility information

**Web application implementation guidance:**
- Use native HTML elements whenever possible (they have built-in accessibility support)
- Add ARIA attributes only when native HTML is insufficient
- Respect OS-level accessibility settings (high contrast, reduced motion, font size)
- Use `prefers-reduced-motion` media query to respect motion preferences
- Use `prefers-contrast` media query for high-contrast mode
- If the application includes content authoring (e.g., message composition, document editing), ensure it produces accessible output
- Ensure all custom components expose proper name, role, value to assistive technology

---

### 1.5 Web Content (E205.4)

**What it is:** E205.4 specifies that all covered electronic content must conform to WCAG 2.0 Level A and Level AA Success Criteria and Conformance Requirements. For web content, this is a direct application. The standard incorporates WCAG 2.0 by reference (702.10.1).

**Why it matters:**
- This is the specific section that makes WCAG compliance mandatory for federal web content
- Applies to all web pages, web applications, and web-based content
- Conformance is required at the page level (not the site level)
- Complete processes must conform end-to-end

**Key requirements:**
- All WCAG 2.0 Level A Success Criteria must be met
- All WCAG 2.0 Level AA Success Criteria must be met
- Conforming Alternate Versions are permitted under strict conditions
- Complete processes (e.g., multi-step forms) must conform throughout

**Web application implementation guidance:**
- Every page in the application must independently meet WCAG 2.0 AA
- Multi-step processes (login → dashboard → report → export) must all conform
- If a conforming alternate version is provided, it must:
  - Conform at AA level
  - Provide the same information and functionality
  - Be as up-to-date as the non-conforming version
  - Be reachable via an accessibility-supported mechanism
- Regularly test all pages, not just selected ones

---

### 1.6 Authoring Tools (E206)

**What it is:** E206 addresses hardware (not authoring tools directly — note: authoring tool requirements are in Section 504 under Chapter 5). Section 504 requires that authoring tools support creation of accessible content, provide accessibility checking, preserve accessibility information, and produce content that conforms to WCAG 2.0 Level A and AA.

**Why it matters:**
- If your web application includes authoring capabilities (e.g., composing messages, creating templates, editing reports), it's an authoring tool under 508
- The tool itself must be accessible, AND it must help users create accessible content

**Key requirements (Section 504):**
- **504.2 Content Creation/Editing:** Authoring tools must produce content that conforms to WCAG 2.0 AA when the tool is used properly
- **504.3 Prompts:** Tools must provide a mode of operation that prompts authors to create accessible content (e.g., prompt for alt text when inserting images)
- **504.4 Templates:** Templates provided by the tool must conform to WCAG 2.0 AA

**Web application implementation guidance:**
- If users can compose content (messages, forms, reports):
  - Provide alt text prompts when images are inserted
  - Ensure rich text editors produce semantic HTML (proper headings, lists, tables)
  - Provide accessibility warnings for potential issues (e.g., insufficient contrast in custom colors)
  - Provide accessible templates as defaults
- Validate that generated output (emails, reports, exported documents) is accessible

---

### 1.7 Functional Performance Criteria (Chapter 3)

**What it is:** Chapter 3 defines outcome-based Functional Performance Criteria (FPC) that apply when the technical requirements in Chapters 4-5 don't address a specific feature, or when evaluating equivalent facilitation. FPC cover these areas:

- **302.1 Without Vision** — at least one mode usable without vision
- **302.2 With Limited Vision** — at least one mode for limited vision users
- **302.3 Without Perception of Color** — mode not requiring color perception
- **302.4 Without Hearing** — mode not requiring hearing
- **302.5 With Limited Hearing** — mode for limited hearing users
- **302.6 Without Speech** — mode not requiring speech
- **302.7 With Limited Manipulation** — mode not requiring fine motor control
- **302.8 With Limited Reach and Strength** — mode accessible with limited reach/strength
- **302.9 With Limited Language, Cognitive, and Learning Abilities** — mode for users with cognitive limitations

**Why it matters:**
- Catch-all requirement — if no specific technical criterion covers a feature, FPC apply
- Ensures no disability group is overlooked
- Used to evaluate alternative designs under Equivalent Facilitation (E101.2)

**Web application implementation guidance:**
- Test all features with screen readers (covers 302.1, 302.2)
- Test all features in high-contrast and magnified modes (302.2)
- Ensure no information is conveyed by color alone (302.3)
- Provide text alternatives for all audio content (302.4, 302.5)
- Ensure all functions work without voice input (302.6)
- Ensure all functions work with keyboard only (302.7, 302.8)
- Use plain language, clear layouts, and predictable patterns (302.9)
- Test with diverse assistive technologies, not just one screen reader

---

## 2. WCAG 2.1/2.2 Compliance

### 2.1 Level A Requirements (Complete List)

Level A is the minimum level of conformance. All of these must be met for any level of WCAG conformance.

| # | Success Criterion | Principle | Summary |
|---|-------------------|-----------|---------|
| 1.1.1 | Non-text Content | Perceivable | All non-text content has text alternatives |
| 1.2.1 | Audio-only and Video-only (Prerecorded) | Perceivable | Alternatives for time-based media |
| 1.2.2 | Captions (Prerecorded) | Perceivable | Captions for prerecorded audio in synchronized media |
| 1.2.3 | Audio Description or Media Alternative (Prerecorded) | Perceivable | Audio description or text alternative for video |
| 1.3.1 | Info and Relationships | Perceivable | Structure and relationships programmatically determined |
| 1.3.2 | Meaningful Sequence | Perceivable | Correct reading sequence programmatically determined |
| 1.3.3 | Sensory Characteristics | Perceivable | Instructions don't rely solely on shape, size, location, orientation, or sound |
| 1.4.1 | Use of Color | Perceivable | Color not used as sole means of conveying info |
| 1.4.2 | Audio Control | Perceivable | Auto-playing audio can be paused/stopped/volume controlled |
| 2.1.1 | Keyboard | Operable | All functionality available via keyboard |
| 2.1.2 | No Keyboard Trap | Operable | Keyboard focus can be moved away from any component |
| 2.2.1 | Timing Adjustable | Operable | Time limits can be turned off, adjusted, or extended |
| 2.2.2 | Pause, Stop, Hide | Operable | Moving, blinking, scrolling, or auto-updating content can be controlled |
| 2.3.1 | Three Flashes or Below Threshold | Operable | No content flashes more than 3 times per second |
| 2.4.1 | Bypass Blocks | Operable | Mechanism to bypass repeated blocks of content |
| 2.4.2 | Page Titled | Operable | Web pages have descriptive titles |
| 2.4.3 | Focus Order | Operable | Focusable components receive focus in meaningful order |
| 2.4.4 | Link Purpose (In Context) | Operable | Purpose of each link determinable from link text or context |
| 2.5.1 | Pointer Gestures | Operable | Multi-point/path-based gestures have single-pointer alternatives (2.1) |
| 2.5.2 | Pointer Cancellation | Operable | At least one: down-event doesn't trigger, abort/undo available (2.1) |
| 2.5.3 | Label in Name | Operable | Accessible name includes visible label text (2.1) |
| 2.5.4 | Motion Actuation | Operable | Motion-triggered functions have UI alternatives and can be disabled (2.1) |
| 3.1.1 | Language of Page | Understandable | Default language programmatically determined |
| 3.2.1 | On Focus | Understandable | Receiving focus doesn't trigger context change |
| 3.2.2 | On Input | Understandable | Changing setting doesn't auto-trigger context change unless user is advised |
| 3.2.6 | Consistent Help | Understandable | Help mechanisms are in same relative order across pages (2.2) |
| 3.3.1 | Error Identification | Understandable | Input errors automatically detected are identified and described in text |
| 3.3.2 | Labels or Instructions | Understandable | Labels or instructions provided when content requires user input |
| 3.3.7 | Redundant Entry | Understandable | Previously entered info auto-populated or available for selection (2.2) |
| 4.1.2 | Name, Role, Value | Robust | UI components have programmatic name, role, value for AT |

> **Note:** 4.1.1 Parsing was removed in WCAG 2.2 but remains for WCAG 2.0/2.1 conformance claims. Since Section 508 references WCAG 2.0, 4.1.1 may still be relevant for 508 testing.

---

### 2.2 Level AA Requirements (Complete List)

Level AA includes all Level A requirements plus the following. This is the level required by Section 508 and most web accessibility laws worldwide.

| # | Success Criterion | Principle | Summary |
|---|-------------------|-----------|---------|
| 1.2.4 | Captions (Live) | Perceivable | Captions for live audio in synchronized media |
| 1.2.5 | Audio Description (Prerecorded) | Perceivable | Audio description for prerecorded video |
| 1.3.4 | Orientation | Perceivable | Content not restricted to single display orientation (2.1) |
| 1.3.5 | Identify Input Purpose | Perceivable | Input fields collecting user info identify their purpose (2.1) |
| 1.4.3 | Contrast (Minimum) | Perceivable | Text has 4.5:1 contrast ratio (3:1 for large text) |
| 1.4.4 | Resize Text | Perceivable | Text resizable to 200% without loss of content/function |
| 1.4.5 | Images of Text | Perceivable | Text used instead of images of text where possible |
| 1.4.10 | Reflow | Perceivable | Content reflows at 320px wide/256px tall without 2D scroll (2.1) |
| 1.4.11 | Non-text Contrast | Perceivable | 3:1 contrast for UI components and graphical objects (2.1) |
| 1.4.12 | Text Spacing | Perceivable | No content loss when text spacing is increased (2.1) |
| 1.4.13 | Content on Hover or Focus | Perceivable | Additional content on hover/focus: dismissible, hoverable, persistent (2.1) |
| 2.4.5 | Multiple Ways | Operable | Multiple ways to locate a web page within a set |
| 2.4.6 | Headings and Labels | Operable | Headings and labels describe topic or purpose |
| 2.4.7 | Focus Visible | Operable | Keyboard focus indicator is visible |
| 2.4.11 | Focus Not Obscured (Minimum) | Operable | Focused component is not entirely hidden (2.2) |
| 2.5.7 | Dragging Movements | Operable | Drag operations have non-dragging alternatives (2.2) |
| 2.5.8 | Target Size (Minimum) | Operable | Pointer targets are at least 24x24 CSS px (with exceptions) (2.2) |
| 3.1.2 | Language of Parts | Understandable | Language of passages/phrases programmatically determined |
| 3.2.3 | Consistent Navigation | Understandable | Repeated navigation mechanisms are in same relative order |
| 3.2.4 | Consistent Identification | Understandable | Components with same functionality identified consistently |
| 3.3.3 | Error Suggestion | Understandable | If input error detected and suggestions known, provided to user |
| 3.3.4 | Error Prevention (Legal, Financial, Data) | Understandable | Submissions reversible, checked, or confirmable |
| 3.3.8 | Accessible Authentication (Minimum) | Understandable | Cognitive function test not required for auth unless alternatives exist (2.2) |
| 4.1.3 | Status Messages | Robust | Status messages conveyed to AT via roles without receiving focus (2.1) |

---

### 2.3 Level AAA Requirements (Complete List)

Level AAA is the highest level. It is NOT recommended as a blanket requirement for entire sites, as some criteria cannot be satisfied for all content. However, individual AAA criteria can be targeted.

| # | Success Criterion | Principle | Summary |
|---|-------------------|-----------|---------|
| 1.2.6 | Sign Language (Prerecorded) | Perceivable | Sign language for prerecorded audio |
| 1.2.7 | Extended Audio Description (Prerecorded) | Perceivable | Extended audio description for video |
| 1.2.8 | Media Alternative (Prerecorded) | Perceivable | Text alternative for synchronized media |
| 1.2.9 | Audio-only (Live) | Perceivable | Text alternative for live audio |
| 1.3.6 | Identify Purpose | Perceivable | Purpose of UI components, icons, regions programmatically determined (2.1) |
| 1.4.6 | Contrast (Enhanced) | Perceivable | 7:1 contrast for text (4.5:1 for large text) |
| 1.4.7 | Low or No Background Audio | Perceivable | Prerecorded audio: no background sounds, or 20dB quieter |
| 1.4.8 | Visual Presentation | Perceivable | User can control colors, width (80 char), no justification, text spacing, 200% resize without horizontal scroll |
| 1.4.9 | Images of Text (No Exception) | Perceivable | Images of text only for decoration or essential |
| 2.1.3 | Keyboard (No Exception) | Operable | ALL functionality via keyboard, no exceptions |
| 2.2.3 | No Timing | Operable | No time limits at all (except real-time events) |
| 2.2.4 | Interruptions | Operable | Interruptions can be postponed or suppressed |
| 2.2.5 | Re-authenticating | Operable | No data loss on re-authentication |
| 2.2.6 | Timeouts | Operable | Users warned of inactivity timeout; data preserved 20+ hours (2.1) |
| 2.3.2 | Three Flashes | Operable | No content flashes more than 3 times per second, period |
| 2.3.3 | Animation from Interactions | Operable | Motion animation can be disabled (2.1) |
| 2.4.8 | Location | Operable | User's location within site is available (breadcrumbs) |
| 2.4.9 | Link Purpose (Link Only) | Operable | Purpose of link determinable from link text alone |
| 2.4.10 | Section Headings | Operable | Section headings used to organize content |
| 2.4.12 | Focus Not Obscured (Enhanced) | Operable | No part of focused component is hidden (2.2) |
| 2.4.13 | Focus Appearance | Operable | Focus indicator meets minimum area/contrast (2.2) |
| 2.5.5 | Target Size (Enhanced) | Operable | Pointer targets at least 44x44 CSS px (2.1) |
| 2.5.6 | Concurrent Input Mechanisms | Operable | Input modality not restricted (2.1) |
| 3.1.3 | Unusual Words | Understandable | Mechanism for definitions of unusual/jargon words |
| 3.1.4 | Abbreviations | Understandable | Mechanism for expanded form of abbreviations |
| 3.1.5 | Reading Level | Understandable | Supplemental content below lower secondary education reading level |
| 3.1.6 | Pronunciation | Understandable | Mechanism for pronunciation of ambiguous words |
| 3.2.5 | Change on Request | Understandable | Context changes only by user request |
| 3.3.5 | Help | Understandable | Context-sensitive help is available |
| 3.3.6 | Error Prevention (All) | Understandable | All submissions: reversible, checked, or confirmable |
| 3.3.9 | Accessible Authentication (Enhanced) | Understandable | No cognitive function test for auth, no exceptions (2.2) |

---

### 2.4 POUR Principles

**What it is:** POUR stands for the four foundational principles of WCAG: Perceivable, Operable, Understandable, and Robust. All success criteria fall under one of these principles.

| Principle | Definition | Key Concern |
|-----------|-----------|-------------|
| **Perceivable** | Information and UI must be presentable in ways users can perceive | Can the user see/hear/feel the content? |
| **Operable** | UI components and navigation must be operable | Can the user interact with all controls? |
| **Understandable** | Information and UI operation must be understandable | Can the user comprehend the content and how the UI works? |
| **Robust** | Content must be robust enough for diverse user agents/AT | Does the content work with assistive technologies? |

**Web application implementation guidance:**
- **Perceivable:** Alt text, captions, sufficient contrast, text alternatives, responsive design
- **Operable:** Keyboard access, skip links, no keyboard traps, sufficient time, no flashing, visible focus
- **Understandable:** Plain language, consistent navigation, error identification, labels, predictable behavior
- **Robust:** Valid HTML, ARIA used correctly, tested with multiple screen readers and browsers

---

### 2.5 Success Criteria Mapping to HTML/CSS/JS

**Critical mappings for web application development:**

| Success Criterion | HTML Implementation | CSS Implementation | JS Implementation |
|---|---|---|---|
| 1.1.1 Non-text Content | `alt` on `<img>`, `<svg>` with `<title>`, `aria-label` | decorative images: `alt=""` | Dynamic images: set `alt` programmatically |
| 1.3.1 Info and Relationships | Semantic HTML (`<nav>`, `<main>`, `<header>`, `<table>`, `<th>`, `<label>`, `<fieldset>`) | Visual-only relationships must also exist in markup | ARIA for custom widgets |
| 1.3.5 Identify Input Purpose | `autocomplete` attribute on form fields | — | — |
| 1.4.3 Contrast | — | `color`, `background-color` with 4.5:1 ratio | Dynamic themes must maintain contrast |
| 1.4.10 Reflow | Responsive viewport `<meta>` | `max-width`, `flexbox`, `grid`, no fixed widths | — |
| 1.4.11 Non-text Contrast | — | 3:1 for borders, icons, focus indicators | Custom drawn elements |
| 1.4.12 Text Spacing | — | No `overflow: hidden` on text containers; flexible line-height | — |
| 2.1.1 Keyboard | native `<button>`, `<a>`, `<input>` | `:focus` styles | `addEventListener('keydown')` for custom widgets, `tabindex` management |
| 2.4.1 Bypass Blocks | "Skip to main content" `<a>` link | `.sr-only` for visually hidden skip links | Focus management on skip |
| 2.4.7 Focus Visible | — | `:focus-visible` outline, never `outline: none` without replacement | — |
| 3.3.1 Error Identification | `aria-invalid`, `aria-describedby` linking to error message | Error message styling | Real-time validation, `aria-live` for dynamic errors |
| 4.1.2 Name, Role, Value | `aria-label`, `aria-labelledby`, `role`, `aria-expanded`, `aria-checked` | — | State management, `setAttribute` |
| 4.1.3 Status Messages | `role="status"`, `role="alert"` | — | `aria-live="polite"` for updates, `aria-live="assertive"` for errors |

---

## 3. Accessibility Testing

### 3.1 Automated Testing Tools

#### axe (Deque Systems)
**What it is:** Open-source accessibility testing engine. Available as browser extension (axe DevTools), CLI tool (`@axe-core/cli`), and library (`axe-core`) for integration into automated tests. De facto industry standard for automated accessibility testing.

**Why it matters:** Catches ~30-40% of accessibility issues automatically. Zero false positives by design. Integrated into CI/CD pipelines for continuous testing.

**Implementation guidance:**
```bash
npm install --save-dev @axe-core/cli axe-core
# Run on a URL
npx axe http://localhost:3000/dashboard.html
```
- Integrate `axe-core` into end-to-end tests (Cypress, Playwright)
- Run on every page/route in CI pipeline
- Use axe DevTools browser extension during development
- Configure custom rules for project-specific requirements

#### WAVE (WebAIM)
**What it is:** Web accessibility evaluation tool from WebAIM (Web Accessibility In Mind). Available as browser extension, web service (wave.webaim.org), and API. Provides visual overlay of accessibility issues on the page.

**Why it matters:** Excellent for visual review — shows issues in context on the page. Identifies structural issues, contrast problems, and missing elements. Free browser extension.

**Implementation guidance:**
- Install WAVE browser extension for Chrome/Firefox
- Use during development for visual accessibility review
- WAVE API available for automated scanning: `https://wave.webaim.org/api/`
- Use alongside axe for complementary coverage

#### Lighthouse (Google)
**What it is:** Automated auditing tool built into Chrome DevTools. Audits performance, accessibility, best practices, SEO, and PWA. Accessibility audit is built on axe-core.

**Why it matters:** Built into Chrome — no installation needed. Provides a 0-100 accessibility score. Integrated into CI via `lighthouse-ci`.

**Implementation guidance:**
```bash
npm install --save-dev @lhci/cli
npx lhci autorun --collect.url=http://localhost:3000
```
- Target 100/100 accessibility score
- Run in CI on every pull request
- Review specific flagged items, not just the score
- Note: Lighthouse catches fewer issues than dedicated axe runs; use both

---

### 3.2 Manual Testing Procedures

**What it is:** Accessibility testing that requires human judgment and cannot be fully automated. Automated tools catch ~30-40% of issues; manual testing is required for the remaining 60-70%.

**Critical manual tests:**

1. **Keyboard-only navigation:**
   - Tab through all interactive elements in logical order
   - Verify visible focus indicator on every focused element
   - Verify all functionality is accessible without a mouse
   - Test Enter/Space activation of buttons and links
   - Test arrow key navigation in menus, tabs, and custom widgets
   - Verify no keyboard traps (can always Tab/Escape away)

2. **Content and structure review:**
   - Heading hierarchy (h1 → h2 → h3, no skipped levels)
   - Meaningful link text (no "click here," "read more" alone)
   - Alt text is accurate and useful (not just filename)
   - Form labels properly associated with inputs
   - Error messages are clear and associated with fields
   - Page titles are unique and descriptive

3. **Visual review:**
   - Zoom to 200% — no content loss or horizontal scrolling
   - Zoom to 400% — content reflows appropriately (1.4.10)
   - High contrast mode — all content visible
   - Increase text spacing dramatically — no content clipping
   - Content understandable without color

4. **Dynamic content review:**
   - Screen reader announcement of status changes
   - Focus management after page updates
   - Modal dialog focus trapping and restoration
   - Error announcement to assistive technology
   - Loading states announced

---

### 3.3 Screen Reader Testing

#### JAWS (Job Access With Speech)
**What it is:** The most widely used commercial screen reader (Windows). Developed by Freedom Scientific. The primary screen reader used by the federal government.

**Testing checklist:**
- All page content is read in logical order
- All interactive elements are properly identified (button, link, checkbox, etc.)
- Form fields have proper labels announced
- Tables are navigable with table navigation commands
- Headings navigation works (H key cycles through headings)
- Landmarks are properly identified and navigable
- Dynamic content updates are announced
- Images have appropriate alt text announced

#### NVDA (NonVisual Desktop Access)
**What it is:** Free, open-source screen reader for Windows. Second most popular after JAWS. Maintained by NV Access.

**Testing guidance:** Same checklist as JAWS. Test with both NVDA and JAWS because they can behave differently with ARIA roles and dynamic content.

#### VoiceOver (Apple)
**What it is:** Screen reader built into macOS and iOS. No installation required on Apple devices. Important for testing mobile accessibility.

**Testing guidance:**
- macOS: Cmd+F5 to toggle, use VO keys (Ctrl+Option) for navigation
- iOS: Triple-click home/side button, use swipe gestures
- Test Safari primarily (VoiceOver is optimized for Safari)
- Critical for validating mobile web accessibility

**Web application implementation guidance:**
- Test with at least NVDA + Chrome and JAWS + Chrome/Edge monthly
- Test with VoiceOver + Safari for macOS/iOS users
- Create a screen reader testing script covering all major user flows
- Document screen reader test results in the accessibility conformance report
- Prioritize fixes for issues found consistently across multiple screen readers

---

### 3.4 Keyboard Navigation Testing

**Full keyboard testing procedure:**

| Key | Expected Behavior | Test |
|-----|-------------------|------|
| Tab | Move to next interactive element | All interactive elements reachable in logical order |
| Shift+Tab | Move to previous interactive element | Reverse order works correctly |
| Enter | Activate link/button | All buttons and links activate |
| Space | Activate button, toggle checkbox | Buttons activate, checkboxes toggle |
| Arrow keys | Navigate within widget (menu, tabs, radio) | Custom widgets support arrow navigation |
| Escape | Close modal/dropdown/popup | All overlays dismissible |
| Home/End | Jump to first/last item in list | Lists and menus support Home/End |

**Web application implementation guidance:**
- Tab order matches visual layout (left-to-right, top-to-bottom)
- Custom components implement appropriate keyboard patterns from WAI-ARIA Authoring Practices
- Modal dialogs trap focus and restore focus on close
- Skip navigation link targets main content area
- Focus never moves to off-screen or hidden elements
- Dropdown menus open on Enter/Space, navigate with arrows, close on Escape

---

### 3.5 Color Contrast Requirements

| Element Type | Minimum Ratio (AA) | Enhanced Ratio (AAA) |
|-------------|--------------------|--------------------|
| Normal text (<18pt / <14pt bold) | 4.5:1 | 7:1 |
| Large text (≥18pt / ≥14pt bold) | 3:1 | 4.5:1 |
| UI components & graphical objects | 3:1 | Not specified |
| Focus indicators | 3:1 | Per 2.4.13 |
| Disabled elements | No requirement | No requirement |
| Incidental (decorative, invisible) | No requirement | No requirement |
| Logotypes | No requirement | No requirement |

**Testing tools:**
- Chrome DevTools (Inspect → Accessibility pane shows contrast ratios)
- WebAIM Contrast Checker (webaim.org/resources/contrastchecker/)
- Colour Contrast Analyser (desktop app by TPGi)
- Stark (Figma/Sketch plugin for design phase)

**Web application implementation guidance:**
- Define a color palette that meets 4.5:1 for all text-on-background combinations
- Test all color combinations in the design system before development
- Never rely on color alone to convey information (add icons, text, or patterns)
- Test with simulated color blindness (Chrome DevTools → Rendering → Emulate vision deficiencies)
- Ensure form field borders have 3:1 contrast against the background
- Ensure chart/graph elements have sufficient contrast AND non-color differentiators

---

### 3.6 ANDI Testing Tool (SSA)

**What it is:** ANDI (Accessible Name & Description Inspector) is a free accessibility testing tool developed by the Social Security Administration (SSA). It's a JavaScript bookmarklet that inspects web pages for accessibility issues, with modules for focusable elements, images, links, structure, color contrast, tables, and hidden content.

**Why it matters:**
- Free tool from a federal agency, designed for 508 testing
- Tests accessible names and descriptions (critical for WCAG 4.1.2)
- Modules align with specific 508/WCAG requirements
- Used extensively in federal accessibility testing
- Aligns with the ICT Testing Baseline

**Modules:**
- Focusable Elements: tests tab order, focus, keyboard access
- Images: tests alt text and image accessibility
- Links/Buttons: tests link purpose and accessible names
- Structure: tests headings, landmarks, lists, and reading order
- Color Contrast: tests foreground/background contrast ratios
- Tables: tests table headers, captions, and structure
- Hidden Content: identifies content hidden from assistive technology

**Web application implementation guidance:**
- Install ANDI bookmarklet from ssa.gov/accessibility/andi
- Run ANDI modules on every page during development
- Use the "focusable elements" module to verify tab order
- Use the "images" module to audit alt text
- Use the "structure" module to verify heading hierarchy and landmarks
- Use the "color contrast" module to verify contrast ratios

---

### 3.7 VPAT (Voluntary Product Accessibility Template)

**What it is:** The VPAT® is a free template created and maintained by the Information Technology Industry Council (ITI). It provides a standardized format for documenting the accessibility conformance of ICT products and services against relevant standards. When completed for a specific product, it becomes an Accessibility Conformance Report (ACR).

**Current version:** VPAT 2.5Rev (April 2025) — four editions:
- **VPAT 2.5 508:** Revised Section 508 Standards (references WCAG 2.0)
- **VPAT 2.5 EU:** EN 301 549 (references WCAG 2.1)
- **VPAT 2.5 WCAG:** W3C WCAG (references WCAG 2.2)
- **VPAT 2.5 INT:** International — includes all three standards

**Conformance levels used in VPAT:**
- **Supports:** Fully meets the criterion
- **Partially Supports:** Some functionality meets, some does not
- **Does Not Support:** Majority doesn't meet
- **Not Applicable:** Criterion doesn't apply to the product

**Why it matters:**
- Required or expected in federal procurement processes
- Standard format recognized by government acquirers worldwide
- Demonstrates commitment to accessibility
- Identifies specific areas of conformance and non-conformance
- Used for competitive evaluation in procurement

**Web application implementation guidance:**
- Complete a VPAT 2.5 INT (covers all three standards) for the web application
- Test against every criterion before completing the VPAT
- Be honest about non-conformance — document it with explanation and remediation plans
- Update the ACR with every major release
- Make the ACR publicly available (post on website or provide on request)
- Use descriptive "Remarks and Explanations" — don't leave them blank

---

### 3.8 ACR (Accessibility Conformance Report)

**What it is:** A completed VPAT for a specific product. The ACR documents the specific accessibility conformance status of a product or service, including test methodology, product description, and per-criterion conformance levels with explanations.

**Why it matters:**
- The deliverable that federal acquirers review during procurement
- Demonstrates due diligence in accessibility
- Identifies known gaps and remediation plans
- Can be the differentiator in competitive federal procurements

**ACR best practices:**
- Include product name, version, and test date
- Describe testing methodology (tools, screen readers, browsers used)
- For each criterion, provide specific remarks — not just "Supports"
- Document known issues with estimated remediation dates
- Include information about accessibility features and configuration
- Update the ACR at least annually or with each major release

**Web application implementation guidance:**
- Create an ACR for the web application using the VPAT 2.5 INT template
- Include all pages and features in the evaluation scope
- Test with: axe, ANDI, NVDA, JAWS, keyboard-only, and manual review
- Document test environment (browsers, OS, AT versions)
- Post the ACR at a stable URL (e.g., `/accessibility-conformance-report`)
- Link to the ACR from the site's accessibility statement

---

## 4. Accessible Document Formats

### 4.1 PDF/UA (ISO 14289)

**What it is:** PDF/UA (Universal Accessibility) is an ISO standard (14289-1, published 2012; 14289-2 published 2024) that defines requirements for accessible PDF documents. PDF/UA requires tagged PDF structure, alternative text, proper reading order, and metadata — essentially translating WCAG principles into PDF format.

**Why it matters:**
- PDF is the primary format for downloadable documents in government and enterprise
- Untagged PDFs are inaccessible to screen readers
- Required for Section 508 compliance of PDF documents
- Ensures PDFs work with assistive technology

**Key requirements:**
- All content must be tagged (semantic structure: headings, paragraphs, lists, tables)
- Proper reading order defined in the tag tree
- Alternative text for all images and non-text content
- Document title set in metadata (not just filename)
- Document language specified
- Tables must have header cells properly marked
- Form fields must have labels
- Bookmarks for documents > 20 pages
- No security settings that prevent assistive technology access

**Web application implementation guidance:**
- If generating PDFs (reports, exports), use a PDF library that creates tagged PDF (e.g., `pdfkit` with accessibility features, `pdf-lib`, or server-side tools like `wkhtmltopdf` with accessible HTML source)
- Always generate tagged PDFs from semantic HTML source
- Set document title, language, and metadata programmatically
- Include alt text for all images in generated PDFs
- Test generated PDFs with:
  - Adobe Acrobat Pro's accessibility checker
  - PAC (PDF Accessibility Checker) — free tool
  - Screen reader (JAWS or NVDA)
- If providing externally created PDFs, validate accessibility before publishing

---

### 4.2 Accessible HTML Best Practices

**What it is:** Using HTML according to its specification, with semantic elements that convey meaning, structure, and relationships to both visual users and assistive technology users.

**Key requirements and implementation:**

```html
<!-- Document structure -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unique, Descriptive Page Title | Site Name</title>
</head>
<body>
  <!-- Skip navigation -->
  <a href="#main-content" class="skip-link">Skip to main content</a>
  
  <!-- Landmarks -->
  <header role="banner">...</header>
  <nav role="navigation" aria-label="Main navigation">...</nav>
  <main id="main-content" role="main">
    <h1>Page Heading</h1>
    <!-- Heading hierarchy: h1 > h2 > h3, never skip levels -->
    <section aria-labelledby="section-title">
      <h2 id="section-title">Section Title</h2>
    </section>
  </main>
  <footer role="contentinfo">...</footer>
</body>
</html>
```

**Critical practices:**
- Use semantic elements: `<nav>`, `<main>`, `<header>`, `<footer>`, `<article>`, `<section>`, `<aside>`
- One `<h1>` per page, logical heading hierarchy without skipping levels
- Meaningful link text (not "click here")
- `<label>` elements properly associated with form inputs (`for`/`id` or wrapping)
- `<table>` with `<th>`, `scope` attributes, and `<caption>`
- `<img>` with descriptive `alt` (or `alt=""` for decorative images)
- `<button>` for actions, `<a>` for navigation
- `lang` attribute on `<html>` and on any passages in a different language

---

### 4.3 ARIA Roles and Attributes

**What it is:** WAI-ARIA (Accessible Rich Internet Applications) provides attributes that supplement HTML to convey semantics, roles, properties, and states to assistive technology. ARIA should be used ONLY when native HTML doesn't adequately convey the semantics.

**First rule of ARIA:** "If you can use a native HTML element or attribute with the semantics and behavior you require already built in, instead of re-purposing an element and adding an ARIA role, state or property, then do so."

**Key ARIA roles for web applications:**

| Role | Purpose | HTML Equivalent |
|------|---------|----------------|
| `role="button"` | Interactive button | `<button>` (preferred) |
| `role="navigation"` | Navigation landmark | `<nav>` (preferred) |
| `role="main"` | Main content | `<main>` (preferred) |
| `role="banner"` | Site header | `<header>` (preferred) |
| `role="contentinfo"` | Site footer | `<footer>` (preferred) |
| `role="dialog"` | Modal dialog | `<dialog>` (preferred) |
| `role="alert"` | Important, time-sensitive information | — |
| `role="status"` | Advisory information | — |
| `role="tablist/tab/tabpanel"` | Tab interface | — |
| `role="menu/menuitem"` | Application menu | — |
| `role="tree/treeitem"` | Tree view | — |
| `role="grid/row/gridcell"` | Interactive data grid | — |

**Key ARIA attributes:**

| Attribute | Purpose | Usage |
|-----------|---------|-------|
| `aria-label` | Provides accessible name | When no visible text label exists |
| `aria-labelledby` | References visible label element | When label is elsewhere on page |
| `aria-describedby` | References descriptive text | For help text, error messages |
| `aria-expanded` | Indicates expandable state | Accordions, menus, dropdowns |
| `aria-hidden="true"` | Hides from AT | Decorative elements, duplicated content |
| `aria-live="polite"` | Announces content changes | Status messages, updates |
| `aria-live="assertive"` | Immediately announces changes | Errors, urgent alerts |
| `aria-required="true"` | Indicates required field | Form inputs |
| `aria-invalid="true"` | Indicates validation error | Form inputs with errors |
| `aria-current="page"` | Indicates current page in navigation | Active navigation item |

**Web application implementation guidance:**
- Prefer native HTML over ARIA (e.g., `<button>` over `<div role="button">`)
- Add ARIA only for custom widgets not representable in native HTML
- Always test ARIA with actual screen readers — incorrect ARIA is worse than no ARIA
- Follow WAI-ARIA Authoring Practices Guide patterns for custom widgets
- Key patterns needed for this project:
  - Modal dialogs (login, confirmations) → `role="dialog"`, `aria-modal="true"`, focus trap
  - Navigation menus → `<nav>`, `aria-label`, `aria-current="page"`
  - Form validation → `aria-invalid`, `aria-describedby`, `role="alert"`
  - Dynamic content → `aria-live` regions for dashboard updates
  - Tabs → `role="tablist/tab/tabpanel"`, `aria-selected`, `aria-controls`

---

### 4.4 Accessible Data Tables

**What it is:** HTML tables that convey their structure and relationships to assistive technology users, enabling screen reader users to navigate and understand tabular data.

**Key requirements:**

```html
<table>
  <caption>Quarterly Compliance Status by Framework</caption>
  <thead>
    <tr>
      <th scope="col">Framework</th>
      <th scope="col">Q1 Status</th>
      <th scope="col">Q2 Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">NIST 800-53</th>
      <td>Compliant</td>
      <td>Compliant</td>
    </tr>
  </tbody>
</table>
```

**Rules:**
- Always use `<caption>` to describe the table's purpose
- Use `<th>` with `scope="col"` or `scope="row"` for header cells
- For complex tables with multi-level headers, use `headers` attribute with `id` references
- Don't use tables for layout — tables are for data only
- Keep tables simple; break complex data into multiple simpler tables
- Don't use merged cells (`colspan`/`rowspan`) unless necessary; if used, add `headers`/`id` associations
- Provide a summary of complex tables for screen reader users

---

### 4.5 Form Accessibility

**What it is:** Making HTML forms usable by all users, including those using assistive technology, keyboard navigation, and voice control.

**Key requirements and implementation:**

```html
<form aria-labelledby="form-title">
  <h2 id="form-title">Contact Information</h2>
  
  <!-- Grouped related fields -->
  <fieldset>
    <legend>Personal Information</legend>
    
    <!-- Required field with label -->
    <div class="field">
      <label for="name">Full Name <span aria-hidden="true">*</span></label>
      <input type="text" id="name" name="name" 
             required aria-required="true"
             autocomplete="name">
    </div>
    
    <!-- Field with help text -->
    <div class="field">
      <label for="email">Email Address</label>
      <input type="email" id="email" name="email"
             aria-describedby="email-help"
             autocomplete="email">
      <span id="email-help" class="help-text">
        We'll use this to send you updates.
      </span>
    </div>
    
    <!-- Field with error -->
    <div class="field has-error">
      <label for="phone">Phone Number</label>
      <input type="tel" id="phone" name="phone"
             aria-invalid="true"
             aria-describedby="phone-error"
             autocomplete="tel">
      <span id="phone-error" class="error-text" role="alert">
        Please enter a valid phone number (e.g., 555-123-4567).
      </span>
    </div>
  </fieldset>
  
  <button type="submit">Submit</button>
</form>
```

**Rules:**
- Every input must have an associated `<label>` (via `for`/`id` or wrapping)
- Group related inputs with `<fieldset>` and `<legend>`
- Use `autocomplete` attributes for user data fields (WCAG 1.3.5)
- Mark required fields with `aria-required="true"` and visual indicator
- Associate help text with `aria-describedby`
- Associate error messages with `aria-describedby` and `aria-invalid="true"`
- Error messages must be descriptive and suggest how to fix the error
- Don't rely on placeholder text as the label
- Support keyboard submission (Enter key in forms)

---

### 4.6 Multimedia Accessibility

**What it is:** Making audio and video content accessible through captions, transcripts, audio descriptions, and accessible media players.

**Requirements by media type:**

| Media Type | Level A | Level AA |
|-----------|---------|----------|
| Prerecorded audio-only | Transcript | — |
| Prerecorded video-only | Transcript OR audio description | — |
| Prerecorded synchronized media | Captions | Audio description |
| Live synchronized media | — | Live captions |

**Implementation guidance:**
```html
<video controls>
  <source src="training.mp4" type="video/mp4">
  <track kind="captions" src="training-en.vtt" srclang="en" label="English" default>
  <track kind="descriptions" src="training-desc-en.vtt" srclang="en" label="English Audio Description">
  <!-- Fallback -->
  <p>Your browser doesn't support video. <a href="training-transcript.html">Read the transcript</a>.</p>
</video>
```

**Key practices:**
- Provide captions (not just subtitles) for all video with audio — captions include non-speech sounds
- Provide transcripts for audio-only content (podcasts, audio recordings)
- Provide audio descriptions for video where important visual content isn't described in dialog
- Use an accessible media player that supports keyboard navigation and screen readers
- Provide a text transcript as an alternative to multimedia
- Caption files should be WebVTT format (.vtt) for web

---

### 4.7 Accessible SVG and Charts

**What it is:** Making SVG graphics and data visualizations accessible to users who can't see them, including those using screen readers and those with color vision deficiencies.

**Key requirements and implementation:**

```html
<!-- Simple SVG with accessible name -->
<svg role="img" aria-labelledby="chart-title chart-desc">
  <title id="chart-title">Monthly Revenue Trend</title>
  <desc id="chart-desc">Revenue increased from $50,000 in January to $75,000 in June, 
  with a dip to $45,000 in March.</desc>
  <!-- SVG content -->
</svg>

<!-- Decorative SVG -->
<svg aria-hidden="true" focusable="false">
  <!-- Decorative content -->
</svg>

<!-- Complex chart with data table alternative -->
<figure>
  <figcaption>Figure 1: Compliance Score by Framework (Q4 2025)</figcaption>
  <svg role="img" aria-labelledby="compliance-chart-title">
    <title id="compliance-chart-title">Bar chart showing compliance scores</title>
  </svg>
  <!-- Data table as accessible alternative -->
  <details>
    <summary>View data table</summary>
    <table>
      <caption>Compliance Score by Framework (Q4 2025)</caption>
      <!-- Accessible table with full data -->
    </table>
  </details>
</figure>
```

**Key practices:**
- Every meaningful SVG needs `<title>` (brief label) and optionally `<desc>` (longer description)
- Use `role="img"` on `<svg>` elements that are content images
- Use `aria-labelledby` to reference `<title>` and `<desc>` IDs
- Decorative SVGs: `aria-hidden="true"` and `focusable="false"`
- Complex charts: provide an accessible data table alternative
- Don't rely on color alone to differentiate data series — use patterns, shapes, or labels
- Ensure chart text meets contrast requirements
- Interactive charts: ensure keyboard navigability and screen reader announcement

---

## 5. DoD & Federal Accessibility Requirements

### 5.1 DoDI 8530.01 Accessibility Requirements

**What it is:** DoDI 8530.01 (Cybersecurity Activities Support to DoD Information Network Operations) and the broader DoD cybersecurity instruction family include requirements for information systems accessibility as part of the Authority to Operate (ATO) process. More directly, DoD Instruction 8410.03 (no longer active, superseded) and current policy through CIO memoranda require Section 508 compliance for all DoD information systems.

**Why it matters:**
- DoD is the largest federal ICT procurer
- Accessibility compliance is part of the ATO process for DoD systems
- Non-compliant systems may not receive authorization to operate
- Applies to all contractors building systems for DoD use

**Key requirements:**
- All DoD web-based applications must meet Revised Section 508 Standards
- Accessibility testing is part of the system security assessment
- VPATs/ACRs required for all procured ICT products
- Reasonable accommodations must be documented when full compliance isn't achievable
- Accessibility must be addressed in the System Security Plan (SSP)

**Web application implementation guidance:**
- Include accessibility testing results in ATO documentation package
- Complete a VPAT/ACR and include in procurement response materials
- Document accessibility testing methodology and results
- Address accessibility in the project's System Security Plan
- Plan for remediation of any non-conformance findings
- Test with DHS Trusted Tester methodology for DoD acceptance

---

### 5.2 GSA Accessibility Guidelines

**What it is:** The General Services Administration (GSA) leads the government-wide Section 508 program through Section508.gov. GSA provides guidance, tools, testing resources, and policy frameworks for federal accessibility compliance. Key resources include the IT Accessibility Policy Framework, the Accessibility Requirements Tool (ART), the ACR Editor, and the ICT Testing Baseline.

**Why it matters:**
- GSA sets the practical implementation standards for 508 compliance
- Section508.gov is the authoritative resource for federal accessibility
- GSA tools (ART, ACR Editor) are the standard for documenting requirements and conformance
- GSA manages the government-wide Section 508 assessment program

**Key resources and requirements:**
- **ICT Testing Baseline:** Standardized test methods for consistent 508 testing across agencies
- **Accessibility Requirements Tool (ART):** Generates accessibility requirements for procurement solicitations
- **ACR Editor:** Online tool for creating standardized Accessibility Conformance Reports
- **Section 508 Assessment:** Annual agency-wide assessment of accessibility maturity
- **OMB M-24-08:** Strengthening Digital Accessibility and Management of Section 508

**Web application implementation guidance:**
- Use the ART (section508.gov/art/) to generate accessibility requirements for the project
- Use the ACR Editor (acreditor.section508.gov/) to create the conformance report
- Follow ICT Testing Baseline test procedures for consistent, reproducible results
- Align testing with the Trusted Tester process for maximum acceptance
- Reference Section508.gov checklists for web, software, and electronic document testing
- Monitor the annual Section 508 Assessment criteria to stay aligned with current expectations

---

### 5.3 HHS Accessibility Standards

**What it is:** The Department of Health and Human Services (HHS) has additional accessibility requirements beyond base 508, driven by their mission to serve populations that include high proportions of individuals with disabilities and older adults. HHS requires 508 compliance for all internal and external-facing systems and has its own Office of Accessible Systems and Technology.

**Why it matters:**
- HHS serves populations with highest disability prevalence
- HHS systems must be extra rigorous in accessibility
- HHS has historically been a leader in federal accessibility enforcement
- HHS-regulated entities (healthcare) must also consider ADA and HHS civil rights requirements

**Key requirements (beyond base 508):**
- Mandatory accessibility testing before deployment
- Accessibility reviews as part of IT governance processes
- Staff training requirements for accessibility
- Specific requirements for health information accessibility
- Mobile accessibility requirements for health apps
- Consideration of cognitive disabilities in HHS systems

**Web application implementation guidance:**
- If serving HHS or health-related agencies:
  - Meet WCAG 2.1 AA minimum (not just 2.0)
  - Pay special attention to cognitive accessibility (plain language, clear navigation, error prevention)
  - Ensure mobile accessibility for all features
  - Test with users who have disabilities, not just automated tools
  - Consider AAA criteria: 3.1.5 Reading Level, 2.4.8 Location, 3.3.5 Help

---

### 5.4 VA Accessibility Requirements

**What it is:** The Department of Veterans Affairs (VA) has comprehensive accessibility requirements for all digital services, driven by their mission to serve veterans, including the ~4 million veterans with service-connected disabilities. The VA's Section 508 office enforces compliance through the VA Directive 6221 and Handbook 6221.

**Why it matters:**
- VA serves the largest single federal user population with disabilities
- VA has aggressive accessibility enforcement
- VA digital services are required to meet WCAG 2.1 AA (beyond the 508 minimum of WCAG 2.0)
- VA uses the U.S. Web Design System (USWDS) as the foundation for accessible design

**Key requirements:**
- All VA digital products must meet WCAG 2.1 Level AA
- Mandatory use of the VA Design System (based on USWDS)
- Accessibility testing at every stage of development
- User testing with veterans who have disabilities
- Mobile-first accessibility (VA mobile apps serve millions)
- Real-time monitoring of accessibility in production

**Web application implementation guidance:**
- If serving VA:
  - Meet WCAG 2.1 AA as minimum
  - Use USWDS/VA Design System components (pre-tested for accessibility)
  - Test with JAWS + Chrome (VA standard screen reader configuration)
  - Conduct usability testing with veteran users
  - Support mobile access for all features
  - Address vestibular disorders (reduced motion support)

---

### 5.5 Trusted Tester Program

**What it is:** The DHS Trusted Tester Process is a standardized, manual test approach for evaluating web content conformance with Section 508 requirements. It aligns with the ICT Testing Baseline and provides repeatable, reliable conformance test results. DHS offers formal training and certification for individuals to become "Trusted Testers." The current version is Trusted Tester v5.

**Why it matters:**
- Provides a standardized, repeatable testing methodology
- Test results from certified Trusted Testers are accepted across federal agencies
- Ensures consistent interpretation of 508 requirements
- Aligns with the ICT Testing Baseline for cross-agency consistency
- Many federal agencies only accept test results from certified testers

**Key components:**
- **Training:** Self-paced online training available at training.section508testing.net
- **Certification:** Formal exam certifying competence in the process
- **Test Process:** Step-by-step testing procedures for each 508/WCAG requirement
- **Tools:** ANDI, Color Contrast Analyzer, browser developer tools
- **Reporting:** Section 508 Compliance Reporting Tool (SCRT)

**The Trusted Tester v5 process covers:**
1. Conforming alternate versions
2. Auto-playing and auto-updating content
3. Flashing content
4. Keyboard access and focus
5. Forms
6. Links and buttons
7. Images
8. Adjustable time limits
9. Repetitive content (bypass blocks, consistent navigation)
10. Content structure (headings, lists)
11. Language
12. Page titles
13. Data tables
14. CSS content and positioning
15. Audio/video content
16. Embedded frames (iframes)
17. Color and contrast
18. Resize text
19. Multiple ways to locate pages
20. Parsing (for WCAG 2.0 conformance)

**Web application implementation guidance:**
- Follow the Trusted Tester v5 test process for all accessibility testing
- Use the tools specified in the process: ANDI, Color Contrast Analyzer, browser DevTools
- Consider sending team members for Trusted Tester certification
- Use the SCRT (Section 508 Compliance Reporting Tool) for formal reporting
- Document test results following the Trusted Tester reporting format
- Run the full Trusted Tester process before each major release
- Prioritize findings: Critical (blocks access) > Major (significant barrier) > Minor (inconvenience)

---

## APPENDIX: Implementation Priority Matrix for Web Applications

### Immediate (Before Next Release)

| Priority | Item | Effort |
|----------|------|--------|
| P0 | Add `lang="en"` to all HTML pages | Low |
| P0 | Add unique, descriptive `<title>` to each page | Low |
| P0 | Add skip navigation link | Low |
| P0 | Verify all images have appropriate `alt` text | Medium |
| P0 | Ensure all form inputs have associated `<label>` elements | Medium |
| P0 | Verify color contrast meets 4.5:1 for text | Medium |
| P0 | Ensure keyboard navigation works for all interactive elements | Medium |
| P0 | Add ARIA landmarks (`<main>`, `<nav>`, `<header>`, `<footer>`) | Low |

### Short-Term (Next 30 Days)

| Priority | Item | Effort |
|----------|------|--------|
| P1 | Integrate axe-core into testing pipeline | Medium |
| P1 | Fix heading hierarchy across all pages | Medium |
| P1 | Add `aria-live` regions for dynamic content updates | Medium |
| P1 | Ensure all error messages are accessible | Medium |
| P1 | Add `autocomplete` attributes to form fields | Low |
| P1 | Verify focus visibility on all interactive elements | Medium |
| P1 | Test and fix responsive layout at 320px width (reflow) | High |
| P1 | Create accessibility statement page | Low |

### Medium-Term (Next 90 Days)

| Priority | Item | Effort |
|----------|------|--------|
| P2 | Complete VPAT/ACR for the application | High |
| P2 | Screen reader testing (NVDA + Chrome, JAWS + Chrome) | High |
| P2 | Implement plain language review of all UI text | Medium |
| P2 | Ensure generated PDFs are accessible (PDF/UA) | High |
| P2 | Add style linting (vale) to CI pipeline | Medium |
| P2 | Create documentation style guide | Medium |
| P2 | Implement API documentation (OpenAPI) | High |

### Long-Term (Next 6 Months)

| Priority | Item | Effort |
|----------|------|--------|
| P3 | Achieve WCAG 2.2 Level AA conformance | High |
| P3 | Conduct usability testing with users with disabilities | High |
| P3 | Implement docs-as-code pipeline | High |
| P3 | Obtain Trusted Tester certification for team member | Medium |
| P3 | Internationalization/localization preparation | High |
| P3 | Implement documentation coverage metrics | Medium |

---

## REFERENCES

### Standards and Specifications
- OASIS DITA 1.3: https://docs.oasis-open.org/dita/dita/v1.3/os/part0-overview/dita-v1.3-os-part0-overview.html
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- WCAG 2.1: https://www.w3.org/TR/WCAG21/
- Revised Section 508 Standards: https://www.access-board.gov/ict/
- WAI-ARIA 1.2: https://www.w3.org/TR/wai-aria-1.2/
- WAI-ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/
- PDF/UA (ISO 14289): https://www.iso.org/standard/64599.html
- OpenAPI Specification: https://spec.openapis.org/oas/latest.html

### Style Guides
- Google Developer Documentation Style Guide: https://developers.google.com/style
- Microsoft Writing Style Guide: https://learn.microsoft.com/en-us/style-guide/welcome/
- Federal Plain Language Guidelines: https://digital.gov/guides/plain-language/

### Federal Resources
- Section508.gov: https://www.section508.gov/
- ICT Testing Baseline: https://ictbaseline.access-board.gov/
- DHS Trusted Tester: https://www.dhs.gov/trusted-tester
- VPAT Templates: https://www.itic.org/policy/accessibility/vpat
- U.S. Web Design System: https://designsystem.digital.gov/
- OMB M-24-08: https://bidenwhitehouse.archives.gov/omb/management/ofcio/m-24-08-strengthening-digital-accessibility-and-the-management-of-section-508-of-the-rehabilitation-act/

### Testing Tools
- axe-core: https://github.com/dequelabs/axe-core
- WAVE: https://wave.webaim.org/
- ANDI: https://www.ssa.gov/accessibility/andi/help/install.html
- Pa11y: https://pa11y.org/
- Lighthouse: https://developer.chrome.com/docs/lighthouse/
- PAC (PDF Accessibility Checker): https://pdfua.foundation/en/pac-download
