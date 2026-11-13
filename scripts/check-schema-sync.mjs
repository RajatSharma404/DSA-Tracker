import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const backendSchemaPath = path.join(rootDir, "backend", "prisma", "schema.prisma");
const frontendSchemaPath = path.join(rootDir, "frontend", "prisma", "schema.prisma");

if (!fs.existsSync(backendSchemaPath)) {
  console.error(`[schema-sync] Missing backend schema at: ${backendSchemaPath}`);
  process.exit(1);
}

if (!fs.existsSync(frontendSchemaPath)) {
  console.error(`[schema-sync] Missing frontend schema at: ${frontendSchemaPath}`);
  process.exit(1);
}

const backendSchema = fs.readFileSync(backendSchemaPath, "utf8").trim();
const frontendSchema = fs.readFileSync(frontendSchemaPath, "utf8").trim();

if (backendSchema !== frontendSchema) {
  console.error("❌ [schema-sync] CI Check Failed: backend/prisma/schema.prisma and frontend/prisma/schema.prisma are out of sync!");
  console.error("   Run 'npm run sync:prisma' to synchronize backend and frontend schemas before committing.");
  process.exit(1);
}

console.log("✅ [schema-sync] Success: Backend and frontend Prisma schemas are perfectly synchronized.");
process.exit(0);

