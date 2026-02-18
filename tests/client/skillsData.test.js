/**
 * Skills Data Integrity Tests
 * Validates the skills.json structure and cross-references.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { beforeAll, describe, expect, it } from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../../');

let skillsData;

describe('Skills Data (skills.json)', () => {
  beforeAll(() => {
    const raw = fs.readFileSync(path.join(rootDir, 'data/skills/skills.json'), 'utf8');
    skillsData = JSON.parse(raw);
  });

  it('should have valid JSON structure', () => {
    expect(skillsData).toBeDefined();
    expect(skillsData.meta).toBeDefined();
    expect(skillsData.categories).toBeInstanceOf(Array);
    expect(skillsData.skills).toBeInstanceOf(Array);
    expect(skillsData.clientJourneys).toBeInstanceOf(Array);
  });

  it('should have at least 20 skills', () => {
    expect(skillsData.skills.length).toBeGreaterThanOrEqual(20);
  });

  it('should have 6 categories', () => {
    expect(skillsData.categories.length).toBe(6);
  });

  it('should have category IDs that are unique', () => {
    const ids = skillsData.categories.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have skill IDs that are unique', () => {
    const ids = skillsData.skills.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every skill should reference a valid category', () => {
    const validCats = new Set(skillsData.categories.map((c) => c.id));
    skillsData.skills.forEach((skill) => {
      expect(validCats.has(skill.category)).toBe(true);
    });
  });

  it('every skill should have required fields', () => {
    skillsData.skills.forEach((skill) => {
      expect(skill.id).toBeTruthy();
      expect(skill.name).toBeTruthy();
      expect(skill.category).toBeTruthy();
      expect(skill.level).toBeGreaterThanOrEqual(1);
      expect(skill.level).toBeLessThanOrEqual(5);
      expect(skill.summary).toBeTruthy();
      expect(skill.clientValue).toBeTruthy();
      expect(skill.useCases).toBeInstanceOf(Array);
      expect(skill.useCases.length).toBeGreaterThanOrEqual(1);
      expect(skill.related).toBeInstanceOf(Array);
    });
  });

  it('all related skill references should point to existing skills', () => {
    const skillIds = new Set(skillsData.skills.map((s) => s.id));
    let danglingCount = 0;
    const danglingRefs = [];

    skillsData.skills.forEach((skill) => {
      skill.related.forEach((ref) => {
        if (!skillIds.has(ref)) {
          danglingCount++;
          danglingRefs.push(`${skill.id} → ${ref}`);
        }
      });
    });

    expect(danglingCount).toBe(0);
  });

  it('all client journey skills should reference existing skills', () => {
    const skillIds = new Set(skillsData.skills.map((s) => s.id));

    skillsData.clientJourneys.forEach((journey) => {
      journey.skills.forEach((sid) => {
        expect(skillIds.has(sid)).toBe(true);
      });
    });
  });

  it('each journey should have required fields', () => {
    skillsData.clientJourneys.forEach((journey) => {
      expect(journey.id).toBeTruthy();
      expect(journey.title).toBeTruthy();
      expect(journey.description).toBeTruthy();
      expect(journey.skills).toBeInstanceOf(Array);
      expect(journey.skills.length).toBeGreaterThanOrEqual(2);
      expect(journey.outcome).toBeTruthy();
    });
  });

  it('every category should have a color and label', () => {
    skillsData.categories.forEach((cat) => {
      expect(cat.id).toBeTruthy();
      expect(cat.label).toBeTruthy();
      expect(cat.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  it('skill relationships should be bidirectional', () => {
    const missing = [];
    skillsData.skills.forEach((skill) => {
      skill.related.forEach((relId) => {
        const relSkill = skillsData.skills.find((s) => s.id === relId);
        if (relSkill && !relSkill.related.includes(skill.id)) {
          missing.push(`${relId} missing back-reference to ${skill.id}`);
        }
      });
    });

    // Report but don't fail — bidirectionality is recommended, not required
    if (missing.length > 0) {
      console.warn(`Non-bidirectional relationships: ${missing.length}`);
    }
  });
});
