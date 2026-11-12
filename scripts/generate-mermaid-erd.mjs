#!/usr/bin/env node
/**
 * scripts/generate-mermaid-erd.mjs
 * 
 * Generates domain-split Mermaid Entity-Relationship (ER) diagrams from Prisma DMMF.
 * Splitting domains:
 *   1. identity.md: User, Account, Session, VerificationToken, ExtensionDevice
 *   2. curriculum.md: Topic, Problem, UserTag, ProblemTag, TheoryProblemLink
 *   3. progress.md: Progress, ReviewLog, ActivityEvent, Streak, SolutionHistory, ProblemNote, Bookmark
 *   4. theory.md: TheoryTrack, TheoryModule, TheoryLesson, TheoryLessonBlock, TheoryProblemLink, UserTheoryLessonProgress
 *   5. assessment.md: ChallengeSession, MockInterview, StudyPlan, AiUsage, SyncReceipt
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Load Prisma client DMMF
const { Prisma } = require(path.join(rootDir, 'backend/node_modules/@prisma/client'));
const models = Prisma.dmmf.datamodel.models;

const DOMAINS = {
  identity: {
    title: 'Identity & Authentication Domain',
    filename: 'identity.md',
    models: ['User', 'Account', 'Session', 'VerificationToken', 'ExtensionDevice'],
    description: `Manages user identity, OAuth provider accounts, active web sessions, NextAuth verification tokens, and paired Chrome Extension devices.\nServes as the root aggregate for tenant-scoped data isolation across all user activity.`,
    crossDomainNotes: `Cross-domain references:\n- \`User\` is the foreign-key root for \`Progress\`, \`ReviewLog\`, \`ActivityEvent\`, \`Streak\`, \`SolutionHistory\`, \`ProblemNote\`, \`Bookmark\` (Progress domain), \`UserTheoryLessonProgress\` (Theory domain), and \`ChallengeSession\`, \`MockInterview\`, \`StudyPlan\`, \`AiUsage\`, \`SyncReceipt\` (Assessment domain).`
  },
  curriculum: {
    title: 'Curriculum & Problem Catalog Domain',
    filename: 'curriculum.md',
    models: ['Topic', 'Problem', 'UserTag', 'ProblemTag', 'TheoryProblemLink'],
    description: `Models the core DSA curriculum, categorizing LeetCode coding problems into canonical topics and tags.\nEnables many-to-many problem tagging and bidirectional linking between problems and theory lessons.`,
    crossDomainNotes: `Cross-domain references:\n- \`Problem\` is referenced by \`Progress\`, \`ReviewLog\`, \`ActivityEvent\`, \`SolutionHistory\`, \`ProblemNote\`, and \`Bookmark\` in the Progress domain.\n- \`Topic\` is referenced by \`TheoryModule\` (Theory domain) and \`StudyPlan\` (Assessment domain).`
  },
  progress: {
    title: 'Progress & Spaced Repetition Domain',
    filename: 'progress.md',
    models: ['Progress', 'ReviewLog', 'ActivityEvent', 'Streak', 'SolutionHistory', 'ProblemNote', 'Bookmark'],
    description: `Drives the core spaced repetition engine (FSRS algorithm), review queues, daily activity events for heatmaps, streaks, user code submissions, personal notes, and problem bookmarks.\nMaintains a complete historical audit log of every memory state transition.`,
    crossDomainNotes: `Cross-domain references:\n- Depends directly on \`User\` (Identity domain) for multi-tenant isolation.\n- Depends on \`Problem\` (Curriculum domain) for problem association and difficulty classification.`
  },
  theory: {
    title: 'Theory & Conceptual Learning Domain',
    filename: 'theory.md',
    models: ['TheoryTrack', 'TheoryModule', 'TheoryLesson', 'TheoryLessonBlock', 'TheoryProblemLink', 'UserTheoryLessonProgress'],
    description: `Provides structured learning paths, theory modules, interactive lessons, markdown content blocks, and per-user lesson completion records.\nBridges theoretical understanding with practical problem solving.`,
    crossDomainNotes: `Cross-domain references:\n- References \`Topic\` and \`Problem\` (Curriculum domain) for curricular alignment.\n- References \`User\` (Identity domain) for tracking individual lesson completion status.`
  },
  assessment: {
    title: 'Assessment & Operational Domain',
    filename: 'assessment.md',
    models: ['ChallengeSession', 'MockInterview', 'StudyPlan', 'AiUsage', 'SyncReceipt'],
    description: `Encapsulates timed coding arena challenges, AI mock interview transcripts, AI study plans, Gemini API rate-limiting usage logs, and extension sync receipts.\nProvides auditing for AI resources and offline synchronization integrity.`,
    crossDomainNotes: `Cross-domain references:\n- References \`User\` (Identity domain) across all operational models.\n- References \`Topic\` (Curriculum domain) in \`StudyPlan\` targets.`
  }
};

/**
 * Format field type for clean Mermaid ERD syntax
 */
