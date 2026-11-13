import {
  LayoutDashboard,
  BookOpen,
  Target,
  Network,
  Zap,
  Library,
  BarChart3,
  Trophy,
  FileText,
  Settings,
  Search,
  RotateCcw,
  Brain,
  GraduationCap,
  Swords,
  Activity,
  Sparkles,
  Building2,
  Puzzle,
  Telescope,
  type LucideIcon,
} from "lucide-react";
import type { FeatureFlags, FeatureName } from "@/types/features";

export type NavItem = {
  icon: LucideIcon;
  label: string;
  href: string;
  /** One-line hint shown in tooltips when the sidebar is collapsed */
  hint?: string;
  badge?: "new";
  /** Hidden unless this runtime feature flag is on */
  feature?: FeatureName;
};

export type NavSection = { title: string; items: NavItem[] };

/** Single source of truth for desktop sidebar + mobile drawer navigation. */
export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Practice",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/", hint: "Today at a glance" },
      { icon: Network, label: "Roadmap", href: "/roadmap", hint: "Visual skill tree" },
      { icon: BookOpen, label: "Topics", href: "/topics", hint: "Problems by pattern" },
      { icon: GraduationCap, label: "Learn", href: "/learn", hint: "Theory tracks & lessons" },
      { icon: Activity, label: "Code Tracer", href: "/tracer", hint: "Step through algorithms", feature: "algotracer" },
    ],
  },
  {
    title: "Compete",
    items: [
      { icon: Zap, label: "Timed Challenges", href: "/challenge", hint: "Beat the clock", feature: "arena" },
      { icon: Swords, label: "1v1 Battles", href: "/pvp", hint: "Race another coder", feature: "pvp" },
      { icon: Target, label: "Mock Interviews", href: "/interviews", hint: "Interview simulator", feature: "interviews" },
    ],
  },
  {
    title: "Retain",
    items: [
      { icon: RotateCcw, label: "Review Queue", href: "/review", hint: "Spaced repetition due today" },
      { icon: Sparkles, label: "Flashcards", href: "/flashcards", hint: "Pattern recall drills" },
      { icon: Building2, label: "Company Tracks", href: "/company-tracks", hint: "Curated per company" },
      { icon: Brain, label: "Recommendations", href: "/recommendations", hint: "What to solve next" },
      { icon: Search, label: "Explore", href: "/search", hint: "Search every problem" },
    ],
  },
  {
    title: "Insights",
    items: [
      { icon: Telescope, label: "Insights Lab", href: "/insights", hint: "Memory forecast & DSA DNA", badge: "new" },
      { icon: BarChart3, label: "Analytics", href: "/analytics", hint: "Trends & breakdowns" },
      { icon: Trophy, label: "Achievements", href: "/achievements", hint: "Badges & milestones" },
      { icon: FileText, label: "Weekly Report", href: "/weekly-report", hint: "Your week in review" },
    ],
  },
  {
    title: "Manage",
    items: [
      { icon: Puzzle, label: "LeetCode Sync", href: "/extension", hint: "Extension & sync status" },
      { icon: Library, label: "Notes Vault", href: "/vault", hint: "Your saved notes" },
      { icon: Settings, label: "Settings", href: "/settings", hint: "Themes & account" },
    ],
  },
];

export const isNavItemActive = (pathname: string, href: string) =>
  pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

/** Applies runtime feature flags and drops sections left empty. */
export const filterNavByFeatures = (sections: NavSection[], flags: FeatureFlags): NavSection[] =>
  sections
    .map((s) => ({ ...s, items: s.items.filter((i) => !i.feature || flags[i.feature]) }))
    .filter((s) => s.items.length > 0);
