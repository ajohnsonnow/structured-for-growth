# WCAG 2.1 AA Accessibility Audit Results

**Generated:** 2026-02-16  
**Tool:** axe-core (Deque) via jsdom  
**Standard:** WCAG 2.1 Level AA + Section 508 + Best Practices  
**System:** Structured for Growth — Consulting & Compliance Platform  
**Scope:** All client-side HTML pages (`client/*.html`)

> **Note:** This audit uses axe-core in a jsdom (simulated browser) environment. 
> CSS-dependent checks such as color contrast, reflow, and visual spacing require a 
> real browser audit (e.g., Lighthouse, WAVE, or manual testing with a screen reader). 
> Those results should be documented separately under P2.2.3 (Trusted Tester baseline).

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Pages Scanned | 10 |
| Total Rules Passed | 348 |
| Total Violations | 0 |
| — 🔴 Critical | 0 |
| — 🟠 Serious | 0 |
| — 🟡 Moderate | 0 |
| — 🟢 Minor | 0 |
| Incomplete (needs manual review) | 13 |
| **Overall Result** | ✅ PASS — zero automated violations |

### Page-Level Summary

| Page | Violations | Passes | Incomplete | Status |
|------|-----------|--------|-----------|--------|
| compliance.html | 0 | 39 | 0 | ✅ Pass |
| dashboard.html | 0 | 41 | 2 | ✅ Pass |
| docs.html | 0 | 38 | 3 | ✅ Pass |
| glossary.html | 0 | 30 | 2 | ✅ Pass |
| index.html | 0 | 37 | 2 | ✅ Pass |
| mbai.html | 0 | 35 | 0 | ✅ Pass |
| offline.html | 0 | 27 | 2 | ✅ Pass |
| portal.html | 0 | 39 | 0 | ✅ Pass |
| skills.html | 0 | 27 | 2 | ✅ Pass |
| templates.html | 0 | 35 | 0 | ✅ Pass |

---

## Detailed Results by Page

### compliance.html

**✅ No violations detected.**

<details>
<summary>Rules passed (39)</summary>

| Rule | Description |
|------|-------------|
| aria-allowed-attr | Elements must only use supported ARIA attributes |
| aria-allowed-role | ARIA role should be appropriate for the element |
| aria-conditional-attr | ARIA attributes must be used as specified for the element's role |
| aria-deprecated-role | Deprecated ARIA roles must not be used |
| aria-dialog-name | ARIA dialog and alertdialog nodes should have an accessible name |
| aria-hidden-body | aria-hidden="true" must not be present on the document body |
| aria-prohibited-attr | Elements must only use permitted ARIA attributes |
| aria-required-attr | Required ARIA attributes must be provided |
| aria-required-children | Certain ARIA roles must contain particular children |
| aria-required-parent | Certain ARIA roles must be contained by particular parents |
| aria-roles | ARIA roles used must conform to valid values |
| aria-valid-attr-value | ARIA attributes must conform to valid values |
| aria-valid-attr | ARIA attributes must conform to valid names |
| button-name | Buttons must have discernible text |
| bypass | Page must have means to bypass repeated blocks |
| document-title | Documents must have <title> element to aid in navigation |
| duplicate-id-aria | IDs used in ARIA and labels must be unique |
| empty-heading | Headings should not be empty |
| form-field-multiple-labels | Form field must not have multiple label elements |
| heading-order | Heading levels should only increase by one |
| html-has-lang | <html> element must have a lang attribute |
| html-lang-valid | <html> element must have a valid value for the lang attribute |
| label-title-only | Form elements should have a visible label |
| label | Form elements must have labels |
| landmark-contentinfo-is-top-level | Contentinfo landmark should not be contained in another landmark |
| landmark-main-is-top-level | Main landmark should not be contained in another landmark |
| landmark-no-duplicate-contentinfo | Document should not have more than one contentinfo landmark |
| landmark-no-duplicate-main | Document should not have more than one main landmark |
| landmark-one-main | Document should have one main landmark |
| landmark-unique | Landmarks should have a unique role or role/label/title (i.e. accessible name) combination |
| link-name | Links must have discernible text |
| list | <ul> and <ol> must only directly contain <li>, <script> or <template> elements |
| listitem | <li> elements must be contained in a <ul> or <ol> |
| meta-viewport-large | Users should be able to zoom and scale the text up to 500% |
| meta-viewport | Zooming and scaling must not be disabled |
| nested-interactive | Interactive controls must not be nested |
| page-has-heading-one | Page should contain a level-one heading |
| presentation-role-conflict | Elements marked as presentational should be consistently ignored |
| region | All page content should be contained by landmarks |

