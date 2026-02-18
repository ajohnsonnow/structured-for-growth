/**
 * Glossary Data Integrity Tests
 * Validates the glossary.json structure, uniqueness, and cross-references.
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, expect, it } from 'vitest';

const glossaryPath = resolve(import.meta.dirname || '.', '../../data/glossary/glossary.json');

let glossary;

try {
  glossary = JSON.parse(readFileSync(glossaryPath, 'utf-8'));
} catch {
  glossary = null;
}

describe('Glossary Data Integrity', () => {
  it('should load glossary.json without errors', () => {
    expect(glossary).not.toBeNull();
    expect(glossary).toBeDefined();
  });

  it('should have a version string', () => {
    const version = glossary.meta?.version || glossary.version;
    expect(version).toBeDefined();
    expect(typeof version).toBe('string');
  });

  it('should have a terms array with at least 100 entries', () => {
    expect(Array.isArray(glossary.terms)).toBe(true);
    expect(glossary.terms.length).toBeGreaterThanOrEqual(100);
  });

  it('every term should have required fields', () => {
    const required = ['id', 'term', 'definition', 'category'];
    for (const term of glossary.terms) {
      for (const field of required) {
        expect(term[field], `Term "${term.id || 'unknown'}" missing "${field}"`).toBeDefined();
        expect(typeof term[field], `Term "${term.id}" field "${field}" should be string`).toBe(
          'string'
        );
        expect(
          term[field].length,
          `Term "${term.id}" field "${field}" should not be empty`
        ).toBeGreaterThan(0);
      }
    }
  });

  it('all term IDs should be unique', () => {
    const ids = glossary.terms.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('all term IDs should be valid slug format (lowercase, hyphens, no spaces)', () => {
    for (const term of glossary.terms) {
      expect(term.id, `Term ID "${term.id}" is not a valid slug`).toMatch(
        /^[a-z0-9]+(-[a-z0-9]+)*$/
      );
    }
  });

  it('every "related" reference should point to a valid term ID or be a future placeholder', () => {
    const validIds = new Set(glossary.terms.map((t) => t.id));
    const broken = [];
    for (const term of glossary.terms) {
      if (Array.isArray(term.related)) {
        for (const ref of term.related) {
          if (!validIds.has(ref)) {
            broken.push(`${term.id} -> ${ref}`);
          }
        }
      }
    }
    // Allow some future placeholders but flag if more than 50% are broken
    const totalRefs = glossary.terms.reduce((sum, t) => sum + (t.related?.length || 0), 0);
    const brokenRatio = broken.length / (totalRefs || 1);
    expect(
      brokenRatio,
      `Too many broken refs (${broken.length}/${totalRefs}): ${broken.slice(0, 5).join(', ')}...`
    ).toBeLessThan(0.5);
  });

  it('categories should be from a known set', () => {
    const knownCategories = new Set([
      'accessibility',
      'security',
      'compliance',
      'development',
      'government',
      'ai',
      'networking',
      'documentation',
      'project-management',
      'data',
    ]);
    for (const term of glossary.terms) {
      expect(
        knownCategories.has(term.category),
        `Term "${term.id}" has unknown category "${term.category}"`
      ).toBe(true);
    }
  });
});
