"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Target,
  Menu,
  LogOut,
  ShieldCheck,
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
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { ThemeSelector } from "@/components/ui/ThemeSelector";

type NavItem = {
  icon: LucideIcon;
  label: string;
  href: string;
};

const navSections: Array<{ title: string; items: NavItem[] }> = [
  {
    title: "Practice",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/" },
      { icon: GraduationCap, label: "Learn", href: "/learn" },
      { icon: Network, label: "Visual Roadmap", href: "/roadmap" },
      { icon: Swords, label: "1v1 PvP Battles", href: "/pvp" },
      { icon: Activity, label: "AlgoTracer 2.0", href: "/tracer" },
      { icon: BookOpen, label: "Topics", href: "/topics" },
      { icon: Target, label: "DSA City", href: "/city" },
      { icon: Zap, label: "The Arena", href: "/challenge" },
      { icon: Target, label: "Mock Interviews", href: "/interviews" },
    ],
  },
  {
    title: "Review",
    items: [
      { icon: RotateCcw, label: "Review Queue", href: "/review" },
      { icon: Sparkles, label: "Flashcards SM-2", href: "/flashcards" },
      { icon: Building2, label: "Company Tracks", href: "/company-tracks" },
      { icon: Brain, label: "AI Recommend", href: "/recommendations" },
      { icon: Search, label: "Explore Problems", href: "/search" },
    ],
  },
  {
    title: "Analyze",
    items: [
      { icon: BarChart3, label: "Analytics", href: "/analytics" },
      { icon: Trophy, label: "Achievements", href: "/achievements" },
      { icon: FileText, label: "Weekly Report", href: "/weekly-report" },
    ],
  },
  {
    title: "Manage",
    items: [
      { icon: Puzzle, label: "Extension Hub", href: "/extension" },
      { icon: Library, label: "The Vault", href: "/vault" },
      { icon: Settings, label: "Settings", href: "/settings" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true);
  const { data: session } = useSession();

  const routeCollapsed = pathname.startsWith("/challenge/");
  const effectiveCollapsed = routeCollapsed || collapsed;
  const isAdmin =
    ((session?.user as { role?: string } | undefined)?.role || "USER") ===
    "ADMIN";
  const displaySections = navSections.map((section) => ({
    ...section,
    items: [...section.items],
  }));
  if (isAdmin) {
    const manageSection = displaySections.find(
      (section) => section.title === "Manage",
    );
    if (manageSection) {
      manageSection.items.push({
        icon: ShieldCheck,
        label: "Admin Panel",
        href: "/admin",
      });
    }
  }

  return (
    <div
      className={`hidden md:flex flex-col h-screen bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-r border-[var(--border-subtle)] transition-all duration-300 ${
        effectiveCollapsed ? "w-16 shrink-0" : "w-64 shrink-0"
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
        {!effectiveCollapsed && (
          <span className="text-[var(--text-primary)] font-bold text-lg tracking-wide flex items-center gap-2 font-display">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-glow)]" />
            DSA Pro
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors ml-auto cursor-pointer focus-visible:outline-none"
          aria-label={
            effectiveCollapsed ? "Expand navigation" : "Collapse navigation"
          }
          aria-expanded={!effectiveCollapsed}
        >
          <Menu size={18} />
        </button>
      </div>

      <nav
        className="flex-1 overflow-y-auto py-3 space-y-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Navigation menu"
      >
        {displaySections.map((section) => (
          <div key={section.title} className="space-y-1">
            {!effectiveCollapsed && (
              <p className="px-5 mb-1 text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] line-clamp-1">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`mx-2 flex items-center px-3 py-2.5 rounded-xl cursor-pointer transition-all text-sm font-medium ${
                      isActive
                        ? "bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] font-semibold border border-[var(--accent-primary)]/30 shadow-inner"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                    title={effectiveCollapsed ? item.label : undefined}
                  >
                    <item.icon
                      size={18}
                      className={`shrink-0 transition-colors ${
                        isActive
                          ? "text-[var(--accent-primary)]"
                          : "text-[var(--text-muted)]"
                      }`}
                    />
                    {!effectiveCollapsed && (
                      <span className="ml-3 truncate">
                        {item.label}
                      </span>
                    )}
                    {isActive && !effectiveCollapsed && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-glow)]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-[var(--border-subtle)] space-y-3 bg-[var(--bg-tertiary)]">
        {!effectiveCollapsed && (
          <div className="px-1">
            <ThemeSelector variant="dropdown" placement="top" />
          </div>
        )}

        {session?.user && !effectiveCollapsed && (
          <div className="flex items-center gap-3 pt-1 px-1">
            {session.user.image ? (
              <div
                className="w-8 h-8 rounded-full bg-cover bg-center border border-[var(--border-subtle)]"
                style={{ backgroundImage: `url(${session.user.image})` }}
                aria-label={`${session.user.name}'s profile picture`}
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30 flex items-center justify-center text-xs font-bold"
                aria-label="Profile initials"
              >
                {session.user.name?.charAt(0) || "U"}
              </div>
            )}
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
                {session.user.name}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] truncate">
                {session.user.email}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={`flex items-center w-full px-2.5 py-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors cursor-pointer ${
            effectiveCollapsed ? "justify-center" : ""
          }`}
          aria-label="Sign out"
        >
          <LogOut size={16} />
          {!effectiveCollapsed && <span className="ml-2.5">Sign Out</span>}
        </button>
      </div>
    </div>
  );
}