</details>

---

### dashboard.html

**✅ No violations detected.**

<details>
<summary>Rules passed (41)</summary>

| Rule | Description |
|------|-------------|
| aria-allowed-attr | Elements must only use supported ARIA attributes |
| aria-allowed-role | ARIA role should be appropriate for the element |
| aria-conditional-attr | ARIA attributes must be used as specified for the element's role |
| aria-deprecated-role | Deprecated ARIA roles must not be used |
| aria-dialog-name | ARIA dialog and alertdialog nodes should have an accessible name |
| aria-hidden-body | aria-hidden="true" must not be present on the document body |
| aria-hidden-focus | ARIA hidden element must not be focusable or contain focusable elements |
| aria-prohibited-attr | Elements must only use permitted ARIA attributes |
| aria-required-attr | Required ARIA attributes must be provided |
| aria-roles | ARIA roles used must conform to valid values |
| aria-valid-attr-value | ARIA attributes must conform to valid values |
| aria-valid-attr | ARIA attributes must conform to valid names |
| autocomplete-valid | autocomplete attribute must be used correctly |
| button-name | Buttons must have discernible text |
| bypass | Page must have means to bypass repeated blocks |
| document-title | Documents must have <title> element to aid in navigation |
| duplicate-id-aria | IDs used in ARIA and labels must be unique |
| empty-heading | Headings should not be empty |
| empty-table-header | Table header text should not be empty |
| form-field-multiple-labels | Form field must not have multiple label elements |
| heading-order | Heading levels should only increase by one |
| html-has-lang | <html> element must have a lang attribute |
| html-lang-valid | <html> element must have a valid value for the lang attribute |
| label-title-only | Form elements should have a visible label |
| label | Form elements must have labels |
| landmark-complementary-is-top-level | Aside should not be contained in another landmark |
| landmark-main-is-top-level | Main landmark should not be contained in another landmark |
| landmark-no-duplicate-main | Document should not have more than one main landmark |
| landmark-one-main | Document should have one main landmark |
| landmark-unique | Landmarks should have a unique role or role/label/title (i.e. accessible name) combination |
| link-name | Links must have discernible text |
| list | <ul> and <ol> must only directly contain <li>, <script> or <template> elements |
| listitem | <li> elements must be contained in a <ul> or <ol> |
| meta-viewport-large | Users should be able to zoom and scale the text up to 500% |
| meta-viewport | Zooming and scaling must not be disabled |
| nested-interactive | Interactive controls must not be nested |
| page-has-heading-one | Page should contain a level-one heading |
| region | All page content should be contained by landmarks |
| select-name | Select element must have an accessible name |
| table-duplicate-name | Tables should not have the same summary and caption |
| td-headers-attr | Table cell headers attributes must refer to other <th> elements in the same table |

</details>

<details>
<summary>Needs manual review (2)</summary>

| Rule | Description | Impact |
|------|-------------|--------|
| duplicate-id-aria | IDs used in ARIA and labels must be unique | critical |
| th-has-data-cells | Table headers in a data table must refer to data cells | serious |

</details>

---

### docs.html

**✅ No violations detected.**

<details>
<summary>Rules passed (38)</summary>

