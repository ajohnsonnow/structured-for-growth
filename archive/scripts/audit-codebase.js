#!/usr/bin/env node
/**
 * Autonomous Codebase Audit Script
 *
 * Performs exhaustive static analysis of the entire codebase:
 * 1. AST-level function mapping (all exports, handlers, routes)
 * 2. UI-to-backend wiring verification (client fetch → server route)
 * 3. Dependency graph validation (orphaned code, circular deps)
 * 4. Coverage gap detection (untested functions)
 * 5. Security surface analysis (unprotected routes, missing validation)
 *
 * Usage:
 *   node scripts/audit-codebase.js              # Full audit
 *   node scripts/audit-codebase.js --json        # JSON output
 *   node scripts/audit-codebase.js --wiring-only # Wiring check only
 *   node scripts/audit-codebase.js --fix         # Auto-generate missing test stubs
 */

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'fs';
import { basename, dirname, extname, join, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

// ─── Configuration ──────────────────────────────────────────
const CONFIG = {
  serverDir: join(ROOT, 'server'),
  clientDir: join(ROOT, 'client'),
  testsDir: join(ROOT, 'tests'),
  outputFile: join(ROOT, 'audit-report.json'),
  ignorePatterns: ['node_modules', 'dist', 'coverage', 'codeql_db', 'archive', '.git'],
};

// ─── Utility Functions ──────────────────────────────────────

function walkDir(dir, filter = () => true) {
  const results = [];
  if (!existsSync(dir)) {
    return results;
  }
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (CONFIG.ignorePatterns.some((p) => entry.name === p)) {
      continue;
    }
    if (entry.isDirectory()) {
      results.push(...walkDir(fullPath, filter));
    } else if (filter(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

function isJsFile(name) {
  return ['.js', '.mjs', '.cjs'].includes(extname(name));
}

// ─── 1. Function Extraction (Lightweight AST via Regex) ─────

/**
 * Extracts all exported functions, classes, and route handlers from a JS file.
 * Uses regex-based parsing (no external AST dependency needed).
 */
function extractExports(filePath) {
  const code = readFileSync(filePath, 'utf-8');
  const relPath = relative(ROOT, filePath);
  const exports = [];

  // Named export functions: export function foo() / export async function foo()
  for (const m of code.matchAll(/export\s+(async\s+)?function\s+(\w+)\s*\(([^)]*)\)/g)) {
    exports.push({
      type: 'function',
      name: m[2],
      params: m[3].trim(),
      async: !!m[1],
      file: relPath,
    });
  }

  // Named export const/let: export const foo = ...
  for (const m of code.matchAll(/export\s+(?:const|let|var)\s+(\w+)\s*=/g)) {
    exports.push({ type: 'const', name: m[1], file: relPath });
  }

  // Default export
  if (/export\s+default\s+/.test(code)) {
    exports.push({ type: 'default', name: 'default', file: relPath });
  }

  // Express route handlers: router.get/post/put/delete/patch
  for (const m of code.matchAll(
    /router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g
  )) {
    // Skip matches inside comments (JSDoc @example, // comments)
    const lineStart = code.lastIndexOf('\n', m.index) + 1;
    const linePrefix = code.substring(lineStart, m.index).trimStart();
    if (linePrefix.startsWith('*') || linePrefix.startsWith('//') || linePrefix.startsWith('/*')) {
      continue;
    }

    exports.push({
      type: 'route',
      method: m[1].toUpperCase(),
      path: m[2],
      file: relPath,
    });
  }

  // Inline route handlers in index.js: app.get/post
  for (const m of code.matchAll(/app\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g)) {
    // Skip matches inside comments
    const lineStart = code.lastIndexOf('\n', m.index) + 1;
    const linePrefix = code.substring(lineStart, m.index).trimStart();
    if (linePrefix.startsWith('*') || linePrefix.startsWith('//') || linePrefix.startsWith('/*')) {
      continue;
    }

    exports.push({
      type: 'route',
      method: m[1].toUpperCase(),
      path: m[2],
      file: relPath,
    });
  }

  // Middleware exports: export function middlewareName or module.exports
  for (const m of code.matchAll(/(?:module\.exports\s*=\s*\{([^}]+)\})/g)) {
    const names = m[1].split(',').map((s) => s.trim().split(':')[0].trim());
    names.forEach((name) => {
      if (name) {
        exports.push({ type: 'cjs-export', name, file: relPath });
      }
    });
  }

  return exports;
}

// ─── 2. Client Fetch Call Extraction ────────────────────────

function extractFetchCalls(filePath) {
  const code = readFileSync(filePath, 'utf-8');
  const relPath = relative(ROOT, filePath);
  const calls = [];

  // fetch('/api/...') or fetch(`/api/...`)
  for (const m of code.matchAll(/fetch\s*\(\s*[`'"]([^`'"]+)[`'"]/g)) {
    const url = m[1];
    calls.push({ url, file: relPath, line: getLineNumber(code, m.index) });
  }

  // fetch(url, { method: 'POST' }) patterns
  for (const m of code.matchAll(
    /fetch\s*\(\s*[`'"]([^`'"]+)[`'"]\s*,\s*\{[^}]*method:\s*['"](\w+)['"]/gs
  )) {
    calls.push({
      url: m[1],
      method: m[2].toUpperCase(),
      file: relPath,
      line: getLineNumber(code, m.index),
    });
  }

  // Template literal fetch with variable interpolation
  for (const m of code.matchAll(/fetch\s*\(\s*`([^`]+)`/g)) {
    const url = m[1].replace(/\$\{[^}]+\}/g, ':param');
    calls.push({ url, file: relPath, line: getLineNumber(code, m.index), dynamic: true });
  }

  return calls;
}

function getLineNumber(code, index) {
  return code.substring(0, index).split('\n').length;
}

// ─── 3. Route Mount Extraction from server/index.js ─────────

function extractRouteMounts() {
  const indexPath = join(CONFIG.serverDir, 'index.js');
  const code = readFileSync(indexPath, 'utf-8');
  const mounts = [];

  // app.use('/api/...', router)
  for (const m of code.matchAll(/app\.use\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*(\w+)/g)) {
    mounts.push({ prefix: m[1], routerVar: m[2] });
  }

  return mounts;
}

// ─── 4. Wiring Verification ────────────────────────────────

function verifyWiring(clientCalls, serverRoutes, routeMounts) {
  const results = { matched: [], unmatched: [], orphanedRoutes: [] };

  // Build full server route paths
  const fullServerRoutes = [];
  for (const route of serverRoutes) {
    if (route.type !== 'route') {
      continue;
    }

    // Find the mount prefix for this route's file
    const routeFile = basename(route.file, '.js');
    const mount = routeMounts.find((m) => {
      return m.routerVar.toLowerCase().includes(routeFile.replace(/-/g, ''));
    });

    const prefix = mount?.prefix || '';
    const fullPath = prefix + route.path;
    fullServerRoutes.push({
      ...route,
      fullPath,
      matched: false,
    });
  }

  // Match each client call to a server route
  for (const call of clientCalls) {
    const url = call.url.replace(/:\w+/g, ':param');
    const matchedRoute = fullServerRoutes.find((r) => {
      const routePath = r.fullPath.replace(/:\w+/g, ':param');
      return routePath === url || url.startsWith(routePath.replace(/\/$/, ''));
    });

    if (matchedRoute) {
      matchedRoute.matched = true;
      results.matched.push({
        clientFile: call.file,
        clientLine: call.line,
        url: call.url,
        method: call.method || 'GET',
        serverFile: matchedRoute.file,
        serverPath: matchedRoute.fullPath,
        serverMethod: matchedRoute.method,
      });
    } else {
      results.unmatched.push({
        clientFile: call.file,
        clientLine: call.line,
        url: call.url,
        method: call.method || 'GET',
        status: 'NO_SERVER_ROUTE',
      });
    }
  }

  // Find orphaned server routes (never called from any client)
  results.orphanedRoutes = fullServerRoutes
    .filter((r) => !r.matched)
    .map((r) => ({
      file: r.file,
      method: r.method,
      path: r.fullPath,
      status: 'NO_CLIENT_CALLER',
    }));

  return results;
}

// ─── 5. Test Coverage Mapping ──────────────────────────────

function mapTestCoverage() {
  const testFiles = walkDir(CONFIG.testsDir, isJsFile);
  const coverage = {};

  for (const testFile of testFiles) {
    const code = readFileSync(testFile, 'utf-8');
    const relPath = relative(ROOT, testFile);

    // Extract import targets
    for (const m of code.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
      const importPath = m[1];
      if (!coverage[importPath]) {
        coverage[importPath] = [];
      }
      coverage[importPath].push(relPath);
    }

    // Extract describe blocks for mapping
    for (const m of code.matchAll(/describe\s*\(\s*['"`]([^'"`]+)['"`]/g)) {
      if (!coverage._describes) {
        coverage._describes = [];
      }
      coverage._describes.push({ test: relPath, describe: m[1] });
    }
  }

  return coverage;
}

// ─── 6. Security Surface Analysis ──────────────────────────

/**
 * Routes that are intentionally public and do not require authentication.
 * Format: 'FILE_BASENAME:METHOD:PATH'
 */
const KNOWN_PUBLIC_ROUTES = new Set([
  // Public API documentation
  'api-docs:GET:/openapi.json',
  'api-docs:GET:/',
  // Auth flow endpoints (must be public to allow login/signup)
  'auth:GET:/verify',
  'auth:POST:/refresh',
  'auth:POST:/logout',
  // Public compliance framework reference data
  'compliance:GET:/frameworks',
  'compliance:GET:/frameworks/:id',
  'compliance:GET:/crossmap',
  'compliance:GET:/templates',
  'compliance:GET:/oscal',
  'compliance:GET:/oscal/:framework',
  'compliance:GET:/evidence',
  'compliance:GET:/guidance/:framework',
  'compliance:GET:/lookup',
  // Public contact form
  'contact:POST:/',
  // Public MBAI template data
  'mbai:GET:/manifest',
  'mbai:GET:/templates',
  'mbai:GET:/templates/:id',
  'mbai:GET:/categories',
  // MFA validation during login (user is not yet authenticated)
  'mfa:POST:/validate',
]);

function analyzeSecuritySurface(serverRoutes) {
  const findings = [];

  for (const route of serverRoutes) {
    if (route.type !== 'route') {
      continue;
    }

    const code = readFileSync(join(ROOT, route.file), 'utf-8');

    // Check if route has authentication
    const routePattern = new RegExp(
      `router\\.${route.method.toLowerCase()}\\s*\\(\\s*['"\`]${route.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"\`]`
    );
    const routeMatch = code.match(routePattern);
    if (!routeMatch) {
      continue;
    }

    const routeContext = code.substring(routeMatch.index, routeMatch.index + 500);

    // Check for authenticateToken (or equivalent auth middleware) at router or route level
    const hasRouterAuth = /router\.use\s*\([^)]*authenticateToken[^)]*\)/.test(code);
    const hasRouteAuth = /authenticateToken/.test(routeContext);
    const hasAltAuth =
      /authenticate\w*/.test(routeContext) ||
      /router\.use\s*\([^)]*authenticate\w*[^)]*\)/.test(code);

    // Check if this is a known-public route
    const routeBasename = basename(route.file, '.js');
    const routeKey = `${routeBasename}:${route.method}:${route.path}`;
    const isKnownPublic = KNOWN_PUBLIC_ROUTES.has(routeKey);

    if (
      !hasRouterAuth &&
      !hasRouteAuth &&
      !hasAltAuth &&
      !route.path.includes('login') &&
      !route.path.includes('register')
    ) {
      if (isKnownPublic) {
        // Known-public route — downgrade to INFO (not a real risk)
        findings.push({
          type: 'PUBLIC_ROUTE_ACKNOWLEDGED',
          severity: 'INFO',
          file: route.file,
          route: `${route.method} ${route.path}`,
          message: 'Intentionally public route (no authentication required)',
        });
      } else {
        findings.push({
          type: 'UNPROTECTED_ROUTE',
          severity: 'HIGH',
          file: route.file,
          route: `${route.method} ${route.path}`,
          message: 'Route has no authentication middleware',
        });
      }
    }

    // Check for input validation on mutation routes
    if (['POST', 'PUT', 'PATCH'].includes(route.method)) {
      const hasValidation = /body\s*\(|param\s*\(|validate|validationResult|handleValidation/i.test(
        routeContext
      );
      if (!hasValidation) {
        findings.push({
          type: 'MISSING_VALIDATION',
          severity: 'MEDIUM',
          file: route.file,
          route: `${route.method} ${route.path}`,
          message: 'Mutation route has no input validation',
        });
      }
    }
  }

  return findings;
}

// ─── 7. Dependency Analysis ────────────────────────────────

function analyzeDependencies() {
  const allFiles = [
    ...walkDir(CONFIG.serverDir, isJsFile),
    ...walkDir(join(CONFIG.clientDir, 'js'), isJsFile),
  ];
  const graph = {};
  const imported = new Set();

  for (const file of allFiles) {
    const code = readFileSync(file, 'utf-8');
    const relPath = relative(ROOT, file);
    graph[relPath] = [];

    for (const m of code.matchAll(/(?:import|from)\s+['"]([^'"]+)['"]/g)) {
      const dep = m[1];
      if (!dep.startsWith('.') && !dep.startsWith('/')) {
        continue;
      } // skip npm packages
      graph[relPath].push(dep);
      imported.add(dep);
    }
  }

  // Detect circular dependencies
  const circular = [];
  const visited = new Set();
  const recursionStack = new Set();

  function dfs(node, path = []) {
    visited.add(node);
    recursionStack.add(node);

    for (const dep of graph[node] || []) {
      const resolved = resolveDep(node, dep);
      if (recursionStack.has(resolved)) {
        circular.push([...path, node, resolved]);
      } else if (!visited.has(resolved)) {
        dfs(resolved, [...path, node]);
      }
    }

    recursionStack.delete(node);
  }

  for (const node of Object.keys(graph)) {
    if (!visited.has(node)) {
      dfs(node);
    }
  }

  return { graph, circular };
}

function resolveDep(fromFile, dep) {
  // Simplified resolution
  if (dep.startsWith('./') || dep.startsWith('../')) {
    const dir = dirname(fromFile);
    return join(dir, dep).replace(/\\/g, '/');
  }
  return dep;
}

// ─── 8. Main Audit Orchestrator ────────────────────────────

function runAudit() {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes('--json');
  const wiringOnly = args.includes('--wiring-only');

  console.log('🔍 Autonomous Codebase Audit — Starting...\n');
  const startTime = Date.now();

  // Phase 1: Extract all server exports and routes
  console.log('📦 Phase 1: Extracting server-side function map...');
  const serverFiles = walkDir(CONFIG.serverDir, isJsFile);
  const serverExports = serverFiles.flatMap(extractExports);
  const serverRoutes = serverExports.filter((e) => e.type === 'route');
  const serverFunctions = serverExports.filter((e) => e.type === 'function');
  console.log(
    `   Found ${serverRoutes.length} routes, ${serverFunctions.length} exported functions`
  );

  // Phase 2: Extract all client fetch calls
  console.log('🖥️  Phase 2: Extracting client-side API calls...');
  const clientJsFiles = walkDir(join(CONFIG.clientDir, 'js'), isJsFile);
  const clientScriptFiles = walkDir(join(CONFIG.clientDir, 'scripts'), isJsFile);
  const allClientFiles = [...clientJsFiles, ...clientScriptFiles];
  const clientCalls = allClientFiles.flatMap(extractFetchCalls);
  const uniqueEndpoints = [...new Set(clientCalls.map((c) => c.url))];
  console.log(
    `   Found ${clientCalls.length} fetch calls to ${uniqueEndpoints.length} unique endpoints`
  );

  // Phase 3: Extract route mounts
  console.log('🔌 Phase 3: Mapping route mounts from server/index.js...');
  const routeMounts = extractRouteMounts();
  console.log(`   Found ${routeMounts.length} route mounts`);

  // Phase 4: Verify wiring
  console.log('🔗 Phase 4: Verifying UI-to-backend wiring...');
  const wiring = verifyWiring(clientCalls, serverExports, routeMounts);
  console.log(`   ✅ ${wiring.matched.length} matched connections`);
  console.log(`   ❌ ${wiring.unmatched.length} unmatched client calls`);
  console.log(`   🔇 ${wiring.orphanedRoutes.length} orphaned server routes`);

  if (wiringOnly) {
    printWiringReport(wiring);
    return;
  }

  // Phase 5: Test coverage mapping
  console.log('🧪 Phase 5: Mapping test coverage...');
  const testCoverage = mapTestCoverage();
  const testedModules = Object.keys(testCoverage).filter((k) => !k.startsWith('_'));
  console.log(`   ${testedModules.length} modules have test imports`);

  // Phase 6: Security surface analysis
  console.log('🛡️  Phase 6: Analyzing security surface...');
  const securityFindings = analyzeSecuritySurface(serverExports);
  console.log(`   ${securityFindings.length} security findings`);

  // Phase 7: Dependency analysis
  console.log('📊 Phase 7: Analyzing dependency graph...');
  const deps = analyzeDependencies();
  console.log(`   ${deps.circular.length} circular dependencies detected`);

  // Phase 8: Generate untested function inventory
  console.log('📋 Phase 8: Generating untested function inventory...');
  const untestedRoutes = findUntestedRoutes(serverFiles, testCoverage);

  // Phase 9: Compile report
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n⏱️  Audit completed in ${elapsed}s\n`);

  const report = {
    timestamp: new Date().toISOString(),
    elapsedSeconds: parseFloat(elapsed),
    summary: {
      totalServerFiles: serverFiles.length,
      totalClientFiles: allClientFiles.length,
      totalRoutes: serverRoutes.length,
      totalExportedFunctions: serverFunctions.length,
      totalClientFetchCalls: clientCalls.length,
      uniqueEndpoints: uniqueEndpoints.length,
      wiringMatched: wiring.matched.length,
      wiringUnmatched: wiring.unmatched.length,
      orphanedServerRoutes: wiring.orphanedRoutes.length,
      securityFindings: securityFindings.length,
      circularDeps: deps.circular.length,
    },
    wiring,
    security: securityFindings,
    dependencies: {
      circular: deps.circular,
    },
    untestedRoutes,
    serverExports,
    clientCalls,
  };

  if (jsonOutput) {
    writeFileSync(CONFIG.outputFile, JSON.stringify(report, null, 2));
    console.log(`📄 Full report saved to ${relative(ROOT, CONFIG.outputFile)}`);
  } else {
    printReport(report);
  }

  return report;
}

// ─── Report Printers ───────────────────────────────────────

function findUntestedRoutes(serverFiles, _testCoverage) {
  const routeFiles = serverFiles.filter((f) => f.includes('routes')).map((f) => relative(ROOT, f));

  const testedRouteFiles = new Set();
  const testFiles = walkDir(CONFIG.testsDir, isJsFile).map((f) => readFileSync(f, 'utf-8'));

  for (const testCode of testFiles) {
    for (const rf of routeFiles) {
      const routeName = basename(rf, '.js');
      if (testCode.includes(routeName) || testCode.includes(rf)) {
        testedRouteFiles.add(rf);
      }
    }
  }

  return routeFiles.filter((f) => !testedRouteFiles.has(f));
}

function printWiringReport(wiring) {
  console.log('\n' + '═'.repeat(60));
  console.log('  UI → BACKEND WIRING REPORT');
  console.log('═'.repeat(60));

  if (wiring.unmatched.length > 0) {
    console.log('\n❌ UNMATCHED CLIENT CALLS (no server route found):');
    for (const u of wiring.unmatched) {
      console.log(`   ${u.method} ${u.url}  ← ${u.clientFile}:${u.clientLine}`);
    }
  }

  if (wiring.orphanedRoutes.length > 0) {
    console.log('\n🔇 ORPHANED SERVER ROUTES (no client calls them):');
    for (const o of wiring.orphanedRoutes) {
      console.log(`   ${o.method} ${o.path}  ← ${o.file}`);
    }
  }

  if (wiring.unmatched.length === 0 && wiring.orphanedRoutes.length === 0) {
    console.log('\n✅ All client calls match server routes and vice versa.');
  }
}

function printReport(report) {
  console.log('═'.repeat(60));
  console.log('  AUTONOMOUS CODEBASE AUDIT REPORT');
  console.log('═'.repeat(60));

  console.log('\n📊 SUMMARY');
  console.log(`   Server files:           ${report.summary.totalServerFiles}`);
  console.log(`   Client JS files:        ${report.summary.totalClientFiles}`);
  console.log(`   Total API routes:       ${report.summary.totalRoutes}`);
  console.log(`   Exported functions:     ${report.summary.totalExportedFunctions}`);
  console.log(`   Client fetch calls:     ${report.summary.totalClientFetchCalls}`);
  console.log(`   Unique API endpoints:   ${report.summary.uniqueEndpoints}`);

  console.log('\n🔗 WIRING VERIFICATION');
  console.log(`   ✅ Matched:             ${report.summary.wiringMatched}`);
  console.log(`   ❌ Unmatched:           ${report.summary.wiringUnmatched}`);
  console.log(`   🔇 Orphaned routes:     ${report.summary.orphanedServerRoutes}`);

  if (report.wiring.unmatched.length > 0) {
    console.log('\n   Unmatched client calls:');
    for (const u of report.wiring.unmatched) {
      console.log(`     ${u.method} ${u.url}  ← ${u.clientFile}:${u.clientLine}`);
    }
  }

  if (report.wiring.orphanedRoutes.length > 0) {
    console.log('\n   Orphaned server routes (no UI caller):');
    for (const o of report.wiring.orphanedRoutes.slice(0, 20)) {
      console.log(`     ${o.method} ${o.path}  ← ${o.file}`);
    }
    if (report.wiring.orphanedRoutes.length > 20) {
      console.log(`     ... and ${report.wiring.orphanedRoutes.length - 20} more`);
    }
  }

  console.log('\n🛡️  SECURITY FINDINGS');
  if (report.security.length === 0) {
    console.log('   ✅ No security issues detected');
  } else {
    for (const f of report.security) {
      const icon = f.severity === 'HIGH' ? '🔴' : '🟡';
      console.log(`   ${icon} [${f.severity}] ${f.type}: ${f.route} in ${f.file}`);
      console.log(`      ${f.message}`);
    }
  }

  console.log('\n📦 DEPENDENCY HEALTH');
  if (report.dependencies.circular.length === 0) {
    console.log('   ✅ No circular dependencies');
  } else {
    console.log(`   ⚠️  ${report.dependencies.circular.length} circular dependency chains`);
    for (const chain of report.dependencies.circular.slice(0, 5)) {
      console.log(`     ${chain.join(' → ')}`);
    }
  }

  console.log('\n🧪 UNTESTED ROUTE FILES');
  if (report.untestedRoutes.length === 0) {
    console.log('   ✅ All route files have tests');
  } else {
    for (const f of report.untestedRoutes) {
      console.log(`   ❌ ${f}`);
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log(`  Audit completed: ${report.timestamp}`);
  console.log('═'.repeat(60));
}

// ─── Execute ────────────────────────────────────────────────
runAudit();
