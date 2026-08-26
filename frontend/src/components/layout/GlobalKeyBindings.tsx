"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { soundEffects } from "@/lib/soundEffects";
import { Compass } from "lucide-react";

export function GlobalKeyBindings() {
  const router = useRouter();
  const [activeChord, setActiveChord] = useState<string | null>(null);
  const chordTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside input, textarea, contenteditable, or Monaco
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.closest(".monaco-editor"))
      ) {
        return;
      }

      // Ignore if modifier keys are pressed (except for Shift in '?')
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const key = e.key.toLowerCase();

      // Open Shortcuts Cheat Sheet on '?'
      if (e.key === "?") {
        e.preventDefault();
        soundEffects.playToggle();
        window.dispatchEvent(new CustomEvent("dsa-open-shortcuts"));
        return;
      }

      // First Stroke: 'g'
      if (key === "g" && !activeChord) {
        setActiveChord("g");
        if (chordTimeoutRef.current) clearTimeout(chordTimeoutRef.current);
        chordTimeoutRef.current = setTimeout(() => {
          setActiveChord(null);
        }, 1200);
        return;
      }

      // Second Stroke after 'g'
      if (activeChord === "g") {
        if (chordTimeoutRef.current) clearTimeout(chordTimeoutRef.current);
        setActiveChord(null);

        switch (key) {
          case "d": // Dashboard
            soundEffects.playChord();
            router.push("/");
            break;
          case "r": // Roadmap
            soundEffects.playChord();
            router.push("/roadmap");
            break;
          case "t": // Topics
            soundEffects.playChord();
            router.push("/topics");
            break;
          case "s": // Search Problems
            soundEffects.playChord();
            router.push("/search");
            break;
          case "p": // PvP Colosseum
            soundEffects.playChord();
            router.push("/pvp");
            break;
          case "a": // AlgoTracer
            soundEffects.playChord();
            router.push("/tracer");
            break;
          case "f": // Flashcards
            soundEffects.playChord();
            router.push("/flashcards");
            break;
          case "c": // Command Palette
            soundEffects.playOpen();
            window.dispatchEvent(new CustomEvent("dsa-open-command-palette"));
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (chordTimeoutRef.current) clearTimeout(chordTimeoutRef.current);
    };
  }, [activeChord, router]);

  if (!activeChord) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[var(--bg-card)]/90 backdrop-blur-md border border-[var(--accent-primary)]/40 text-[var(--accent-primary)] font-mono text-xs font-bold shadow-[0_0_20px_var(--accent-glow)] animate-in fade-in slide-in-from-bottom-2 duration-150">
      <Compass size={14} className="animate-spin text-[var(--accent-primary)]" style={{ animationDuration: "3s" }} />
      <span>{activeChord} &bull; press [d, r, t, s, p, a, f, c]</span>
    </div>
  );
}