| Rule | Description |
|------|-------------|
| aria-allowed-attr | Elements must only use supported ARIA attributes |
| aria-allowed-role | ARIA role should be appropriate for the element |
| aria-conditional-attr | ARIA attributes must be used as specified for the element's role |
| aria-deprecated-role | Deprecated ARIA roles must not be used |
| aria-hidden-body | aria-hidden="true" must not be present on the document body |
| aria-prohibited-attr | Elements must only use permitted ARIA attributes |
| aria-required-attr | Required ARIA attributes must be provided |
| aria-required-children | Certain ARIA roles must contain particular children |
| aria-required-parent | Certain ARIA roles must be contained by particular parents |
| aria-roles | ARIA roles used must conform to valid values |
| aria-valid-attr-value | ARIA attributes must conform to valid values |
| aria-valid-attr | ARIA attributes must conform to valid names |
| autocomplete-valid | autocomplete attribute must be used correctly |
| button-name | Buttons must have discernible text |
| bypass | Page must have means to bypass repeated blocks |
| document-title | Documents must have <title> element to aid in navigation |
| duplicate-id-aria | IDs used in ARIA and labels must be unique |
| empty-heading | Headings should not be empty |
| empty-table-header | Table header text should not be empty |
| form-field-multiple-labels | Form field must not have multiple label elements |
| heading-order | Heading levels should only increase by one |
| html-has-lang | <html> element must have a lang attribute |
| html-lang-valid | <html> element must have a valid value for the lang attribute |
| label-title-only | Form elements should have a visible label |
| label | Form elements must have labels |
| landmark-contentinfo-is-top-level | Contentinfo landmark should not be contained in another landmark |
| landmark-main-is-top-level | Main landmark should not be contained in another landmark |
| landmark-no-duplicate-contentinfo | Document should not have more than one contentinfo landmark |
| landmark-no-duplicate-main | Document should not have more than one main landmark |
| landmark-unique | Landmarks should have a unique role or role/label/title (i.e. accessible name) combination |
| link-name | Links must have discernible text |
| meta-viewport-large | Users should be able to zoom and scale the text up to 500% |
| meta-viewport | Zooming and scaling must not be disabled |
| nested-interactive | Interactive controls must not be nested |
| presentation-role-conflict | Elements marked as presentational should be consistently ignored |
| region | All page content should be contained by landmarks |
| table-duplicate-name | Tables should not have the same summary and caption |
| td-headers-attr | Table cell headers attributes must refer to other <th> elements in the same table |

</details>

<details>
<summary>Needs manual review (3)</summary>

| Rule | Description | Impact |
|------|-------------|--------|
| landmark-one-main | Document should have one main landmark | moderate |
| page-has-heading-one | Page should contain a level-one heading | moderate |
| th-has-data-cells | Table headers in a data table must refer to data cells | serious |

</details>

---

### glossary.html

**✅ No violations detected.**

<details>
<summary>Rules passed (30)</summary>

| Rule | Description |
|------|-------------|
| aria-allowed-attr | Elements must only use supported ARIA attributes |
| aria-allowed-role | ARIA role should be appropriate for the element |
| aria-conditional-attr | ARIA attributes must be used as specified for the element's role |
| aria-deprecated-role | Deprecated ARIA roles must not be used |
| aria-hidden-body | aria-hidden="true" must not be present on the document body |
| aria-prohibited-attr | Elements must only use permitted ARIA attributes |
| aria-required-attr | Required ARIA attributes must be provided |
| aria-roles | ARIA roles used must conform to valid values |
| aria-valid-attr-value | ARIA attributes must conform to valid values |
| aria-valid-attr | ARIA attributes must conform to valid names |
| autocomplete-valid | autocomplete attribute must be used correctly |
| button-name | Buttons must have discernible text |
| bypass | Page must have means to bypass repeated blocks |
| document-title | Documents must have <title> element to aid in navigation |
| empty-heading | Headings should not be empty |
| form-field-multiple-labels | Form field must not have multiple label elements |
| heading-order | Heading levels should only increase by one |
| html-has-lang | <html> element must have a lang attribute |
| html-lang-valid | <html> element must have a valid value for the lang attribute |
| label-title-only | Form elements should have a visible label |
| label | Form elements must have labels |
| landmark-main-is-top-level | Main landmark should not be contained in another landmark |
| landmark-no-duplicate-main | Document should not have more than one main landmark |
| landmark-unique | Landmarks should have a unique role or role/label/title (i.e. accessible name) combination |
| link-name | Links must have discernible text |
| list | <ul> and <ol> must only directly contain <li>, <script> or <template> elements |
| meta-viewport-large | Users should be able to zoom and scale the text up to 500% |
| meta-viewport | Zooming and scaling must not be disabled |
| nested-interactive | Interactive controls must not be nested |
| region | All page content should be contained by landmarks |

</details>

<details>
<summary>Needs manual review (2)</summary>

| Rule | Description | Impact |
|------|-------------|--------|
| landmark-one-main | Document should have one main landmark | moderate |
| page-has-heading-one | Page should contain a level-one heading | moderate |

</details>

---

### index.html

**✅ No violations detected.**

<details>
<summary>Rules passed (37)</summary>

