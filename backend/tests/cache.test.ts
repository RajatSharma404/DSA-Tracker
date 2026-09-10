import { describe, it, expect, vi } from "vitest";
import { TtlCache } from "../utils/cache";

describe("TtlCache", () => {
  it("should set and retrieve values", () => {
    const cache = new TtlCache<string, number>({ defaultTtlMs: 1000 });
    cache.set("a", 100);
    expect(cache.get("a")).toBe(100);
    expect(cache.has("a")).toBe(true);
    expect(cache.size()).toBe(1);
  });

  it("should return undefined for missing keys", () => {
    const cache = new TtlCache<string, string>();
    expect(cache.get("nonexistent")).toBeUndefined();
    expect(cache.has("nonexistent")).toBe(false);
  });

  it("should expire items after TTL", () => {
    vi.useFakeTimers();
    try {
      const cache = new TtlCache<string, string>({ defaultTtlMs: 500 });
      cache.set("user:1", "alice");

      expect(cache.get("user:1")).toBe("alice");

      // Advance clock past TTL
      vi.advanceTimersByTime(501);

      expect(cache.get("user:1")).toBeUndefined();
      expect(cache.has("user:1")).toBe(false);
      expect(cache.size()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it("should support custom TTL override per entry", () => {
    vi.useFakeTimers();
    try {
      const cache = new TtlCache<string, string>({ defaultTtlMs: 1000 });
      cache.set("short", "quick", 100);
      cache.set("long", "stay", 5000);

      vi.advanceTimersByTime(150);
      expect(cache.get("short")).toBeUndefined();
      expect(cache.get("long")).toBe("stay");

      vi.advanceTimersByTime(5000);
      expect(cache.get("long")).toBeUndefined();
    } finally {
      vi.useRealTimers();
    }
  });

  it("should enforce maximum capacity and evict least recently used entries", () => {
    const cache = new TtlCache<string, number>({ maxSize: 3, defaultTtlMs: 10000 });

    cache.set("k1", 1);
    cache.set("k2", 2);
    cache.set("k3", 3);

    expect(cache.size()).toBe(3);

    // Access k1 to make it recently used (order now: k2, k3, k1)
    cache.get("k1");

    // Insert k4, should evict k2 (oldest)
    cache.set("k4", 4);

    expect(cache.get("k2")).toBeUndefined();
    expect(cache.get("k1")).toBe(1);
    expect(cache.get("k3")).toBe(3);
    expect(cache.get("k4")).toBe(4);
    expect(cache.size()).toBe(3);
  });

  it("should support manual deletion and clearing", () => {
    const cache = new TtlCache<string, string>();
    cache.set("x", "1");
    cache.set("y", "2");

    expect(cache.delete("x")).toBe(true);
    expect(cache.get("x")).toBeUndefined();
    expect(cache.size()).toBe(1);

    cache.clear();
    expect(cache.size()).toBe(0);
    expect(cache.get("y")).toBeUndefined();
  });

  it("should prune expired items correctly", () => {
    vi.useFakeTimers();
    try {
      const cache = new TtlCache<string, string>({ defaultTtlMs: 200 });
      cache.set("a", "1");
      cache.set("b", "2", 1000);

      vi.advanceTimersByTime(300);

      const pruned = cache.pruneExpired();
      expect(pruned).toBe(1);
      expect(cache.get("b")).toBe("2");
    } finally {
      vi.useRealTimers();
    }
  });
});
