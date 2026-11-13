"use client";

import React from "react";
import Link from "next/link";
import { PageTransition } from "@/components/layout/PageTransition";
import { Building2, ArrowRight, Network } from "lucide-react";

// =========================================================================
// [NEW OPTIMIZED LOGIC: LIGHTWEIGHT DECOMMISSIONED RETIRED ROUTE]
// =========================================================================
export default function CityComingSoonPage() {
  return (
    <PageTransition>
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center text-center p-8 space-y-6 animate-in fade-in duration-300">
        <div className="p-4 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--accent-primary)] shadow-lg">
          <Building2 size={40} />
        </div>
        <div className="space-y-2 max-w-md">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">DSA City Feature Retired</h1>
          <p className="text-sm text-[var(--text-muted)]">
            This module has been retired to streamline application performance, optimize bundle size, and accelerate navigation. All your roadmap progress is tracked in the Visual Roadmap.
          </p>
        </div>
        <div className="flex items-center gap-4 pt-2">
          <Link
            href="/roadmap"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent-primary)] text-black font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Network size={16} />
            <span>Explore Visual Roadmap</span>
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-medium text-sm hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}