| Rule | Description |
|------|-------------|
| aria-allowed-attr | Elements must only use supported ARIA attributes |
| aria-allowed-role | ARIA role should be appropriate for the element |
| aria-conditional-attr | ARIA attributes must be used as specified for the element's role |
| aria-deprecated-role | Deprecated ARIA roles must not be used |
| aria-hidden-body | aria-hidden="true" must not be present on the document body |
| aria-prohibited-attr | Elements must only use permitted ARIA attributes |
| aria-required-attr | Required ARIA attributes must be provided |
| aria-required-children | Certain ARIA roles must contain particular children |
| aria-required-parent | Certain ARIA roles must be contained by particular parents |
| aria-roles | ARIA roles used must conform to valid values |
| aria-valid-attr-value | ARIA attributes must conform to valid values |
| aria-valid-attr | ARIA attributes must conform to valid names |
| button-name | Buttons must have discernible text |
| bypass | Page must have means to bypass repeated blocks |
| document-title | Documents must have <title> element to aid in navigation |
| duplicate-id-aria | IDs used in ARIA and labels must be unique |
| empty-heading | Headings should not be empty |
| form-field-multiple-labels | Form field must not have multiple label elements |
| heading-order | Heading levels should only increase by one |
| html-has-lang | <html> element must have a lang attribute |
| html-lang-valid | <html> element must have a valid value for the lang attribute |
| label-title-only | Form elements should have a visible label |
| label | Form elements must have labels |
| landmark-contentinfo-is-top-level | Contentinfo landmark should not be contained in another landmark |
| landmark-main-is-top-level | Main landmark should not be contained in another landmark |
| landmark-no-duplicate-contentinfo | Document should not have more than one contentinfo landmark |
| landmark-no-duplicate-main | Document should not have more than one main landmark |
| landmark-unique | Landmarks should have a unique role or role/label/title (i.e. accessible name) combination |
| link-name | Links must have discernible text |
| list | <ul> and <ol> must only directly contain <li>, <script> or <template> elements |
| listitem | <li> elements must be contained in a <ul> or <ol> |
| meta-viewport-large | Users should be able to zoom and scale the text up to 500% |
| meta-viewport | Zooming and scaling must not be disabled |
| nested-interactive | Interactive controls must not be nested |
| presentation-role-conflict | Elements marked as presentational should be consistently ignored |
| region | All page content should be contained by landmarks |
| select-name | Select element must have an accessible name |

</details>

<details>
<summary>Needs manual review (2)</summary>

| Rule | Description | Impact |
|------|-------------|--------|
| landmark-one-main | Document should have one main landmark | moderate |
| page-has-heading-one | Page should contain a level-one heading | moderate |

</details>

---

### mbai.html

**✅ No violations detected.**

<details>
<summary>Rules passed (35)</summary>

| Rule | Description |
|------|-------------|
| aria-allowed-attr | Elements must only use supported ARIA attributes |
| aria-allowed-role | ARIA role should be appropriate for the element |
| aria-conditional-attr | ARIA attributes must be used as specified for the element's role |
| aria-deprecated-role | Deprecated ARIA roles must not be used |
| aria-dialog-name | ARIA dialog and alertdialog nodes should have an accessible name |
| aria-hidden-body | aria-hidden="true" must not be present on the document body |
| aria-prohibited-attr | Elements must only use permitted ARIA attributes |
| aria-required-attr | Required ARIA attributes must be provided |
| aria-required-children | Certain ARIA roles must contain particular children |
| aria-required-parent | Certain ARIA roles must be contained by particular parents |
| aria-roles | ARIA roles used must conform to valid values |
| aria-valid-attr-value | ARIA attributes must conform to valid values |
| aria-valid-attr | ARIA attributes must conform to valid names |
| button-name | Buttons must have discernible text |
| bypass | Page must have means to bypass repeated blocks |
| document-title | Documents must have <title> element to aid in navigation |
| duplicate-id-aria | IDs used in ARIA and labels must be unique |
| empty-heading | Headings should not be empty |
| form-field-multiple-labels | Form field must not have multiple label elements |
| heading-order | Heading levels should only increase by one |
| html-has-lang | <html> element must have a lang attribute |
| html-lang-valid | <html> element must have a valid value for the lang attribute |
| label-title-only | Form elements should have a visible label |
| label | Form elements must have labels |
| landmark-main-is-top-level | Main landmark should not be contained in another landmark |
| landmark-no-duplicate-main | Document should not have more than one main landmark |
| landmark-one-main | Document should have one main landmark |
| landmark-unique | Landmarks should have a unique role or role/label/title (i.e. accessible name) combination |
| link-name | Links must have discernible text |
| meta-viewport-large | Users should be able to zoom and scale the text up to 500% |
| meta-viewport | Zooming and scaling must not be disabled |
| nested-interactive | Interactive controls must not be nested |
| page-has-heading-one | Page should contain a level-one heading |
| presentation-role-conflict | Elements marked as presentational should be consistently ignored |
| region | All page content should be contained by landmarks |

