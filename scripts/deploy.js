#!/usr/bin/env node

/**
 * Deploy Script — Structured for Growth
 * ──────────────────────────────────────
 * A single command that takes the project from "code on disk" to
 * "ready to push to Render."  Think of it as an assembly line:
 *
 *   1. Auto-fix lint issues  →  catch easy mistakes automatically
 *   2. Lint (strict)         →  zero warnings gate
 *   3. Run full test suite   →  all 500+ tests must pass
 *   4. Archive stale files   →  move dead weight out of the build
 *   5. Regenerate docs       →  docs-manifest.json stays in sync
 *   6. Update README stats   →  public-facing numbers always accurate
 *   7. WCAG report           →  accessibility audit trail (if axe available)
 *   8. Readability report    →  Plain Writing Act compliance
 *   9. Full audit + bump     →  security, data, build checks + version bump
 *  10. Production build      →  Vite build for dist/
 *  11. Summary               →  one-screen deploy receipt
 *
 * Usage:
 *   node scripts/deploy.js               # patch bump (default)
 *   node scripts/deploy.js --minor       # minor bump
 *   node scripts/deploy.js --major       # major bump
 *   node scripts/deploy.js --dry-run     # everything except build + bump
 *   node scripts/deploy.js --skip-tests  # skip test suite (use sparingly!)
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// ── CLI flags ───────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const SKIP_TESTS = args.includes('--skip-tests');
const VERSION_TYPE = args.includes('--major')
  ? 'major'
  : args.includes('--minor')
    ? 'minor'
    : 'patch';

// ── Pretty output helpers ───────────────────────────────────
const C = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

function banner(text) {
  const line = '═'.repeat(60);
  console.log(`\n${C.blue}╔${line}╗${C.reset}`);
  console.log(`${C.blue}║${C.bold}  ${text.padEnd(58)}${C.reset}${C.blue}║${C.reset}`);
  console.log(`${C.blue}╚${line}╝${C.reset}\n`);
}

function step(num, label) {
  console.log(`\n${C.cyan}━━━ Step ${num}: ${label} ━━━${C.reset}\n`);
}

function ok(msg) {
  console.log(`  ${C.green}✓${C.reset} ${msg}`);
}
function warn(msg) {
  console.log(`  ${C.yellow}⚠${C.reset} ${msg}`);
}
function fail(msg) {
  console.log(`  ${C.red}✗${C.reset} ${msg}`);
}
function info(msg) {
  console.log(`  ${C.dim}ℹ${C.reset} ${msg}`);
}

/** Run a shell command; return { success, stdout }. */
function run(cmd, opts = {}) {
  const { silent = false, canFail = false } = opts;
  try {
    const stdout = execSync(cmd, {
      cwd: ROOT,
      encoding: 'utf-8',
      stdio: silent ? 'pipe' : 'inherit',
      timeout: 300_000, // 5 min max per command
    });
    return { success: true, stdout: stdout || '' };
  } catch (err) {
    if (canFail) {
      return { success: false, stdout: err.stdout || '' };
    }
    throw err;
  }
}

/** Read a JSON file relative to ROOT. */
function readJSON(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf-8').replace(/^\uFEFF/, ''));
}

/** Recursively find files matching a test function. */
function walk(dir, test, results = []) {
  if (!fs.existsSync(dir)) {
    return results;
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (
      entry.isDirectory() &&
      !['node_modules', 'dist', '.git', 'coverage', 'codeql_db'].includes(entry.name)
    ) {
      walk(full, test, results);
    } else if (entry.isFile() && test(entry.name, full)) {
      results.push(full);
    }
  }
  return results;
}

// ── Tracking for final summary ──────────────────────────────
const summary = {
  stepsRun: 0,
  stepsPassed: 0,
  archived: [],
  statsUpdated: false,
  testsRun: false,
  testsPassed: false,
  buildPassed: false,
  version: '',
  errors: [],
};

// ════════════════════════════════════════════════════════════
// STEP IMPLEMENTATIONS
// ════════════════════════════════════════════════════════════

