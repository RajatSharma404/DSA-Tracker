import { describe, it, expect } from "vitest";
import { buildBookmarklet, bookmarkletSource } from "../bookmarklet";

describe("bookmarklet", () => {
  it("is valid JavaScript bound to the tracker origin", () => {
    const src = bookmarkletSource("https://dsa.example.com");
    expect(() => new Function(src)).not.toThrow();
    expect(src).toContain('"https://dsa.example.com"');
    expect(src).toContain("/connect/leetcode");
    expect(src).not.toMatch(/\n/);
  });

  it("produces an encoded javascript: URL that decodes back to the source", () => {
    const href = buildBookmarklet("http://localhost:3005");
    expect(href.startsWith("javascript:")).toBe(true);
    expect(decodeURIComponent(href.slice("javascript:".length))).toBe(bookmarkletSource("http://localhost:3005"));
  });

  it("only posts the snapshot to the tracker origin", () => {
    const src = bookmarkletSource("http://localhost:3005");
    expect(src).toContain("w.postMessage({ type: \"DSA_LC_SNAPSHOT\", data: payload }, T)");
    expect(src).toContain("e.origin === T");
  });
});
