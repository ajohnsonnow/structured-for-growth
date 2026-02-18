#!/usr/bin/env node

/**
 * Readability Scorer (P3.5.3)
 *
 * Scans Markdown documentation files and computes Flesch-Kincaid Grade Level.
 * Plain Writing Act target: ≤ grade 8 for public-facing content.
 *
 * Usage:
 *   node scripts/readability.js                      # scan docs/
 *   node scripts/readability.js README.md docs/*.md   # specific files
 *   node scripts/readability.js --json                # JSON output
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const TARGET_GRADE = 8;
const jsonMode = process.argv.includes('--json');

// ── Flesch-Kincaid helpers ─────────────────────────────────

/** Count syllables in a word (English heuristic). */
function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 2) {
    return 1;
  }

  // common suffixes that don't add syllables
  word = word.replace(/(?:e)$/, '');
  const vowelGroups = word.match(/[aeiouy]+/g);
  const count = vowelGroups ? vowelGroups.length : 1;
  return Math.max(1, count);
}

/** Split text into sentences. */
function sentences(text) {
  return text
    .replace(/\n/g, ' ')
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/** Split text into words. */
function words(text) {
  return text
    .replace(/[^a-zA-Z\s'-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

/**
 * Compute Flesch-Kincaid Grade Level.
 * FK = 0.39 * (words/sentences) + 11.8 * (syllables/words) − 15.59
 */
function fleschKincaid(text) {
  const ss = sentences(text);
  const ws = words(text);
  if (ws.length === 0 || ss.length === 0) {
    return 0;
  }

  const totalSyllables = ws.reduce((sum, w) => sum + countSyllables(w), 0);
  const grade = 0.39 * (ws.length / ss.length) + 11.8 * (totalSyllables / ws.length) - 15.59;
  return Math.round(grade * 10) / 10;
}

/**
 * Strip Markdown syntax to get plain prose.
 * Removes code blocks, links, images, headings markers, HTML tags, tables.
 */
function stripMarkdown(md) {
  return md
    .replace(/```[\s\S]*?```/g, '') // fenced code blocks
    .replace(/`[^`]+`/g, '') // inline code
    .replace(/!\[.*?\]\(.*?\)/g, '') // images
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1') // links → keep text
    .replace(/^#{1,6}\s+/gm, '') // heading markers
    .replace(/<[^>]+>/g, '') // HTML tags
    .replace(/^\|.*\|$/gm, '') // tables
    .replace(/^[-*>]+\s/gm, '') // list markers / blockquotes
    .replace(/^\s*[-=]{3,}\s*$/gm, '') // horizontal rules
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1') // bold/italic
    .replace(/_([^_]+)_/g, '$1') // underscores
    .trim();
}

// ── Collect files ──────────────────────────────────────────

function collectFiles(dir) {
  const result = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (!['node_modules', 'dist', '.git', 'codeql_db', 'archive'].includes(entry)) {
        result.push(...collectFiles(full));
      }
    } else if (entry.endsWith('.md')) {
      result.push(full);
    }
  }
  return result;
}

// ── Main ───────────────────────────────────────────────────

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const projectRoot = process.cwd();
const files = args.length > 0 ? args : collectFiles(join(projectRoot, 'docs'));

const results = [];
let failures = 0;

for (const file of files) {
  const raw = readFileSync(file, 'utf-8');
  const prose = stripMarkdown(raw);
  const grade = fleschKincaid(prose);
  const ws = words(prose);
  const ss = sentences(prose);
  const pass = grade <= TARGET_GRADE || ws.length < 50; // skip very short docs

  const entry = {
    file: relative(projectRoot, file),
    grade,
    words: ws.length,
    sentences: ss.length,
    pass,
  };

  results.push(entry);
  if (!pass) {
    failures++;
  }
}

if (jsonMode) {
  console.log(
    JSON.stringify({ target: TARGET_GRADE, total: results.length, failures, results }, null, 2)
  );
} else {
  console.log(`\n📖  Readability Report (Flesch-Kincaid Grade Level)\n`);
  console.log(`Target: ≤ Grade ${TARGET_GRADE} (Plain Writing Act)`);
  console.log(`${'─'.repeat(70)}`);
  console.log(`${'File'.padEnd(45)} ${'Grade'.padStart(6)} ${'Words'.padStart(7)} Result`);
  console.log(`${'─'.repeat(70)}`);

  for (const r of results) {
    const icon = r.pass ? '✅' : '⚠️';
    console.log(
      `${r.file.padEnd(45)} ${String(r.grade).padStart(6)} ${String(r.words).padStart(7)} ${icon}`
    );
  }

  console.log(`${'─'.repeat(70)}`);
  console.log(`Total: ${results.length} files | Failures: ${failures}`);
  if (failures > 0) {
    console.log(
      `\n⚠️  ${failures} file(s) exceed grade ${TARGET_GRADE}. Consider simplifying language.`
    );
  } else {
    console.log(`\n✅ All files meet the grade ${TARGET_GRADE} target.`);
  }
}

process.exit(failures > 0 ? 1 : 0);