</details>

---

### offline.html

**✅ No violations detected.**

<details>
<summary>Rules passed (27)</summary>

| Rule | Description |
|------|-------------|
| aria-allowed-attr | Elements must only use supported ARIA attributes |
| aria-allowed-role | ARIA role should be appropriate for the element |
| aria-conditional-attr | ARIA attributes must be used as specified for the element's role |
| aria-deprecated-role | Deprecated ARIA roles must not be used |
| aria-hidden-body | aria-hidden="true" must not be present on the document body |
| aria-hidden-focus | ARIA hidden element must not be focusable or contain focusable elements |
| aria-prohibited-attr | Elements must only use permitted ARIA attributes |
| aria-required-attr | Required ARIA attributes must be provided |
| aria-roles | ARIA roles used must conform to valid values |
| aria-valid-attr-value | ARIA attributes must conform to valid values |
| aria-valid-attr | ARIA attributes must conform to valid names |
| avoid-inline-spacing | Inline text spacing must be adjustable with custom stylesheets |
| button-name | Buttons must have discernible text |
| bypass | Page must have means to bypass repeated blocks |
| document-title | Documents must have <title> element to aid in navigation |
| empty-heading | Headings should not be empty |
| heading-order | Heading levels should only increase by one |
| html-has-lang | <html> element must have a lang attribute |
| html-lang-valid | <html> element must have a valid value for the lang attribute |
| landmark-main-is-top-level | Main landmark should not be contained in another landmark |
| landmark-no-duplicate-main | Document should not have more than one main landmark |
| landmark-unique | Landmarks should have a unique role or role/label/title (i.e. accessible name) combination |
| link-name | Links must have discernible text |
| meta-viewport-large | Users should be able to zoom and scale the text up to 500% |
| meta-viewport | Zooming and scaling must not be disabled |
| nested-interactive | Interactive controls must not be nested |
| region | All page content should be contained by landmarks |

</details>

<details>
<summary>Needs manual review (2)</summary>

| Rule | Description | Impact |
|------|-------------|--------|
| landmark-one-main | Document should have one main landmark | moderate |
| page-has-heading-one | Page should contain a level-one heading | moderate |

</details>

---

### portal.html

**✅ No violations detected.**

<details>
<summary>Rules passed (39)</summary>

| Rule | Description |
|------|-------------|
| aria-allowed-attr | Elements must only use supported ARIA attributes |
| aria-allowed-role | ARIA role should be appropriate for the element |
| aria-conditional-attr | ARIA attributes must be used as specified for the element's role |
| aria-deprecated-role | Deprecated ARIA roles must not be used |
| aria-dialog-name | ARIA dialog and alertdialog nodes should have an accessible name |
| aria-hidden-body | aria-hidden="true" must not be present on the document body |
| aria-hidden-focus | ARIA hidden element must not be focusable or contain focusable elements |
| aria-prohibited-attr | Elements must only use permitted ARIA attributes |
| aria-required-attr | Required ARIA attributes must be provided |
| aria-roles | ARIA roles used must conform to valid values |
| aria-valid-attr-value | ARIA attributes must conform to valid values |
| aria-valid-attr | ARIA attributes must conform to valid names |
| button-name | Buttons must have discernible text |
| bypass | Page must have means to bypass repeated blocks |
| document-title | Documents must have <title> element to aid in navigation |
| duplicate-id-aria | IDs used in ARIA and labels must be unique |
| empty-heading | Headings should not be empty |
| form-field-multiple-labels | Form field must not have multiple label elements |
| heading-order | Heading levels should only increase by one |
| html-has-lang | <html> element must have a lang attribute |
| html-lang-valid | <html> element must have a valid value for the lang attribute |
| image-alt | Images must have alternative text |
| image-redundant-alt | Alternative text of images should not be repeated as text |
| label-title-only | Form elements should have a visible label |
| label | Form elements must have labels |
| landmark-banner-is-top-level | Banner landmark should not be contained in another landmark |
| landmark-contentinfo-is-top-level | Contentinfo landmark should not be contained in another landmark |
| landmark-main-is-top-level | Main landmark should not be contained in another landmark |
| landmark-no-duplicate-banner | Document should not have more than one banner landmark |
| landmark-no-duplicate-contentinfo | Document should not have more than one contentinfo landmark |
| landmark-no-duplicate-main | Document should not have more than one main landmark |
| landmark-one-main | Document should have one main landmark |
| landmark-unique | Landmarks should have a unique role or role/label/title (i.e. accessible name) combination |
| link-name | Links must have discernible text |
| meta-viewport-large | Users should be able to zoom and scale the text up to 500% |
| meta-viewport | Zooming and scaling must not be disabled |
| nested-interactive | Interactive controls must not be nested |
| page-has-heading-one | Page should contain a level-one heading |
| region | All page content should be contained by landmarks |

