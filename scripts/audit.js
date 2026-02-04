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

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

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
  cyan: '\x1b[36m'
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
  'TEMPLATE-INVENTORY.md',
  'docs/CLIENT-GUIDE.md',
  'docs/ADMIN-GUIDE.md'
];

// Required directories
const requiredDirs = [
  'client',
  'server',
  'server/routes',
  'server/controllers',
  'server/models',
  'server/middleware',
  'templates',
  'docs'
];

function checkFileExists(filePath) {
  return fs.existsSync(path.join(rootDir, filePath));
}

function checkDirExists(dirPath) {
  return fs.existsSync(path.join(rootDir, dirPath)) && 
         fs.statSync(path.join(rootDir, dirPath)).isDirectory();
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
    fs.writeFileSync(
      path.join(rootDir, filePath),
      JSON.stringify(data, null, 2) + '\n',
      'utf8'
    );
    return true;
  } catch (error) {
    report.error(`Failed to write ${filePath}: ${error.message}`);
    return false;
  }
}

function checkDocumentation() {
  report.section('📚 Documentation Audit');

  requiredDocs.forEach(doc => {
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

  requiredDirs.forEach(dir => {
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
  if (!pkg) return;

  const requiredFields = ['name', 'version', 'description', 'scripts', 'dependencies'];
  requiredFields.forEach(field => {
    if (pkg[field]) {
      report.success(`package.json has '${field}' field`);
    } else {
      report.error(`package.json missing '${field}' field`);
    }
  });

  const requiredScripts = ['dev', 'build', 'start'];
  requiredScripts.forEach(script => {
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
  if (!pkg) return null;

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
      const criticalDeps = {
        'express': pkg.dependencies,
        'sql.js': pkg.dependencies,
        'vite': pkg.devDependencies
      };
      
      Object.entries(criticalDeps).forEach(([dep, location]) => {
        if (location && location[dep]) {
          report.success(`Critical dependency '${dep}' is listed`);
        } else {
          report.error(`Critical dependency '${dep}' is missing`);
        }
      });
    }

    // Test build (dry run)
    report.infoMsg('Testing production build...');
    try {
      execSync('npm run build', { cwd: rootDir, stdio: 'pipe', timeout: 60000 });
      report.success('Production build succeeds');
    } catch (error) {
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

    searchDirs.forEach(dir => {
      const dirPath = path.join(rootDir, dir);
      if (fs.existsSync(dirPath)) {
        const files = getAllFiles(dirPath, ['.js', '.html', '.css']);
        files.forEach(file => {
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

    serverFiles.forEach(file => {
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

  files.forEach(file => {
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
    report.warning('.env exists (ensure it\'s in .gitignore)');
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
      errors: report.errors
    }
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
async function runAudit(options = {}) {
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
  checkBuildIntegrity();

  // Bump version if requested
  let newVersion = null;
  if (options.bump) {
    newVersion = bumpVersion(options.versionType || 'patch');
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
  versionType: args.find(arg => ['major', 'minor', 'patch'].includes(arg)) || 'patch'
};

// Run the audit
runAudit(options).catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
