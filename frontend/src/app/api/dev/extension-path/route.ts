import { NextResponse } from "next/server";
import path from "node:path";
import { existsSync } from "node:fs";

/**
 * Dev-only: the absolute path of the repo's /extension folder, so the setup
 * guide can show (and copy) the real path. Disabled in production.
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }
  const dir = path.resolve(process.cwd(), "..", "extension");
  return NextResponse.json({ path: existsSync(path.join(dir, "manifest.json")) ? dir : null });
}
