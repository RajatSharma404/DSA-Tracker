"use client";

import React from "react";
import Link from "next/link";
import { PageTransition } from "@/components/layout/PageTransition";
import { Building2, ArrowRight, Network } from "lucide-react";

export default function CityLevelPage() {
  return (
    <PageTransition>
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center text-center p-8 space-y-6 animate-in fade-in duration-300">
        <div className="p-4 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--accent-primary)] shadow-lg">
          <Building2 size={40} />
        </div>
        <div className="space-y-2 max-w-md">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">City District Retired</h1>
          <p className="text-sm text-[var(--text-muted)]">
            City districts have been retired to optimize application performance. All problems, topics, and code solutions are directly accessible in the Visual Roadmap and Topics directory.
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
            href="/topics"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-medium text-sm hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            <span>Browse Topics</span>
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}
