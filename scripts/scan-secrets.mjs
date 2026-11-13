#!/usr/bin/env node
import { execSync } from 'node:child_process';

console.log('Scanning all commits across git history for leaked secrets...');

const patterns = [
  { name: 'Google API Key', regex: /AIzaSy[A-Za-z0-9_-]{33}/ },
  { name: 'Private Key', regex: /-----BEGIN [A-Z ]+PRIVATE KEY-----/ },
  { name: 'Postgres with password', regex: /postgres(ql)?:\/\/[^:]+:[^@\s]+@/ },
  { name: 'Generic Secret Token', regex: /(api[_-]?key|jwt[_-]?secret|auth[_-]?secret)\s*[:=]\s*['"][A-Za-z0-9_-]{24,}['"]/i }
];

const log = execSync('git log -p --all -n 300', { maxBuffer: 50 * 1024 * 1024, encoding: 'utf8' });
const lines = log.split('\n');

let leaks = 0;
let currentCommit = '';
let currentFile = '';

for (const line of lines) {
  if (line.startsWith('commit ')) {
    currentCommit = line.slice(7, 15);
  } else if (line.startsWith('diff --git ')) {
    currentFile = line.split(' ')[2] || '';
  } else if (line.startsWith('+') && !line.startsWith('+++')) {
    const content = line.slice(1);
    if (
      currentFile.includes('.env.example') ||
      currentFile.includes('test') ||
      currentFile.includes('mock') ||
      currentFile.includes('docs/') ||
      currentFile.includes('.github/')
    ) {
      continue;
    }
    for (const pat of patterns) {
      if (pat.regex.test(content)) {
        console.log(`[ALERT] Commit ${currentCommit} in ${currentFile}: matched ${pat.name}`);
        console.log('   Line snippet: ' + content.trim().slice(0, 80));
        leaks++;
      }
    }
  }
}

if (leaks === 0) {
  console.log('SUCCESS: No real secrets found in commits. History is clean.');
} else {
  console.log(`WARNING: Found ${leaks} potential secret patterns to review.`);
}

