"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import {
  Search,
  MonitorPlay,
  Brain,
  BookOpen,
  Settings,
  LogOut,
  LayoutDashboard,
  Target,
  Swords,
  Activity,
  Zap,
  Sparkles,
  Building2,
  BarChart3,
  Trophy,
  FileText,
  Puzzle,
  Library,
  GraduationCap,
  RotateCcw,
} from "lucide-react";
import { signOut } from "next-auth/react";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Toggle the menu when ⌘K or Ctrl+K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Menu"
      className="fixed left-1/2 top-1/2 z-[100] w-[92vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[var(--border-medium)] bg-[var(--bg-card)]/95 shadow-2xl backdrop-blur-2xl transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
    >
      <div className="flex items-center border-b border-[var(--border-subtle)] px-4">
        <Search className="mr-3 h-5 w-5 shrink-0 text-[var(--text-muted)]" />
        <Command.Input
          placeholder="Search features, practice, algorithms, or jump to route..."
          className="flex h-14 w-full bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      <Command.List className="max-h-[340px] overflow-y-auto overflow-x-hidden p-2 text-[var(--text-primary)] scrollbar-thin">
        <Command.Empty className="py-8 text-center text-sm text-[var(--text-muted)]">
          No results found.
        </Command.Empty>

        <Command.Group
          heading="Core Navigation"
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[var(--text-muted)]"
        >
          <Command.Item
            onSelect={() => runCommand(() => router.push("/"))}
            className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm text-[var(--text-secondary)] outline-none aria-selected:bg-[var(--accent-primary)]/15 aria-selected:text-[var(--accent-primary)] aria-selected:font-semibold"
          >
            <LayoutDashboard className="mr-3 h-4 w-4 shrink-0" />
            Dashboard Home
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => router.push("/roadmap"))}
            className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm text-[var(--text-secondary)] outline-none aria-selected:bg-[var(--accent-primary)]/15 aria-selected:text-[var(--accent-primary)] aria-selected:font-semibold"
          >
            <Target className="mr-3 h-4 w-4 shrink-0" />
            Visual Roadmap & Curriculum
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => router.push("/tracer"))}
            className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm text-[var(--text-secondary)] outline-none aria-selected:bg-[var(--accent-primary)]/15 aria-selected:text-[var(--accent-primary)] aria-selected:font-semibold"
          >
            <Activity className="mr-3 h-4 w-4 shrink-0" />
            AlgoTracer 2.0 Visualizer
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => router.push("/search"))}
            className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm text-[var(--text-secondary)] outline-none aria-selected:bg-[var(--accent-primary)]/15 aria-selected:text-[var(--accent-primary)] aria-selected:font-semibold"
          >
            <Search className="mr-3 h-4 w-4 shrink-0" />
            Explore Problem Bank
          </Command.Item>
        </Command.Group>

        <Command.Group
          heading="Competitive & Practice"
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[var(--text-muted)]"
        >
          <Command.Item
            onSelect={() => runCommand(() => router.push("/pvp"))}
            className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm text-[var(--text-secondary)] outline-none aria-selected:bg-[var(--accent-primary)]/15 aria-selected:text-[var(--accent-primary)] aria-selected:font-semibold"
          >
            <Swords className="mr-3 h-4 w-4 shrink-0" />
            1v1 PvP Speed Duels
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => router.push("/challenge"))}
            className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm text-[var(--text-secondary)] outline-none aria-selected:bg-[var(--accent-primary)]/15 aria-selected:text-[var(--accent-primary)] aria-selected:font-semibold"
          >
            <Zap className="mr-3 h-4 w-4 shrink-0" />
            The Arena Speed Challenge
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => router.push("/city"))}
            className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm text-[var(--text-secondary)] outline-none aria-selected:bg-[var(--accent-primary)]/15 aria-selected:text-[var(--accent-primary)] aria-selected:font-semibold"
          >
            <Target className="mr-3 h-4 w-4 shrink-0" />
            DSA 3D City Metaverse
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => router.push("/interviews"))}
            className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm text-[var(--text-secondary)] outline-none aria-selected:bg-[var(--accent-primary)]/15 aria-selected:text-[var(--accent-primary)] aria-selected:font-semibold"
          >
            <MonitorPlay className="mr-3 h-4 w-4 shrink-0" />
            AI Mock Technical Interviews
          </Command.Item>
        </Command.Group>

        <Command.Group
          heading="Retention & Spaced Repetition"
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[var(--text-muted)]"
        >
          <Command.Item
            onSelect={() => runCommand(() => router.push("/review"))}
            className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm text-[var(--text-secondary)] outline-none aria-selected:bg-[var(--accent-primary)]/15 aria-selected:text-[var(--accent-primary)] aria-selected:font-semibold"
          >
            <RotateCcw className="mr-3 h-4 w-4 shrink-0" />
            SM-2 Daily Review Queue
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => router.push("/flashcards"))}
            className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm text-[var(--text-secondary)] outline-none aria-selected:bg-[var(--accent-primary)]/15 aria-selected:text-[var(--accent-primary)] aria-selected:font-semibold"
          >
            <Sparkles className="mr-3 h-4 w-4 shrink-0" />
            Invariant Flashcards Deck
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => router.push("/company-tracks"))}
            className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm text-[var(--text-secondary)] outline-none aria-selected:bg-[var(--accent-primary)]/15 aria-selected:text-[var(--accent-primary)] aria-selected:font-semibold"
          >
            <Building2 className="mr-3 h-4 w-4 shrink-0" />
            FAANG Company Prep Tracks
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => router.push("/learn"))}
            className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm text-[var(--text-secondary)] outline-none aria-selected:bg-[var(--accent-primary)]/15 aria-selected:text-[var(--accent-primary)] aria-selected:font-semibold"
          >
            <GraduationCap className="mr-3 h-4 w-4 shrink-0" />
            Interactive Theory Modules
          </Command.Item>
        </Command.Group>

        <Command.Group
          heading="Performance & Account"
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[var(--text-muted)]"
        >
          <Command.Item
            onSelect={() => runCommand(() => router.push("/analytics"))}
            className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm text-[var(--text-secondary)] outline-none aria-selected:bg-[var(--accent-primary)]/15 aria-selected:text-[var(--accent-primary)] aria-selected:font-semibold"
          >
            <BarChart3 className="mr-3 h-4 w-4 shrink-0" />
            Performance Analytics
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => router.push("/achievements"))}
            className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm text-[var(--text-secondary)] outline-none aria-selected:bg-[var(--accent-primary)]/15 aria-selected:text-[var(--accent-primary)] aria-selected:font-semibold"
          >
            <Trophy className="mr-3 h-4 w-4 shrink-0" />
            Trophy Hall & Badges
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => router.push("/weekly-report"))}
            className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm text-[var(--text-secondary)] outline-none aria-selected:bg-[var(--accent-primary)]/15 aria-selected:text-[var(--accent-primary)] aria-selected:font-semibold"
          >
            <FileText className="mr-3 h-4 w-4 shrink-0" />
            Weekly Progress Report
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => router.push("/extension"))}
            className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm text-[var(--text-secondary)] outline-none aria-selected:bg-[var(--accent-primary)]/15 aria-selected:text-[var(--accent-primary)] aria-selected:font-semibold"
          >
            <Puzzle className="mr-3 h-4 w-4 shrink-0" />
            Chrome Extension Auto-Sync
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => router.push("/vault"))}
            className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm text-[var(--text-secondary)] outline-none aria-selected:bg-[var(--accent-primary)]/15 aria-selected:text-[var(--accent-primary)] aria-selected:font-semibold"
          >
            <Library className="mr-3 h-4 w-4 shrink-0" />
            Templates & Notes Vault
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => router.push("/settings"))}
            className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm text-[var(--text-secondary)] outline-none aria-selected:bg-[var(--accent-primary)]/15 aria-selected:text-[var(--accent-primary)] aria-selected:font-semibold"
          >
            <Settings className="mr-3 h-4 w-4 shrink-0" />
            Settings & Themes
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => signOut({ callbackUrl: "/login" }))}
            className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm text-red-400 outline-none aria-selected:bg-red-500/10 aria-selected:text-red-400"
          >
            <LogOut className="mr-3 h-4 w-4 shrink-0" />
            Sign Out
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
