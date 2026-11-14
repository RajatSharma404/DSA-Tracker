"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, ShieldCheck, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { safeSignOut } from "@/lib/auth/safeSignOut";
import { useFeatures } from "@/components/providers/FeaturesProvider";
import { motion } from "framer-motion";
import { ThemeSelector } from "@/components/ui/ThemeSelector";
import { BrandMark } from "@/components/ui/BrandMark";
import { NAV_SECTIONS, filterNavByFeatures, isNavItemActive, type NavSection } from "@/lib/navigation";

const COLLAPSE_KEY = "dsa_sidebar_collapsed";


export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const features = useFeatures();
  // Expanded by default on wide screens; the user's choice is remembered.
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      const saved = localStorage.getItem(COLLAPSE_KEY);
      if (saved !== null) return saved === "1";
    } catch {
      // ignore
    }
    return window.innerWidth < 1280;
  });
  const [tooltip, setTooltip] = useState<{ label: string; hint?: string; top: number } | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
    } catch {
      // ignore
    }
  }, [collapsed]);

  // Keyboard: Ctrl/Cmd + B toggles the sidebar (like most editors).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        const target = e.target as HTMLElement | null;
        if (target?.closest("input, textarea, [contenteditable=true], .monaco-editor")) return;
        e.preventDefault();
        setCollapsed((c) => !c);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Workspaces need the width: collapse automatically while solving.
  const effectiveCollapsed =
    pathname.startsWith("/challenge/") || pathname.startsWith("/problems/") || pathname === "/tracer" || collapsed;
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";
  const visible = filterNavByFeatures(NAV_SECTIONS, features);
  const sections: NavSection[] = isAdmin
    ? visible.map((s) =>
        s.title === "Manage"
          ? { ...s, items: [...s.items, { icon: ShieldCheck, label: "Admin Panel", href: "/admin", hint: "Manage content" }] }
          : s,
      )
    : visible;

  return (
    <aside
      className={`relative hidden md:flex flex-col h-screen shrink-0 border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)]/85 backdrop-blur-xl text-[var(--text-secondary)] transition-[width] duration-300 ease-[cubic-bezier(.16,1,.3,1)] z-30 ${
        effectiveCollapsed ? "w-[68px]" : "w-60"
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Brand */}
      <div className="flex h-14 items-center gap-2 px-4 border-b border-[var(--border-subtle)]">
        <Link href="/" className="flex items-center gap-2.5 min-w-0" aria-label="DSA Pro home">
          <BrandMark />
          {!effectiveCollapsed && (
            <span className="truncate text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">
              DSA Tracker
            </span>
          )}
        </Link>
      </div>

      <nav
        className="flex-1 overflow-y-auto overflow-x-hidden py-3 no-scrollbar"
        aria-label="Navigation menu"
        onMouseLeave={() => setTooltip(null)}
      >
        {sections.map((section, idx) => (
          <div key={section.title} className={idx > 0 ? "mt-4" : ""}>
            {effectiveCollapsed ? (
              idx > 0 && <div className="mx-4 mb-3 h-px bg-[var(--border-subtle)]" />
            ) : (
              <p className="px-5 mb-1.5 eyebrow !text-[10px]">{section.title}</p>
            )}
            <ul className="space-y-0.5 px-2.5">
              {section.items.map((item) => {
                const active = isNavItemActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      aria-label={effectiveCollapsed ? item.label : undefined}
                      onMouseEnter={(e) => {
                        if (!effectiveCollapsed) return;
                        const r = e.currentTarget.getBoundingClientRect();
                        setTooltip({ label: item.label, hint: item.hint, top: r.top + r.height / 2 });
                      }}
                      onFocus={(e) => {
                        if (!effectiveCollapsed) return;
                        const r = e.currentTarget.getBoundingClientRect();
                        setTooltip({ label: item.label, hint: item.hint, top: r.top + r.height / 2 });
                      }}
                      onBlur={() => setTooltip(null)}
                      className={`group relative flex items-center gap-3 rounded-xl py-2 text-[13px] font-medium transition-colors ${
                        effectiveCollapsed ? "justify-center px-0" : "px-3"
                      } ${
                        active
                          ? "text-[var(--text-primary)]"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="sidebar-active"
                          transition={{ type: "spring", stiffness: 500, damping: 40 }}
                          className="absolute inset-0 rounded-xl bg-[var(--accent-primary)]/12 border border-[var(--accent-primary)]/25"
                        >
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2.5 h-5 w-1 rounded-r-full bg-[var(--accent-primary)] shadow-[0_0_10px_var(--accent-glow)]" />
                        </motion.span>
                      )}
                      <item.icon
                        size={18}
                        className={`relative shrink-0 transition-colors ${
                          active ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"
                        }`}
                      />
                      {!effectiveCollapsed && <span className="relative truncate">{item.label}</span>}
                      {item.badge === "new" && (
                        <span
                          className={
                            effectiveCollapsed
                              ? "absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-[var(--accent-secondary)]"
                              : "relative ml-auto rounded-md px-1.5 py-px text-[9px] font-bold uppercase tracking-wider bg-[var(--accent-secondary)]/15 text-[var(--accent-secondary)]"
                          }
                        >
                          {effectiveCollapsed ? null : "New"}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Collapsed tooltip (portal-free, fixed so it escapes the scroll container) */}
      {effectiveCollapsed && tooltip && (
        <div
          role="tooltip"
          className="pointer-events-none fixed left-[76px] z-50 -translate-y-1/2 rounded-xl border border-[var(--border-medium)] bg-[var(--bg-card)] px-3 py-2 shadow-[var(--shadow-lg)] animate-in fade-in slide-in-from-left-1 duration-150"
          style={{ top: tooltip.top }}
        >
          <div className="text-xs font-semibold text-[var(--text-primary)] whitespace-nowrap">{tooltip.label}</div>
          {tooltip.hint && <div className="text-[11px] text-[var(--text-muted)] whitespace-nowrap">{tooltip.hint}</div>}
        </div>
      )}

      <div className="border-t border-[var(--border-subtle)] p-2.5 space-y-2">
        {!effectiveCollapsed && <ThemeSelector variant="dropdown" placement="top" />}

        {session?.user && !effectiveCollapsed && (
          <div className="flex items-center gap-2.5 rounded-xl px-2 py-1.5">
            {session.user.image ? (
              <div
                className="w-8 h-8 shrink-0 rounded-full bg-cover bg-center ring-1 ring-[var(--border-medium)]"
                style={{ backgroundImage: `url(${session.user.image})` }}
                aria-hidden
              />
            ) : (
              <div className="w-8 h-8 shrink-0 rounded-full grid place-items-center text-xs font-bold bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]">
                {session.user.name?.charAt(0) || "U"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-[var(--text-primary)] truncate">{session.user.name}</div>
              <div className="text-[10px] text-[var(--text-muted)] truncate">{session.user.email}</div>
            </div>
            <button
              onClick={() => safeSignOut()}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}

        <div className={`flex ${effectiveCollapsed ? "flex-col items-center gap-1" : "items-center justify-between"}`}>
          {effectiveCollapsed && (
            <button
              onClick={() => safeSignOut()}
              className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className={`flex items-center gap-2 rounded-lg p-2 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer ${
              effectiveCollapsed ? "" : "w-full"
            }`}
            aria-label={effectiveCollapsed ? "Expand navigation" : "Collapse navigation"}
            aria-expanded={!effectiveCollapsed}
          >
            {effectiveCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            {!effectiveCollapsed && (
              <>
                <span>Collapse</span>
                <kbd className="ml-auto font-mono text-[10px] rounded border border-[var(--border-subtle)] px-1">⌘B</kbd>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
