"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
  Palette,
  Check,
  Code2,
  ExternalLink,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { dsaApi, SearchProblem, Topic } from "@/lib/api";
import { useTheme, THEME_OPTIONS, ThemeMode } from "@/components/providers/ThemeProvider";
import { soundEffects } from "@/lib/soundEffects";

const DIFFICULTY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  EASY: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
  },
  MEDIUM: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
  },
  HARD: {
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/30",
  },
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchedProblems, setSearchedProblems] = useState<SearchProblem[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load topics once on mount
  useEffect(() => {
    dsaApi
      .getTopics()
      .then((data) => setTopics(data))
      .catch(() => {});
  }, []);

  // Listen for ⌘K or Ctrl+K shortcut & custom open events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => {
          if (!prev) soundEffects.playOpen();
          return !prev;
        });
      }
    };

    const handleCustomOpen = () => {
      soundEffects.playOpen();
      setOpen(true);
    };

    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("dsa-open-command-palette", handleCustomOpen);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("dsa-open-command-palette", handleCustomOpen);
    };
  }, []);

  // Debounced live problem search
  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery);
    if (!newQuery.trim() || newQuery.length < 2) {
      setSearchedProblems([]);
      setIsSearching(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await dsaApi.searchProblems({ q: newQuery.trim() });
        setSearchedProblems(results.slice(0, 8));
      } catch {
        setSearchedProblems([]);
      } finally {
        setIsSearching(false);
      }
    }, 180);
  }, []);

  const runCommand = (command: () => void) => {
    soundEffects.playClick();
    setOpen(false);
    setQuery("");
    setSearchedProblems([]);
    command();
  };

  const handleSwitchTheme = (themeId: ThemeMode) => {
    setTheme(themeId);
    soundEffects.playSuccess();
    setOpen(false);
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) soundEffects.playOpen();
        setOpen(nextOpen);
        if (!nextOpen) {
          setQuery("");
          setSearchedProblems([]);
        }
      }}
      label="Global Command Menu"
      className="fixed left-1/2 top-1/2 z-[100] w-[94vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[var(--border-medium)] bg-[var(--bg-card)]/95 shadow-2xl backdrop-blur-2xl transition-all overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
    >
      {/* Search Header Input */}
      <div className="flex items-center border-b border-[var(--border-subtle)] px-4">
        <Search className="mr-3 h-5 w-5 shrink-0 text-[var(--text-muted)]" />
        <Command.Input
          value={query}
          onValueChange={handleQueryChange}
          placeholder="Search problems, topics, actions, or switch theme..."
          className="flex h-14 w-full bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
        {isSearching && (
          <span className="text-[10px] font-mono text-[var(--accent-primary)] animate-pulse shrink-0">
            Searching...
          </span>
        )}
      </div>

      {/* Results Scrollable Area */}
      <Command.List className="max-h-[380px] overflow-y-auto overflow-x-hidden p-2 text-[var(--text-primary)] scrollbar-thin">
        <Command.Empty className="py-10 text-center text-sm text-[var(--text-muted)]">
          No matching problems or actions found.
        </Command.Empty>

        {/* Dynamic Problems Search Results */}
        {searchedProblems.length > 0 && (
          <Command.Group
            heading="Matched Problems"
            className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[var(--accent-primary)]"
          >
            {searchedProblems.map((prob) => {
              const diffStyle =
                DIFFICULTY_STYLES[prob.difficulty] || DIFFICULTY_STYLES.MEDIUM;

              return (
                <Command.Item
                  key={prob.id}
                  value={`problem-${prob.title}-${prob.topicName}`}
                  onSelect={() =>
                    runCommand(() => router.push(`/problems/${prob.id}`))
                  }
                  className="relative flex cursor-pointer select-none items-center justify-between rounded-xl px-3 py-2.5 text-sm text-[var(--text-secondary)] outline-none aria-selected:bg-[var(--accent-primary)]/15 aria-selected:text-[var(--text-primary)] aria-selected:font-semibold"
                >
                  <div className="flex items-center gap-3 truncate">
                    <Code2 className="h-4 w-4 shrink-0 text-[var(--accent-primary)]" />
                    <span className="truncate">{prob.title}</span>
                    <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider hidden sm:inline">
                      {prob.topicName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${diffStyle.bg} ${diffStyle.text} border ${diffStyle.border}`}
                    >
                      {prob.difficulty}
                    </span>
                  </div>
                </Command.Item>
              );
            })}
          </Command.Group>
        )}

        {/* Theme Switching Commands */}
        <Command.Group
          heading="Instant Theme Engine"
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[var(--text-muted)]"
        >
          {THEME_OPTIONS.map((opt) => {
            const isActive = opt.id === theme;
            return (
              <Command.Item
                key={opt.id}
                value={`theme-${opt.name}-${opt.id}`}
                onSelect={() => handleSwitchTheme(opt.id)}
                className="relative flex cursor-pointer select-none items-center justify-between rounded-xl px-3 py-2 text-sm text-[var(--text-secondary)] outline-none aria-selected:bg-[var(--accent-primary)]/15 aria-selected:text-[var(--accent-primary)] aria-selected:font-semibold"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-inner"
                    style={{ backgroundColor: opt.accentPreview }}
                  />
                  <span>Theme: {opt.name}</span>
                </div>
                {isActive && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-[var(--accent-primary)]">
                    <Check size={12} /> Active
                  </span>
                )}
              </Command.Item>
            );
          })}
        </Command.Group>

        {/* DSA Topics Jump */}
        {topics.length > 0 && (
          <Command.Group
            heading="Curriculum Topics"
            className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[var(--text-muted)]"
          >
            {topics.slice(0, 8).map((topic) => (
              <Command.Item
                key={topic.id}
                value={`topic-${topic.name}`}
                onSelect={() =>
                  runCommand(() => router.push(`/topics?topic=${topic.id}`))
                }
                className="relative flex cursor-pointer select-none items-center justify-between rounded-xl px-3 py-2 text-sm text-[var(--text-secondary)] outline-none aria-selected:bg-[var(--accent-primary)]/15 aria-selected:text-[var(--accent-primary)] aria-selected:font-semibold"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="mr-1 h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
                  <span>Topic: {topic.name}</span>
                </div>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">
                  {topic.solvedProblems}/{topic.totalProblems} Solved
                </span>
              </Command.Item>
            ))}
          </Command.Group>
        )}

        {/* Core Navigation */}
        <Command.Group
          heading="Core Destinations"
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[var(--text-muted)]"
        >
          <Command.Item
            onSelect={() => runCommand(() => router.push("/"))}
            className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2 text-sm text-[var(--text-secondary)] outline-none aria-selected:bg-[var(--accent-primary)]/15 aria-selected:text-[var(--accent-primary)] aria-selected:font-semibold"
          >
            <LayoutDashboard className="mr-3 h-4 w-4 shrink-0" />
            Dashboard Home
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => router.push("/roadmap"))}
            className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2 text-sm text-[var(--text-secondary)] outline-none aria-selected:bg-[var(--accent-primary)]/15 aria-selected:text-[var(--accent-primary)] aria-selected:font-semibold"
          >
            <Target className="mr-3 h-4 w-4 shrink-0" />
            Visual Roadmap & Curriculum
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => router.push("/tracer"))}
            className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2 text-sm text-[var(--text-secondary)] outline-none aria-selected:bg-[var(--accent-primary)]/15 aria-selected:text-[var(--accent-primary)] aria-selected:font-semibold"
          >
            <Activity className="mr-3 h-4 w-4 shrink-0" />
            AlgoTracer 2.0 Visualizer
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => router.push("/search"))}
            className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2 text-sm text-[var(--text-secondary)] outline-none aria-selected:bg-[var(--accent-primary)]/15 aria-selected:text-[var(--accent-primary)] aria-selected:font-semibold"
          >
            <Search className="mr-3 h-4 w-4 shrink-0" />
            Explore Problem Bank
          </Command.Item>
        </Command.Group>

        {/* Competitive & Practice */}
        <Command.Group
          heading="Competitive & Practice"
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[var(--text-muted)]"
        >
          <Command.Item
            onSelect={() => runCommand(() => router.push("/pvp"))}
            className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2 text-sm text-[var(--text-secondary)] outline-none aria-selected:bg-[var(--accent-primary)]/15 aria-selected:text-[var(--accent-primary)] aria-selected:font-semibold"
          >
            <Swords className="mr-3 h-4 w-4 shrink-0" />
            1v1 PvP Speed Duels
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => router.push("/challenge"))}
            className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2 text-sm text-[var(--text-secondary)] outline-none aria-selected:bg-[var(--accent-primary)]/15 aria-selected:text-[var(--accent-primary)] aria-selected:font-semibold"
          >
            <Zap className="mr-3 h-4 w-4 shrink-0" />
            The Arena Speed Challenge
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => router.push("/city"))}
            className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2 text-sm text-[var(--text-secondary)] outline-none aria-selected:bg-[var(--accent-primary)]/15 aria-selected:text-[var(--accent-primary)] aria-selected:font-semibold"
          >
            <Target className="mr-3 h-4 w-4 shrink-0" />
            DSA 3D City Metaverse
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => router.push("/interviews"))}
            className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2 text-sm text-[var(--text-secondary)] outline-none aria-selected:bg-[var(--accent-primary)]/15 aria-selected:text-[var(--accent-primary)] aria-selected:font-semibold"
          >
            <MonitorPlay className="mr-3 h-4 w-4 shrink-0" />
            AI Mock Technical Interviews
          </Command.Item>
        </Command.Group>

        {/* Retention & Spaced Repetition */}
        <Command.Group
          heading="Retention & Spaced Repetition"
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[var(--text-muted)]"
        >
          <Command.Item
            onSelect={() => runCommand(() => router.push("/review"))}
            className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2 text-sm text-[var(--text-secondary)] outline-none aria-selected:bg-[var(--accent-primary)]/15 aria-selected:text-[var(--accent-primary)] aria-selected:font-semibold"
          >
            <RotateCcw className="mr-3 h-4 w-4 shrink-0" />
            SM-2 Daily Review Queue
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => router.push("/flashcards"))}
            className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2 text-sm text-[var(--text-secondary)] outline-none aria-selected:bg-[var(--accent-primary)]/15 aria-selected:text-[var(--accent-primary)] aria-selected:font-semibold"
          >
            <Sparkles className="mr-3 h-4 w-4 shrink-0" />
            Invariant Flashcards Deck
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => router.push("/company-tracks"))}
            className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2 text-sm text-[var(--text-secondary)] outline-none aria-selected:bg-[var(--accent-primary)]/15 aria-selected:text-[var(--accent-primary)] aria-selected:font-semibold"
          >
            <Building2 className="mr-3 h-4 w-4 shrink-0" />
            FAANG Company Prep Tracks
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => router.push("/learn"))}
            className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2 text-sm text-[var(--text-secondary)] outline-none aria-selected:bg-[var(--accent-primary)]/15 aria-selected:text-[var(--accent-primary)] aria-selected:font-semibold"
          >
            <GraduationCap className="mr-3 h-4 w-4 shrink-0" />
            Interactive Theory Modules
          </Command.Item>
        </Command.Group>

        {/* Performance & Account */}
        <Command.Group
          heading="Performance & Account"
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[var(--text-muted)]"
        >
          <Command.Item
            onSelect={() => runCommand(() => router.push("/analytics"))}
            className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2 text-sm text-[var(--text-secondary)] outline-none aria-selected:bg-[var(--accent-primary)]/15 aria-selected:text-[var(--accent-primary)] aria-selected:font-semibold"
          >
            <BarChart3 className="mr-3 h-4 w-4 shrink-0" />
            Performance Analytics
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => router.push("/achievements"))}
            className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2 text-sm text-[var(--text-secondary)] outline-none aria-selected:bg-[var(--accent-primary)]/15 aria-selected:text-[var(--accent-primary)] aria-selected:font-semibold"
          >
            <Trophy className="mr-3 h-4 w-4 shrink-0" />
            Trophy Hall & Badges
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => router.push("/weekly-report"))}
            className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2 text-sm text-[var(--text-secondary)] outline-none aria-selected:bg-[var(--accent-primary)]/15 aria-selected:text-[var(--accent-primary)] aria-selected:font-semibold"
          >
            <FileText className="mr-3 h-4 w-4 shrink-0" />
            Weekly Progress Report
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => router.push("/extension"))}
            className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2 text-sm text-[var(--text-secondary)] outline-none aria-selected:bg-[var(--accent-primary)]/15 aria-selected:text-[var(--accent-primary)] aria-selected:font-semibold"
          >
            <Puzzle className="mr-3 h-4 w-4 shrink-0" />
            Chrome Extension Auto-Sync
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => router.push("/vault"))}
            className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2 text-sm text-[var(--text-secondary)] outline-none aria-selected:bg-[var(--accent-primary)]/15 aria-selected:text-[var(--accent-primary)] aria-selected:font-semibold"
          >
            <Library className="mr-3 h-4 w-4 shrink-0" />
            Templates & Notes Vault
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => router.push("/settings"))}
            className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2 text-sm text-[var(--text-secondary)] outline-none aria-selected:bg-[var(--accent-primary)]/15 aria-selected:text-[var(--accent-primary)] aria-selected:font-semibold"
          >
            <Settings className="mr-3 h-4 w-4 shrink-0" />
            Settings & Themes
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => signOut({ callbackUrl: "/login" }))}
            className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2 text-sm text-rose-400 outline-none aria-selected:bg-rose-500/10 aria-selected:text-rose-400"
          >
            <LogOut className="mr-3 h-4 w-4 shrink-0" />
            Sign Out
          </Command.Item>
        </Command.Group>
      </Command.List>

      {/* Keyboard navigation footer guide */}
      <div className="flex items-center justify-between border-t border-[var(--border-subtle)] px-4 py-2.5 text-[10px] text-[var(--text-muted)] bg-[var(--bg-secondary)]/50">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] font-mono">
              ↑
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] font-mono">
              ↓
            </kbd>
            <span>Navigate</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] font-mono">
              ↵
            </kbd>
            <span>Select</span>
          </span>
        </div>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] font-mono">
            ESC
          </kbd>
          <span>Close</span>
        </span>
      </div>
    </Command.Dialog>
  );
}
