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
const DATA_ROOT = resolve(__dirname, '..', '..', '..', 'Compliance-as-Code', 'data');
const FRAMEWORKS_DIR = join(DATA_ROOT, 'frameworks');
const MAPPINGS_DIR  = join(DATA_ROOT, 'mappings');

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

export default router;