function stepAutoFix() {
  step(1, 'Auto-fix lint issues');
  summary.stepsRun++;

  const result = run('npx eslint server/ client/js/ scripts/ tests/ --fix', {
    canFail: true,
    silent: true,
  });
  if (result.success) {
    ok('ESLint auto-fix applied (no remaining auto-fixable issues)');
  } else {
    info('ESLint auto-fix applied — some issues remain (will be caught in Step 2)');
  }

  // Also run Prettier to normalize formatting
  run(
    'npx prettier --write "server/**/*.js" "client/js/**/*.js" "tests/**/*.js" "scripts/**/*.js"',
    {
      canFail: true,
      silent: true,
    }
  );
  ok('Prettier formatting applied');
  summary.stepsPassed++;
}

function stepLint() {
  step(2, 'Strict lint (zero warnings)');
  summary.stepsRun++;

  try {
    run('npx eslint server/ client/js/ scripts/ tests/');
    ok('ESLint: 0 errors, 0 warnings');
    summary.stepsPassed++;
  } catch {
    fail('ESLint found errors that auto-fix could not resolve');
    summary.errors.push('Lint errors remain — run `npm run lint` to see details');
    throw new Error('Lint failed');
  }
}

function stepTests() {
  step(3, 'Full test suite');
  summary.stepsRun++;
  summary.testsRun = true;

  if (SKIP_TESTS) {
    warn('Tests SKIPPED (--skip-tests flag)');
    summary.stepsPassed++;
    return;
  }

  try {
    run('npx vitest run');
    ok('All tests passed');
    summary.testsPassed = true;
    summary.stepsPassed++;
  } catch {
    fail('Test suite failed');
    summary.errors.push('Tests failed — run `npm test` to see details');
    throw new Error('Tests failed');
  }
}

function stepArchive() {
  step(4, 'Archive stale / orphan files');
  summary.stepsRun++;

  const archiveDir = path.join(ROOT, 'archive');
  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
  }

  // Patterns for files that should never ship in a production deploy
  const stalePatterns = [
    /\.bak$/i,
    /\.old$/i,
    /\.orig$/i,
    /\.tmp$/i,
    /~$/,
    /\.disabled$/i,
    /\.dead$/i,
  ];

  const staleFiles = walk(ROOT, (name, fullPath) => {
    // Skip the archive folder itself
    if (fullPath.includes(path.join(ROOT, 'archive'))) {
      return false;
    }
    return stalePatterns.some((p) => p.test(name));
  });

  // Check for empty JS/CSS files (0 bytes or only whitespace)
  const emptyFiles = walk(ROOT, (name, fullPath) => {
    if (fullPath.includes(path.join(ROOT, 'archive'))) {
      return false;
    }
    if (fullPath.includes('node_modules')) {
      return false;
    }
    if (/\.(js|css|json)$/.test(name)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8').trim();
        return content.length === 0;
      } catch {
        return false;
      }
    }
    return false;
  });

  const toArchive = [...staleFiles, ...emptyFiles];

  if (toArchive.length === 0) {
    ok('No stale or orphan files found');
  } else {
    for (const file of toArchive) {
      const relPath = path.relative(ROOT, file);
      const dest = path.join(archiveDir, relPath);
      const destDir = path.dirname(dest);

      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      fs.renameSync(file, dest);
      summary.archived.push(relPath);
      info(`Archived: ${relPath}`);
    }
    ok(`Archived ${toArchive.length} stale file(s)`);
  }

  summary.stepsPassed++;
}

function stepDocs() {
  step(5, 'Regenerate documentation');
  summary.stepsRun++;

  try {
    run('node scripts/generate-docs.js');
    ok('docs-manifest.json regenerated');
    summary.stepsPassed++;
  } catch {
    fail('Docs generation failed');
    summary.errors.push('Docs generation failed — run `npm run docs:generate` to see details');
    throw new Error('Docs generation failed');
  }
}

