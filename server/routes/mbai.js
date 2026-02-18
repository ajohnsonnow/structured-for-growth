/**
 * MBAi Methodology - Express API Routes
 * Serves the MBAi paradigm templates (SBSC, Circular Supply Chain,
 * TBL, Marketing, HR, SDLC, GRC) for the SFG platform.
 *
 * Data lives in <project>/data/mbai/
 */

import { Router } from 'express';
import { readdir, readFile } from 'fs/promises';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..', '..');
const MBAI_ROOT = join(PROJECT_ROOT, 'data', 'mbai');
const TEMPLATES_DIR = join(MBAI_ROOT, 'templates');

const router = Router();

// ── GET /api/mbai/manifest ────────────────────────────────
// Returns the top-level manifest with pillars, categories, and template list
router.get('/manifest', async (_req, res) => {
  try {
    const raw = await readFile(join(MBAI_ROOT, 'manifest.json'), 'utf-8');
    res.json(JSON.parse(raw));
  } catch (err) {
    console.error('[mbai] Error loading manifest:', err.message);
    res.status(500).json({ error: 'Failed to load MBAi manifest', detail: err.message });
  }
});

// ── GET /api/mbai/templates ───────────────────────────────
// Returns all templates in a single payload
router.get('/templates', async (_req, res) => {
  try {
    const files = await readdir(TEMPLATES_DIR);
    const jsonFiles = files.filter((f) => f.endsWith('.json'));
    const templates = await Promise.all(
      jsonFiles.map(async (f) => {
        const raw = await readFile(join(TEMPLATES_DIR, f), 'utf-8');
        return JSON.parse(raw);
      })
    );
    res.json({ count: templates.length, templates });
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.json({ count: 0, templates: [] });
    }
    console.error('[mbai] Error loading templates:', err.message);
    res.status(500).json({ error: 'Failed to load MBAi templates', detail: err.message });
  }
});

// ── GET /api/mbai/templates/:id ───────────────────────────
// Returns a single template by ID (filename without .json)
router.get('/templates/:id', async (req, res) => {
  try {
    const safeName = req.params.id.replace(/[^a-zA-Z0-9_-]/g, '');
    const filePath = join(TEMPLATES_DIR, `${safeName}.json`);
    const raw = await readFile(filePath, 'utf-8');
    res.json(JSON.parse(raw));
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.status(404).json({ error: 'MBAi template not found' });
    } else {
      console.error('[mbai] Error loading template:', err.message);
      res.status(500).json({ error: 'Failed to load template', detail: err.message });
    }
  }
});

// ── GET /api/mbai/categories ──────────────────────────────
// Returns the list of business function categories
router.get('/categories', async (_req, res) => {
  try {
    const raw = await readFile(join(MBAI_ROOT, 'manifest.json'), 'utf-8');
    const manifest = JSON.parse(raw);
    res.json({ categories: manifest.categories || [] });
  } catch (err) {
    console.error('[mbai] Error loading categories:', err.message);
    res.status(500).json({ error: 'Failed to load categories', detail: err.message });
  }
});

export default router;
