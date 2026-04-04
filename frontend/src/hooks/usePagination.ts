/**
 * usePagination Hook - Handle pagination logic
 */

"use client";

import { useState, useCallback, useMemo } from "react";

export interface UsePaginationOptions {
  pageSize?: number;
  initialPage?: number;
}

export interface UsePaginationReturn<T> {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  paginatedItems: T[];
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  setPageSize: (size: number) => void;
}

/**
 * Hook for pagination
 * @param items - Array of items to paginate
 * @param options - Configuration options
 */
export function usePagination<T>(
  items: T[],
  options: UsePaginationOptions = {},
): UsePaginationReturn<T> {
  const { pageSize = 10, initialPage = 1 } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);

  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / currentPageSize) || 1;

  // Validate current page
  const validatedPage = Math.min(Math.max(currentPage, 1), totalPages);

  const paginatedItems = useMemo(() => {
    const startIndex = (validatedPage - 1) * currentPageSize;
    const endIndex = startIndex + currentPageSize;
    return items.slice(startIndex, endIndex);
  }, [items, validatedPage, currentPageSize]);

  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    },
    [totalPages],
  );

  const nextPage = useCallback(() => {
    goToPage(validatedPage + 1);
  }, [validatedPage, goToPage]);

  const previousPage = useCallback(() => {
    goToPage(validatedPage - 1);
  }, [validatedPage, goToPage]);

  const handleSetPageSize = useCallback((size: number) => {
    setCurrentPageSize(Math.max(1, size));
    setCurrentPage(1); // Reset to first page
  }, []);

  return {
    currentPage: validatedPage,
    pageSize: currentPageSize,
    totalPages,
    totalItems,
    paginatedItems,
    hasNextPage: validatedPage < totalPages,
    hasPreviousPage: validatedPage > 1,
    goToPage,
    nextPage,
    previousPage,
    setPageSize: handleSetPageSize,
  };
}