</details>

---

### skills.html

**✅ No violations detected.**

<details>
<summary>Rules passed (27)</summary>

| Rule | Description |
|------|-------------|
| aria-allowed-attr | Elements must only use supported ARIA attributes |
| aria-allowed-role | ARIA role should be appropriate for the element |
| aria-conditional-attr | ARIA attributes must be used as specified for the element's role |
| aria-deprecated-role | Deprecated ARIA roles must not be used |
| aria-hidden-body | aria-hidden="true" must not be present on the document body |
| aria-hidden-focus | ARIA hidden element must not be focusable or contain focusable elements |
| aria-prohibited-attr | Elements must only use permitted ARIA attributes |
| aria-required-attr | Required ARIA attributes must be provided |
| aria-roles | ARIA roles used must conform to valid values |
| aria-valid-attr-value | ARIA attributes must conform to valid values |
| aria-valid-attr | ARIA attributes must conform to valid names |
| button-name | Buttons must have discernible text |
| bypass | Page must have means to bypass repeated blocks |
| document-title | Documents must have <title> element to aid in navigation |
| empty-heading | Headings should not be empty |
| heading-order | Heading levels should only increase by one |
| html-has-lang | <html> element must have a lang attribute |
| html-lang-valid | <html> element must have a valid value for the lang attribute |
| landmark-main-is-top-level | Main landmark should not be contained in another landmark |
| landmark-no-duplicate-main | Document should not have more than one main landmark |
| landmark-unique | Landmarks should have a unique role or role/label/title (i.e. accessible name) combination |
| link-name | Links must have discernible text |
| meta-viewport-large | Users should be able to zoom and scale the text up to 500% |
| meta-viewport | Zooming and scaling must not be disabled |
| nested-interactive | Interactive controls must not be nested |
| region | All page content should be contained by landmarks |
| role-img-alt | [role="img"] elements must have alternative text |

</details>

<details>
<summary>Needs manual review (2)</summary>

| Rule | Description | Impact |
|------|-------------|--------|
| landmark-one-main | Document should have one main landmark | moderate |
| page-has-heading-one | Page should contain a level-one heading | moderate |

</details>

---

### templates.html

**✅ No violations detected.**

<details>
<summary>Rules passed (35)</summary>