function formatType(field) {
  if (field.isList) {
    return `${field.type}List`;
  }
  return field.type;
}

/**
 * Build Mermaid ER diagram string for a domain
 */
function buildDomainDiagram(domainKey, domainConfig) {
  const domainModelSet = new Set(domainConfig.models);
  const domainModels = models.filter(m => domainModelSet.has(m.name));
  const modelMap = new Map(models.map(m => [m.name, m]));

  const lines = ['erDiagram'];
  const relationships = new Set();

  // 1. Discover relations between models in this domain or touching primary external roots
  for (const model of domainModels) {
    for (const field of model.fields) {
      if (field.kind === 'object' && modelMap.has(field.type)) {
        const targetModelName = field.type;
        const targetModel = modelMap.get(targetModelName);

        // Relation line
        if (field.relationFromFields && field.relationFromFields.length > 0) {
          const isTargetInDomain = domainModelSet.has(targetModelName);
          if (isTargetInDomain) {
            // model holds foreign key -> child
            const relKey = `${targetModelName}_${model.name}_${field.relationName || 'rel'}`;
            if (!relationships.has(relKey)) {
              relationships.add(relKey);
              const card = field.isRequired ? '||--o{' : '|o--o{';
              lines.push(`    ${targetModelName} ${card} ${model.name} : "${field.name}"`);
            }
          }
        }
      }
    }
  }

  lines.push('');

  // 2. Output model entity definitions with fields
  for (const model of domainModels) {
    lines.push(`    ${model.name} {`);

    // Map foreign key field names
    const fkFields = new Set();
    for (const field of model.fields) {
      if (field.kind === 'object' && field.relationFromFields) {
        for (const fk of field.relationFromFields) {
          fkFields.add(fk);
        }
      }
    }

    // Map unique field names
    const ukFields = new Set();
    if (model.uniqueFields) {
      for (const group of model.uniqueFields) {
        for (const f of group) ukFields.add(f);
      }
    }
    if (model.uniqueIndexes) {
      for (const idx of model.uniqueIndexes) {
        if (idx.fields) {
          for (const f of idx.fields) ukFields.add(f);
        }
      }
    }

    // Iterate scalar and enum fields
    for (const field of model.fields) {
      if (field.kind === 'scalar' || field.kind === 'enum') {
        const typeStr = formatType(field);
        const nameStr = field.name;
        
        let modifier = '';
        const isPk = field.isId;
        const isFk = fkFields.has(field.name);
        const isUk = field.isUnique || ukFields.has(field.name);

        if (isPk) {
          modifier = ' PK';
        } else if (isFk && isUk) {
          modifier = ' "FK,UK"';
        } else if (isFk) {
          modifier = ' FK';
        } else if (isUk) {
          modifier = ' UK';
        }

        lines.push(`        ${typeStr} ${nameStr}${modifier}`);
      }
    }

    lines.push('    }');
  }

  return lines.join('\n');
}

/**
 * Generate complete Markdown document for a domain
 */
