#!/usr/bin/env node
/**
 * Builds the two downloadable install options into frontend/public:
 *   - dsa-tracker.user.js            userscript (sync-only) for Tampermonkey
 *   - dsa-tracker-extension.zip      the full extension, for "Load unpacked"
 *
 * Runs automatically before `next dev` / `next build` (see frontend
 * package.json). Outputs are gitignored.
 */
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { deflateRawSync } from "node:zlib";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const extDir = path.join(root, "extension");
const outDir = path.join(root, "frontend", "public");
mkdirSync(outDir, { recursive: true });

const manifest = JSON.parse(readFileSync(path.join(extDir, "manifest.json"), "utf8"));
const version = manifest.version;

// ---------------------------------------------------------------- userscript
const template = readFileSync(path.join(extDir, "userscript.template.js"), "utf8");
const hook = readFileSync(path.join(extDir, "leetcode-hook.js"), "utf8");
const userscript = template.replaceAll("__VERSION__", version).replace("__HOOK__", JSON.stringify(hook));
writeFileSync(path.join(outDir, "dsa-tracker.user.js"), userscript);

// ------------------------------------------------------------------- zip
const CRC_TABLE = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

const EXCLUDE = new Set(["userscript.template.js", ".DS_Store"]);
const walk = (dir, base = "") =>
  readdirSync(dir).flatMap((name) => {
    if (EXCLUDE.has(name)) return [];
    const full = path.join(dir, name);
    const rel = base ? `${base}/${name}` : name;
    return statSync(full).isDirectory() ? walk(full, rel) : [{ full, rel }];
  });

const files = walk(extDir).map(({ full, rel }) => ({ name: `dsa-tracker-extension/${rel}`, data: readFileSync(full) }));
const locals = [];
const centrals = [];
let offset = 0;
for (const f of files) {
  const name = Buffer.from(f.name);
  const deflated = deflateRawSync(f.data);
  const crc = crc32(f.data);
  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4);
  local.writeUInt16LE(0x0800, 6); // UTF-8 names
  local.writeUInt16LE(8, 8); // deflate
  local.writeUInt32LE(0, 10); // time/date
  local.writeUInt32LE(crc, 14);
  local.writeUInt32LE(deflated.length, 18);
  local.writeUInt32LE(f.data.length, 22);
  local.writeUInt16LE(name.length, 26);
  locals.push(local, name, deflated);

  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(20, 4);
  central.writeUInt16LE(20, 6);
  central.writeUInt16LE(0x0800, 8);
  central.writeUInt16LE(8, 10);
  central.writeUInt32LE(crc, 16);
  central.writeUInt32LE(deflated.length, 20);
  central.writeUInt32LE(f.data.length, 24);
  central.writeUInt16LE(name.length, 28);
  central.writeUInt32LE(offset, 42);
  centrals.push(central, name);
  offset += local.length + name.length + deflated.length;
}
const centralBuf = Buffer.concat(centrals);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0);
end.writeUInt16LE(files.length, 8);
end.writeUInt16LE(files.length, 10);
end.writeUInt32LE(centralBuf.length, 12);
end.writeUInt32LE(offset, 16);
writeFileSync(path.join(outDir, "dsa-tracker-extension.zip"), Buffer.concat([...locals, centralBuf, end]));

console.log(`extension v${version}: built userscript and zip (${files.length} files) in frontend/public`);