| Rule | Description |
|------|-------------|
| aria-allowed-attr | Elements must only use supported ARIA attributes |
| aria-allowed-role | ARIA role should be appropriate for the element |
| aria-conditional-attr | ARIA attributes must be used as specified for the element's role |
| aria-deprecated-role | Deprecated ARIA roles must not be used |
| aria-dialog-name | ARIA dialog and alertdialog nodes should have an accessible name |
| aria-hidden-body | aria-hidden="true" must not be present on the document body |
| aria-prohibited-attr | Elements must only use permitted ARIA attributes |
| aria-required-attr | Required ARIA attributes must be provided |
| aria-required-children | Certain ARIA roles must contain particular children |
| aria-required-parent | Certain ARIA roles must be contained by particular parents |
| aria-roles | ARIA roles used must conform to valid values |
| aria-valid-attr-value | ARIA attributes must conform to valid values |
| aria-valid-attr | ARIA attributes must conform to valid names |
| button-name | Buttons must have discernible text |
| bypass | Page must have means to bypass repeated blocks |
| document-title | Documents must have <title> element to aid in navigation |
| duplicate-id-aria | IDs used in ARIA and labels must be unique |
| empty-heading | Headings should not be empty |
| form-field-multiple-labels | Form field must not have multiple label elements |
| heading-order | Heading levels should only increase by one |
| html-has-lang | <html> element must have a lang attribute |
| html-lang-valid | <html> element must have a valid value for the lang attribute |
| label-title-only | Form elements should have a visible label |
| label | Form elements must have labels |
| landmark-main-is-top-level | Main landmark should not be contained in another landmark |
| landmark-no-duplicate-main | Document should not have more than one main landmark |
| landmark-one-main | Document should have one main landmark |
| landmark-unique | Landmarks should have a unique role or role/label/title (i.e. accessible name) combination |
| link-name | Links must have discernible text |
| meta-viewport-large | Users should be able to zoom and scale the text up to 500% |
| meta-viewport | Zooming and scaling must not be disabled |
| nested-interactive | Interactive controls must not be nested |
| page-has-heading-one | Page should contain a level-one heading |
| presentation-role-conflict | Elements marked as presentational should be consistently ignored |
| region | All page content should be contained by landmarks |

</details>

---

## WCAG 2.1 Success Criteria Coverage

The following table maps WCAG 2.1 Level A and AA success criteria to automated test coverage:

| SC | Name | Level | Automated | Notes |
|-------|------|-------|-----------|-------|
| 1.1.1 | Non-text Content | A | ✅ axe-core | `image-alt`, `input-image-alt`, `object-alt` |
| 1.2.1 | Audio-only and Video-only | A | Partial | `video-caption` — requires manual review for media |
| 1.2.2 | Captions (Prerecorded) | A | Partial | `video-caption` — requires manual review |
| 1.2.3 | Audio Description or Media Alternative | A | ❌ Manual | Not testable by axe-core |
| 1.2.4 | Captions (Live) | AA | ❌ Manual | Not applicable to static pages |
| 1.2.5 | Audio Description (Prerecorded) | AA | ❌ Manual | Not testable by axe-core |
| 1.3.1 | Info and Relationships | A | ✅ axe-core | `aria-required-attr`, `list`, `listitem`, `definition-list`, `table-*` |
| 1.3.2 | Meaningful Sequence | A | Partial | `tabindex` — partly testable |
| 1.3.3 | Sensory Characteristics | A | ❌ Manual | Requires human judgment |
| 1.3.4 | Orientation | AA | ❌ Manual | Requires viewport testing |
| 1.3.5 | Identify Input Purpose | AA | ✅ axe-core | `autocomplete-valid` |
| 1.4.1 | Use of Color | A | ❌ Manual | Requires human judgment |
| 1.4.2 | Audio Control | A | ❌ Manual | N/A — no auto-playing audio |
| 1.4.3 | Contrast (Minimum) | AA | ⚠ Disabled | `color-contrast` — requires real browser (disabled in jsdom) |
| 1.4.4 | Resize Text | AA | ❌ Manual | Requires viewport testing |
| 1.4.5 | Images of Text | AA | ❌ Manual | Requires human judgment |
| 1.4.10 | Reflow | AA | ❌ Manual | Requires viewport testing |
| 1.4.11 | Non-text Contrast | AA | ❌ Manual | Requires visual inspection |
| 1.4.12 | Text Spacing | AA | ❌ Manual | Requires CSS override testing |
| 1.4.13 | Content on Hover or Focus | AA | ❌ Manual | Requires interaction testing |
| 2.1.1 | Keyboard | A | Partial | `accesskeys`, `tabindex` — full test requires manual |
| 2.1.2 | No Keyboard Trap | A | ❌ Manual | Requires interaction testing |
| 2.1.4 | Character Key Shortcuts | A | ❌ Manual | Requires interaction testing |
| 2.2.1 | Timing Adjustable | A | ❌ Manual | Requires interaction testing |
| 2.2.2 | Pause, Stop, Hide | A | ❌ Manual | No auto-updating content |
| 2.3.1 | Three Flashes or Below Threshold | A | ❌ Manual | No flashing content |
| 2.4.1 | Bypass Blocks | A | ✅ axe-core | `bypass`, `region` |
| 2.4.2 | Page Titled | A | ✅ axe-core | `document-title` |
| 2.4.3 | Focus Order | A | ❌ Manual | Requires interaction testing |
| 2.4.4 | Link Purpose (In Context) | A | ✅ axe-core | `link-name` |
| 2.4.5 | Multiple Ways | AA | ❌ Manual | Requires site-level review |
| 2.4.6 | Headings and Labels | AA | ✅ axe-core | `heading-order`, `label` |
| 2.4.7 | Focus Visible | AA | ⚠ CSS | Implemented via `main.css` `:focus-visible` — manual verification needed |
| 2.5.1 | Pointer Gestures | A | ❌ Manual | N/A — no complex gestures |
| 2.5.2 | Pointer Cancellation | A | ❌ Manual | Standard click behavior |
| 2.5.3 | Label in Name | A | ✅ axe-core | `label-title-only` |
| 2.5.4 | Motion Actuation | A | ❌ Manual | N/A — no motion input |
| 3.1.1 | Language of Page | A | ✅ axe-core | `html-has-lang`, `html-lang-valid` |
| 3.1.2 | Language of Parts | AA | ✅ axe-core | `valid-lang` |
| 3.2.1 | On Focus | A | ❌ Manual | Requires interaction testing |
| 3.2.2 | On Input | A | ❌ Manual | Requires interaction testing |
| 3.2.3 | Consistent Navigation | AA | ❌ Manual | Requires site-level review |
| 3.2.4 | Consistent Identification | AA | ❌ Manual | Requires site-level review |
| 3.3.1 | Error Identification | A | ❌ Manual | Requires form submission testing |
| 3.3.2 | Labels or Instructions | A | ✅ axe-core | `label`, `aria-input-field-name` |
| 3.3.3 | Error Suggestion | AA | ❌ Manual | Requires form submission testing |
| 3.3.4 | Error Prevention (Legal, Financial, Data) | AA | ❌ Manual | Requires workflow testing |
| 4.1.1 | Parsing | A | ✅ axe-core | `duplicate-id`, `duplicate-id-active` |
| 4.1.2 | Name, Role, Value | A | ✅ axe-core | `aria-*`, `button-name`, `input-*-name` |
| 4.1.3 | Status Messages | AA | ❌ Manual | `aria-live` — requires interaction testing |

