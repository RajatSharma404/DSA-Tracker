#!/usr/bin/env node
/**
 * scripts/check-markdown-links.mjs
 * 
 * Verifies that all local file links and anchor references in README.md
 * and docs/**\/*.md resolve to existing files and valid heading anchors.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Helper to convert heading title to GitHub slug
function headingToSlug(heading) {
  return heading
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // remove punctuation
    .trim()
    .replace(/\s+/g, '-');    // replace spaces with dashes
}

// Extract all heading slugs from a markdown file
function getHeadingSlugs(filePath) {
  if (!fs.existsSync(filePath)) return new Set();
  const content = fs.readFileSync(filePath, 'utf8');
  const headingRegex = /^#{1,6}\s+(.+)$/gm;
  const slugs = new Set();
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const rawHeading = match[1].trim();
    // remove markdown links inside headings if any
    const cleanHeading = rawHeading.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
    slugs.add(headingToSlug(cleanHeading));
  }
  return slugs;
}

// Find all markdown files in directory
function findMarkdownFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
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

async function verifyAllLinks() {
  const markdownFiles = [
    path.join(rootDir, 'README.md'),
    path.join(rootDir, 'SECURITY.md'),
    path.join(rootDir, 'CONTRIBUTING.md'),
    ...findMarkdownFiles(path.join(rootDir, 'docs'))
  ];

  let totalLinks = 0;
  let passedLinks = 0;
  const brokenLinks = [];

  // Regex matching [text](url) or [text](<url>) with support for balanced or escaped parens
  const linkRegex = /!?\[([^\]]*)\]\((<[^>]+>|[^)]+)\)/g;

  for (const filePath of markdownFiles) {
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf8');
    const relativeSource = path.relative(rootDir, filePath).replace(/\\/g, '/');
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      let rawTarget = match[2].trim();
      if (rawTarget.startsWith('<') && rawTarget.endsWith('>')) {
        rawTarget = rawTarget.slice(1, -1).trim();
      }
      // Decode URI components like %28 and %29
      try {
        rawTarget = decodeURIComponent(rawTarget);
      } catch (e) {
        // keep as is
      }

      // Skip external links
      if (/^(https?:|mailto:|ftp:)/i.test(rawTarget)) {
        continue;
      }

      totalLinks++;

      // Handle file:/// URL format
      let targetPathPart = rawTarget;
      let anchorPart = '';

      if (rawTarget.startsWith('file:///')) {
        let cleanPath = rawTarget.replace(/^file:\/\/\//, '');
        // On Windows: d:/DSA-Tracker/...
        cleanPath = cleanPath.replace(/\//g, path.sep);
        const hashIdx = cleanPath.indexOf('#');
        if (hashIdx !== -1) {
          targetPathPart = cleanPath.slice(0, hashIdx);
          anchorPart = cleanPath.slice(hashIdx + 1);
        } else {
          targetPathPart = cleanPath;
        }

        if (!fs.existsSync(targetPathPart)) {
          brokenLinks.push({
            source: relativeSource,
            target: rawTarget,
            reason: `Target file not found: ${targetPathPart}`
          });
          continue;
        }

        if (anchorPart && targetPathPart.endsWith('.md')) {
          const slugs = getHeadingSlugs(targetPathPart);
          if (!slugs.has(anchorPart.toLowerCase())) {
            brokenLinks.push({
              source: relativeSource,
              target: rawTarget,
              reason: `Anchor #${anchorPart} not found in ${targetPathPart}`
            });
            continue;
          }
        }

        passedLinks++;
        continue;
      }

      // Local relative or anchor link
      const hashIndex = rawTarget.indexOf('#');
      if (hashIndex !== -1) {
        targetPathPart = rawTarget.slice(0, hashIndex);
        anchorPart = rawTarget.slice(hashIndex + 1);
      } else {
        targetPathPart = rawTarget;
      }

      // Anchor in current file
      if (!targetPathPart && anchorPart) {
        const slugs = getHeadingSlugs(filePath);
        if (!slugs.has(anchorPart.toLowerCase())) {
          brokenLinks.push({
            source: relativeSource,
            target: rawTarget,
            reason: `Local anchor #${anchorPart} not found in ${relativeSource}`
          });
          continue;
        }
        passedLinks++;
        continue;
      }

      // Relative file path
      const resolvedTarget = path.resolve(path.dirname(filePath), targetPathPart);

      if (!fs.existsSync(resolvedTarget)) {
        brokenLinks.push({
          source: relativeSource,
          target: rawTarget,
          reason: `Target file does not exist: ${resolvedTarget}`
        });
        continue;
      }

      // Check cross-file anchor if target is markdown
      if (anchorPart && resolvedTarget.endsWith('.md')) {
        const slugs = getHeadingSlugs(resolvedTarget);
        if (!slugs.has(anchorPart.toLowerCase())) {
          brokenLinks.push({
            source: relativeSource,
            target: rawTarget,
            reason: `Cross-file anchor #${anchorPart} not found in ${resolvedTarget}`
          });
          continue;
        }
      }

      passedLinks++;
    }
  }

  console.log(`Markdown Link Check: ${passedLinks}/${totalLinks} local links and anchors verified.`);

  if (brokenLinks.length > 0) {
    console.error(`\nFound ${brokenLinks.length} broken links:`);
    for (const item of brokenLinks) {
      console.error(`  - In [${item.source}]: "${item.target}" -> ${item.reason}`);
    }
    process.exit(1);
  } else {
    console.log('All local markdown links and heading anchors resolve cleanly.');
  }
}

verifyAllLinks().catch(err => {
  console.error('Link checker failed:', err);
  process.exit(1);
});
