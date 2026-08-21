"use client";

import React from "react";
import dynamic from "next/dynamic";

const AlgoTracer = dynamic(
  () => import("@/features/algo-tracer").then((mod) => mod.AlgoTracer),
  {
    ssr: false,
    loading: () => (
      <div className="h-screen w-full animate-pulse bg-black/60 flex items-center justify-center text-gray-500 font-mono text-xs">
        Loading AlgoTrace Engine...
      </div>
    ),
  },
);

export default function TracerPage() {
  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 h-screen w-auto overflow-hidden flex flex-col">
      <AlgoTracer />
    </div>
  );
}
