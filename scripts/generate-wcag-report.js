/**
 * WCAG Audit Report Generator (P2.2.2)
 *
 * Runs axe-core against all client HTML pages and generates a detailed
 * Markdown audit report at docs/WCAG-AUDIT-RESULTS.md.
 *
 * Usage:  node scripts/generate-wcag-report.js
 */

import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { resolve, basename, dirname } from 'path';
import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT = resolve(__dirname, '..');
const clientDir = resolve(ROOT, 'client');
const outPath = resolve(ROOT, 'docs', 'WCAG-AUDIT-RESULTS.md');

const htmlFiles = readdirSync(clientDir)
  .filter((f) => f.endsWith('.html'))
  .sort()
  .map((f) => resolve(clientDir, f));

async function auditPage(filePath) {
  const html = readFileSync(filePath, 'utf-8');
  const dom = new JSDOM(html, {
    pretendToBeVisual: true,
    runScripts: 'outside-only',
  });
  const win = dom.window;
  const doc = win.document;

  // Inject axe-core source into the JSDOM window so it runs in that context
  const axeSource = readFileSync(resolve(ROOT, 'node_modules', 'axe-core', 'axe.min.js'), 'utf-8');
  win.eval(axeSource);

  // Run axe inside the jsdom window context
  const results = await new Promise((ok, fail) => {
    win.axe.run(
      doc.documentElement,
      {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'section508', 'best-practice'],
        },
        rules: {
          // In jsdom we can't evaluate CSS-dependent rules accurately
          'color-contrast': { enabled: false },
        },
      },
      (err, res) => (err ? fail(err) : ok(res))
    );
  });

  dom.window.close();
  return results;
}

function impactEmoji(impact) {
  switch (impact) {
    case 'critical':
      return '🔴';
    case 'serious':
      return '🟠';
    case 'moderate':
      return '🟡';
    case 'minor':
      return '🟢';
    default:
      return '⚪';
  }
}

function wcagTags(tags) {
  return tags
    .filter((t) => t.startsWith('wcag') || t.startsWith('section508') || t === 'best-practice')
    .join(', ');
}