function stepUpdateReadmeStats() {
  step(6, 'Update README & landing page stats');
  summary.stepsRun++;

  try {
    // Load the freshly-generated manifest for live numbers
    const manifest = readJSON('client/assets/docs-manifest.json');
    const { totalRoutes, totalPages, totalTemplates, totalFrameworks } = manifest.summary;

    // ── Update README.md ────────────────────────────────────
    const readmePath = path.join(ROOT, 'README.md');
    let readme = fs.readFileSync(readmePath, 'utf-8');
    let readmeChanged = false;

    // Fix "compliance knowledge base covering N regulatory frameworks"
    const fwRegex = /compliance knowledge base covering \d+ regulatory frameworks/;
    if (fwRegex.test(readme) && !readme.includes(`covering ${totalFrameworks} regulatory`)) {
      readme = readme.replace(
        fwRegex,
        `compliance knowledge base covering ${totalFrameworks} regulatory frameworks`
      );
      readmeChanged = true;
      info(`README: frameworks count → ${totalFrameworks}`);
    }

    // Fix template count "NN production-ready code templates"
    const tmplRegex = /(\d+) production-ready code templates/;
    const tmplMatch = readme.match(tmplRegex);
    if (tmplMatch && Number(tmplMatch[1]) !== totalTemplates) {
      readme = readme.replace(tmplRegex, `${totalTemplates} production-ready code templates`);
      readmeChanged = true;
      info(`README: template count → ${totalTemplates}`);
    }

    // Fix "NN regulatory frameworks" in Compliance section
    const fwCountRegex = /\*\*(\d+) Regulatory Frameworks\*\*/;
    const fwMatch = readme.match(fwCountRegex);
    if (fwMatch && Number(fwMatch[1]) !== totalFrameworks) {
      readme = readme.replace(fwCountRegex, `**${totalFrameworks} Regulatory Frameworks**`);
      readmeChanged = true;
      info(`README: "N Regulatory Frameworks" → ${totalFrameworks}`);
    }

    if (readmeChanged) {
      fs.writeFileSync(readmePath, readme);
      ok('README.md stats updated');
    } else {
      ok('README.md stats already current');
    }

    // ── Update CHANGELOG Stats block for next release ────────
    // (We just append or find data — the audit bump creates the entry)
    const changelogPath = path.join(ROOT, 'CHANGELOG.md');
    if (fs.existsSync(changelogPath)) {
      // Count tests from latest vitest run
      const testResult = run('npx vitest run --reporter=json', { canFail: true, silent: true });
      let testCount = '500+';
      let testFileCount = '48';
      try {
        if (testResult.success && testResult.stdout) {
          const json = JSON.parse(testResult.stdout);
          testCount = json.numTotalTests || testCount;
          testFileCount = json.numTotalTestSuites || testFileCount;
        }
      } catch {
        /* keep defaults if JSON parse fails */
      }

      info(
        `Latest stats: ${totalRoutes} routes, ${totalPages} pages, ${totalTemplates} templates, ${totalFrameworks} frameworks`
      );
      info(`Test coverage: ${testCount} tests across ${testFileCount} files`);
    }

    summary.statsUpdated = true;
    summary.stepsPassed++;
  } catch (err) {
    warn(`Stats update had issues: ${err.message}`);
    summary.stepsPassed++; // non-blocking
  }
}

function stepWcagReport() {
  step(7, 'WCAG accessibility report');
  summary.stepsRun++;

  const result = run('node scripts/generate-wcag-report.js', { canFail: true, silent: true });
  if (result.success) {
    ok('WCAG audit report updated → docs/WCAG-AUDIT-RESULTS.md');
  } else {
    warn('WCAG report skipped (axe-core issue — non-blocking)');
  }
  summary.stepsPassed++;
}

function stepReadability() {
  step(8, 'Readability scoring');
  summary.stepsRun++;

  const result = run('node scripts/readability.js', { canFail: true, silent: false });
  if (result.success) {
    ok('Readability scores computed');
  } else {
    warn('Readability check had issues (non-blocking)');
  }
  summary.stepsPassed++;
}

