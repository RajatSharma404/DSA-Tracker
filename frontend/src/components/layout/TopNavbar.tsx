"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Volume2,
  VolumeX,
  HelpCircle,
} from "lucide-react";
import { ExtensionStatusBadge } from "@/components/layout/ExtensionStatusBadge";
import { soundEffects } from "@/lib/soundEffects";

interface TopNavbarProps {
  onOpenCommandPalette: () => void;
  streakCount?: number;
}

export function TopNavbar({
  onOpenCommandPalette,
  streakCount = 1,
}: TopNavbarProps) {
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

  const iconBtn =
    "grid h-8 w-8 place-items-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer";

  return (
    <header className="z-20 hidden h-14 w-full shrink-0 items-center justify-between gap-4 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/80 px-6 backdrop-blur-md md:flex">
      <button
        onClick={handleSearchClick}
        className="group flex w-full max-w-sm items-center gap-2 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-1.5 text-[13px] text-[var(--text-muted)] transition-colors hover:border-[var(--border-strong)] cursor-pointer"
        aria-label="Search (⌘K)"
      >
        <Search size={14} />
        <span className="flex-1 truncate text-left">Search problems, topics and actions</span>
        <kbd className="hidden rounded border border-[var(--border-subtle)] px-1.5 font-mono text-[10px] lg:inline">⌘K</kbd>
      </button>

      <div className="flex items-center gap-1">
        <ExtensionStatusBadge compact />
        <span className="mx-1.5 h-5 w-px bg-[var(--border-subtle)]" aria-hidden />
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("dsa-open-sync-guide"))}
          title="Setup guide"
          aria-label="Open setup guide"
          className={iconBtn}
        >
          <HelpCircle size={16} />
        </button>
        <button
          onClick={handleToggleSound}
          title={isMuted ? "Turn sounds on" : "Turn sounds off"}
          aria-label={isMuted ? "Turn sounds on" : "Turn sounds off"}
          aria-pressed={!isMuted}
          className={iconBtn}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>
    </header>
  );
}
