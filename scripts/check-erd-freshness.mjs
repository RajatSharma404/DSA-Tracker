#!/usr/bin/env node
/**
 * scripts/check-erd-freshness.mjs
 * 
 * Verifies that the files in docs/erd/ are strictly up-to-date with backend/prisma/schema.prisma.
 * Fails with exit code 1 if any discrepancy or stale content is detected.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { generateAllDiagrams } from './generate-mermaid-erd.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const erdDir = path.join(rootDir, 'docs', 'erd');

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'erd-check-'));

try {
  generateAllDiagrams(tempDir);

  const files = ['identity.md', 'curriculum.md', 'progress.md', 'theory.md', 'assessment.md', 'README.md'];
  let hasDiff = false;

  for (const file of files) {
    const committedPath = path.join(erdDir, file);
    const generatedPath = path.join(tempDir, file);

    if (!fs.existsSync(committedPath)) {
      console.error(`[STALE] Missing expected ERD file: docs/erd/${file}`);
      hasDiff = true;
      continue;
    }

    const committedContent = fs.readFileSync(committedPath, 'utf8').replace(/\r\n/g, '\n').trim();
    const generatedContent = fs.readFileSync(generatedPath, 'utf8').replace(/\r\n/g, '\n').trim();

    if (committedContent !== generatedContent) {
      console.error(`[STALE] Drift detected in docs/erd/${file}! Schema has changed without regenerating ERDs.`);
      hasDiff = true;
    } else {
      console.log(`[OK] docs/erd/${file} matches Prisma schema.`);
    }
  }

  if (hasDiff) {
    console.error('\nERROR: ER diagrams are out of sync with backend/prisma/schema.prisma.');
    console.error('Run `npm run docs:erd` to regenerate ER diagrams and commit the changes.');
    process.exit(1);
  }

  console.log('\nAll ER diagrams are fully synchronized with the database schema.');
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}

