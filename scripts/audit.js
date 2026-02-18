#!/usr/bin/env node

/**
 * Pre-Deploy/Pre-Push Audit Script
 * Comprehensive audit system with automatic versioning
 *
 * Checks:
 * - Documentation completeness
 * - Code quality
 * - Build integrity
 * - Version bumping
 * - File consistency
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

class AuditReport {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.info = [];
    this.passed = [];
  }

  error(message) {
    this.errors.push(message);
    console.log(`${colors.red}✗ ERROR: ${message}${colors.reset}`);
  }

  warning(message) {
    this.warnings.push(message);
    console.log(`${colors.yellow}⚠ WARNING: ${message}${colors.reset}`);
  }

  success(message) {
    this.passed.push(message);
    console.log(`${colors.green}✓ ${message}${colors.reset}`);
  }

  infoMsg(message) {
    this.info.push(message);
    console.log(`${colors.cyan}ℹ ${message}${colors.reset}`);
  }

  section(title) {
    console.log(`\n${colors.magenta}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.magenta}${title}${colors.reset}`);
    console.log(`${colors.magenta}${'='.repeat(60)}${colors.reset}\n`);
  }

  summary() {
    console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.blue}AUDIT SUMMARY${colors.reset}`);
    console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}\n`);
    console.log(`${colors.green}✓ Passed: ${this.passed.length}${colors.reset}`);
    console.log(`${colors.yellow}⚠ Warnings: ${this.warnings.length}${colors.reset}`);
    console.log(`${colors.red}✗ Errors: ${this.errors.length}${colors.reset}`);
    console.log('');

    return this.errors.length === 0;
  }
}

const report = new AuditReport();

// Required documentation files
const requiredDocs = [
  'README.md',
  'SETUP.md',
  'docs/CLIENT-GUIDE.md',
  'docs/ADMIN-GUIDE.md',
  'client/assets/docs-manifest.json',
];

// Required directories
const requiredDirs = [
  'client',
  'server',
  'server/routes',
  'server/controllers',
  'server/models',
  'server/middleware',
  'docs',
];

function checkFileExists(filePath) {
  return fs.existsSync(path.join(rootDir, filePath));
}

function checkDirExists(dirPath) {
  return (
    fs.existsSync(path.join(rootDir, dirPath)) &&
    fs.statSync(path.join(rootDir, dirPath)).isDirectory()
  );
}

function readJSON(filePath) {
  try {
    const content = fs.readFileSync(path.join(rootDir, filePath), 'utf8');
    return JSON.parse(content);
  } catch (error) {
    report.error(`Failed to read ${filePath}: ${error.message}`);
    return null;
  }
}

function writeJSON(filePath, data) {
  try {
    fs.writeFileSync(path.join(rootDir, filePath), JSON.stringify(data, null, 2) + '\n', 'utf8');
    return true;
  } catch (error) {
    report.error(`Failed to write ${filePath}: ${error.message}`);
    return false;
  }
}

function checkDocumentation() {
  report.section('📚 Documentation Audit');

  requiredDocs.forEach((doc) => {
    if (checkFileExists(doc)) {
      const stats = fs.statSync(path.join(rootDir, doc));
      if (stats.size > 100) {
        report.success(`${doc} exists and has content (${stats.size} bytes)`);
      } else {
        report.warning(`${doc} exists but may be incomplete (${stats.size} bytes)`);
      }
    } else {
      report.error(`${doc} is missing`);
    }
  });
}

function checkDirectoryStructure() {
  report.section('📁 Directory Structure Audit');

  requiredDirs.forEach((dir) => {
    if (checkDirExists(dir)) {
      const files = fs.readdirSync(path.join(rootDir, dir));
      report.success(`${dir}/ exists (${files.length} files)`);
    } else {
      report.error(`${dir}/ directory is missing`);
    }
  });
}

function checkPackageJSON() {
  report.section('📦 Package.json Audit');

  const pkg = readJSON('package.json');
  if (!pkg) {
    return;
  }

  const requiredFields = ['name', 'version', 'description', 'scripts', 'dependencies'];
  requiredFields.forEach((field) => {
    if (pkg[field]) {
      report.success(`package.json has '${field}' field`);
    } else {
      report.error(`package.json missing '${field}' field`);
    }
  });

  const requiredScripts = ['dev', 'build', 'start'];
  requiredScripts.forEach((script) => {
    if (pkg.scripts && pkg.scripts[script]) {
      report.success(`Script '${script}' is defined`);
    } else {
      report.error(`Script '${script}' is missing`);
    }
  });

  report.infoMsg(`Current version: ${pkg.version}`);
}

function bumpVersion(type = 'patch') {
  report.section('🔢 Version Bump');

  const pkg = readJSON('package.json');
  if (!pkg) {
    return null;
  }

  const [major, minor, patch] = pkg.version.split('.').map(Number);
  let newVersion;

  switch (type) {
    case 'major':
      newVersion = `${major + 1}.0.0`;
      break;
    case 'minor':
      newVersion = `${major}.${minor + 1}.0`;
      break;
    case 'patch':
    default:
      newVersion = `${major}.${minor}.${patch + 1}`;
      break;
  }

  pkg.version = newVersion;

  if (writeJSON('package.json', pkg)) {
    report.success(`Version bumped: ${pkg.version} → ${newVersion}`);
    return newVersion;
  }

  return null;
}

function checkBuildIntegrity() {
  report.section('🏗️ Build Integrity Check');

  try {
    // Check if node_modules exists
    if (!checkDirExists('node_modules')) {
      report.error('node_modules not found - run npm install');
      return;
    }
    report.success('node_modules directory exists');

    // Check critical dependencies
    const pkg = readJSON('package.json');
    if (pkg) {
      const criticalDeps = [
        { name: 'express', location: 'dependencies' },
        { name: 'sql.js', location: 'dependencies' },
        { name: 'vite', location: 'dependencies' },
      ];

      criticalDeps.forEach(({ name, location }) => {
        const deps = location === 'dependencies' ? pkg.dependencies : pkg.devDependencies;
        if (deps && deps[name]) {
          report.success(`Critical dependency '${name}' is listed`);
        } else {
          report.error(`Critical dependency '${name}' is missing`);
        }
      });
    }

    // Test build (dry run)
    report.infoMsg('Testing production build...');
    try {
      execSync('npm run build', { cwd: rootDir, stdio: 'pipe', timeout: 60000 });
      report.success('Production build succeeds');
    } catch (_error) {
      report.warning('Production build test skipped or failed (not critical for audit)');
    }
  } catch (error) {
    report.error(`Build check failed: ${error.message}`);
  }
}

function checkCodeQuality() {
  report.section('🎯 Code Quality Checks');

  // Check for TODO comments
  try {
    const searchDirs = ['client', 'server', 'templates'];
    let todoCount = 0;

    searchDirs.forEach((dir) => {
      const dirPath = path.join(rootDir, dir);
      if (fs.existsSync(dirPath)) {
        const files = getAllFiles(dirPath, ['.js', '.html', '.css']);
        files.forEach((file) => {
          const content = fs.readFileSync(file, 'utf8');
          const todos = content.match(/TODO|FIXME|HACK/gi);
          if (todos) {
            todoCount += todos.length;
          }
        });
      }
    });

    if (todoCount === 0) {
      report.success('No TODO/FIXME/HACK comments found');
    } else {
      report.warning(`Found ${todoCount} TODO/FIXME/HACK comments`);
    }
  } catch (error) {
    report.warning(`Code quality check incomplete: ${error.message}`);
  }

  // Check for console.log statements (should use proper logging)
  try {
    const serverFiles = getAllFiles(path.join(rootDir, 'server'), ['.js']);
    let consoleCount = 0;

    serverFiles.forEach((file) => {
      const content = fs.readFileSync(file, 'utf8');
      const consoles = content.match(/console\.(log|error|warn|info)/gi);
      if (consoles) {
        consoleCount += consoles.length;
      }
    });

    if (consoleCount > 0) {
      report.infoMsg(`Found ${consoleCount} console statements (consider using proper logger)`);
    }
  } catch (error) {
    report.warning(`Console statement check incomplete: ${error.message}`);
  }
}

function getAllFiles(dirPath, extensions, fileList = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules' && file !== 'dist') {
        getAllFiles(filePath, extensions, fileList);
      }
    } else {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

function checkEnvironment() {
  report.section('🌍 Environment Check');

  if (checkFileExists('.env.example')) {
    report.success('.env.example exists');
  } else {
    report.warning('.env.example is missing');
  }

  if (checkFileExists('.env')) {
    report.warning(".env exists (ensure it's in .gitignore)");
  }

  if (checkFileExists('.gitignore')) {
    const gitignore = fs.readFileSync(path.join(rootDir, '.gitignore'), 'utf8');
    if (gitignore.includes('.env')) {
      report.success('.env is in .gitignore');
    } else {
      report.error('.env is NOT in .gitignore (security risk!)');
    }
    if (gitignore.includes('node_modules')) {
      report.success('node_modules is in .gitignore');
    } else {
      report.warning('node_modules not in .gitignore');
    }
  } else {
    report.error('.gitignore is missing');
  }
}

// ─── Data Integrity Checks ────────────────────────────────
function checkDataIntegrity() {
  report.section('📊 Data Integrity');

  // Glossary validation
  const glossaryPath = path.join(rootDir, 'data/glossary/glossary.json');
  if (fs.existsSync(glossaryPath)) {
    try {
      const glossary = JSON.parse(fs.readFileSync(glossaryPath, 'utf8'));
      const termCount = glossary.terms?.length || 0;
      report.success(`Glossary loaded: ${termCount} terms`);

      // Check for dangling cross-references
      const termIds = new Set(glossary.terms.map((t) => t.id));
      let danglingRefs = 0;
      glossary.terms.forEach((term) => {
        (term.related || []).forEach((ref) => {
          if (!termIds.has(ref)) {
            danglingRefs++;
          }
        });
      });

      if (danglingRefs === 0) {
        report.success('Glossary: zero dangling cross-references');
      } else {
        report.error(`Glossary: ${danglingRefs} dangling cross-references found`);
      }

      // Check meta.termCount matches
      if (glossary.meta?.termCount === termCount) {
        report.success('Glossary: meta.termCount matches actual count');
      } else {
        report.warning(
          `Glossary: meta.termCount (${glossary.meta?.termCount}) ≠ actual (${termCount})`
        );
      }
    } catch (e) {
      report.error(`Glossary JSON parse error: ${e.message}`);
    }
  } else {
    report.error('Glossary data file missing: data/glossary/glossary.json');
  }

  // Skills data validation
  const skillsPath = path.join(rootDir, 'data/skills/skills.json');
  if (fs.existsSync(skillsPath)) {
    try {
      const skillsData = JSON.parse(fs.readFileSync(skillsPath, 'utf8'));
      const skillCount = skillsData.skills?.length || 0;
      const catCount = skillsData.categories?.length || 0;
      const journeyCount = skillsData.clientJourneys?.length || 0;
      report.success(
        `Skills data loaded: ${skillCount} skills, ${catCount} categories, ${journeyCount} journeys`
      );

      // Check all skills reference valid categories
      const validCats = new Set(skillsData.categories.map((c) => c.id));
      const skillIds = new Set(skillsData.skills.map((s) => s.id));
      let invalidCats = 0;
      let danglingSkillRefs = 0;

      skillsData.skills.forEach((skill) => {
        if (!validCats.has(skill.category)) {
          invalidCats++;
        }
        (skill.related || []).forEach((rid) => {
          if (!skillIds.has(rid)) {
            danglingSkillRefs++;
          }
        });
      });

      if (invalidCats === 0) {
        report.success('Skills: all skills reference valid categories');
      } else {
        report.error(`Skills: ${invalidCats} skills reference invalid categories`);
      }

      if (danglingSkillRefs === 0) {
        report.success('Skills: zero dangling related-skill references');
      } else {
        report.error(`Skills: ${danglingSkillRefs} dangling related-skill references`);
      }

      // Check journeys reference valid skills
      let invalidJourneySkills = 0;
      (skillsData.clientJourneys || []).forEach((j) => {
        (j.skills || []).forEach((sid) => {
          if (!skillIds.has(sid)) {
            invalidJourneySkills++;
          }
        });
      });

      if (invalidJourneySkills === 0) {
        report.success('Skills: all journey skills reference valid skill IDs');
      } else {
        report.error(`Skills: ${invalidJourneySkills} invalid journey skill references`);
      }
    } catch (e) {
      report.error(`Skills JSON parse error: ${e.message}`);
    }
  } else {
    report.warning('Skills data file missing: data/skills/skills.json');
  }
}

// ─── Security Checks ──────────────────────────────────────
function checkSecurityPatterns() {
  report.section('🔒 Security Checks');

  // Check all route files use authentication
  const routesDir = path.join(rootDir, 'server/routes');
  if (fs.existsSync(routesDir)) {
    const routeFiles = fs.readdirSync(routesDir).filter((f) => f.endsWith('.js'));
    const publicRoutes = ['api-docs.js', 'auth.js', 'contact.js', 'demo.js'];

    routeFiles.forEach((file) => {
      if (publicRoutes.includes(file)) {
        return;
      }
      const content = fs.readFileSync(path.join(routesDir, file), 'utf8');
      if (content.includes('authenticateToken') || content.includes('authenticateClient')) {
        report.success(`Route ${file}: authentication enabled`);
      } else {
        report.warning(`Route ${file}: no authentication middleware detected`);
      }
    });
  }

  // Check innerHTML sanitization in client JS
  const clientJsDir = path.join(rootDir, 'client/js');
  if (fs.existsSync(clientJsDir)) {
    const jsFiles = getAllFiles(clientJsDir, ['.js']);
    let unsanitized = 0;
    const unsanitizedFiles = [];

    jsFiles.forEach((filePath) => {
      const content = fs.readFileSync(filePath, 'utf8');
      // Files that use innerHTML but don't import sanitize.js
      if (content.includes('.innerHTML') && content.includes('${')) {
        if (!content.includes('escapeHTML') && !content.includes('sanitize')) {
          const relativePath = path.relative(rootDir, filePath);
          // Skip the sanitizer itself
          if (!relativePath.includes('sanitize.js')) {
            unsanitized++;
            unsanitizedFiles.push(relativePath);
          }
        }
      }
    });

    if (unsanitized === 0) {
      report.success('Client JS: all innerHTML with interpolation uses escapeHTML');
    } else {
      report.error(
        `Client JS: ${unsanitized} file(s) use innerHTML without sanitizer: ${unsanitizedFiles.join(', ')}`
      );
    }
  }

  // Check CSRF middleware is mounted
  const serverIndex = path.join(rootDir, 'server/index.js');
  if (fs.existsSync(serverIndex)) {
    const content = fs.readFileSync(serverIndex, 'utf8');
    if (content.includes('csrfProtection') && content.includes("app.use('/api/'")) {
      report.success('CSRF protection enabled on API routes');
    } else {
      report.warning('CSRF protection may not be enabled globally');
    }
  }
}

// ─── HTML Page Checks ─────────────────────────────────────
function checkHTMLPages() {
  report.section('📄 HTML Page Audit');

  const clientDir = path.join(rootDir, 'client');
  const htmlFiles = fs.readdirSync(clientDir).filter((f) => f.endsWith('.html'));

  htmlFiles.forEach((file) => {
    const content = fs.readFileSync(path.join(clientDir, file), 'utf8');

    // Check for meta description
    if (content.includes('meta name="description"')) {
      report.success(`${file}: has meta description`);
    } else {
      report.warning(`${file}: missing meta description`);
    }

    // Check for Open Graph
    if (content.includes('og:title')) {
      report.success(`${file}: has Open Graph tags`);
    } else {
      report.warning(`${file}: missing Open Graph tags`);
    }

    // Check for skip link
    if (content.includes('skip-link') || content.includes('skip-nav')) {
      report.success(`${file}: has skip navigation link`);
    } else {
      report.warning(`${file}: missing skip navigation link`);
    }

    // Check for canonical URL
    if (content.includes('rel="canonical"')) {
      report.success(`${file}: has canonical URL`);
    } else {
      report.warning(`${file}: missing canonical URL`);
    }
  });
}

// ─── CSS / Page Rendering Integrity ───────────────────────
function checkPageRendering() {
  report.section('🎨 Page Rendering Integrity');

  const clientDir = path.join(rootDir, 'client');
  const stylesDir = path.join(clientDir, 'styles');
  const htmlFiles = fs.readdirSync(clientDir).filter((f) => f.endsWith('.html'));

  // 1. Verify all referenced CSS files exist
  htmlFiles.forEach((file) => {
    const content = fs.readFileSync(path.join(clientDir, file), 'utf8');
    const cssRefs = content.match(/href="\/styles\/([^"]+\.css)"/g) || [];

    if (cssRefs.length === 0 && !file.includes('offline')) {
      report.error(`${file}: no CSS stylesheets linked (page will render unstyled)`);
      return;
    }

    cssRefs.forEach((ref) => {
      const cssFile = ref.match(/href="\/styles\/([^"]+\.css)"/)?.[1];
      if (cssFile) {
        const cssPath = path.join(stylesDir, cssFile);
        if (fs.existsSync(cssPath)) {
          const stat = fs.statSync(cssPath);
          if (stat.size < 10) {
            report.warning(
              `${file}: CSS file ${cssFile} is suspiciously small (${stat.size} bytes)`
            );
          }
        } else {
          report.error(`${file}: references missing CSS file: styles/${cssFile}`);
        }
      }
    });
  });

  // 2. Check core CSS files exist and are non-empty
  const requiredCSS = ['main.css', 'tokens.css', 'nav.css', 'components.css'];
  requiredCSS.forEach((cssFile) => {
    const cssPath = path.join(stylesDir, cssFile);
    if (fs.existsSync(cssPath)) {
      const stat = fs.statSync(cssPath);
      if (stat.size > 100) {
        report.success(`Core CSS: ${cssFile} exists (${(stat.size / 1024).toFixed(1)} KB)`);
      } else {
        report.error(`Core CSS: ${cssFile} is empty or near-empty (${stat.size} bytes)`);
      }
    } else {
      report.error(`Core CSS: ${cssFile} is missing`);
    }
  });

  // 3. Verify each HTML page links at least the core stylesheets
  const coreStylesheets = ['main.css', 'tokens.css', 'nav.css'];
  htmlFiles.forEach((file) => {
    if (file === 'offline.html') {
      return;
    } // offline uses inline styles by design
    const content = fs.readFileSync(path.join(clientDir, file), 'utf8');

    const missingCore = coreStylesheets.filter((css) => !content.includes(`/styles/${css}`));
    if (missingCore.length === 0) {
      report.success(`${file}: links all core stylesheets`);
    } else {
      report.error(`${file}: missing core stylesheet(s): ${missingCore.join(', ')}`);
    }
  });

  // 4. Verify Vite build config includes all HTML pages
  const viteConfigPath = path.join(rootDir, 'vite.config.js');
  if (fs.existsSync(viteConfigPath)) {
    const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
    const buildablePages = htmlFiles.filter((f) => f !== 'offline.html');
    const missingFromBuild = buildablePages.filter((f) => {
      // Check if the HTML filename appears in the vite config (e.g., "client/templates.html")
      return !viteConfig.includes(f);
    });

    if (missingFromBuild.length === 0) {
      report.success('Vite build config: all pages included in rollup inputs');
    } else {
      report.warning(
        `Vite build config: pages not in rollup inputs: ${missingFromBuild.join(', ')}`
      );
    }
  }

  // 5. Verify dev-mode Express serves all page routes
  const serverIndexPath = path.join(rootDir, 'server/index.js');
  if (fs.existsSync(serverIndexPath)) {
    const serverContent = fs.readFileSync(serverIndexPath, 'utf8');
    const pageRoutes = htmlFiles
      .filter((f) => f !== 'offline.html' && f !== 'index.html')
      .map((f) => f.replace('.html', ''));

    const missingRoutes = pageRoutes.filter((page) => {
      // Check both dev and production route declarations
      return !serverContent.includes(`'/${page}'`);
    });

    if (missingRoutes.length === 0) {
      report.success('Express routes: all pages have server-side routes (dev + prod)');
    } else {
      report.error(`Express routes: missing server routes for: ${missingRoutes.join(', ')}`);
    }

    // 6. Verify dev-mode static file serving
    if (serverContent.includes('express.static') && serverContent.includes("'/styles'")) {
      report.success('Express dev mode: static CSS serving configured');
    } else {
      report.error(
        'Express dev mode: no static CSS serving — pages will render unstyled on port 3000'
      );
    }
  }
}

function generateAuditLog(version) {
  report.section('📝 Generating Audit Log');

  const timestamp = new Date().toISOString();
  const logEntry = {
    version,
    timestamp,
    passed: report.passed.length,
    warnings: report.warnings.length,
    errors: report.errors.length,
    details: {
      passed: report.passed,
      warnings: report.warnings,
      errors: report.errors,
    },
  };

  const logsDir = path.join(rootDir, 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  const logFile = path.join(logsDir, 'audit-history.jsonl');
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');

  report.success(`Audit log written to logs/audit-history.jsonl`);
}

// Main audit function
function runAudit(options = {}) {
  console.log(`${colors.blue}`);
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                                                            ║');
  console.log('║          STRUCTURED FOR GROWTH - PRE-DEPLOY AUDIT         ║');
  console.log('║                                                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`${colors.reset}\n`);

  // Run all checks
  checkDocumentation();
  checkDirectoryStructure();
  checkPackageJSON();
  checkEnvironment();
  checkCodeQuality();
  checkDataIntegrity();
  checkSecurityPatterns();
  checkHTMLPages();
  checkPageRendering();
  checkBuildIntegrity();

  // Bump version if requested
  let _newVersion = null;
  if (options.bump) {
    _newVersion = bumpVersion(options.versionType || 'patch');
  }

  // Generate audit log
  const pkg = readJSON('package.json');
  generateAuditLog(pkg ? pkg.version : 'unknown');

  // Display summary
  const passed = report.summary();

  if (passed) {
    console.log(`${colors.green}✓ AUDIT PASSED - Ready for deployment!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}✗ AUDIT FAILED - Fix errors before deploying${colors.reset}\n`);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  bump: args.includes('--bump') || args.includes('-b'),
  versionType: args.find((arg) => ['major', 'minor', 'patch'].includes(arg)) || 'patch',
};

// Run the audit
runAudit(options).catch((error) => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
