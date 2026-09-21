#!/usr/bin/env node

/**
 * DSA Tracker Pro - Full-Stack Automated Architecture & Code Improvement Scanner
 * Scans Frontend, Backend, and Database schemas for optimization opportunities.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../..');

const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  dim: '\x1b[2m',
  bold: '\x1b[1m'
};

const findings = {
  db: [],
  frontend: [],
  backend: [],
  codeQuality: []
};

console.log(`${colors.cyan}${colors.bold}====================================================${colors.reset}`);
console.log(`${colors.cyan}${colors.bold}🔍 DSA TRACKER PRO - AUTOMATED PROJECT AUDIT SCANNER${colors.reset}`);
console.log(`${colors.cyan}${colors.bold}====================================================${colors.reset}\n`);

// 1. DATABASE AUDIT: Prisma Schema Parity & Missing Foreign Key Indexes
function auditDatabase() {
  console.log(`${colors.yellow}[1/4] Auditing Database & Prisma Schemas...${colors.reset}`);

  const backendSchemaPath = path.join(rootDir, 'backend/prisma/schema.prisma');
  const frontendSchemaPath = path.join(rootDir, 'frontend/prisma/schema.prisma');

  if (!fs.existsSync(backendSchemaPath) || !fs.existsSync(frontendSchemaPath)) {
    findings.db.push({
      type: 'ERROR',
      message: 'Prisma schema file missing in either backend or frontend.'
    });
    return;
  }

  const backendSchema = fs.readFileSync(backendSchemaPath, 'utf8');
  const frontendSchema = fs.readFileSync(frontendSchemaPath, 'utf8');

  if (backendSchema !== frontendSchema) {
    findings.db.push({
      type: 'CRITICAL',
      title: 'Prisma Dual-Schema Parity Mismatch',
      file: 'backend/prisma/schema.prisma <=> frontend/prisma/schema.prisma',
      message: 'Backend and frontend Prisma schemas are out of sync. Run "npm run sync:prisma" to align.'
    });
  } else {
    console.log(`  ${colors.green}✔ Dual Prisma schemas are 100% in sync.${colors.reset}`);
  }

  // Check models for unindexed foreign keys
  const modelBlocks = backendSchema.split(/model\s+/).slice(1);
  for (const block of modelBlocks) {
    const modelName = block.split(/\s+/)[0];
    const relationLines = block.match(/@relation\(fields:\s*\[([^\]]+)\]/g) || [];
    const indexLines = block.match(/@@index\(\[([^\]]+)\]\)/g) || [];
    const uniqueLines = block.match(/@@unique\(\[([^\]]+)\]\)/g) || [];

    const indexedFields = new Set();
    for (const idx of [...indexLines, ...uniqueLines]) {
      const match = idx.match(/\[([^\]]+)\]/);
      if (match) {
        // First field in composite index acts as index for that field
        const fields = match[1].split(',').map(s => s.trim());
        if (fields[0]) indexedFields.add(fields[0]);
      }
    }

    for (const rel of relationLines) {
      const match = rel.match(/fields:\s*\[([^\]]+)\]/);
      if (match) {
        const fieldName = match[1].trim();
        // Check if field is id or has @unique or is indexed
        const isUniqueField = new RegExp(`${fieldName}\\s+[^\\n]+@unique`).test(block);
        const isIdField = new RegExp(`${fieldName}\\s+[^\\n]+@id`).test(block);

        if (!indexedFields.has(fieldName) && !isUniqueField && !isIdField) {
          findings.db.push({
            type: 'OPTIMIZATION',
            title: `Unindexed Foreign Key in Model '${modelName}'`,
            file: 'backend/prisma/schema.prisma',
            message: `Foreign key field '${fieldName}' in model '${modelName}' lacks an explicit @@index([${fieldName}]). This can cause table scans during joins and cascade deletes.`
          });
        }
      }
    }
  }
}

// 2. FRONTEND AUDIT: Heavy Client-Side Bundles & Dynamic Import Opportunities
function auditFrontend() {
  console.log(`${colors.yellow}[2/4] Auditing Frontend Components & Bundle Splitting...${colors.reset}`);

  const frontendSrc = path.join(rootDir, 'frontend/src');
  if (!fs.existsSync(frontendSrc)) return;

  const heavyLibraries = [
    { name: '@monaco-editor/react', label: 'Monaco Editor (Heavy Bundle: ~3MB)' },
    { name: 'three', label: 'Three.js 3D WebGL (Heavy Bundle: ~600KB)' },
    { name: '@react-three/fiber', label: 'React Three Fiber (Heavy 3D Runtime)' },
    { name: 'reactflow', label: 'ReactFlow Diagram Engine (Heavy Canvas Bundle)' }
  ];

  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== '.next' && entry.name !== '__tests__') {
          scanDir(fullPath);
        }
      } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const relativePath = path.relative(rootDir, fullPath);

        // Check if file has "use client" and imports heavy libraries without next/dynamic
        const isClientComponent = content.includes('"use client"') || content.includes("'use client'");
        const isDynamic = content.includes('next/dynamic') || content.includes('React.lazy');

        for (const lib of heavyLibraries) {
          if (content.includes(`from '${lib.name}'`) || content.includes(`from "${lib.name}"`)) {
            if (isClientComponent && !isDynamic && !entry.name.toLowerCase().includes('canvas') && !entry.name.toLowerCase().includes('editor')) {
              findings.frontend.push({
                type: 'PERFORMANCE',
                title: `Direct Static Import of Heavy Library (${lib.name})`,
                file: relativePath,
                message: `Component statically imports ${lib.label}. Consider wrapping with \`next/dynamic(() => import(...), { ssr: false })\` to improve First Contentful Paint (FCP) and reduce initial bundle size.`
              });
            }
          }
        }

        // Check for missing image dimensions or raw <img> tags instead of next/image
        const rawImgMatches = content.match(/<img\s+[^>]*src=/g);
        if (rawImgMatches && !relativePath.includes('test')) {
          findings.frontend.push({
            type: 'ENHANCEMENT',
            title: 'Raw <img> Tag Usage',
            file: relativePath,
            message: `Found raw HTML <img> tag(s). Migrating to Next.js <Image /> provides automatic AVIF/WebP conversion, layout stability (CLS prevention), and responsive srcset.`
          });
        }
      }
    }
  }

  scanDir(frontendSrc);
}

// 3. BACKEND AUDIT: Route Error Handling & Middleware Coverage
function auditBackend() {
  console.log(`${colors.yellow}[3/4] Auditing Backend Routes & Middlewares...${colors.reset}`);

  const routesDir = path.join(rootDir, 'backend/routes');
  if (!fs.existsSync(routesDir)) return;

  const routeFiles = fs.readdirSync(routesDir).filter(f => f.endsWith('.ts'));

  for (const file of routeFiles) {
    const fullPath = path.join(routesDir, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    const relativePath = path.relative(rootDir, fullPath);

    // Look for async route handlers without try/catch
    const asyncHandlers = content.match(/router\.(get|post|put|delete|patch)\([^,]+,\s*async\s*\([^)]*\)\s*=>\s*\{/g) || [];
    const tryCatches = content.match(/try\s*\{/g) || [];

    if (asyncHandlers.length > tryCatches.length) {
      findings.backend.push({
        type: 'STABILITY',
        title: 'Potential Unhandled Async Rejection in Route Handler',
        file: relativePath,
        message: `${asyncHandlers.length} async handler(s) found but only ${tryCatches.length} try/catch block(s). Unhandled async exceptions in Express can crash the event loop or hang requests.`
      });
    }

    // Check for hardcoded pagination limits or missing limits in prisma queries
    if (content.includes('prisma.') && content.includes('.findMany(') && !content.includes('take:') && !content.includes('limit')) {
      findings.backend.push({
        type: 'SCALABILITY',
        title: 'Unbounded findMany Query Without Pagination Limit',
        file: relativePath,
        message: 'A Prisma findMany call without an explicit `take` or pagination limit was detected. As user datasets scale, this can exhaust node memory.'
      });
    }
  }
}

// 4. CODE QUALITY AUDIT: Type Safety & Console Statements
function auditCodeQuality() {
  console.log(`${colors.yellow}[4/4] Auditing Code Quality, Type Safety & Leftover Logs...${colors.reset}`);

  const targetDirs = [
    path.join(rootDir, 'backend/routes'),
    path.join(rootDir, 'backend/services'),
    path.join(rootDir, 'frontend/src/app'),
    path.join(rootDir, 'frontend/src/components')
  ];

  function scan(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== '__tests__') scan(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const relativePath = path.relative(rootDir, fullPath);

        // Check for any type casting
        const anyMatches = content.match(/:\s*any\b|as\s+any\b/g);
        if (anyMatches && anyMatches.length >= 3) {
          findings.codeQuality.push({
            type: 'TYPE_SAFETY',
            title: `Pervasive 'any' Types Detected (${anyMatches.length} occurrences)`,
            file: relativePath,
            message: `Multiple 'any' casts bypass TypeScript compiler verification. Refactor to precise discriminated unions or generics.`
          });
        }
      }
    }
  }

  targetDirs.forEach(scan);
}

// EXECUTE AUDITS
auditDatabase();
auditFrontend();
auditBackend();
auditCodeQuality();

// REPORT FINDINGS
console.log(`\n${colors.cyan}${colors.bold}====================================================${colors.reset}`);
console.log(`${colors.cyan}${colors.bold}📊 DSA TRACKER PRO - AUDIT SUMMARY REPORT${colors.reset}`);
console.log(`${colors.cyan}${colors.bold}====================================================${colors.reset}\n`);

const allFindings = [
  ...findings.db,
  ...findings.frontend,
  ...findings.backend,
  ...findings.codeQuality
];

if (allFindings.length === 0) {
  console.log(`${colors.green}${colors.bold}🎉 Outstanding! No critical issues or optimization gaps detected!${colors.reset}\n`);
} else {
  console.log(`Total actionable suggestions discovered: ${colors.bold}${allFindings.length}${colors.reset}\n`);

  const printCategory = (name, items, color) => {
    if (items.length === 0) return;
    console.log(`${color}${colors.bold}--- ${name.toUpperCase()} (${items.length}) ---${colors.reset}`);
    items.forEach((item, idx) => {
      console.log(`  ${idx + 1}. [${item.type}] ${colors.bold}${item.title || item.message}${colors.reset}`);
      if (item.file) console.log(`     ${colors.dim}File: ${item.file}${colors.reset}`);
      if (item.title && item.message) console.log(`     ${item.message}`);
      console.log();
    });
  };

  printCategory('Database & Schema Optimizations', findings.db, colors.cyan);
  printCategory('Frontend & Rendering Polish', findings.frontend, colors.green);
  printCategory('Backend API & Robustness', findings.backend, colors.yellow);
  printCategory('Code Quality & Type Safety', findings.codeQuality, colors.dim);
}

const score = Math.max(70, 100 - allFindings.length * 3);
console.log(`${colors.bold}Overall Architecture Health Score: ${score >= 90 ? colors.green : colors.yellow}${score}/100${colors.reset}`);
console.log(`${colors.dim}Run '/improvement' to generate full-stack refactoring diffs and roadmaps.${colors.reset}\n`);
