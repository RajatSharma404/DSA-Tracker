import { describe, it, expect, vi, beforeEach } from "vitest";
import { queryCache, useCachedQuery } from "../queryCache";
import { renderHook, act, waitFor } from "@testing-library/react";

describe("Query Cache (lib/queryCache.ts)", () => {
  beforeEach(() => {
    queryCache.clear();
    vi.clearAllMocks();
  });

  describe("queryCache methods", () => {
    it("should set and get values from cache", () => {
      queryCache.set("test_key", { value: 123 });
      const cached = queryCache.get<{ value: number }>("test_key");
      expect(cached).toEqual({ value: 123 });
    });

    it("should return undefined for non-existent key", () => {
      expect(queryCache.get("missing_key")).toBeUndefined();
    });

    it("should invalidate key and prefix keys", () => {
      queryCache.set("topic_1", "data1");
      queryCache.set("topic_2", "data2");
      queryCache.set("user_profile", "user");

      queryCache.invalidate("topic_");
      expect(queryCache.get("topic_1")).toBeUndefined();
      expect(queryCache.get("topic_2")).toBeUndefined();
      expect(queryCache.get("user_profile")).toBe("user");
    });

    it("should check staleness accurately", () => {
      queryCache.set("stale_test", "val");
      expect(queryCache.isStale("stale_test", 10_000)).toBe(false);
      expect(queryCache.isStale("stale_test", -1)).toBe(true);
      expect(queryCache.isStale("non_existent", 10_000)).toBe(true);
    });

    it("should deduplicate in-flight fetch requests", async () => {
      const fetcher = vi.fn().mockImplementation(async () => {
        await new Promise((r) => setTimeout(r, 50));
        return { count: 42 };
      });

      const [p1, p2] = await Promise.all([
        queryCache.fetch("flight_key", fetcher),
        queryCache.fetch("flight_key", fetcher),
      ]);

      expect(fetcher).toHaveBeenCalledTimes(1);
      expect(p1).toEqual({ count: 42 });
      expect(p2).toEqual({ count: 42 });
    });

    it("should notify subscribers when key is updated", () => {
      const callback = vi.fn();
      const unsubscribe = queryCache.subscribe("sub_key", callback);

      queryCache.set("sub_key", "new_val");
      expect(callback).toHaveBeenCalledWith("new_val");

      unsubscribe();
      queryCache.set("sub_key", "another_val");
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe("useCachedQuery hook", () => {
    it("should fetch and return data", async () => {
      const fetcher = vi.fn().mockResolvedValue({ id: 1 });
      const { result } = renderHook(() =>
        useCachedQuery("hook_test", fetcher, { staleTime: 5000 })
      );

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.data).toEqual({ id: 1 });
      expect(result.current.error).toBeNull();
    });

    it("should support manual mutation", async () => {
      const fetcher = vi.fn().mockResolvedValue({ count: 1 });
      const { result } = renderHook(() =>
        useCachedQuery("hook_mutate", fetcher, { staleTime: 5000 })
      );

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.mutate({ count: 10 });
      });

      expect(result.current.data).toEqual({ count: 10 });
      expect(queryCache.get("hook_mutate")).toEqual({ count: 10 });
    });
  });
});
