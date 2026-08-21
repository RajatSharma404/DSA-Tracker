"use client";

import React from "react";
import dynamic from "next/dynamic";

const AlgoTracer = dynamic(
  () => import("@/features/algo-tracer").then((mod) => mod.AlgoTracer),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full animate-pulse bg-[var(--bg-card)] flex items-center justify-center text-[var(--text-muted)] font-mono text-xs">
        Loading AlgoTrace Engine...
      </div>
    ),
  },
);

export default function TracerPage() {
  return (
    <div className="-mt-16 -mb-20 -mx-4 sm:-m-6 lg:-m-8 h-[calc(100vh-3.5rem-4rem)] sm:h-screen w-auto overflow-hidden flex flex-col">
      <AlgoTracer />
    </div>
  );
}
