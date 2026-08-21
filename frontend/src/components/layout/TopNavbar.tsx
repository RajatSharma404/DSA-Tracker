"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Search,
  Flame,
  Volume2,
  VolumeX,
  Sparkles,
  Command,
  HelpCircle,
} from "lucide-react";
import { ExtensionStatusBadge } from "@/components/layout/ExtensionStatusBadge";
import { ThemeSelector } from "@/components/ui/ThemeSelector";
import { soundEffects } from "@/lib/soundEffects";

interface TopNavbarProps {
  onOpenCommandPalette: () => void;
  streakCount?: number;
}

export function TopNavbar({
  onOpenCommandPalette,
  streakCount = 1,
}: TopNavbarProps) {
  const { data: session } = useSession();
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsMuted(soundEffects.getMuted());

    const handleMuteChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ isMuted: boolean }>;
      setIsMuted(customEvent.detail.isMuted);
    };

    window.addEventListener("dsa-sound-mute-changed", handleMuteChange);
    return () => {
      window.removeEventListener("dsa-sound-mute-changed", handleMuteChange);
    };
  }, []);

  const handleToggleSound = () => {
    const nextMuted = soundEffects.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleSearchClick = () => {
    soundEffects.playOpen();
    onOpenCommandPalette();
  };

  return (
    <header className="hidden md:flex h-14 w-full bg-[var(--bg-secondary)]/80 backdrop-blur-md border-b border-[var(--border-subtle)] px-6 items-center justify-between gap-4 shrink-0 transition-colors duration-250 z-20">
      {/* Left: Interactive Command Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={handleSearchClick}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-medium)] transition-all cursor-pointer shadow-xs group"
          aria-label="Open Command Search (⌘K)"
        >
          <div className="flex items-center gap-2 text-xs">
            <Search size={14} className="text-[var(--text-muted)] group-hover:text-[var(--accent-primary)] transition-colors" />
            <span className="truncate">Search problems, topics, actions...</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="hidden lg:inline-flex items-center gap-0.5 text-[10px] font-mono font-semibold text-[var(--text-muted)] px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)]">
              <span>⌘</span>K
            </kbd>
          </div>
        </button>
      </div>

      {/* Right: Metrics, Status, Sound, Theme, Profile */}
      <div className="flex items-center gap-3">
        {/* Extension Health Badge */}
        <ExtensionStatusBadge compact />

        {/* Streak Counter */}
        <Link
          href="/achievements"
          title="Daily Grind Streak"
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold hover:bg-amber-500/15 transition-colors cursor-pointer"
        >
          <Flame size={13} className="fill-amber-400 animate-pulse" />
          <span>{streakCount}d Streak</span>
        </Link>

        {/* Global Sound FX Toggle */}
        <button
          onClick={handleToggleSound}
          title={isMuted ? "Unmute Sound Effects" : "Mute Sound Effects"}
          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
            isMuted
              ? "bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              : "bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/30 text-[var(--accent-primary)] shadow-[0_0_10px_var(--accent-glow)]"
          }`}
          aria-label="Toggle Sound Effects"
        >
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>

        {/* Theme Selector */}
        <div className="shrink-0">
          <ThemeSelector variant="dropdown" />
        </div>

        {/* User Mini Profile */}
        {session?.user && (
          <Link
            href="/settings"
            title={`${session.user.name || "User"} (${session.user.email || ""})`}
            className="flex items-center gap-2 pl-2 border-l border-[var(--border-subtle)] cursor-pointer group"
          >
            {session.user.image ? (
              <div
                className="w-7 h-7 rounded-full bg-cover bg-center border border-[var(--border-subtle)] group-hover:border-[var(--accent-primary)] transition-colors"
                style={{ backgroundImage: `url(${session.user.image})` }}
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30 flex items-center justify-center text-[11px] font-bold">
                {session.user.name?.charAt(0) || "U"}
              </div>
            )}
          </Link>
        )}
      </div>
    </header>
  );
}
