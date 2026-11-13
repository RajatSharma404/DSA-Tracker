import fs from "fs";
import path from "path";

const staticChunksDir = path.resolve("frontend/.next/static/chunks");

if (!fs.existsSync(staticChunksDir)) {
  console.log("Static chunks directory not found. Run 'npm run build --prefix frontend' first.");
  process.exit(0);
}

const files = fs.readdirSync(staticChunksDir, { recursive: true });
let totalBytes = 0;
const chunkDetails = [];

for (const file of files) {
  const fullPath = path.join(staticChunksDir, file);
  if (fs.statSync(fullPath).isFile() && file.endsWith(".js")) {
    const size = fs.statSync(fullPath).size;
    totalBytes += size;
    chunkDetails.push({ file, sizeKb: (size / 1024).toFixed(1) });
  }
}

chunkDetails.sort((a, b) => b.sizeKb - a.sizeKb);

console.log(`📦 Total JS Chunks in frontend/.next/static: ${(totalBytes / 1024 / 1024).toFixed(2)} MB across ${chunkDetails.length} chunks.`);
console.log("Top 10 largest chunks:");
console.table(chunkDetails.slice(0, 10));