function generateDomainMarkdown(domainKey, domainConfig) {
  const diagram = buildDomainDiagram(domainKey, domainConfig);
  const domainModelSet = new Set(domainConfig.models);
  const domainModels = models.filter(m => domainModelSet.has(m.name));

  let md = `# Entity-Relationship Diagram: ${domainConfig.title}\n\n`;
  md += `## Domain Description\n${domainConfig.description}\n\n`;
  md += `> [!NOTE]\n> ${domainConfig.crossDomainNotes.replace(/\n/g, '\n> ')}\n\n`;
  md += `## Visual Schema\n\n\`\`\`mermaid\n${diagram}\n\`\`\`\n\n`;
  md += `## Models & Indexes Detail\n\n`;

  for (const model of domainModels) {
    md += `### \`${model.name}\` (table: \`${model.dbName || model.name}\`)\n\n`;
    md += `| Field | Type | Attributes | Constraints |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;

    const fkMap = new Map();
    for (const f of model.fields) {
      if (f.kind === 'object' && f.relationFromFields) {
        for (let i = 0; i < f.relationFromFields.length; i++) {
          fkMap.set(f.relationFromFields[i], `${f.type}.${f.relationToFields[i] || 'id'}`);
        }
      }
    }

    for (const field of model.fields) {
      if (field.kind === 'scalar' || field.kind === 'enum') {
        const flags = [];
        if (field.isId) flags.push('PK');
        if (fkMap.has(field.name)) flags.push(`FK -> ${fkMap.get(field.name)}`);
        if (field.isUnique) flags.push('UNIQUE');
        if (field.isRequired) flags.push('NOT NULL');
        if (field.hasDefaultValue) {
          const defVal = typeof field.default === 'object' ? field.default.name : field.default;
          flags.push(`DEFAULT(${defVal})`);
        }

        md += `| \`${field.name}\` | \`${formatType(field)}\` | ${field.kind} | ${flags.join(', ') || '—'} |\n`;
      }
    }

    // Indexes
    const indexes = [];
    if (model.primaryKey) {
      indexes.push(`Primary Key: \`(${model.primaryKey.fields.join(', ')})\``);
    }
    if (model.uniqueIndexes && model.uniqueIndexes.length > 0) {
      for (const idx of model.uniqueIndexes) {
        indexes.push(`Unique Index: \`(${idx.fields.join(', ')})\`${idx.name ? ` [${idx.name}]` : ''}`);
      }
    }
    // Check fields with indexes or unique
    for (const f of model.fields) {
      if (f.isUnique && !indexes.some(i => i.includes(`(${f.name})`))) {
        indexes.push(`Unique Constraint: \`(${f.name})\``);
      }
    }

    if (indexes.length > 0) {
      md += `\n**Key Indexes & Constraints:**\n`;
      for (const idx of indexes) {
        md += `- ${idx}\n`;
      }
    }

    md += '\n';
  }

  return md;
}

export function generateAllDiagrams(outputDir) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const generated = {};
  for (const [domainKey, config] of Object.entries(DOMAINS)) {
    const md = generateDomainMarkdown(domainKey, config);
    const targetPath = path.join(outputDir, config.filename);
    fs.writeFileSync(targetPath, md, 'utf8');
    generated[config.filename] = md;
  }

  // Generate README overview in docs/erd/
  let indexMd = `# Database Entity-Relationship Diagrams\n\n`;
  indexMd += `This directory contains domain-split Entity-Relationship (ER) diagrams generated directly from the canonical Prisma schema ([backend/prisma/schema.prisma](../../backend/prisma/schema.prisma)).\n\n`;
  indexMd += `## Domains\n\n`;
  indexMd += `| Domain | Models | Link |\n`;
  indexMd += `| :--- | :--- | :--- |\n`;
  for (const [domainKey, config] of Object.entries(DOMAINS)) {
    indexMd += `| **${config.title}** | ${config.models.map(m => `\`${m}\``).join(', ')} | [${config.filename}](./${config.filename}) |\n`;
  }
  indexMd += `\n## Schema Freshness\n`;
  indexMd += `To regenerate these diagrams from the Prisma schema:\n`;
  indexMd += `\`\`\`bash\nnpm run docs:erd\n\`\`\`\n\n`;
  indexMd += `To verify that documentation remains synchronized with the database schema in CI:\n`;
  indexMd += `\`\`\`bash\nnode scripts/check-erd-freshness.mjs\n\`\`\`\n`;

  const indexFilePath = path.join(outputDir, 'README.md');
  fs.writeFileSync(indexFilePath, indexMd, 'utf8');
  generated['README.md'] = indexMd;

  return generated;
}

// Direct execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const erdDir = path.join(rootDir, 'docs', 'erd');
  generateAllDiagrams(erdDir);
  console.log(`Successfully generated ER diagrams in ${erdDir}`);
}
