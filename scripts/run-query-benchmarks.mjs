import fs from "fs";
import path from "path";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { Client } = require("../backend/node_modules/pg");

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:admin@localhost:5432/dsatracker_test";

const outDir = path.resolve("docs/metrics");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function runExplainBenchmarks() {
  const client = new Client({ connectionString });
  await client.connect();

  console.log("📊 Running EXPLAIN (ANALYZE, BUFFERS) Benchmarks...\n");

  const queries = [
    {
      name: "1. Review Queue Query",
      sql: `EXPLAIN (ANALYZE, BUFFERS)
SELECT p.id, p."problemId", p."nextReviewDate", p.interval, prob.title, prob.difficulty, t.name
FROM "Progress" p
JOIN "Problem" prob ON p."problemId" = prob.id
JOIN "Topic" t ON prob."topicId" = t.id
WHERE p."userId" = 'bench-user-1'
  AND p.status = 'DONE'
  AND p."nextReviewDate" <= NOW()
ORDER BY p."nextReviewDate" ASC;`,
    },
    {
      name: "2. Weak Topics Aggregation Query",
      sql: `EXPLAIN (ANALYZE, BUFFERS)
SELECT t.id, t.name,
  COUNT(p.id) as total_problems,
  COUNT(CASE WHEN prog.status = 'DONE' THEN 1 END) as solved_count,
  AVG(prog."easinessFactor") as avg_factor
FROM "Topic" t
JOIN "Problem" p ON p."topicId" = t.id
LEFT JOIN "Progress" prog ON prog."problemId" = p.id AND prog."userId" = 'bench-user-1'
GROUP BY t.id, t.name;`,
    },
    {
      name: "3. Heatmap / Activity Events Query",
      sql: `EXPLAIN (ANALYZE, BUFFERS)
SELECT DATE_TRUNC('day', "occurredAt") as day, COUNT(*) as count
FROM "activity_events"
WHERE "userId" = 'bench-user-1'
  AND "occurredAt" >= NOW() - INTERVAL '365 days'
GROUP BY day
ORDER BY day ASC;`,
    },
  ];

  let fullOutput = `=== PostgreSQL EXPLAIN (ANALYZE, BUFFERS) Benchmark Results ===\n`;
  fullOutput += `Environment: Local PostgreSQL 18.x on Windows\n`;
  fullOutput += `Dataset: User bench-user-1 (5,000 Progress rows, 20,000 ActivityEvent rows)\n`;
  fullOutput += `Date: ${new Date().toISOString()}\n\n`;

  const summary = [];

  for (const q of queries) {
    console.log(`Executing ${q.name}...`);
    const res = await client.query(q.sql);
    const planLines = res.rows.map((r) => r["QUERY PLAN"]);
    const planText = planLines.join("\n");

    fullOutput += `--------------------------------------------------\n`;
    fullOutput += `${q.name}\n`;
    fullOutput += `--------------------------------------------------\n`;
    fullOutput += planText + "\n\n";

    // Extract execution time and index info
    const execTimeMatch = planText.match(/Execution Time: ([\d.]+) ms/);
    const execTime = execTimeMatch ? `${execTimeMatch[1]} ms` : "N/A";
    const usesIndex = /Index (Scan|Only Scan|Cond)/.test(planText);
    const rowsMatch = planText.match(/actual rows=(\d+)/);
    const rowsExamined = rowsMatch ? rowsMatch[1] : "N/A";

    summary.push({
      query: q.name,
      executionTime: execTime,
      usesIndex,
      rowsExamined,
    });
  }

  fs.writeFileSync(path.join(outDir, "raw-plans.txt"), fullOutput, "utf8");
  console.log(`\n✅ Raw plans saved to ${path.join(outDir, "raw-plans.txt")}\n`);

  console.table(summary);
  await client.end();
}

runExplainBenchmarks().catch((err) => {
  console.error("Benchmark error:", err);
  process.exit(1);
});
