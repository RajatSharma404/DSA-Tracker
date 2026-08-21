"use client";

import React from "react";
import dynamic from "next/dynamic";

const AlgoTracer = dynamic(
  () => import("@/features/algo-tracer").then((mod) => mod.AlgoTracer),
  {
    ssr: false,
    loading: () => (
      <div className="h-160 animate-pulse rounded-3xl border border-white/10 bg-white/3 flex items-center justify-center text-gray-500 font-mono text-xs">
        Loading AlgoTrace Engine...
      </div>
    ),
  },
);

export default function TracerPage() {
  return <AlgoTracer />;
}