## Recommendations

### Immediate Actions

1. ✅ No automated violations to fix — all pages pass axe-core WCAG 2.1 AA checks

### Manual Testing Required

The following items require manual testing beyond what axe-core can detect:

1. **Color Contrast (SC 1.4.3):** Run Lighthouse or WAVE in a real browser to verify contrast ratios
2. **Keyboard Navigation (SC 2.1.1, 2.1.2, 2.4.3, 2.4.7):** Tab through every page, verify focus order and visibility
3. **Screen Reader Testing:** Test with NVDA (Windows) and VoiceOver (macOS) for proper announcements
4. **Zoom/Reflow (SC 1.4.4, 1.4.10):** Verify content reflows properly at 200% and 400% zoom
5. **Text Spacing (SC 1.4.12):** Apply WCAG text spacing overrides and verify no loss of content
6. **Focus Not Obscured (SC 2.4.11, 2.4.12):** Verify focused elements are not hidden by sticky headers
7. **Target Size (SC 2.5.8):** Verify all interactive elements meet 24×24px minimum size

### Ongoing

1. axe-core tests run automatically in CI on every build (`.github/workflows/ci.yml`)
2. The threshold for moderate violations is set to ≤5 per page — lower to 0 as issues are fixed
3. Schedule quarterly manual accessibility audits
4. Complete DHS Trusted Tester v5.1 baseline testing (P2.2.3)
5. Generate VPAT 2.5 Accessibility Conformance Report (P2.2.4)

---

## Test Configuration

```json
{
  "tool": "axe-core",
  "environment": "jsdom (Vitest)",
  "runOnly": [
    "wcag2a",
    "wcag2aa",
    "wcag21a",
    "wcag21aa",
    "section508",
    "best-practice"
  ],
  "disabledRules": [
    "color-contrast (requires real browser rendering)"
  ],
  "testFile": "tests/accessibility/axe.test.js",
  "ciStep": ".github/workflows/ci.yml — \"Run accessibility tests (axe-core)\"",
  "npmScript": "npm run test:a11y"
}
```

---

*This report was auto-generated by `scripts/generate-wcag-report.js`. Re-run to update.*