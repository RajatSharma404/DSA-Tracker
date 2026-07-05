/**
 * useApi Hook - Generic data fetching with loading/error states
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { normalizeError, ApiError } from "@/types/errors";

export interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  retryCount?: number;
  retryDelay?: number;
}

export interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for API data fetching
 * @param fetcher - Async function that fetches data
 * @param deps - Dependencies array
 * @param options - Configuration options
 */
export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  options: UseApiOptions<T> = {},
): UseApiReturn<T> {
  const { onSuccess, onError, retryCount = 3, retryDelay = 1000 } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    let lastError: ApiError | null = null;
    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        const result = await fetcher();
        setData(result);
        setError(null);
        onSuccess?.(result);
        setLoading(false);
        return;
      } catch (err) {
        lastError = normalizeError(err);
        if (attempt < retryCount) {
          await new Promise((resolve) =>
            setTimeout(resolve, retryDelay * Math.pow(2, attempt)),
          );
        }
      }
    }

    if (lastError) {
      setError(lastError);
      onError?.(lastError);
    }
    setLoading(false);
  }, [fetcher, retryCount, retryDelay, onSuccess, onError]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refetch: fetchData };
}

/**
 * useAsync Hook - For manual async operations
 */
export interface UseAsyncOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
}

export interface UseAsyncReturn<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  execute: () => Promise<void>;
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  options: UseAsyncOptions<T> = {},
): UseAsyncReturn<T> {
  const { onSuccess, onError } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFunction();
      setData(result);
      setError(null);
      onSuccess?.(result);
    } catch (err) {
      const normalized = normalizeError(err);
      setError(normalized);
      onError?.(normalized);
    } finally {
      setLoading(false);
    }
  }, [asyncFunction, onSuccess, onError]);

  return { data, loading, error, execute };
}
