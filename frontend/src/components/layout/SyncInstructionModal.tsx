"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  X,
  Puzzle,
  Key,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Zap,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Layers,
  Lock,
  ArrowRight,
  Info,
  CheckCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  getExtensionHealth,
  ExtensionHealthState,
} from "@/lib/extensionBridge";
import { dsaApi } from "@/lib/api";
import { soundEffects } from "@/lib/soundEffects";

type ActiveTab = "extension" | "cookie" | "compare";
type BrowserType = "chrome" | "firefox" | "edge" | "arc";

interface SyncInstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: ActiveTab;
}

export function SyncInstructionModal({
  isOpen,
  onClose,
  defaultTab = "extension",
}: SyncInstructionModalProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>(defaultTab);
  const [selectedBrowser, setSelectedBrowser] = useState<BrowserType>("chrome");

  // Health
  const [extensionState, setExtensionState] =
    useState<ExtensionHealthState>("NOT_INSTALLED");
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  // Cookie
  const [leetcodeSession, setLeetcodeSession] = useState("");
  const [isSavingCookie, setIsSavingCookie] = useState(false);
  const [savedUser, setSavedUser] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Copy Key
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      checkHealth();
      loadUserSettings();
    }
  }, [isOpen, defaultTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopy = (text: string, key: string, label = "Copied to clipboard!") => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    soundEffects.playClick();
    toast.success(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const checkHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const health = await getExtensionHealth();
      setExtensionState(health.state);
    } catch {
      setExtensionState("NOT_INSTALLED");
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const loadUserSettings = async () => {
    try {
      const settings = await dsaApi.getUserSettings();
      if (settings?.leetcodeSession) {
        setLeetcodeSession(settings.leetcodeSession);
      }
      if (settings?.leetcodeUsername) {
        setSavedUser(settings.leetcodeUsername);
      }
    } catch (err) {
      console.error("Failed to load user settings:", err);
    }
  };

  const handleSaveCookie = async () => {
    if (!leetcodeSession.trim()) {
      toast.error("Please paste your LEETCODE_SESSION cookie value");
      return;
    }

    setIsSavingCookie(true);
    try {
      const match = leetcodeSession.match(/(?:^|[;\s])LEETCODE_SESSION=([^;\s]+)/i);
      const cleanSession = (match ? match[1] : leetcodeSession).trim().replace(/^"|"$/g, "");

      await dsaApi.updateLeetcodeSession(cleanSession);
      toast.success("LeetCode session cookie saved successfully!");
      soundEffects.playSuccess();

      setIsSyncing(true);
      const syncResult = await dsaApi.syncLeetcode();
      if (syncResult?.syncSource === "session") {
        toast.success(`Session verified! Synced ${syncResult.syncedCount || 0} problems.`);
      } else if (syncResult?.warning) {
        toast.warning(syncResult.warning);
      }
    } catch (error: any) {
      console.error("Save cookie error:", error);
      toast.error(error?.response?.data?.error || "Failed to save or validate session cookie");
    } finally {
      setIsSavingCookie(false);
      setIsSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-secondary)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 shadow-xs">
              <Puzzle size={20} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)] font-display flex items-center gap-2">
                <span>Integration & Sync Instructions</span>
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Step-by-step setup for Chrome Extension auto-sync & LeetCode session cookie
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/extension"
              onClick={onClose}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
            >
              <span>Full Page</span>
              <ExternalLink size={12} />
            </Link>
            <button
              onClick={() => {
                soundEffects.playClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all cursor-pointer border border-[var(--border-subtle)]"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Live Status Pill & Tab Buttons */}
        <div className="px-6 pt-4 border-b border-[var(--border-subtle)] bg-[var(--bg-card)] shrink-0 space-y-3">
          {/* Extension Health Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  extensionState === "READY"
                    ? "bg-emerald-400 animate-pulse"
                    : extensionState === "INSTALLED_NOT_READY"
                    ? "bg-amber-400"
                    : "bg-gray-400"
                }`}
              />
              <span className="font-bold text-[var(--text-primary)]">
                Extension Status:{" "}
                <span
                  className={
                    extensionState === "READY"
                      ? "text-emerald-400"
                      : extensionState === "INSTALLED_NOT_READY"
                      ? "text-amber-400"
                      : "text-[var(--text-muted)]"
                  }
                >
                  {extensionState === "READY"
                    ? "Active & Connected"
                    : extensionState === "INSTALLED_NOT_READY"
                    ? "Installed • Log in to LeetCode"
                    : "Not Loaded"}
                </span>
              </span>
            </div>

            <button
              onClick={checkHealth}
              disabled={isCheckingHealth}
              className="px-3 py-1 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] text-[11px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <RefreshCw
                size={11}
                className={isCheckingHealth ? "animate-spin text-[var(--accent-primary)]" : ""}
              />
              <span>{isCheckingHealth ? "Checking..." : "Test Connection"}</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab("extension")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === "extension"
                  ? "border-[var(--accent-primary)] text-[var(--accent-primary)] bg-[var(--accent-primary)]/5 rounded-t-xl"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Puzzle size={14} />
              <span>Chrome Extension (0-Click Auto-Sync)</span>
            </button>

            <button
              onClick={() => setActiveTab("cookie")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === "cookie"
                  ? "border-[var(--accent-primary)] text-[var(--accent-primary)] bg-[var(--accent-primary)]/5 rounded-t-xl"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Key size={14} />
              <span>LEETCODE_SESSION Cookie</span>
            </button>

            <button
              onClick={() => setActiveTab("compare")}
              className={`hidden sm:flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === "compare"
                  ? "border-[var(--accent-primary)] text-[var(--accent-primary)] bg-[var(--accent-primary)]/5 rounded-t-xl"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Layers size={14} />
              <span>Comparison & FAQ</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 min-h-0">
          {/* TAB 1: EXTENSION SETUP */}
          {activeTab === "extension" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Step 1 */}
                <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <span className="text-[10px] font-mono uppercase text-[var(--text-muted)]">
                      Open Extensions
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">
                    Go to Extensions Page
                  </h4>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Type or paste into your browser address bar:
                  </p>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] font-mono text-xs text-cyan-300">
                    <span>chrome://extensions</span>
                    <button
                      onClick={() => handleCopy("chrome://extensions", "m_step1", "URL copied!")}
                      className="p-1 rounded bg-[var(--bg-secondary)] hover:text-white transition-all cursor-pointer"
                    >
                      {copiedKey === "m_step1" ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <span className="text-[10px] font-mono uppercase text-[var(--text-muted)]">
                      Developer Mode
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">
                    Toggle Developer Mode
                  </h4>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Turn on the <strong>Developer mode</strong> switch in the top-right corner of the Extensions page.
                  </p>
                  <div className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[11px] text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={13} />
                    <span>Enables &quot;Load unpacked&quot; button</span>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <span className="text-[10px] font-mono uppercase text-[var(--text-muted)]">
                      Load Unpacked
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">
                    Select Extension Folder
                  </h4>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Click &quot;Load unpacked&quot; and choose the extension directory:
                  </p>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] font-mono text-xs text-amber-300">
                    <span className="truncate pr-2">d:\DSA-Tracker\extension</span>
                    <button
                      onClick={() => handleCopy("d:\\DSA-Tracker\\extension", "m_step3", "Path copied!")}
                      className="p-1 rounded bg-[var(--bg-secondary)] hover:text-white transition-all cursor-pointer shrink-0"
                    >
                      {copiedKey === "m_step3" ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      4
                    </div>
                    <span className="text-[10px] font-mono uppercase text-[var(--text-muted)]">
                      Auto-Sync Active
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">
                    Solve on LeetCode
                  </h4>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Sign in to <a href="https://leetcode.com" target="_blank" rel="noreferrer" className="text-[var(--accent-primary)] underline">leetcode.com</a>. Submissions are synced to your database automatically on every accepted solve!
                  </p>
                  <div className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[11px] text-emerald-300 flex items-center gap-1.5">
                    <Zap size={13} className="text-emerald-400" />
                    <span>0-click background synchronization</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COOKIE EXTRACTION */}
          {activeTab === "cookie" && (
            <div className="space-y-5">
              {/* Browser Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Browser:
                </span>
                {(["chrome", "edge", "firefox", "arc"] as BrowserType[]).map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBrowser(b)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedBrowser === b
                        ? "bg-[var(--accent-primary)] text-[var(--bg-primary)]"
                        : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {b === "chrome" ? "Chrome / Brave" : b === "edge" ? "Edge" : b === "firefox" ? "Firefox" : "Arc / Safari"}
                  </button>
                ))}
              </div>

              {/* Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-1">
                  <div className="font-bold text-[var(--text-primary)]">1. Log In</div>
                  <p className="text-[11px] text-[var(--text-muted)]">Open leetcode.com & sign in.</p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-1">
                  <div className="font-bold text-[var(--text-primary)]">2. Press F12</div>
                  <p className="text-[11px] text-[var(--text-muted)]">Open Browser DevTools.</p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-1">
                  <div className="font-bold text-[var(--text-primary)]">
                    {selectedBrowser === "firefox" ? "3. Storage" : "3. Application"}
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)]">Click tab in top toolbar.</p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-1">
                  <div className="font-bold text-[var(--text-primary)]">4. Cookies</div>
                  <p className="text-[11px] text-[var(--text-muted)]">Select leetcode.com.</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                  <div className="font-bold text-emerald-400">5. Copy Session</div>
                  <p className="text-[11px] text-emerald-300">Copy LEETCODE_SESSION.</p>
                </div>
              </div>

              {/* Inline Save & Test Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-3">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="modalCookieInput"
                    className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <Lock size={13} className="text-[var(--accent-primary)]" />
                    Paste & Save Session Cookie
                  </label>
                  {savedUser && (
                    <span className="text-[11px] text-emerald-400 font-mono">
                      @{savedUser}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    id="modalCookieInput"
                    type="password"
                    value={leetcodeSession}
                    onChange={(e) => setLeetcodeSession(e.target.value)}
                    placeholder="Paste LEETCODE_SESSION value here..."
                    className="flex-1 px-3.5 py-2.5 text-xs font-mono border border-[var(--border-medium)] rounded-xl bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-all"
                  />
                  <button
                    onClick={handleSaveCookie}
                    disabled={isSavingCookie || isSyncing || !leetcodeSession}
                    className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[var(--accent-primary)] text-[var(--bg-primary)] hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer shrink-0 flex items-center justify-center gap-2"
                  >
                    {isSavingCookie || isSyncing ? (
                      <RefreshCw size={13} className="animate-spin" />
                    ) : (
                      <Check size={13} />
                    )}
                    <span>{isSavingCookie || isSyncing ? "Saving..." : "Save & Verify"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMPARISON */}
          {activeTab === "compare" && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2">
                <h4 className="font-bold text-[var(--text-primary)]">
                  Which method should I choose?
                </h4>
                <p className="text-[var(--text-muted)] leading-relaxed">
                  • <strong>Chrome Extension (Recommended):</strong> Best for daily coding. Automatically records accepted solves and solve time without touching cookies.
                </p>
                <p className="text-[var(--text-muted)] leading-relaxed">
                  • <strong>Session Cookie:</strong> Best if you want to import 300+ historical solved problems or fetch your past code for the AI reviewer.
                </p>
                <p className="text-emerald-400 font-semibold pt-1">
                  💡 Best approach: Set both! One-time cookie setup for full history + extension for daily practice.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex items-center justify-between text-xs text-[var(--text-muted)] shrink-0">
          <span className="text-[11px]">
            Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] font-mono">Esc</kbd> to close
          </span>
          <Link
            href="/extension"
            onClick={onClose}
            className="text-[var(--accent-primary)] font-bold hover:underline flex items-center gap-1"
          >
            <span>Open Dedicated Integration Hub</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
