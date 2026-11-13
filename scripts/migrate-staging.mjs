#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const stagingContent = fs.readFileSync('.env.staging', 'utf8');
const match = stagingContent.match(/DATABASE_URL=["'](.*?)["']/);
if (!match) {
  console.error('Cannot find DATABASE_URL in .env.staging');
  process.exit(1);
}

const stagingUrl = match[1];
console.log('Running `prisma migrate deploy` on staging database...');

try {
  const result = execSync('npx prisma migrate deploy', {
    cwd: path.join(process.cwd(), 'backend'),
    env: { ...process.env, DATABASE_URL: stagingUrl },
    encoding: 'utf8'
  });
  console.log(result);

  console.log('Checking migration status on staging...');
  const status = execSync('npx prisma migrate status', {
    cwd: path.join(process.cwd(), 'backend'),
    env: { ...process.env, DATABASE_URL: stagingUrl },
    encoding: 'utf8'
  });
  console.log(status);
} catch (err) {
  console.error('Migration failed:', err.stdout || err.message);
  process.exit(1);
}

