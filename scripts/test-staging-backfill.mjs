#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rootDir = process.cwd();
const backendDir = path.join(rootDir, 'backend');
const { PrismaClient } = require(path.join(backendDir, 'node_modules/@prisma/client'));

const stagingContent = fs.readFileSync('.env.staging', 'utf8');
const match = stagingContent.match(/DATABASE_URL=["'](.*?)["']/);
if (!match) {
  console.error('Cannot find DATABASE_URL in .env.staging');
  process.exit(1);
}

const stagingUrl = match[1];

async function run() {
  console.log('--- 1. Seeding staging curriculum with prisma/seed.ts ---');
  execSync('npx tsx prisma/seed.ts', {
    cwd: backendDir,
    env: { ...process.env, DATABASE_URL: stagingUrl },
    stdio: 'inherit'
  });

  const prisma = new PrismaClient({
    datasources: { db: { url: stagingUrl } }
  });

  // Fetch user and problem to create sample pre-upgrade progress
  const user = await prisma.user.findFirst();
  const problems = await prisma.problem.findMany({ take: 3 });

  console.log(`\nCreating 2 sample completed progress rows for user ${user.email}...`);
  for (let i = 0; i < 2; i++) {
    await prisma.progress.upsert({
      where: {
        userId_problemId: {
          userId: user.id,
          problemId: problems[i].id
        }
      },
      update: {
        status: 'DONE',
        completedAt: new Date(Date.now() - 86400000 * (i + 1))
      },
      create: {
        userId: user.id,
        problemId: problems[i].id,
        status: 'DONE',
        completedAt: new Date(Date.now() - 86400000 * (i + 1)),
        easinessFactor: 2.5,
        interval: 1
      }
    });
  }

  await prisma.$disconnect();

  console.log('\n--- 2. Running backfill in --dry-run mode ---');
  execSync('npx tsx scripts/backfill-activity-and-fsrs.ts --dry-run', {
    cwd: backendDir,
    env: { ...process.env, DATABASE_URL: stagingUrl },
    stdio: 'inherit'
  });

  console.log('\n--- 3. Running backfill for REAL on staging ---');
  execSync('npx tsx scripts/backfill-activity-and-fsrs.ts', {
    cwd: backendDir,
    env: { ...process.env, DATABASE_URL: stagingUrl },
    stdio: 'inherit'
  });

  const prismaVerify = new PrismaClient({
    datasources: { db: { url: stagingUrl } }
  });

  const completedCount = await prismaVerify.progress.count({
    where: { completedAt: { not: null } }
  });
  const eventCount = await prismaVerify.activityEvent.count({
    where: { type: 'SOLVED' }
  });

  console.log(`\nVerification Counts on Staging:`);
  console.log(`- Progress (completedAt NOT NULL): ${completedCount}`);
  console.log(`- ActivityEvent (type=SOLVED):     ${eventCount}`);

  if (completedCount !== eventCount) {
    console.error(`MISMATCH: Progress (${completedCount}) does not match ActivityEvent (${eventCount})!`);
    process.exit(1);
  } else {
    console.log(`SUCCESS: Progress count equals ActivityEvent count (${completedCount} === ${eventCount})!`);
  }

  console.log('\n--- 4. Running backfill a SECOND time (idempotency check) ---');
  execSync('npx tsx scripts/backfill-activity-and-fsrs.ts', {
    cwd: backendDir,
    env: { ...process.env, DATABASE_URL: stagingUrl },
    stdio: 'inherit'
  });

  const eventCountAfter = await prismaVerify.activityEvent.count({
    where: { type: 'SOLVED' }
  });

  console.log(`- ActivityEvent count after second run: ${eventCountAfter}`);
  if (eventCountAfter !== eventCount) {
    console.error(`FAILED: Backfill is not idempotent! Row count changed from ${eventCount} to ${eventCountAfter}.`);
    process.exit(1);
  } else {
    console.log(`SUCCESS: Idempotency confirmed! Row count remained identical (${eventCountAfter}).`);
  }

  await prismaVerify.$disconnect();
}

run().catch(err => {
  console.error('Test staging backfill failed:', err);
  process.exit(1);
});
