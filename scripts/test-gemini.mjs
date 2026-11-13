#!/usr/bin/env node
import fs from 'node:fs';
import https from 'node:https';

if (!fs.existsSync('backend/.env')) {
  console.log('backend/.env not found.');
  process.exit(0);
}

const envContent = fs.readFileSync('backend/.env', 'utf8');
const env = {};
for (const line of envContent.split(/\r?\n/)) {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[match[1]] = value;
  }
}
const key = env.GEMINI_API_KEY;
const model = env.GEMINI_MODEL || 'gemini-2.5-flash';

if (!key || key.includes('your-') || key.length < 10) {
  console.log('NOTE: GEMINI_API_KEY in backend/.env is not configured yet (or is placeholder).');
  process.exit(0);
}

console.log(`Testing Gemini API connectivity for model "${model}"...`);

const data = JSON.stringify({ contents: [{ parts: [{ text: 'say hi' }] }] });
const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

const req = https.request(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log(`Gemini API Response Status: ${res.statusCode}`);
    if (res.statusCode === 200) {
      console.log(`SUCCESS: Model "${model}" is active and returning valid content!`);
    } else {
      console.log(`API response status: ${res.statusCode}.`);
    }
  });
});

req.on('error', (err) => {
  console.error('Request error:', err.message);
});

req.write(data);
req.end();
