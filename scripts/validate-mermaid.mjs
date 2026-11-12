#!/usr/bin/env node
/**
 * scripts/validate-mermaid.mjs
 * 
 * Extracts and validates every Mermaid diagram block in docs/
 * using Mermaid's parser and JSDOM DOMPurify hooks.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Setup JSDOM & DOMPurify for Node headless parsing
const { JSDOM } = require(path.join(rootDir, 'frontend/node_modules/jsdom'));
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
try {
  global.DOMPurify = require(path.join(rootDir, 'frontend/node_modules/dompurify'))(dom.window);
} catch (e) {
  // fallback
}

const mermaid = require('mermaid').default;
mermaid.initialize({ startOnLoad: false, securityLevel: 'loose' });

// Recursive scan for markdown files
function findMarkdownFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

async function validateMermaidBlocks() {
  const docsDir = path.join(rootDir, 'docs');
  const files = [
    path.join(rootDir, 'README.md'),
    ...findMarkdownFiles(docsDir)
  ];

  let totalDiagrams = 0;
  let passedDiagrams = 0;
  const errors = [];

  for (const filePath of files) {
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf8');
    const mermaidRegex = /```mermaid\r?\n([\s\S]*?)```/g;
    let match;
    let blockIndex = 0;

    while ((match = mermaidRegex.exec(content)) !== null) {
      blockIndex++;
      totalDiagrams++;
      const diagramText = match[1].trim();
      const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');

      try {
        await mermaid.parse(diagramText);
        passedDiagrams++;
        console.log(`[PASS] ${relativePath} (block #${blockIndex})`);
      } catch (err) {
        errors.push({
          file: relativePath,
          block: blockIndex,
          error: err.message,
          snippet: diagramText.slice(0, 200)
        });
        console.error(`[FAIL] ${relativePath} (block #${blockIndex}): ${err.message}`);
      }
    }
  }

  console.log(`\nValidation complete: ${passedDiagrams}/${totalDiagrams} Mermaid diagrams valid.`);
  if (errors.length > 0) {
    console.error(`Found ${errors.length} invalid diagrams.`);
    process.exit(1);
  }
}

validateMermaidBlocks().catch(err => {
  console.error('Validator crashed:', err);
  process.exit(1);
});
