import { describe, it, expect, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useApi, useAsync } from "../useApi";
import { useDebounce } from "../useDebounce";
import { usePagination } from "../usePagination";

describe("Frontend Custom Hooks", () => {
  describe("useApi & useAsync (hooks/useApi.ts)", () => {
    it("should fetch data, invoke onSuccess, and support refetch in useApi", async () => {
      const onSuccess = vi.fn();
      const mockFetcher = vi.fn().mockResolvedValue(["topic1", "topic2"]);
      const { result } = renderHook(() =>
        useApi(mockFetcher, [], { onSuccess, retryCount: 1 })
      );

      expect(result.current.loading).toBe(true);
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.data).toEqual(["topic1", "topic2"]);
      expect(result.current.error).toBeNull();
      expect(onSuccess).toHaveBeenCalledWith(["topic1", "topic2"]);

      // Test refetch
      mockFetcher.mockResolvedValueOnce(["topic1", "topic2", "topic3"]);
      await act(async () => {
        await result.current.refetch();
      });
      expect(result.current.data).toEqual(["topic1", "topic2", "topic3"]);
    });

    it("should retry on error and succeed if subsequent attempt passes", async () => {
      const mockFetcher = vi
        .fn()
        .mockRejectedValueOnce(new Error("Transient network error"))
        .mockResolvedValueOnce(["recovered_data"]);

      const { result } = renderHook(() =>
        useApi(mockFetcher, [], { retryCount: 2, retryDelay: 10 })
      );

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.data).toEqual(["recovered_data"]);
      expect(result.current.error).toBeNull();
    });

    it("should handle error in useApi after retries", async () => {
      const mockFetcher = vi.fn().mockRejectedValue(new Error("Fetch failed"));
      const onError = vi.fn();
      const { result } = renderHook(() =>
        useApi(mockFetcher, [], { retryCount: 0, onError })
      );

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBeDefined();
      expect(onError).toHaveBeenCalled();
    });

    it("should handle manual execution in useAsync and error callbacks", async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();
      const asyncFn = vi.fn().mockResolvedValue({ status: "ok" });
      const { result } = renderHook(() => useAsync(asyncFn, { onSuccess, onError }));

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeNull();

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.data).toEqual({ status: "ok" });
      expect(onSuccess).toHaveBeenCalledWith({ status: "ok" });

      // Error case
      asyncFn.mockRejectedValueOnce(new Error("Async execute failure"));
      await act(async () => {
        await result.current.execute();
      });
      expect(result.current.error).toBeDefined();
      expect(onError).toHaveBeenCalled();
    });
  });

  describe("useDebounce (hooks/useDebounce.ts)", () => {
    it("should debounce rapid value updates", async () => {
      const { result, rerender } = renderHook(
        ({ val, delay }) => useDebounce(val, delay),
        { initialProps: { val: "initial", delay: 50 } }
      );

      expect(result.current).toBe("initial");

      rerender({ val: "changed-1", delay: 50 });
      rerender({ val: "changed-2", delay: 50 });
      expect(result.current).toBe("initial");

      await waitFor(() => expect(result.current).toBe("changed-2"));
    });
  });

  describe("usePagination (hooks/usePagination.ts)", () => {
    const testItems = Array.from({ length: 25 }, (_, i) => `item_${i + 1}`);

    it("should calculate pages and slice items correctly", () => {
      const { result } = renderHook(() =>
        usePagination(testItems, { pageSize: 10, initialPage: 1 })
      );

      expect(result.current.currentPage).toBe(1);
      expect(result.current.totalPages).toBe(3);
      expect(result.current.paginatedItems).toHaveLength(10);
      expect(result.current.hasNextPage).toBe(true);
      expect(result.current.hasPreviousPage).toBe(false);

      act(() => {
        result.current.nextPage();
      });

      expect(result.current.currentPage).toBe(2);
      expect(result.current.paginatedItems[0]).toBe("item_11");

      act(() => {
        result.current.previousPage();
      });

      expect(result.current.currentPage).toBe(1);

      act(() => {
        result.current.goToPage(3);
      });
      expect(result.current.currentPage).toBe(3);

      act(() => {
        result.current.goToPage(-10);
      });
      expect(result.current.currentPage).toBe(1);

      act(() => {
        result.current.goToPage(100);
      });
      expect(result.current.currentPage).toBe(3);

      act(() => {
        result.current.setPageSize(5);
      });

      expect(result.current.pageSize).toBe(5);
      expect(result.current.totalPages).toBe(5);
    });
  });
});
