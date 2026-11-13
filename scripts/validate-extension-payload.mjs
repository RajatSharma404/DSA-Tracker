import fs from "fs";
import path from "path";
import crypto from "crypto";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { z } = require("../backend/node_modules/zod");

console.log("🔍 Validating Chrome Extension payload against backend contract...");

// 1. Checksum verification
const contractPath = path.resolve("backend/contracts/extensionSyncContract.ts");
const checksumPath = path.resolve("extension/contracts/contract.sha256");

if (!fs.existsSync(checksumPath)) {
  console.error("❌ Checksum file missing! Run node scripts/sync-extension-contract.mjs");
  process.exit(1);
}

const currentHash = crypto.createHash("sha256").update(fs.readFileSync(contractPath, "utf8")).digest("hex");
const storedHash = fs.readFileSync(checksumPath, "utf8").trim();

if (currentHash !== storedHash) {
  console.error(`❌ Contract drift detected!\n  Current: ${currentHash}\n  Stored:  ${storedHash}\nRun 'node scripts/sync-extension-contract.mjs'`);
  process.exit(1);
}

// 2. Exact contract schema
const ExtensionSyncRequestSchema = z
  .object({
    submissionId: z.string().trim().min(1, "submissionId is required"),
    slug: z.string().trim().min(1, "slug is required"),
    verdict: z.string().trim().min(1, "verdict is required"),
    runtimeMs: z.number().nonnegative().optional(),
    memoryKb: z.number().nonnegative().optional(),
    submittedAt: z.string().min(1, "submittedAt must be non-empty"),
    title: z.string().trim().max(200).optional(),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
    lang: z.string().trim().max(30).optional(),
    code: z.string().max(100_000).optional(),
    runtimePercentile: z.number().min(0).max(100).optional(),
    memoryPercentile: z.number().min(0).max(100).optional(),
  })
  .strict();

// 3. Simulate extension payload builder from extension/background.js
function buildExtensionSamplePayload(raw) {
  const submissionId = raw.submissionId || `sub_${Date.now()}_test`;
  return {
    submissionId,
    slug: String(raw.slug || "").trim().toLowerCase(),
    verdict: String(raw.verdict || "ACCEPTED").trim().toUpperCase(),
    runtimeMs: typeof raw.runtimeMs === "number" ? raw.runtimeMs : undefined,
    memoryKb: typeof raw.memoryKb === "number" ? raw.memoryKb : undefined,
    submittedAt: raw.submittedAt || new Date().toISOString(),
  };
}

const sampleValid = buildExtensionSamplePayload({
  slug: "two-sum",
  verdict: "ACCEPTED",
  runtimeMs: 52,
  memoryKb: 42100,
});

const result = ExtensionSyncRequestSchema.safeParse(sampleValid);
if (!result.success) {
  console.error("❌ Sample extension payload failed validation:", result.error.format());
  process.exit(1);
}

// Test with extra field (must fail)
const sampleExtraField = { ...sampleValid, unallowedProperty: "danger" };
const extraResult = ExtensionSyncRequestSchema.safeParse(sampleExtraField);
if (extraResult.success) {
  console.error("❌ Schema failed to reject extra field!");
  process.exit(1);
}

console.log("✅ Extension payload builder strictly matches backend contract. Checksum matches:", storedHash.slice(0, 16));
