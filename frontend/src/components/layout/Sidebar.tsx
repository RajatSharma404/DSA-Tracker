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
      { icon: Brain, label: "AI Recommend", href: "/recommendations" },
      { icon: Search, label: "Explore", href: "/search" },
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
      className={`flex flex-col h-screen bg-[var(--bg-card)] text-[var(--text-muted)] border-r border-[var(--border-subtle)] transition-all duration-300 ${
        effectiveCollapsed ? "w-16" : "w-64"
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
        {!effectiveCollapsed && (
          <span className="text-[var(--text-primary)] font-display font-bold text-lg tracking-wide flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-glow)]" />
            DSA Pro
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors ml-auto cursor-pointer"
          aria-label={
            effectiveCollapsed ? "Expand navigation" : "Collapse navigation"
          }
          aria-expanded={!effectiveCollapsed}
        >
          <Menu size={18} />
        </button>
      </div>

      <nav
        className="flex-1 overflow-y-auto py-2 sm:py-3 scrollbar-hide"
        aria-label="Navigation menu"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {displaySections.map((section) => (
          <div key={section.title} className="mb-2 sm:mb-3">
            {!effectiveCollapsed && (
              <p className="hidden md:block px-4 mb-1 text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-70 line-clamp-1">
                {section.title}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-3 sm:px-4 py-2.5 sm:py-3 cursor-pointer transition-all text-[14px] sm:text-base font-medium ${
                      isActive
                        ? "bg-[var(--bg-hover)] text-[var(--text-primary)] border-r-2 border-[var(--accent-primary)] shadow-sm font-semibold"
                        : "hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                    title={effectiveCollapsed ? item.label : undefined}
                  >
                    <item.icon
                      size={18}
                      className={`sm:w-5 sm:h-5 shrink-0 ${
                        isActive
                          ? "text-[var(--accent-primary)]"
                          : "text-[var(--text-muted)]"
                      }`}
                    />
                    {!effectiveCollapsed && (
                      <span className="ml-2 sm:ml-3 font-medium truncate">
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-[var(--border-subtle)] space-y-3 bg-[var(--bg-secondary)]">
        {!effectiveCollapsed && (
          <div className="px-1">
            <ThemeSelector variant="dropdown" />
          </div>
        )}

        {session?.user && !effectiveCollapsed && (
          <div className="flex items-center gap-3 pt-1">
            {session.user.image ? (
              <div
                className="w-8 h-8 rounded-full bg-cover bg-center border border-[var(--border-medium)]"
                style={{ backgroundImage: `url(${session.user.image})` }}
                aria-label={`${session.user.name}'s profile picture`}
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-medium)] flex items-center justify-center text-[var(--text-primary)] text-xs font-bold"
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
