"use client";

import React from "react";
import Link from "next/link";
import { Menu, X, HelpCircle } from "lucide-react";

interface MobileHeaderProps {
  isDrawerOpen: boolean;
  onToggleDrawer: () => void;
  onOpenCommandPalette?: () => void;
  streakCount?: number;
}

export function MobileHeader({
  isDrawerOpen,
  onToggleDrawer,
  onOpenCommandPalette,
  streakCount = 1,
}: MobileHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-[calc(3.5rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] bg-[var(--bg-secondary)]/90 backdrop-blur-md border-b border-[var(--border-subtle)] px-4 flex items-center justify-between md:hidden">
      {/* Brand logo & name */}
      <Link href="/" className="flex items-center gap-2 cursor-pointer">
        <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-glow)] animate-pulse" />
        <span className="font-bold text-base tracking-wide text-[var(--text-primary)] font-display">
          DSA Pro
        </span>
      </Link>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {/* Sync Guide Modal Button */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("dsa-open-sync-guide"))}
          className="p-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-medium)] transition-colors cursor-pointer"
          aria-label="Open Setup Instructions"
          title="Extension & Cookie Setup Instructions"
        >
          <HelpCircle size={16} className="text-[var(--accent-primary)]" />
        </button>

        {/* Hamburger Toggle */}
        <button
          onClick={onToggleDrawer}
          className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-medium)] transition-colors cursor-pointer"
          aria-label={isDrawerOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isDrawerOpen}
        >
          {isDrawerOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
    </header>
  );
}
