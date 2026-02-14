/**
 * Compliance Knowledge Base — Express API Routes
 * Reads framework JSON data from the Compliance-as-Code repo and serves
 * it for the SFG compliance page.
 */

import { Router } from 'express';
import { readdir, readFile } from 'fs/promises';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Path to the Compliance-as-Code data directory (sibling repo)
const CAC_ROOT = resolve(__dirname, '..', '..', '..', 'Compliance-as-Code');
const DATA_ROOT = join(CAC_ROOT, 'data');
const FRAMEWORKS_DIR = join(DATA_ROOT, 'frameworks');
const MAPPINGS_DIR  = join(DATA_ROOT, 'mappings');
const OSCAL_DIR     = join(DATA_ROOT, 'oscal');
const KB_DIR        = join(CAC_ROOT, 'knowledge-base');

const router = Router();

// ── GET /api/compliance/frameworks ─────────────────────────
// Returns all framework summaries in a single list
router.get('/frameworks', async (_req, res) => {
  try {
    const files = await readdir(FRAMEWORKS_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    const frameworks = await Promise.all(
      jsonFiles.map(async f => {
        const raw = await readFile(join(FRAMEWORKS_DIR, f), 'utf-8');
        return JSON.parse(raw);
      })
    );
    res.json({ frameworks });
  } catch (err) {
    console.error('[compliance] Error loading frameworks:', err.message);
    res.status(500).json({ error: 'Failed to load framework data', detail: err.message });
  }
});

// ── GET /api/compliance/frameworks/:id ─────────────────────
// Returns a single framework by its ID (filename without .json)
router.get('/frameworks/:id', async (req, res) => {
  try {
    const safeName = req.params.id.replace(/[^a-zA-Z0-9_-]/g, '');
    const filePath = join(FRAMEWORKS_DIR, `${safeName}.json`);
    const raw = await readFile(filePath, 'utf-8');
    res.json(JSON.parse(raw));
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.status(404).json({ error: 'Framework not found' });
    } else {
      console.error('[compliance] Error loading framework:', err.message);
      res.status(500).json({ error: 'Failed to load framework', detail: err.message });
    }
  }
});

// ── GET /api/compliance/crossmap ───────────────────────────
// Returns the cross-framework mapping data
router.get('/crossmap', async (_req, res) => {
  try {
    const raw = await readFile(join(MAPPINGS_DIR, 'cross-framework-map.json'), 'utf-8');
    res.json(JSON.parse(raw));
  } catch (err) {
    console.error('[compliance] Error loading cross-map:', err.message);
    res.status(500).json({ error: 'Failed to load cross-framework map', detail: err.message });
  }
});

// ── GET /api/compliance/templates ──────────────────────────
// Returns template metadata (the actual templates live in the Compliance-as-Code repo)
router.get('/templates', async (_req, res) => {
  try {
    const raw = await readFile(join(MAPPINGS_DIR, 'resource-taxonomy.json'), 'utf-8');
    res.json(JSON.parse(raw));
  } catch (err) {
    console.error('[compliance] Error loading templates:', err.message);
    res.status(500).json({ error: 'Failed to load template metadata', detail: err.message });
  }
});

// ── GET /api/compliance/oscal ─────────────────────────────
// Returns list of available OSCAL catalogs
router.get('/oscal', async (_req, res) => {
  try {
    const files = await readdir(OSCAL_DIR);
    const catalogs = files.filter(f => f.endsWith('.json')).map(f => {
      const id = f.replace('catalog-', '').replace('.json', '');
      return { id, filename: f, downloadUrl: `/api/compliance/oscal/${id}` };
    });
    res.json({ catalogs });
  } catch (err) {
    console.error('[compliance] Error listing OSCAL catalogs:', err.message);
    res.status(500).json({ error: 'Failed to list OSCAL catalogs', detail: err.message });
  }
});

// ── GET /api/compliance/oscal/:framework ──────────────────
// Returns a specific OSCAL catalog JSON
router.get('/oscal/:framework', async (req, res) => {
  try {
    const safeName = req.params.framework.replace(/[^a-zA-Z0-9_-]/g, '');
    const filePath = join(OSCAL_DIR, `catalog-${safeName}.json`);
    const raw = await readFile(filePath, 'utf-8');
    res.json(JSON.parse(raw));
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.status(404).json({ error: 'OSCAL catalog not found' });
    } else {
      console.error('[compliance] Error loading OSCAL catalog:', err.message);
      res.status(500).json({ error: 'Failed to load OSCAL catalog', detail: err.message });
    }
  }
});

// ── GET /api/compliance/evidence ──────────────────────────
// Returns evidence requirements matrix across all frameworks
router.get('/evidence', async (_req, res) => {
  try {
    const files = await readdir(FRAMEWORKS_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    const evidence = [];

    for (const f of jsonFiles) {
      const raw = await readFile(join(FRAMEWORKS_DIR, f), 'utf-8');
      const fw = JSON.parse(raw);
      for (const domain of fw.domains || []) {
        for (const ctrl of domain.controls || []) {
          if (ctrl.evidenceRequired?.length > 0) {
            evidence.push({
              frameworkId: fw.id,
              frameworkName: fw.name,
              domain: domain.name,
              controlId: ctrl.id,
              controlName: ctrl.name,
              evidenceRequired: ctrl.evidenceRequired,
              automationCapability: ctrl.automationCapability || 'manual'
            });
          }
        }
      }
    }

    res.json({ totalControls: evidence.length, evidence });
  } catch (err) {
    console.error('[compliance] Error loading evidence data:', err.message);
    res.status(500).json({ error: 'Failed to load evidence matrix', detail: err.message });
  }
});

// ── GET /api/compliance/guidance/:framework ───────────────
// Returns the implementation guide markdown for a framework
router.get('/guidance/:framework', async (req, res) => {
  try {
    const safeName = req.params.framework.replace(/[^a-zA-Z0-9_-]/g, '');
    const guidePath = join(KB_DIR, safeName, 'implementation-guide.md');
    const content = await readFile(guidePath, 'utf-8');
    res.type('text/markdown').send(content);
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.status(404).json({ error: 'Implementation guide not found' });
    } else {
      res.status(500).json({ error: 'Failed to load guide', detail: err.message });
    }
  }
});

// ── GET /api/compliance/lookup ────────────────────────────
// Returns the pre-built cross-framework lookup table (if available)
router.get('/lookup', async (_req, res) => {
  try {
    const raw = await readFile(join(MAPPINGS_DIR, 'cross-framework-lookup.json'), 'utf-8');
    res.json(JSON.parse(raw));
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.status(404).json({ error: 'Run npm run build:crossmap in Compliance-as-Code first' });
    } else {
      res.status(500).json({ error: 'Failed to load lookup table', detail: err.message });
    }
  }
});

export default router;
