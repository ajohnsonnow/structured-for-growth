#!/usr/bin/env node

/**
 * Docs-as-Code Generator
 * ──────────────────────
 * Introspects the live codebase and produces a JSON manifest
 * that powers the searchable /docs page.
 *
 * Runs automatically during:
 *   • npm run predeploy
 *   • npm run prepush
 *   • npm run docs:generate (manual)
 *
 * Output → client/assets/docs-manifest.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

/* ── helpers ─────────────────────────────────────────────── */

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf-8');
}
function readJSON(rel) {
  return JSON.parse(read(rel));
}
function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}
function globDir(rel, ext) {
  const dir = path.join(ROOT, rel);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith(ext));
}
function filesRecursive(dir, exts, list = []) {
  if (!fs.existsSync(dir)) return list;
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory() && !f.startsWith('.') && f !== 'node_modules' && f !== 'dist') {
      filesRecursive(full, exts, list);
    } else if (exts.some(e => f.endsWith(e))) {
      list.push(full);
    }
  }
  return list;
}

/* ── 1. Parse server routes ─────────────────────────────── */

function parseRoutes() {
  const routeDir = path.join(ROOT, 'server', 'routes');
  const routeFiles = globDir('server/routes', '.js');
  const routes = [];

  for (const file of routeFiles) {
    const content = fs.readFileSync(path.join(routeDir, file), 'utf-8');
    const moduleName = file.replace('.js', '');

    // Match router.get/post/put/delete/patch('path', ...)
    const methodRegex = /router\.(get|post|put|delete|patch)\(\s*['"`]([^'"`]+)['"`]/gi;
    let m;
    while ((m = methodRegex.exec(content)) !== null) {
      const method = m[1].toUpperCase();
      const routePath = m[2];

      // Try to grab the inline comment above or next to the route
      const linesBefore = content.substring(0, m.index).split('\n');
      let description = '';
      for (let i = linesBefore.length - 1; i >= Math.max(0, linesBefore.length - 4); i--) {
        const line = linesBefore[i].trim();
        if (line.startsWith('//')) {
          description = line.replace(/^\/\/\s*/, '');
          break;
        }
      }

      // Detect auth requirement
      const surroundingText = content.substring(m.index, m.index + 200);
      let auth = 'None';
      if (surroundingText.includes('requireAdmin')) auth = 'Admin';
      else if (surroundingText.includes('requireAuth') || surroundingText.includes('authenticateToken')) auth = 'Token';
      else if (surroundingText.includes('authenticateClient')) auth = 'Client Token';

      // Build the full API path
      const prefix = moduleName === 'contact' ? '/api/contact' : `/api/${moduleName}`;
      const fullPath = routePath === '/' ? prefix : `${prefix}${routePath}`;

      routes.push({ method, path: fullPath, module: moduleName, auth, description });
    }
  }

  // Add health check from server/index.js
  routes.unshift({ method: 'GET', path: '/api/health', module: 'core', auth: 'None', description: 'Health check endpoint' });

  return routes;
}

/* ── 2. Parse client pages ──────────────────────────────── */

function parsePages() {
  const htmlFiles = globDir('client', '.html');
  const pages = [];

  for (const file of htmlFiles) {
    const content = read(`client/${file}`);
    const pageName = file.replace('.html', '');

    // Extract <title>
    const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : pageName;

    // Count sections, forms, modals
    const sections = (content.match(/<section/gi) || []).length;
    const forms = (content.match(/<form/gi) || []).length;
    const modals = (content.match(/modal/gi) || []).length;
    const scripts = [...content.matchAll(/<script[^>]*src=["']([^"']+)["']/gi)].map(m => m[1]);

    // Extract heading-level features
    const headings = [...content.matchAll(/<h[1-3][^>]*>([^<]+)</gi)].map(m => m[1].trim());

    pages.push({
      file: `client/${file}`,
      slug: pageName === 'index' ? '/' : `/${pageName}`,
      title,
      sections,
      forms,
      modals,
      scripts,
      headings
    });
  }

  return pages;
}

/* ── 3. Parse templates from templateData.js ────────────── */

function parseTemplates() {
  // We'll parse the client-facing templateData.js since that's what users see
  const content = read('client/js/templateData.js');
  const templates = [];

  // Match template object literals — id, title, category, description
  const templateBlocks = content.split(/(?=\{\s*id\s*:)/g).slice(1);

  for (const block of templateBlocks) {
    const id = block.match(/id\s*:\s*['"`]([^'"`]+)['"`]/)?.[1];
    const title = block.match(/title\s*:\s*['"`]([^'"`]+)['"`]/)?.[1];
    const category = block.match(/category\s*:\s*['"`]([^'"`]+)['"`]/)?.[1];
    const description = block.match(/description\s*:\s*['"`]([^'"`]+)['"`]/)?.[1];
    const language = block.match(/language\s*:\s*['"`]([^'"`]+)['"`]/)?.[1];
    const timeSaved = block.match(/timeSaved\s*:\s*['"`]([^'"`]+)['"`]/)?.[1];

    if (id && title) {
      templates.push({ id, title, category: category || 'misc', description: description || '', language: language || 'javascript', timeSaved: timeSaved || '' });
    }
  }

  return templates;
}

/* ── 4. Parse compliance frameworks ─────────────────────── */

function parseFrameworks() {
  const fwDir = 'data/compliance/frameworks';
  const files = globDir(fwDir, '.json');
  const frameworks = [];

  for (const file of files) {
    try {
      const fw = readJSON(`${fwDir}/${file}`);
      const controlCount = Array.isArray(fw.controls) ? fw.controls.length : (Array.isArray(fw.domains) ? fw.domains.reduce((s, d) => s + (d.controls?.length || 0), 0) : 0);
      frameworks.push({
        id: fw.id || file.replace('.json', ''),
        name: fw.name || fw.title || file.replace('.json', ''),
        description: fw.description || '',
        version: fw.version || '',
        controlCount,
        file: `${fwDir}/${file}`
      });
    } catch { /* skip bad json */ }
  }

  return frameworks;
}

/* ── 5. Parse OSCAL catalogs ────────────────────────────── */

function parseOscal() {
  const oscalDir = 'data/compliance/oscal';
  const files = globDir(oscalDir, '.json');
  return files.map(f => {
    const id = f.replace('catalog-', '').replace('.json', '');
    return { id, file: `${oscalDir}/${f}` };
  });
}

/* ── 6. Parse cross-framework mappings ──────────────────── */

function parseMappings() {
  const mapDir = 'data/compliance/mappings';
  const files = globDir(mapDir, '.json');
  return files.map(f => {
    const data = readJSON(`${mapDir}/${f}`);
    const entryCount = Array.isArray(data) ? data.length : (data.mappings ? data.mappings.length : Object.keys(data).length);
    return { file: f, entries: entryCount };
  });
}

/* ── 7. Parse package metadata ──────────────────────────── */

function parsePackage() {
  const pkg = readJSON('package.json');
  return {
    name: pkg.name,
    version: pkg.version,
    description: pkg.description || '',
    nodeEngine: pkg.engines?.node || '>=18',
    scripts: Object.entries(pkg.scripts || {}).map(([name, cmd]) => ({ name, command: cmd })),
    dependencies: Object.entries(pkg.dependencies || {}).map(([name, ver]) => ({ name, version: ver })),
    devDependencies: Object.entries(pkg.devDependencies || {}).map(([name, ver]) => ({ name, version: ver }))
  };
}

/* ── 8. Collect existing markdown docs ──────────────────── */

function parseDocs() {
  const docFiles = [
    'README.md', 'SETUP.md',
    'docs/ADMIN-GUIDE.md', 'docs/CLIENT-GUIDE.md'
  ];
  const docs = [];

  for (const rel of docFiles) {
    if (!exists(rel)) continue;
    const content = read(rel);
    const lines = content.split('\n');
    const headings = lines.filter(l => l.startsWith('#')).map(l => l.replace(/^#+\s*/, ''));
    const wordCount = content.split(/\s+/).length;
    docs.push({ file: rel, headings, wordCount });
  }

  return docs;
}

/* ── 9. Collect CSS stylesheets ─────────────────────────── */

function parseStyles() {
  const cssFiles = globDir('client/styles', '.css');
  return cssFiles.map(f => {
    const content = read(`client/styles/${f}`);
    const vars = (content.match(/--[\w-]+/g) || []).length;
    const selectors = (content.match(/[^{}]+\{/g) || []).length;
    return { file: `client/styles/${f}`, customProperties: vars, selectors };
  });
}

/* ── 10. Feature inventory (derived) ────────────────────── */

function deriveFeatures(routes, pages, templates, frameworks) {
  return [
    {
      name: 'Public Portfolio & Landing',
      description: 'Responsive homepage showcasing projects, services, and contact form with email delivery.',
      category: 'frontend',
      relatedPages: ['/'],
      relatedRoutes: ['/api/contact'],
      status: 'stable'
    },
    {
      name: 'Admin Dashboard',
      description: 'Full-featured management console: clients, projects, tasks, time tracking, messaging, campaigns, user management, backups.',
      category: 'frontend',
      relatedPages: ['/dashboard'],
      relatedRoutes: routes.filter(r => ['/api/clients', '/api/projects', '/api/messages', '/api/campaigns', '/api/backup', '/api/auth'].some(p => r.path.startsWith(p))).map(r => r.path),
      status: 'stable'
    },
    {
      name: 'Client Portal',
      description: 'Self-service portal for clients to view projects, billing, estimates, and exchange messages.',
      category: 'frontend',
      relatedPages: ['/portal'],
      relatedRoutes: routes.filter(r => r.path.startsWith('/api/portal')).map(r => r.path),
      status: 'stable'
    },
    {
      name: 'Developer Template Library',
      description: `${templates.length} production-ready code templates across ${[...new Set(templates.map(t => t.category))].length} categories with live preview, usage notes, and search.`,
      category: 'frontend',
      relatedPages: ['/templates'],
      relatedRoutes: [],
      status: 'stable'
    },
    {
      name: 'Compliance Knowledge Base',
      description: `${frameworks.length} regulatory frameworks with cross-mapping, evidence tracking, OSCAL catalogs, and implementation guidance.`,
      category: 'frontend',
      relatedPages: ['/compliance'],
      relatedRoutes: routes.filter(r => r.path.startsWith('/api/compliance')).map(r => r.path),
      status: 'stable'
    },
    {
      name: 'Authentication & RBAC',
      description: 'JWT-based auth with admin/user roles, activity logging, and password management.',
      category: 'backend',
      relatedPages: [],
      relatedRoutes: routes.filter(r => r.path.startsWith('/api/auth')).map(r => r.path),
      status: 'stable'
    },
    {
      name: 'Campaign & Messaging Engine',
      description: 'Segment-based bulk messaging, email templates, read-tracking, and campaign analytics.',
      category: 'backend',
      relatedPages: [],
      relatedRoutes: routes.filter(r => r.path.startsWith('/api/campaigns') || r.path.startsWith('/api/messages')).map(r => r.path),
      status: 'stable'
    },
    {
      name: 'Backup & Restore',
      description: 'On-demand JSON backups, downloadable exports, and one-click restoration with safety snapshots.',
      category: 'backend',
      relatedPages: [],
      relatedRoutes: routes.filter(r => r.path.startsWith('/api/backup')).map(r => r.path),
      status: 'stable'
    },
    {
      name: 'Demo Data Generator',
      description: 'One-click demo population with realistic clients, projects, messages, and campaigns. Selective or full cleanup.',
      category: 'backend',
      relatedPages: [],
      relatedRoutes: routes.filter(r => r.path.startsWith('/api/demo')).map(r => r.path),
      status: 'stable'
    },
    {
      name: 'Docs-as-Code',
      description: 'Auto-generated, searchable documentation page that stays in sync with the codebase on every deploy.',
      category: 'tooling',
      relatedPages: ['/docs'],
      relatedRoutes: [],
      status: 'stable'
    }
  ];
}

/* ── Build manifest ─────────────────────────────────────── */

function buildManifest() {
  console.log('\n🔍  Scanning codebase...\n');

  const routes     = parseRoutes();
  const pages      = parsePages();
  const templates  = parseTemplates();
  const frameworks = parseFrameworks();
  const oscal      = parseOscal();
  const mappings   = parseMappings();
  const pkg        = parsePackage();
  const docs       = parseDocs();
  const styles     = parseStyles();
  const features   = deriveFeatures(routes, pages, templates, frameworks);

  const manifest = {
    generated: new Date().toISOString(),
    version: pkg.version,
    summary: {
      totalRoutes: routes.length,
      totalPages: pages.length,
      totalTemplates: templates.length,
      totalFrameworks: frameworks.length,
      totalFeatures: features.length,
      totalDocs: docs.length
    },
    features,
    routes,
    pages,
    templates,
    compliance: { frameworks, oscal, mappings },
    pkg,
    docs,
    styles
  };

  // Write the manifest
  const outDir = path.join(ROOT, 'client', 'assets');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const outPath = path.join(outDir, 'docs-manifest.json');
  fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2), 'utf-8');

  // Stats
  console.log('  ✓ Routes:      ', routes.length);
  console.log('  ✓ Pages:       ', pages.length);
  console.log('  ✓ Templates:   ', templates.length);
  console.log('  ✓ Frameworks:  ', frameworks.length);
  console.log('  ✓ Features:    ', features.length);
  console.log('  ✓ Docs:        ', docs.length);
  console.log('  ✓ Stylesheets: ', styles.length);
  console.log(`\n📄  Manifest written → client/assets/docs-manifest.json`);
  console.log(`    (${(JSON.stringify(manifest).length / 1024).toFixed(1)} KB)\n`);
}

buildManifest();
