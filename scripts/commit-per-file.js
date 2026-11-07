const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function run(cmd) {
  try {
    return execSync(cmd, { stdio: 'pipe' }).toString().trim();
  } catch (err) {
    if (err.stdout) console.log(err.stdout.toString());
    if (err.stderr) console.error(err.stderr.toString());
    throw err;
  }
}

function getCommitMessage(filePath, type) {
  const norm = filePath.replace(/\\/g, '/');
  const base = path.basename(norm);
  const ext = path.extname(norm);
  const nameWithoutExt = path.basename(norm, ext);

  if (type === 'deleted') {
    const parts = norm.split('/');
    const skillName = parts[2] || 'skills';
    return `chore(skills/${skillName}): remove deprecated ${base}`;
  }

  if (norm === 'AGENTS.md') {
    return 'docs(agents): update agent directives for 28 awesome skills';
  }

  if (norm === 'scripts/commit-per-file.js') {
    return 'chore(scripts): update commit-per-file script for fullstack upgrades';
  }

  // =========================================================================
  // [NEW OPTIMIZED LOGIC: SPECIFIC SCOPED COMMIT MESSAGES FOR UPGRADES]
  // =========================================================================
  if (norm === 'backend/app.ts') {
    return 'feat(backend): add /api/ping keep-alive and comment out city routes';
  }
  if (norm === 'backend/services.ts') {
    return 'perf(backend/services): add in-memory TTL caching for getWeakTopics';
  }
  if (norm === 'frontend/src/app/(dashboard)/city/[levelId]/page.tsx') {
    return 'refactor(city/district): decommission district view and redirect to roadmap';
  }
  if (norm === 'frontend/src/app/(dashboard)/city/page.tsx') {
    return 'refactor(city): decommission DSA city page and add roadmap redirect';
  }
  if (norm === 'frontend/src/app/globals.css') {
    return 'perf(css): add hardware-accelerated GPU shimmer animation';
  }
  if (norm === 'frontend/src/components/dashboard/ActivityCalendarHeatmap.tsx') {
    return 'fix(dashboard/heatmap): replace external heatmap with zero-dependency SVG matrix';
  }
  if (norm === 'frontend/src/components/layout/CommandPalette.tsx') {
    return 'refactor(layout/palette): comment out DSA City action item';
  }
  if (norm === 'frontend/src/components/layout/MobileDrawer.tsx') {
    return 'refactor(layout/mobile): comment out DSA City navigation item';
  }
  if (norm === 'frontend/src/components/layout/Sidebar.tsx') {
    return 'refactor(layout/sidebar): comment out DSA City navigation item';
  }

  if (norm.startsWith('.agents/skills/')) {
    const parts = norm.split('/');
    const skillName = parts[2];
    const sub = parts[3];

    if (base === 'SKILL.md') {
      return `feat(skills/${skillName}): add ${skillName} operational runbook`;
    }
    if (sub === 'references') {
      return `docs(skills/${skillName}): add ${nameWithoutExt} reference guide`;
    }
    if (sub === 'scripts') {
      return `feat(skills/${skillName}): add ${base} automation script`;
    }
    if (sub === 'resources' || sub === 'assets') {
      return `docs(skills/${skillName}): add ${nameWithoutExt} resource assets`;
    }
    if (ext === '.md') {
      return `docs(skills/${skillName}): add ${nameWithoutExt} documentation`;
    }
    return `feat(skills/${skillName}): add ${base}`;
  }

  return `feat: update ${base}`;
}

function getUntrackedFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(getUntrackedFiles(full));
    } else {
      results.push(full.replace(/\\/g, '/'));
    }
  });
  return results;
}

const statusOutput = run('git status -s');
const lines = statusOutput.split('\n').map(l => l.trim()).filter(Boolean);

const deletedFiles = [];
const modifiedFiles = [];

lines.forEach(l => {
  if (l.startsWith('D ')) {
    deletedFiles.push(l.substring(2).trim().replace(/\\/g, '/'));
  } else if (l.startsWith('M ')) {
    modifiedFiles.push(l.substring(2).trim().replace(/\\/g, '/'));
  }
});

const untrackedSkills = getUntrackedFiles('.agents/skills');
const commits = [];

console.log(`Found ${deletedFiles.length} deleted files, ${modifiedFiles.length} modified files, ${untrackedSkills.length} untracked skill files.`);

// 1. Commit deleted files one by one
for (const file of deletedFiles) {
  const msg = getCommitMessage(file, 'deleted');
  console.log(`Staging deletion: ${file}`);
  run(`git rm "${file}"`);
  run(`git commit -m "${msg}"`);
  const sha = run('git rev-parse --short HEAD');
  commits.push({ file, sha, msg });
  console.log(`[${sha}] ${msg}`);
}

// 2. Commit modified files one by one
for (const file of modifiedFiles) {
  const msg = getCommitMessage(file, 'modified');
  console.log(`Staging modified: ${file}`);
  run(`git add "${file}"`);
  run(`git commit -m "${msg}"`);
  const sha = run('git rev-parse --short HEAD');
  commits.push({ file, sha, msg });
  console.log(`[${sha}] ${msg}`);
}

// 3. Commit untracked skills one by one
for (const file of untrackedSkills) {
  const msg = getCommitMessage(file, 'untracked');
  console.log(`Staging new file: ${file}`);
  run(`git add "${file}"`);
  run(`git commit -m "${msg}"`);
  const sha = run('git rev-parse --short HEAD');
  commits.push({ file, sha, msg });
  console.log(`[${sha}] ${msg}`);
}

// 4. Commit scripts/commit-per-file.js itself
const scriptFile = 'scripts/commit-per-file.js';
if (fs.existsSync(scriptFile)) {
  const status = run('git status -s');
  if (status.includes('commit-per-file.js')) {
    const msg = getCommitMessage(scriptFile, 'untracked');
    run(`git add "${scriptFile}"`);
    run(`git commit -m "${msg}"`);
    const sha = run('git rev-parse --short HEAD');
    commits.push({ file: scriptFile, sha, msg });
    console.log(`[${sha}] ${msg}`);
  }
}

console.log(`\nSuccessfully created ${commits.length} commits!`);