async function main() {
  const now = new Date().toISOString().split('T')[0];
  const allResults = [];

  for (const filePath of htmlFiles) {
    const pageName = basename(filePath);
    process.stdout.write(`Scanning ${pageName}...`);
    try {
      const results = await auditPage(filePath);
      allResults.push({ pageName, results });
      process.stdout.write(
        ` ${results.violations.length} violations, ${results.passes.length} passes\n`
      );
    } catch (err) {
      process.stdout.write(` ERROR: ${err.message}\n`);
      allResults.push({
        pageName,
        results: { violations: [], passes: [], incomplete: [], inapplicable: [] },
        error: err.message,
      });
    }
  }

  // Build the report
  const lines = [];
  const push = (line = '') => lines.push(line);

  push('# WCAG 2.1 AA Accessibility Audit Results');
  push();
  push(`**Generated:** ${now}  `);
  push('**Tool:** axe-core (Deque) via jsdom  ');
  push('**Standard:** WCAG 2.1 Level AA + Section 508 + Best Practices  ');
  push('**System:** Structured for Growth — Consulting & Compliance Platform  ');
  push('**Scope:** All client-side HTML pages (`client/*.html`)');
  push();
  push('> **Note:** This audit uses axe-core in a jsdom (simulated browser) environment. ');
  push('> CSS-dependent checks such as color contrast, reflow, and visual spacing require a ');
  push('> real browser audit (e.g., Lighthouse, WAVE, or manual testing with a screen reader). ');
  push('> Those results should be documented separately under P2.2.3 (Trusted Tester baseline).');
  push();
  push('---');
  push();

  // Summary table
  push('## Executive Summary');
  push();

  let totalViolations = 0;
  let totalPasses = 0;
  let totalIncomplete = 0;
  let criticalCount = 0;
  let seriousCount = 0;
  let moderateCount = 0;
  let minorCount = 0;

  for (const { results } of allResults) {
    totalViolations += results.violations.length;
    totalPasses += results.passes.length;
    totalIncomplete += results.incomplete.length;
    for (const v of results.violations) {
      if (v.impact === 'critical') {
        criticalCount++;
      } else if (v.impact === 'serious') {
        seriousCount++;
      } else if (v.impact === 'moderate') {
        moderateCount++;
      } else {
        minorCount++;
      }
    }
  }

  push('| Metric | Value |');
  push('|--------|-------|');
  push(`| Pages Scanned | ${allResults.length} |`);
  push(`| Total Rules Passed | ${totalPasses} |`);
  push(`| Total Violations | ${totalViolations} |`);
  push(`| — 🔴 Critical | ${criticalCount} |`);
  push(`| — 🟠 Serious | ${seriousCount} |`);
  push(`| — 🟡 Moderate | ${moderateCount} |`);
  push(`| — 🟢 Minor | ${minorCount} |`);
  push(`| Incomplete (needs manual review) | ${totalIncomplete} |`);
  push(
    `| **Overall Result** | ${totalViolations === 0 ? '✅ PASS — zero automated violations' : `⚠ ${totalViolations} violation(s) found`} |`
  );
  push();

  // Per-page summary
  push('### Page-Level Summary');
  push();
  push('| Page | Violations | Passes | Incomplete | Status |');
  push('|------|-----------|--------|-----------|--------|');
  for (const { pageName, results, error } of allResults) {
    if (error) {
      push(`| ${pageName} | ERROR | — | — | ❌ Scan failed |`);
    } else {
      const vCount = results.violations.length;
      const status = vCount === 0 ? '✅ Pass' : `⚠ ${vCount} issue(s)`;
      push(
        `| ${pageName} | ${vCount} | ${results.passes.length} | ${results.incomplete.length} | ${status} |`
      );
    }
  }
  push();
  push('---');
  push();

  // Detailed per-page results
  push('## Detailed Results by Page');
  push();

  for (const { pageName, results, error } of allResults) {
    push(`### ${pageName}`);
    push();

    if (error) {
      push(`**Error:** ${error}`);
      push();
      continue;
    }

    if (results.violations.length === 0) {
      push('**✅ No violations detected.**');
      push();
    } else {
      push(`**${results.violations.length} violation(s) found:**`);
      push();
      for (const v of results.violations) {
        push(`#### ${impactEmoji(v.impact)} ${v.id}`);
        push();
        push(`| Field | Value |`);
        push(`|-------|-------|`);
        push(`| **Impact** | ${v.impact} |`);
        push(`| **Description** | ${v.help} |`);
        push(`| **WCAG Criteria** | ${wcagTags(v.tags)} |`);
        push(`| **Help URL** | ${v.helpUrl} |`);
        push(`| **Affected Elements** | ${v.nodes.length} |`);
        push();
        push('**Affected HTML:**');
        push();
        push('```html');
        for (const node of v.nodes.slice(0, 5)) {
          push(node.html.slice(0, 200));
        }
        push('```');
        push();
      }
    }

    // Rules passed
    push('<details>');
    push(`<summary>Rules passed (${results.passes.length})</summary>`);
    push();
    push('| Rule | Description |');
    push('|------|-------------|');
    for (const p of results.passes) {
      push(`| ${p.id} | ${p.help} |`);
    }
    push();
    push('</details>');
    push();

    // Incomplete (need manual review)
    if (results.incomplete.length > 0) {
      push('<details>');
      push(`<summary>Needs manual review (${results.incomplete.length})</summary>`);
      push();
      push('| Rule | Description | Impact |');
      push('|------|-------------|--------|');
      for (const inc of results.incomplete) {
        push(`| ${inc.id} | ${inc.help} | ${inc.impact || 'unknown'} |`);
      }
      push();
      push('</details>');
      push();
    }

    push('---');
    push();
  }

  // WCAG SC Coverage Matrix
  push('## WCAG 2.1 Success Criteria Coverage');
  push();
  push(
    'The following table maps WCAG 2.1 Level A and AA success criteria to automated test coverage:'
  );
  push();
  push('| SC | Name | Level | Automated | Notes |');
  push('|-------|------|-------|-----------|-------|');
  push(
    '| 1.1.1 | Non-text Content | A | ✅ axe-core | `image-alt`, `input-image-alt`, `object-alt` |'
  );
  push(
    '| 1.2.1 | Audio-only and Video-only | A | Partial | `video-caption` — requires manual review for media |'
  );
  push(
    '| 1.2.2 | Captions (Prerecorded) | A | Partial | `video-caption` — requires manual review |'
  );
  push(
    '| 1.2.3 | Audio Description or Media Alternative | A | ❌ Manual | Not testable by axe-core |'
  );
  push('| 1.2.4 | Captions (Live) | AA | ❌ Manual | Not applicable to static pages |');
  push('| 1.2.5 | Audio Description (Prerecorded) | AA | ❌ Manual | Not testable by axe-core |');
  push(
    '| 1.3.1 | Info and Relationships | A | ✅ axe-core | `aria-required-attr`, `list`, `listitem`, `definition-list`, `table-*` |'
  );
  push('| 1.3.2 | Meaningful Sequence | A | Partial | `tabindex` — partly testable |');
  push('| 1.3.3 | Sensory Characteristics | A | ❌ Manual | Requires human judgment |');
  push('| 1.3.4 | Orientation | AA | ❌ Manual | Requires viewport testing |');
  push('| 1.3.5 | Identify Input Purpose | AA | ✅ axe-core | `autocomplete-valid` |');
  push('| 1.4.1 | Use of Color | A | ❌ Manual | Requires human judgment |');
  push('| 1.4.2 | Audio Control | A | ❌ Manual | N/A — no auto-playing audio |');
  push(
    '| 1.4.3 | Contrast (Minimum) | AA | ⚠ Disabled | `color-contrast` — requires real browser (disabled in jsdom) |'
  );
  push('| 1.4.4 | Resize Text | AA | ❌ Manual | Requires viewport testing |');
  push('| 1.4.5 | Images of Text | AA | ❌ Manual | Requires human judgment |');
  push('| 1.4.10 | Reflow | AA | ❌ Manual | Requires viewport testing |');
  push('| 1.4.11 | Non-text Contrast | AA | ❌ Manual | Requires visual inspection |');
  push('| 1.4.12 | Text Spacing | AA | ❌ Manual | Requires CSS override testing |');
  push('| 1.4.13 | Content on Hover or Focus | AA | ❌ Manual | Requires interaction testing |');
  push('| 2.1.1 | Keyboard | A | Partial | `accesskeys`, `tabindex` — full test requires manual |');
  push('| 2.1.2 | No Keyboard Trap | A | ❌ Manual | Requires interaction testing |');
  push('| 2.1.4 | Character Key Shortcuts | A | ❌ Manual | Requires interaction testing |');
  push('| 2.2.1 | Timing Adjustable | A | ❌ Manual | Requires interaction testing |');
  push('| 2.2.2 | Pause, Stop, Hide | A | ❌ Manual | No auto-updating content |');
  push('| 2.3.1 | Three Flashes or Below Threshold | A | ❌ Manual | No flashing content |');
  push('| 2.4.1 | Bypass Blocks | A | ✅ axe-core | `bypass`, `region` |');
  push('| 2.4.2 | Page Titled | A | ✅ axe-core | `document-title` |');
  push('| 2.4.3 | Focus Order | A | ❌ Manual | Requires interaction testing |');
  push('| 2.4.4 | Link Purpose (In Context) | A | ✅ axe-core | `link-name` |');
  push('| 2.4.5 | Multiple Ways | AA | ❌ Manual | Requires site-level review |');
  push('| 2.4.6 | Headings and Labels | AA | ✅ axe-core | `heading-order`, `label` |');
  push(
    '| 2.4.7 | Focus Visible | AA | ⚠ CSS | Implemented via `main.css` `:focus-visible` — manual verification needed |'
  );
  push('| 2.5.1 | Pointer Gestures | A | ❌ Manual | N/A — no complex gestures |');
  push('| 2.5.2 | Pointer Cancellation | A | ❌ Manual | Standard click behavior |');
  push('| 2.5.3 | Label in Name | A | ✅ axe-core | `label-title-only` |');
  push('| 2.5.4 | Motion Actuation | A | ❌ Manual | N/A — no motion input |');
  push('| 3.1.1 | Language of Page | A | ✅ axe-core | `html-has-lang`, `html-lang-valid` |');
  push('| 3.1.2 | Language of Parts | AA | ✅ axe-core | `valid-lang` |');
  push('| 3.2.1 | On Focus | A | ❌ Manual | Requires interaction testing |');
  push('| 3.2.2 | On Input | A | ❌ Manual | Requires interaction testing |');
  push('| 3.2.3 | Consistent Navigation | AA | ❌ Manual | Requires site-level review |');
  push('| 3.2.4 | Consistent Identification | AA | ❌ Manual | Requires site-level review |');
  push('| 3.3.1 | Error Identification | A | ❌ Manual | Requires form submission testing |');
  push('| 3.3.2 | Labels or Instructions | A | ✅ axe-core | `label`, `aria-input-field-name` |');
  push('| 3.3.3 | Error Suggestion | AA | ❌ Manual | Requires form submission testing |');
  push(
    '| 3.3.4 | Error Prevention (Legal, Financial, Data) | AA | ❌ Manual | Requires workflow testing |'
  );
  push('| 4.1.1 | Parsing | A | ✅ axe-core | `duplicate-id`, `duplicate-id-active` |');
  push('| 4.1.2 | Name, Role, Value | A | ✅ axe-core | `aria-*`, `button-name`, `input-*-name` |');
  push('| 4.1.3 | Status Messages | AA | ❌ Manual | `aria-live` — requires interaction testing |');
  push();

  // Recommendations
  push('## Recommendations');
  push();
  push('### Immediate Actions');
  push();
  if (totalViolations > 0) {
    push('1. Fix all critical and serious violations identified above');
    push('2. Re-run axe-core to verify fixes');
  } else {
    push('1. ✅ No automated violations to fix — all pages pass axe-core WCAG 2.1 AA checks');
  }
  push();
  push('### Manual Testing Required');
  push();
  push('The following items require manual testing beyond what axe-core can detect:');
  push();
  push(
    '1. **Color Contrast (SC 1.4.3):** Run Lighthouse or WAVE in a real browser to verify contrast ratios'
  );
  push(
    '2. **Keyboard Navigation (SC 2.1.1, 2.1.2, 2.4.3, 2.4.7):** Tab through every page, verify focus order and visibility'
  );
  push(
    '3. **Screen Reader Testing:** Test with NVDA (Windows) and VoiceOver (macOS) for proper announcements'
  );
  push(
    '4. **Zoom/Reflow (SC 1.4.4, 1.4.10):** Verify content reflows properly at 200% and 400% zoom'
  );
  push(
    '5. **Text Spacing (SC 1.4.12):** Apply WCAG text spacing overrides and verify no loss of content'
  );
  push(
    '6. **Focus Not Obscured (SC 2.4.11, 2.4.12):** Verify focused elements are not hidden by sticky headers'
  );
  push('7. **Target Size (SC 2.5.8):** Verify all interactive elements meet 24×24px minimum size');
  push();
  push('### Ongoing');
  push();
  push('1. axe-core tests run automatically in CI on every build (`.github/workflows/ci.yml`)');
  push(
    '2. The threshold for moderate violations is set to ≤5 per page — lower to 0 as issues are fixed'
  );
  push('3. Schedule quarterly manual accessibility audits');
  push('4. Complete DHS Trusted Tester v5.1 baseline testing (P2.2.3)');
  push('5. Generate VPAT 2.5 Accessibility Conformance Report (P2.2.4)');
  push();
  push('---');
  push();
  push('## Test Configuration');
  push();
  push('```json');
  push(
    JSON.stringify(
      {
        tool: 'axe-core',
        environment: 'jsdom (Vitest)',
        runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'section508', 'best-practice'],
        disabledRules: ['color-contrast (requires real browser rendering)'],
        testFile: 'tests/accessibility/axe.test.js',
        ciStep: '.github/workflows/ci.yml — "Run accessibility tests (axe-core)"',
        npmScript: 'npm run test:a11y',
      },
      null,
      2
    )
  );
  push('```');
  push();
  push('---');
  push();
  push('*This report was auto-generated by `scripts/generate-wcag-report.js`. Re-run to update.*');

  writeFileSync(outPath, lines.join('\n'), 'utf-8');
  console.log(`\n✅ Report written to ${outPath}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
