import fs from "fs";
import path from "path";
import crypto from "crypto";

const contractPath = path.resolve("backend/contracts/extensionSyncContract.ts");
const outDir = path.resolve("extension/contracts");

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Read backend contract content
const contractSource = fs.readFileSync(contractPath, "utf8");

// Generate sha256 checksum
const hash = crypto.createHash("sha256").update(contractSource, "utf8").digest("hex");

// Write checksum
fs.writeFileSync(path.join(outDir, "contract.sha256"), hash, "utf8");

// Generate extension-compatible mirror
const mirrorContent = `// AUTO-GENERATED FROM backend/contracts/extensionSyncContract.ts
// CHECKSUM: ${hash}
// Do not edit directly; run 'node scripts/sync-extension-contract.mjs'

export const EXTENSION_SYNC_CONTRACT = {
  requiredFields: ["submissionId", "slug", "verdict", "submittedAt"],
  optionalFields: ["runtimeMs", "memoryKb", "title", "difficulty", "lang", "code", "runtimePercentile", "memoryPercentile"],
  strictMode: true,
  checksum: "${hash}",
};
`;

fs.writeFileSync(path.join(outDir, "extensionSyncContract.js"), mirrorContent, "utf8");
console.log(`✅ Extension sync contract synchronized. Checksum: ${hash.slice(0, 16)}...`);