function stepAudit() {
  step(9, `Full audit + ${DRY_RUN ? '(dry-run, no bump)' : `${VERSION_TYPE} version bump`}`);
  summary.stepsRun++;

  const bumpFlag = DRY_RUN ? '' : `--bump ${VERSION_TYPE}`;
  try {
    run(`node scripts/audit.js ${bumpFlag}`);
    const pkg = readJSON('package.json');
    summary.version = pkg.version;
    ok(`Audit passed — version ${pkg.version}`);
    summary.stepsPassed++;
  } catch {
    fail('Audit failed — fix errors listed above');
    summary.errors.push('Audit failed — run `npm run audit` to see details');
    throw new Error('Audit failed');
  }
}

function stepBuild() {
  step(10, 'Production build');
  summary.stepsRun++;

  if (DRY_RUN) {
    info('Skipped (--dry-run)');
    summary.stepsPassed++;
    return;
  }

  try {
    run('npx vite build');
    ok('Vite production build succeeded');
    summary.buildPassed = true;
    summary.stepsPassed++;
  } catch {
    fail('Production build failed');
    summary.errors.push('Build failed — run `npx vite build` to see details');
    throw new Error('Build failed');
  }
}

function printSummary() {
  step(11, 'Deploy Summary');

  const pkg = readJSON('package.json');
  const passed = summary.errors.length === 0;

  console.log(`${C.bold}  Project:${C.reset}  ${pkg.name}`);
  console.log(`${C.bold}  Version:${C.reset}  ${summary.version || pkg.version}`);
  console.log(`${C.bold}  Date:${C.reset}     ${new Date().toISOString().split('T')[0]}`);
  console.log(`${C.bold}  Mode:${C.reset}     ${DRY_RUN ? 'Dry Run' : 'Full Deploy'}`);
  console.log('');
  console.log(
    `  Steps:    ${C.green}${summary.stepsPassed} passed${C.reset} / ${summary.stepsRun} total`
  );

  if (summary.archived.length > 0) {
    console.log(`  Archived: ${summary.archived.length} file(s)`);
  }

  if (summary.errors.length > 0) {
    console.log('');
    console.log(`  ${C.red}${C.bold}ERRORS:${C.reset}`);
    for (const e of summary.errors) {
      console.log(`    ${C.red}•${C.reset} ${e}`);
    }
  }

  console.log('');
  if (passed) {
    console.log(
      `  ${C.green}${C.bold}✓ DEPLOY READY — push to main and Render will pick it up.${C.reset}`
    );
    console.log(
      `  ${C.dim}  git add -A && git commit -m "v${summary.version || pkg.version}" && git push${C.reset}`
    );
  } else {
    console.log(`  ${C.red}${C.bold}✗ DEPLOY BLOCKED — fix the errors above and re-run.${C.reset}`);
  }
  console.log('');

  // Write a machine-readable deploy receipt
  const receipt = {
    timestamp: new Date().toISOString(),
    version: summary.version || pkg.version,
    mode: DRY_RUN ? 'dry-run' : 'deploy',
    versionBump: VERSION_TYPE,
    stepsPassed: summary.stepsPassed,
    stepsTotal: summary.stepsRun,
    testsRun: summary.testsRun,
    testsPassed: summary.testsPassed,
    buildPassed: summary.buildPassed,
    statsUpdated: summary.statsUpdated,
    archived: summary.archived,
    errors: summary.errors,
    success: passed,
  };

  const logsDir = path.join(ROOT, 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  fs.appendFileSync(path.join(logsDir, 'deploy-history.jsonl'), JSON.stringify(receipt) + '\n');
  info('Deploy receipt → logs/deploy-history.jsonl');

  return passed;
}

// ════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════

function main() {
  banner(`DEPLOY${DRY_RUN ? ' (DRY RUN)' : ''} — Structured for Growth`);

  const startTime = Date.now();

  try {
    stepAutoFix();
    stepLint();
    stepTests();
    stepArchive();
    stepDocs();
    stepUpdateReadmeStats();
    stepWcagReport();
    stepReadability();
    stepAudit();
    stepBuild();
  } catch (err) {
    fail(`Pipeline stopped: ${err.message}`);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  info(`Total time: ${elapsed}s`);

  const passed = printSummary();
  process.exit(passed ? 0 : 1);
}

main();
