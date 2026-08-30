"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class QueryCacheManager {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private inFlightRequests = new Map<string, Promise<any>>();
  private subscribers = new Map<string, Set<(data: any) => void>>();
  private defaultStaleTime = 30_000; // 30 seconds
  private defaultCacheTime = 5 * 60_000; // 5 minutes

  constructor() {
    // Restore cache from sessionStorage if available in browser
    if (typeof window !== "undefined") {
      try {
        const raw = sessionStorage.getItem("dsa_query_cache");
        if (raw) {
          const parsed = JSON.parse(raw);
          const now = Date.now();
          for (const [k, v] of Object.entries(parsed)) {
            const entry = v as CacheEntry<any>;
            if (entry && now - entry.timestamp < this.defaultCacheTime) {
              this.memoryCache.set(k, entry);
            }
          }
        }
      } catch {
        // Ignore storage errors
      }
    }
  }

  private persist() {
    if (typeof window === "undefined") return;
    try {
      const obj: Record<string, CacheEntry<any>> = {};
      const now = Date.now();
      this.memoryCache.forEach((v, k) => {
        if (now - v.timestamp < this.defaultCacheTime) {
          obj[k] = v;
        }
      });
      sessionStorage.setItem("dsa_query_cache", JSON.stringify(obj));
    } catch {
      // Ignore quota exceeded or private mode errors
    }
  }

  get<T>(key: string): T | undefined {
    const entry = this.memoryCache.get(key);
    if (!entry) return undefined;
    if (Date.now() - entry.timestamp > this.defaultCacheTime) {
      this.memoryCache.delete(key);
      return undefined;
    }
    return entry.data as T;
  }

  isStale(key: string, customStaleTime?: number): boolean {
    const entry = this.memoryCache.get(key);
    if (!entry) return true;
    const staleTime = customStaleTime ?? this.defaultStaleTime;
    return Date.now() - entry.timestamp > staleTime;
  }

  set<T>(key: string, data: T): void {
    this.memoryCache.set(key, { data, timestamp: Date.now() });
    this.persist();
    this.notify(key, data);
  }

  async fetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: { staleTime?: number; force?: boolean },
  ): Promise<T> {
    const force = options?.force ?? false;
    const cached = this.get<T>(key);

    if (!force && cached !== undefined && !this.isStale(key, options?.staleTime)) {
      return cached;
    }

    // Request Deduplication
    if (this.inFlightRequests.has(key)) {
      return this.inFlightRequests.get(key) as Promise<T>;
    }

    const requestPromise = (async () => {
      try {
        const data = await fetcher();
        this.set(key, data);
        return data;
      } finally {
        this.inFlightRequests.delete(key);
      }
    })();

    this.inFlightRequests.set(key, requestPromise);
    return requestPromise;
  }

  invalidate(patternOrKey: string | RegExp): void {
    const isRegex = patternOrKey instanceof RegExp;
    const keysToDelete: string[] = [];

    this.memoryCache.forEach((_, key) => {
      if (isRegex ? patternOrKey.test(key) : key.startsWith(patternOrKey)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((k) => {
      this.memoryCache.delete(k);
    });

    this.persist();
  }

  clear(): void {
    this.memoryCache.clear();
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem("dsa_query_cache");
      } catch {
        // Ignore
      }
    }
  }

  subscribe(key: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key)!.add(callback);
    return () => {
      this.subscribers.get(key)?.delete(callback);
    };
  }

  private notify(key: string, data: any) {
    this.subscribers.get(key)?.forEach((cb) => {
      try {
        cb(data);
      } catch (err) {
        console.error("Subscriber notification error", err);
      }
    });
  }
}

export const queryCache = new QueryCacheManager();

export interface UseCachedQueryOptions<T> {
  staleTime?: number;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (err: unknown) => void;
}

export function useCachedQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseCachedQueryOptions<T> = {},
) {
  const { staleTime = 30_000, enabled = true, onSuccess, onError } = options;

  // Immediate synchronous cache read for 0ms initial render
  const initialData = queryCache.get<T>(key);
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState<boolean>(enabled && initialData === undefined);
  const [isRevalidating, setIsRevalidating] = useState<boolean>(false);
  const [error, setError] = useState<unknown | null>(null);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const executeFetch = useCallback(
    async (force = false) => {
      if (!enabled) return;

      const cached = queryCache.get<T>(key);
      if (cached !== undefined && !force && !queryCache.isStale(key, staleTime)) {
        setData(cached);
        setLoading(false);
        return cached;
      }

      if (cached !== undefined) {
        setIsRevalidating(true);
      } else {
        setLoading(true);
      }

      try {
        const freshData = await queryCache.fetch<T>(key, fetcherRef.current, {
          staleTime,
          force,
        });
        setData(freshData);
        setError(null);
        onSuccessRef.current?.(freshData);
        return freshData;
      } catch (err) {
        setError(err);
        onErrorRef.current?.(err);
      } finally {
        setLoading(false);
        setIsRevalidating(false);
      }
    },
    [key, enabled, staleTime],
  );

  // Subscribe to external cache updates
  useEffect(() => {
    const unsubscribe = queryCache.subscribe(key, (updatedData: T) => {
      setData(updatedData);
      setLoading(false);
    });
    return unsubscribe;
  }, [key]);

  // Trigger fetch on mount or key change
  useEffect(() => {
    executeFetch();
  }, [executeFetch]);

  const mutate = useCallback(
    (newData: T | ((prev: T | undefined) => T), revalidate = false) => {
      const resolved =
        typeof newData === "function"
          ? (newData as (prev: T | undefined) => T)(data)
          : newData;

      queryCache.set(key, resolved);
      setData(resolved);

      if (revalidate) {
        void executeFetch(true);
      }
    },
    [key, data, executeFetch],
  );

  return {
    data,
    loading,
    isRevalidating,
    error,
    refetch: () => executeFetch(true),
    mutate,
  };
}
