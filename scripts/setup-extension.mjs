#!/usr/bin/env node
/**
 * npm run extension
 *
 * Unpacked extensions can only be added from the browser's extensions page
 * (Chrome removed --load-extension in v137), so this does the rest: copies
 * the extension folder path to the clipboard and opens the extensions page.
 */
import { execFileSync, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const extDir = path.join(root, "extension");
const manifest = path.join(extDir, "manifest.json");

if (!existsSync(manifest)) {
  console.error(`✗ Can't find ${manifest}`);
  process.exit(1);
}

const copy = (text) => {
  const attempts =
    process.platform === "darwin"
      ? [["pbcopy", []]]
      : process.platform === "win32"
        ? [["clip", []]]
        : [["wl-copy", []], ["xclip", ["-selection", "clipboard"]], ["xsel", ["--clipboard", "--input"]]];
  for (const [cmd, args] of attempts) {
    try {
      execFileSync(cmd, args, { input: text, stdio: ["pipe", "ignore", "ignore"] });
      return true;
    } catch {
      // try the next one
    }
  }
  return false;
};

/** Best effort: open the extensions page in an installed Chromium browser. */
const openExtensionsPage = () => {
  if (process.platform !== "darwin") return null;
  const browsers = [
    ["Arc", "arc://extensions"],
    ["Google Chrome", "chrome://extensions"],
    ["Brave Browser", "brave://extensions"],
    ["Microsoft Edge", "edge://extensions"],
  ];
  for (const [app, url] of browsers) {
    if (existsSync(`/Applications/${app}.app`)) {
      spawn("open", ["-a", app, url], { stdio: "ignore", detached: true }).unref();
      return app;
    }
  }
  return null;
};

const copied = copy(extDir);
const opened = openExtensionsPage();

console.log(`
DSA Tracker extension
─────────────────────
Folder: ${extDir}${copied ? "  (copied to clipboard)" : ""}

${opened ? `Opened the extensions page in ${opened}.` : "Open chrome://extensions (or arc://, brave://, edge://)."}
  1. Turn on Developer mode (top right)
  2. Click "Load unpacked" and paste the folder path${copied ? " (⌘/Ctrl+V in the file dialog: ⌘⇧G on macOS)" : ""}
  3. Open the tracker while signed in. It pairs automatically.

Already installed? Click the reload icon on the extension card after pulling changes.
`);
