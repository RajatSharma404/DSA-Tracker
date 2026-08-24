/**
 * scripts/sync-solutions.js
 * Scans the solutions/ directory and updates solutions/README.md with a dynamic index and statistics.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const SOLUTIONS_DIR = path.join(ROOT_DIR, 'solutions');
const README_PATH = path.join(SOLUTIONS_DIR, 'README.md');

function getAllSolutionFiles() {
  if (!fs.existsSync(SOLUTIONS_DIR)) {
    fs.mkdirSync(SOLUTIONS_DIR, { recursive: true });
    return [];
  }

  const results = [];
  const folders = fs.readdirSync(SOLUTIONS_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const folder of folders) {
    const folderPath = path.join(SOLUTIONS_DIR, folder);
    const files = fs.readdirSync(folderPath);

    for (const file of files) {
      if (file.startsWith('.') || file.toLowerCase() === 'readme.md') continue;
      const fullPath = path.join(folderPath, file);
      const content = fs.readFileSync(fullPath, 'utf8');

      // Extract metadata
      let problemId = null;
      let title = file.replace(/\.[^/.]+$/, '');
      let difficulty = 'Medium';
      let topic = folder.replace(/^\d+-/, '').replace(/-/g, ' ');

      const idMatch = file.match(/^(\d+)-(.*)\./);
      if (idMatch) {
        problemId = parseInt(idMatch[1], 10);
        title = idMatch[2].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      }

      const diffMatch = content.match(/Difficulty:\s*(Easy|Medium|Hard)/i);
      if (diffMatch) difficulty = diffMatch[1];

      const topicMatch = content.match(/Topic:\s*([^\r\n]+)/i);
      if (topicMatch) topic = topicMatch[1].trim();

      const timeMatch = content.match(/Time:\s*([^\r\n]+)/i);
      const spaceMatch = content.match(/Space:\s*([^\r\n]+)/i);

      const ext = path.extname(file).replace('.', '').toLowerCase();
      const lang = ext === 'cpp' ? 'C++' : ext === 'py' ? 'Python' : ext === 'java' ? 'Java' : ext === 'js' ? 'JavaScript' : ext === 'ts' ? 'TypeScript' : ext.toUpperCase();

      results.push({
        id: problemId || 9999,
        title,
        difficulty,
        topic,
        lang,
        folder,
        file,
        time: timeMatch ? timeMatch[1].trim() : '-',
        space: spaceMatch ? spaceMatch[1].trim() : '-',
        relPath: `./${folder}/${file}`
      });
    }
  }

  results.sort((a, b) => a.id - b.id);
  return results;
}

function generateMarkdown(solutions) {
  const total = solutions.length;
  const easy = solutions.filter(s => s.difficulty.toLowerCase() === 'easy').length;
  const medium = solutions.filter(s => s.difficulty.toLowerCase() === 'medium').length;
  const hard = solutions.filter(s => s.difficulty.toLowerCase() === 'hard').length;

  let md = `# 🧠 LeetCode & DSA Solutions Repository\n\n`;
  md += `> Auto-generated index of solved DSA problems and patterns.\n\n`;
  
  md += `### 📊 Progress Overview\n\n`;
  md += `| Total Solved | 🟢 Easy | 🟡 Medium | 🔴 Hard |\n`;
  md += `| :---: | :---: | :---: | :---: |\n`;
  md += `| **${total}** | **${easy}** | **${medium}** | **${hard}** |\n\n`;

  md += `### 📂 Topic Directories\n\n`;
  const topics = [...new Set(solutions.map(s => s.folder))].sort();
  if (topics.length === 0) {
    md += `*No topic solutions added yet. Run \`npm run add:sol\` to add your first solution!*\n\n`;
  } else {
    for (const t of topics) {
      const count = solutions.filter(s => s.folder === t).length;
      const formatted = t.replace(/^\d+-/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      md += `- [**${formatted}**](./${t}/) (${count} problems)\n`;
    }
    md += `\n`;
  }

  md += `### 📝 Problem Index\n\n`;
  md += `| # | Title | Topic | Difficulty | Language | Time | Space | Solution |\n`;
  md += `| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |\n`;

  for (const s of solutions) {
    const diffBadge = s.difficulty.toLowerCase() === 'easy' ? '🟢 Easy' : s.difficulty.toLowerCase() === 'medium' ? '🟡 Medium' : '🔴 Hard';
    md += `| ${s.id} | ${s.title} | ${s.topic} | ${diffBadge} | \`${s.lang}\` | \`${s.time}\` | \`${s.space}\` | [Code](${s.relPath}) |\n`;
  }

  md += `\n---\n*Updated automatically via \`scripts/sync-solutions.js\`*\n`;

  return md;
}

function run() {
  const solutions = getAllSolutionFiles();
  const md = generateMarkdown(solutions);
  fs.writeFileSync(README_PATH, md, 'utf8');
  console.log(`✅ Synced solutions/README.md (${solutions.length} problems tracked)`);
}

run();

module.exports = run;
