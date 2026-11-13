#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rootDir = process.cwd();
const { Client } = require(path.join(rootDir, 'backend/node_modules/pg'));

if (!fs.existsSync('backend/.env')) {
  console.error('backend/.env not found.');
  process.exit(1);
}

const envContent = fs.readFileSync('backend/.env', 'utf8');
let dbUrl = '';
for (const line of envContent.split(/\r?\n/)) {
  const m = line.match(/^\s*DATABASE_URL\s*=\s*['"]?(.*?)['"]?\s*$/);
  if (m) { dbUrl = m[1]; break; }
}

if (!dbUrl) {
  console.error('DATABASE_URL not found in backend/.env');
  process.exit(1);
}

// Connect to default 'postgres' database with same credentials
const rootDbUrl = dbUrl.replace(/\/([^\/?]+)(\?.*)?$/, '/postgres$2');
const stagingDbUrl = dbUrl.replace(/\/([^\/?]+)(\?.*)?$/, '/dsatracker_staging$2');

async function run() {
  console.log('Connecting to PostgreSQL server...');
  const client = new Client({ connectionString: rootDbUrl });
  await client.connect();

  const check = await client.query("SELECT 1 FROM pg_database WHERE datname = 'dsatracker_staging'");
  if (check.rows.length === 0) {
    console.log('Creating database "dsatracker_staging"...');
    await client.query('CREATE DATABASE dsatracker_staging');
    console.log('Database "dsatracker_staging" created successfully!');
  } else {
    console.log('Database "dsatracker_staging" already exists.');
  }

  await client.end();

  // Create .env.staging
  const stagingEnv = `# Staging Environment (Local Isolation)
DATABASE_URL="${stagingDbUrl}"
NODE_ENV=test
PORT=3002
BACKEND_JWT_SECRET="staging-jwt-secret-for-migration-testing-min-32-chars"
AUTH_ACCEPT_LEGACY="true"
`;

  fs.writeFileSync('.env.staging', stagingEnv, 'utf8');
  console.log('Created .env.staging with staging connection string (gitignored).');
}

run().catch(err => {
  console.error('Failed to setup staging DB:', err.message);
  process.exit(1);
});
