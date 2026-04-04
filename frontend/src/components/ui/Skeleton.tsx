/**
 * Unified Skeleton Components for Loading States
 */

"use client";

import { cn } from "@/lib/design-tokens";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "card" | "text" | "circle" | "button" | "chart" | "list";
}

/**
 * Base Skeleton Component
 */
export function Skeleton({
  variant = "card",
  className,
  ...props
}: SkeletonProps) {
  const variants = {
    card: "h-48 w-full rounded-2xl border border-white/5 bg-white/3",
    text: "h-4 w-full rounded-md bg-white/3",
    circle: "h-10 w-10 rounded-full bg-white/3",
    button: "h-10 w-32 rounded-lg bg-white/3",
    chart: "h-64 w-full rounded-2xl border border-white/5 bg-white/3",
    list: "space-y-2",
  };

  return (
    <div
      className={cn("animate-pulse", variants[variant], className)}
      {...props}
    />
  );
}

/**
 * Activity Card Skeleton
 */
export function ActivityCardSkeleton() {
  return <Skeleton variant="card" className="h-48" />;
}

/**
 * Stats Card Skeleton
 */
export function StatsCardSkeleton() {
  return <Skeleton variant="card" className="h-32" />;
}

/**
 * Chart Skeleton
 */
export function ChartSkeleton() {
  return <Skeleton variant="chart" />;
}

/**
 * List Item Skeleton
 */
export function ListItemSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton variant="text" className="h-4 w-3/4" />
          <Skeleton variant="text" className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

/**
 * Card Grid Skeleton
 */
export function CardGridSkeleton({
  columns = 3,
  count = 6,
}: {
  columns?: number;
  count?: number;
}) {
  return (
    <div
      className={`grid gap-4 md:grid-cols-${columns}`}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant="card" />
      ))}
    </div>
  );
}

/**
 * Loading Wrapper
 */
export interface LoadingWrapperProps {
  isLoading: boolean;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  skeletonCount?: number;
}

export function LoadingWrapper({
  isLoading,
  children,
  skeleton = <ListItemSkeleton />,
  skeletonCount,
}: LoadingWrapperProps) {
  if (isLoading) {
    return skeletonCount ? (
      <div className="space-y-3">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i}>{skeleton}</div>
        ))}
      </div>
    ) : (
      skeleton
    );
  }

  return <>{children}</>;
}
