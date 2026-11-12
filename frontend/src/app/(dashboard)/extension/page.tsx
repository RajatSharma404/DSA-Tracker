"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Puzzle,
  Key,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Zap,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Layers,
  Lock,
  Info,
  CheckCheck,
  Keyboard,
  Compass,
  Flame,
  WifiOff,
  Command,
  Sliders,
  Cpu,
} from "lucide-react";
import { toast } from "sonner";
import {
  getExtensionHealth,
  ExtensionHealthState,
} from "@/lib/extensionBridge";
import { dsaApi } from "@/lib/api";

type ActiveTab = "extension" | "cookie" | "keyboard" | "features" | "compare";
type BrowserType = "chrome" | "firefox" | "edge" | "arc";

function ExtensionHubContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as ActiveTab) || "extension";

  const [activeTab, setActiveTab] = useState<ActiveTab>(
    ["extension", "cookie", "keyboard", "features", "compare"].includes(initialTab)
      ? initialTab
      : "extension",
  );
  const [selectedBrowser, setSelectedBrowser] = useState<BrowserType>("chrome");

  // Extension Health
  const [extensionState, setExtensionState] =
    useState<ExtensionHealthState>("NOT_INSTALLED");
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);

  // Device Pairing State (Task 2.1 & 2.3)
  interface DeviceItem {
    id: string;
    name: string;
    tokenPrefix: string;
    scopes: string[];
    createdAt: string;
    lastUsedAt: string | null;
    expiresAt: string | null;
    revokedAt: string | null;
  }
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState("My Chrome Extension");
  const [isCreatingDevice, setIsCreatingDevice] = useState(false);
  const [newlyCreatedToken, setNewlyCreatedToken] = useState<string | null>(null);

  // Cookie Management
  const [leetcodeSession, setLeetcodeSession] = useState("");
  const [isSavingCookie, setIsSavingCookie] = useState(false);
  const [savedUser, setSavedUser] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Copy helpers
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string, label = "Copied to clipboard!") => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const checkHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const health = await getExtensionHealth();
      setExtensionState(health.state);
      setLastCheckTime(new Date());
      if (health.state === "READY") {
        toast.success("Chrome Extension is active & ready!");
      } else if (health.state === "INSTALLED_NOT_READY") {
        toast.warning("Extension detected! Please sign in to LeetCode.");
      } else {
        toast.info("Extension not detected. Follow the steps below to load it.");
      }
    } catch {
      setExtensionState("NOT_INSTALLED");
    } finally {
      setIsCheckingHealth(false);
    }
  };

  useEffect(() => {
    checkHealth();
    loadUserSettings();
    loadDevices();
  }, []);

  const loadDevices = async () => {
    setIsLoadingDevices(true);
    try {
      const data = await dsaApi.getExtensionDevices();
      setDevices(data?.devices || []);
    } catch (err) {
      console.error("Failed to load extension devices:", err);
    } finally {
      setIsLoadingDevices(false);
    }
  };

  const handleCreateDevice = async () => {
    setIsCreatingDevice(true);
    try {
      const res = await dsaApi.createExtensionDevice(newDeviceName || "Chrome Extension");
      setNewlyCreatedToken(res.token);
      toast.success("Pairing token generated! Copy it now.");
      await loadDevices();
    } catch {
      toast.error("Failed to generate pairing token");
    } finally {
      setIsCreatingDevice(false);
    }
  };

  const handleRevokeDevice = async (id: string) => {
    try {
      await dsaApi.revokeExtensionDevice(id);
      toast.success("Device revoked");
      await loadDevices();
    } catch {
      toast.error("Failed to revoke device");
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
      // Clean cookie if user pasted key=value
      const match = leetcodeSession.match(/(?:^|[;\s])LEETCODE_SESSION=([^;\s]+)/i);
      const cleanSession = (match ? match[1] : leetcodeSession).trim().replace(/^"|"$/g, "");

      await dsaApi.updateLeetcodeSession(cleanSession);
      toast.success("LeetCode session cookie saved successfully!");
      
      // Auto-trigger sync validation
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full min-w-0 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 text-[var(--accent-primary)] text-xs font-bold uppercase tracking-wider mb-2">
            <Puzzle size={13} />
            <span>LeetCode Integration & Auto-Sync Center</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight flex items-center gap-3 font-display">
            Extension & Session Setup
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1 max-w-2xl">
            Configure the Chrome extension for zero-click background syncing or connect your LeetCode session cookie for full problem backlog imports and AI code reviews.
          </p>
        </div>

        {/* Live Status Pill */}
        <div className="flex items-center gap-3">
          <button
            onClick={checkHealth}
            disabled={isCheckingHealth}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer shadow-sm"
          >
            <RefreshCw
              size={14}
              className={`${isCheckingHealth ? "animate-spin text-[var(--accent-primary)]" : ""}`}
            />
            <span>{isCheckingHealth ? "Checking..." : "Test Connection"}</span>
          </button>
        </div>
      </div>

      {/* Live Diagnostic Banner */}
      <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start md:items-center gap-3.5">
          <div
            className={`p-3 rounded-2xl shrink-0 ${
              extensionState === "READY"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : extensionState === "INSTALLED_NOT_READY"
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
            }`}
          >
            {extensionState === "READY" ? (
              <CheckCircle2 size={22} />
            ) : extensionState === "INSTALLED_NOT_READY" ? (
              <AlertTriangle size={22} />
            ) : (
              <Puzzle size={22} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Browser Extension Status:
              </span>
              <span
                className={`text-xs font-extrabold uppercase px-2 py-0.5 rounded-full ${
                  extensionState === "READY"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : extensionState === "INSTALLED_NOT_READY"
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                }`}
              >
                {extensionState === "READY"
                  ? "Connected & Ready"
                  : extensionState === "INSTALLED_NOT_READY"
                  ? "Installed • LeetCode Login Needed"
                  : "Not Detected / Not Loaded"}
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {extensionState === "READY"
                ? "The extension is communicating seamlessly with DSA Tracker and listening for accepted solves."
                : extensionState === "INSTALLED_NOT_READY"
                ? "The extension is installed, but you are not logged into leetcode.com in this browser profile."
                : "Load the unpacked extension in Chrome to enable live submission auto-recording."}
            </p>
          </div>
        </div>

        {lastCheckTime && (
          <div className="text-[11px] font-mono text-[var(--text-muted)] shrink-0 self-end md:self-center">
            Checked: {lastCheckTime.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex border-b border-[var(--border-subtle)] space-x-2">
        <button
          onClick={() => setActiveTab("extension")}
          className={`flex items-center gap-2.5 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "extension"
              ? "border-[var(--accent-primary)] text-[var(--accent-primary)] bg-[var(--accent-primary)]/5 rounded-t-xl"
              : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Puzzle size={16} />
          <span>Chrome Extension Setup</span>
          <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 hidden sm:inline">
            Recommended
          </span>
        </button>

        <button
          onClick={() => setActiveTab("cookie")}
          className={`flex items-center gap-2.5 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "cookie"
              ? "border-[var(--accent-primary)] text-[var(--accent-primary)] bg-[var(--accent-primary)]/5 rounded-t-xl"
              : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Lock size={16} />
          <span>Device Pairing Tokens</span>
          <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 hidden sm:inline">
            Zero-Cookie Auth
          </span>
        </button>

        <button
          onClick={() => setActiveTab("keyboard")}
          className={`flex items-center gap-2.5 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "keyboard"
              ? "border-[var(--accent-primary)] text-[var(--accent-primary)] bg-[var(--accent-primary)]/5 rounded-t-xl"
              : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Keyboard size={16} />
          <span>Keyboard & Vim Chords</span>
        </button>

        <button
          onClick={() => setActiveTab("features")}
          className={`flex items-center gap-2.5 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "features"
              ? "border-[var(--accent-primary)] text-[var(--accent-primary)] bg-[var(--accent-primary)]/5 rounded-t-xl"
              : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Sparkles size={16} />
          <span>PWA & Power Features</span>
        </button>

        <button
          onClick={() => setActiveTab("compare")}
          className={`flex items-center gap-2.5 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "compare"
              ? "border-[var(--accent-primary)] text-[var(--accent-primary)] bg-[var(--accent-primary)]/5 rounded-t-xl"
              : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Layers size={16} />
          <span>Comparison & FAQ</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CHROME EXTENSION SETUP */}
      {/* ========================================================================= */}
      {activeTab === "extension" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Quick Summary Card */}
          <div className="relative overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-linear-to-r from-[var(--bg-card)] via-[var(--bg-secondary)] to-[var(--bg-card)] p-6 sm:p-8 shadow-xl">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
                  <Zap size={13} /> 0-Click Automated Syncing
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] font-display">
                  How the Chrome Extension Works
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  The extension sits in your browser and automatically detects when you solve problems on LeetCode. When you hit <strong>Submit</strong> and get an <strong>Accepted</strong> verdict, the extension pings your local DSA Tracker server, logging your solved state, time spent, and SM-2 review schedule instantly.
                </p>
              </div>

              <div className="lg:col-span-4 p-5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] space-y-2 text-xs">
                <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Extension Features
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCheck size={14} /> Zero manual copying required
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCheck size={14} /> 1-Click submit from DSA Tracker editor
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCheck size={14} /> Real-time solve timer tracking
                </div>
              </div>
            </div>
          </div>

          {/* 4 Step Visual Guide */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Terminal className="text-[var(--accent-primary)] w-5 h-5" />
              <h3 className="text-lg font-bold text-[var(--text-primary)] font-display">
                Step-by-Step Installation (Takes 60 Seconds)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Step 1 */}
              <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] space-y-4 relative group hover:border-[var(--border-medium)] transition-all">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-black text-sm">
                    1
                  </div>
                  <span className="text-[10px] font-mono uppercase text-[var(--text-muted)]">
                    Browser Configuration
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-bold text-[var(--text-primary)]">
                    Open Extensions Manager
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    Type or paste this URL into your browser address bar and hit Enter:
                  </p>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] font-mono text-xs text-cyan-300">
                  <span>chrome://extensions</span>
                  <button
                    onClick={() => handleCopy("chrome://extensions", "step1", "URL copied!")}
                    className="p-1.5 rounded-lg bg-[var(--bg-primary)] hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                    title="Copy URL"
                  >
                    {copiedKey === "step1" ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>

                <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5">
                  <Info size={12} className="text-[var(--accent-primary)] shrink-0" />
                  <span>In Brave, use <code className="text-cyan-300 font-mono">brave://extensions</code>. In Edge, use <code className="text-cyan-300 font-mono">edge://extensions</code>.</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] space-y-4 relative group hover:border-[var(--border-medium)] transition-all">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-black text-sm">
                    2
                  </div>
                  <span className="text-[10px] font-mono uppercase text-[var(--text-muted)]">
                    Developer Mode
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-bold text-[var(--text-primary)]">
                    Enable Developer Mode
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    Look at the <strong>top-right corner</strong> of the Extensions tab and toggle the <strong>Developer mode</strong> switch to <strong className="text-emerald-400">ON</strong>.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
                  <span>Developer mode toggle</span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                    [ON] Enabled
                  </span>
                </div>

                <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                  <span>Enabling developer mode reveals the &quot;Load unpacked&quot; button.</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] space-y-4 relative group hover:border-[var(--border-medium)] transition-all">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-black text-sm">
                    3
                  </div>
                  <span className="text-[10px] font-mono uppercase text-[var(--text-muted)]">
                    Load Unpacked Directory
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-bold text-[var(--text-primary)]">
                    Select the Extension Folder
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    Click the <strong>&quot;Load unpacked&quot;</strong> button on the top-left toolbar and select this repository&apos;s extension folder:
                  </p>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] font-mono text-xs text-amber-300">
                  <span className="truncate pr-2">d:\DSA-Tracker\extension</span>
                  <button
                    onClick={() => handleCopy("d:\\DSA-Tracker\\extension", "step3", "Path copied!")}
                    className="p-1.5 rounded-lg bg-[var(--bg-primary)] hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all cursor-pointer shrink-0"
                    title="Copy Folder Path"
                  >
                    {copiedKey === "step3" ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>

                <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5">
                  <Info size={12} className="text-[var(--accent-primary)] shrink-0" />
                  <span>Ensure you select the folder containing <code className="text-amber-300">manifest.json</code>.</span>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] space-y-4 relative group hover:border-[var(--border-medium)] transition-all">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-black text-sm">
                    4
                  </div>
                  <span className="text-[10px] font-mono uppercase text-[var(--text-muted)]">
                    Verify & Solve
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-bold text-[var(--text-primary)]">
                    Sign In & Solve Problems
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    Open <a href="https://leetcode.com" target="_blank" rel="noreferrer" className="text-[var(--accent-primary)] underline">leetcode.com</a> in your browser and make sure you are signed in.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-between">
                  <span className="text-xs text-[var(--text-secondary)]">Test your connection</span>
                  <button
                    onClick={checkHealth}
                    className="px-3 py-1.5 rounded-lg bg-[var(--accent-primary)] text-[var(--bg-primary)] font-bold text-xs hover:opacity-90 transition-all cursor-pointer"
                  >
                    Ping Extension
                  </button>
                </div>

                <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                  <span>Done! Any accepted solve on LeetCode will automatically sync to your roadmap.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: EXTENSION PAIRING TOKEN MANAGEMENT (Task 2.1 & 2.3) */}
      {/* ========================================================================= */}
      {activeTab === "cookie" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Header Explanation */}
          <div className="p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)] font-display">
                  Chrome Extension Device Pairing
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Pair your browser extensions securely with scoped cryptographic tokens. DSA Tracker Pro never reads or stores your sensitive LeetCode session cookies.
                </p>
              </div>
            </div>
          </div>

          {/* Newly Created Token Banner (Show Once) */}
          {newlyCreatedToken && (
            <div className="p-6 rounded-3xl border-2 border-emerald-500/50 bg-emerald-950/20 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Sparkles size={18} />
                <span>Pairing Token Generated Successfully!</span>
              </div>
              <p className="text-xs text-emerald-200/90 leading-relaxed">
                Copy this token now and paste it into the <strong>DSA Tracker Pro extension popup</strong>. For your security, this plaintext token will <strong>never be shown again</strong>.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  readOnly
                  value={newlyCreatedToken}
                  className="w-full px-4 py-2.5 text-xs font-mono border border-emerald-500/30 rounded-xl bg-[var(--bg-secondary)] text-emerald-300 select-all focus:outline-none"
                />
                <button
                  onClick={() => handleCopy(newlyCreatedToken, "newToken", "Pairing token copied!")}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer hover:bg-emerald-400 transition-all"
                >
                  {copiedKey === "newToken" ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedKey === "newToken" ? "Copied!" : "Copy Token"}</span>
                </button>
                <button
                  onClick={() => setNewlyCreatedToken(null)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs font-semibold cursor-pointer border border-[var(--border-subtle)]"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Generate Token Box */}
          <div className="p-6 sm:p-8 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-2xl space-y-6">
            <div className="space-y-1">
              <label
                htmlFor="newDeviceNameInput"
                className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2"
              >
                <Key size={14} className="text-[var(--accent-primary)]" />
                Generate New Pairing Token
              </label>
              <p className="text-xs text-[var(--text-muted)]">
                Provide a friendly name for your browser or workstation to identify this extension device.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                id="newDeviceNameInput"
                type="text"
                value={newDeviceName}
                onChange={(e) => setNewDeviceName(e.target.value)}
                placeholder="e.g. MacBook Chrome, Office Workstation"
                className="w-full sm:w-80 px-4 py-2.5 text-xs border border-[var(--border-medium)] rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-all"
              />
              <button
                onClick={handleCreateDevice}
                disabled={isCreatingDevice || !newDeviceName.trim()}
                className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold rounded-xl bg-[var(--accent-primary)] text-[var(--bg-primary)] hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shadow-md shrink-0"
              >
                {isCreatingDevice ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                <span>{isCreatingDevice ? "Generating..." : "Generate Pairing Token"}</span>
              </button>
            </div>
          </div>

          {/* Paired Devices List */}
          <div className="p-6 sm:p-8 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Paired Extension Devices
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Manage active connections and revoke compromised or old devices at any time.
                </p>
              </div>
              <button
                onClick={loadDevices}
                disabled={isLoadingDevices}
                className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] cursor-pointer"
                title="Refresh Devices"
              >
                <RefreshCw size={14} className={isLoadingDevices ? "animate-spin" : ""} />
              </button>
            </div>

            {isLoadingDevices && devices.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--text-muted)] font-mono">
                Loading paired devices...
              </div>
            ) : devices.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border-subtle)] rounded-2xl">
                No paired extension devices found. Generate a pairing token above to connect.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)] uppercase text-[10px] tracking-wider font-semibold">
                      <th className="py-3 px-2">Device Name</th>
                      <th className="py-3 px-2">Token Prefix</th>
                      <th className="py-3 px-2">Created</th>
                      <th className="py-3 px-2">Last Synced</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)] font-mono">
                    {devices.map((device) => {
                      const isRevoked = Boolean(device.revokedAt);
                      const isExpired = device.expiresAt && new Date(device.expiresAt).getTime() < Date.now();
                      const statusLabel = isRevoked ? "Revoked" : isExpired ? "Expired" : "Active";
                      const statusClass = isRevoked
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        : isExpired
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

                      return (
                        <tr key={device.id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                          <td className="py-3 px-2 font-sans font-semibold text-[var(--text-primary)]">
                            {device.name}
                          </td>
                          <td className="py-3 px-2 text-[var(--text-muted)]">
                            <code>{device.tokenPrefix}…</code>
                          </td>
                          <td className="py-3 px-2 text-[var(--text-muted)] text-[11px]">
                            {new Date(device.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-2 text-[var(--text-muted)] text-[11px]">
                            {device.lastUsedAt ? new Date(device.lastUsedAt).toLocaleDateString() : "Never"}
                          </td>
                          <td className="py-3 px-2">
                            <span className={`inline-block px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase ${statusClass}`}>
                              {statusLabel}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right">
                            {!isRevoked && (
                              <button
                                onClick={() => handleRevokeDevice(device.id)}
                                className="px-2.5 py-1 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 text-[11px] font-sans font-bold cursor-pointer transition-all"
                              >
                                Revoke
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: KEYBOARD & VIM NAVIGATION CHORDS */}
      {/* ========================================================================= */}
      {activeTab === "keyboard" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 shadow-xs">
                <Compass size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] font-display">
                  Two-Stroke Vim Navigation Chords
                </h3>
                <p className="text-xs text-[var(--text-muted)] font-mono">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)]">g</kbd> followed by any target key to teleport across the platform
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              {[
                { chord: "g d", label: "Dashboard Overview", desc: "Jump to metrics & streak", path: "/" },
                { chord: "g r", label: "Visual Roadmap", desc: "Interactive curriculum graph", path: "/roadmap" },
                { chord: "g t", label: "Topic Curriculum", desc: "Topic lists & breakdown", path: "/topics" },
                { chord: "g s", label: "Problem Search Bank", desc: "Filter 2000+ problems", path: "/search" },
                { chord: "g p", label: "1v1 PvP Colosseum", desc: "Battle live opponents", path: "/pvp" },
                { chord: "g a", label: "AlgoTracer 2.0", desc: "Call stack & memory runtime", path: "/tracer" },
                { chord: "g f", label: "Flashcards Deck", desc: "SM-2 spaced repetition", path: "/flashcards" },
                { chord: "g c", label: "Command Center", desc: "Open global palette (⌘K)", path: "⌘K" },
              ].map((item) => (
                <div
                  key={item.chord}
                  className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <kbd className="px-2.5 py-1 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-mono font-black text-xs border border-[var(--accent-primary)]/30 shadow-xs">
                      {item.chord}
                    </kbd>
                    <span className="font-bold text-[var(--text-primary)] text-xs font-display">{item.label}</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Command Palette Power Shortcuts */}
            <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-cyan-400 font-bold font-mono uppercase text-xs">
                <Command size={16} />
                <span>Command Palette & Tag Filters (⌘K)</span>
              </div>
              <ul className="space-y-2.5 text-xs text-[var(--text-secondary)]">
                <li className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                  <span>Pick Random Problem:</span>
                  <span className="font-mono text-amber-400 font-bold">🎲 Random</span>
                </li>
                <li className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                  <span>Sync LeetCode Submissions:</span>
                  <span className="font-mono text-emerald-400 font-bold">🔄 Sync</span>
                </li>
                <li className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                  <span>Start SM-2 Daily Review:</span>
                  <span className="font-mono text-purple-400 font-bold">⚡ Review</span>
                </li>
                <li className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                  <span>Filter by Difficulty in Search:</span>
                  <span className="font-mono text-cyan-300 font-bold">#easy / #hard</span>
                </li>
              </ul>
            </div>

            {/* Monaco & Gesture Controls */}
            <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-purple-400 font-bold font-mono uppercase text-xs">
                <Sliders size={16} />
                <span>Editor & Gesture Controls</span>
              </div>
              <ul className="space-y-2.5 text-xs text-[var(--text-secondary)]">
                <li className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                  <span>Submit Code Solution:</span>
                  <kbd className="font-mono bg-[var(--bg-card)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">Ctrl + Enter</kbd>
                </li>
                <li className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                  <span>Run Sample Test Cases:</span>
                  <kbd className="font-mono bg-[var(--bg-card)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">Ctrl + &apos;</kbd>
                </li>
                <li className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                  <span>Flip 3D Flashcard:</span>
                  <kbd className="font-mono bg-[var(--bg-card)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">Space</kbd>
                </li>
                <li className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                  <span>Flashcard Swipe Rating:</span>
                  <span className="font-mono text-emerald-400 font-bold">Right: Easy / Left: Hard</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PWA & POWER FEATURES */}
      {/* ========================================================================= */}
      {activeTab === "features" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PWA Standalone App */}
            <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 sm:p-8 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold font-mono uppercase text-xs">
                <Zap size={16} />
                <span>PWA Standalone Application</span>
              </div>
              <h4 className="text-lg font-bold text-[var(--text-primary)] font-display">
                Install as a Native Desktop / Mobile App
              </h4>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                DSA Tracker Pro includes full Web App Manifest and Service Worker caching. Click the install icon in your browser URL bar or use your browser menu to install DSA Tracker directly onto your desktop or home screen for distraction-free coding.
              </p>
              <div className="pt-2">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono text-[11px]">
                  ✓ Zero Tab Overhead &bull; Native Window &bull; Offline Shell
                </span>
              </div>
            </div>

            {/* Offline Mutation Buffer */}
            <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 sm:p-8 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold font-mono uppercase text-xs">
                <WifiOff size={16} />
                <span>Offline Resilience & Auto-Sync Queue</span>
              </div>
              <h4 className="text-lg font-bold text-[var(--text-primary)] font-display">
                Code Without Internet Worries
              </h4>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                If your network connection drops, problem completion states and bookmark changes are safely queued in an encrypted local storage buffer. When connection is restored, DSA Tracker automatically replays your updates and alerts you with a confirmation toast.
              </p>
              <div className="pt-2">
                <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono text-[11px]">
                  ⚡ Automatic Background Replay on Reconnect
                </span>
              </div>
            </div>

            {/* 4-Tier Procedural Streak Flame */}
            <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 sm:p-8 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-orange-400 font-bold font-mono uppercase text-xs">
                <Flame size={16} />
                <span>Procedural Milestone Streak Flame</span>
              </div>
              <h4 className="text-lg font-bold text-[var(--text-primary)] font-display">
                Dynamic SVG Particle Fire Milestones
              </h4>
              <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                <li>• <strong>1–6 Days (Spark):</strong> Gentle warm amber glow with subtle pulsation.</li>
                <li>• <strong>7–29 Days (Blaze):</strong> Electric orange flame with floating spark particles.</li>
                <li>• <strong>30–99 Days (Plasma):</strong> Cyan/Violet dual-core cyberpunk plasma flame.</li>
                <li>• <strong>100+ Days (Supernova):</strong> Celestial golden core with revolving planetary ring.</li>
              </ul>
            </div>

            {/* AlgoTracer 2.0 & 1v1 PvP Arena */}
            <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 sm:p-8 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold font-mono uppercase text-xs">
                <Cpu size={16} />
                <span>AlgoTracer 2.0 & 1v1 PvP Colosseum</span>
              </div>
              <h4 className="text-lg font-bold text-[var(--text-primary)] font-display">
                Deep Visual Debugging & Competitive Battles
              </h4>
              <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                <li>• <strong>Speed Presets:</strong> Toggle between 0.25x, 0.5x, 1x, 2x, and 5x speeds.</li>
                <li>• <strong>Call Stack Visualizer:</strong> Track active stack frames and memory allocations.</li>
                <li>• <strong>Live Speedometer:</strong> Real-time WPM/CPM gauge in 1v1 PvP arena.</li>
                <li>• <strong>Victory Podium:</strong> Audio fanfares, ELO gain breakdown, and confetti blast.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: COMPARISON & RECOMMENDATION */}
      {/* ========================================================================= */}
      {activeTab === "compare" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Comparison Matrix Table */}
          <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 sm:p-8 shadow-xl space-y-6">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-[var(--text-primary)] font-display flex items-center gap-2">
                <Layers size={18} className="text-[var(--accent-primary)]" />
                Integration Methods Comparison
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Understand what each integration option provides and how to get the optimal experience.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)] uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Feature</th>
                    <th className="py-3 px-4">Username Only</th>
                    <th className="py-3 px-4 text-cyan-400">LEETCODE_SESSION Cookie</th>
                    <th className="py-3 px-4 text-emerald-400 font-black">Chrome Extension (Recommended)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-secondary)]">
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-[var(--text-primary)]">
                      Recent Problem Sync (last ~20–100)
                    </td>
                    <td className="py-3.5 px-4 text-emerald-400 font-bold">✓ Yes</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-bold">✓ Yes</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-bold">✓ Yes</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-[var(--text-primary)]">
                      Full Historical Solved Backlog (500+ AC)
                    </td>
                    <td className="py-3.5 px-4 text-rose-400 font-bold">✗ No (limit 100)</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-bold">✓ Yes (Paginated)</td>
                    <td className="py-3.5 px-4 text-rose-400 font-bold">✗ Real-time only</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-[var(--text-primary)]">
                      0-Click Automatic Submission Capture
                    </td>
                    <td className="py-3.5 px-4 text-rose-400 font-bold">✗ Requires manual sync</td>
                    <td className="py-3.5 px-4 text-rose-400 font-bold">✗ Requires manual sync</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-bold">✓ Automatic on Submit</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-[var(--text-primary)]">
                      Past Submission Code for AI Review
                    </td>
                    <td className="py-3.5 px-4 text-rose-400 font-bold">✗ Private API</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-bold">✓ Yes (Fetches code)</td>
                    <td className="py-3.5 px-4 text-rose-400 font-bold">✗ Requires Cookie</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-[var(--text-primary)]">
                      1-Click Submit from DSA Tracker Editor
                    </td>
                    <td className="py-3.5 px-4 text-rose-400 font-bold">✗ No</td>
                    <td className="py-3.5 px-4 text-amber-400 font-bold">~ Backend API</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-bold">✓ Direct Tab Automation</td>
                  </tr>
                  <tr className="bg-[var(--accent-primary)]/5">
                    <td className="py-3.5 px-4 font-black text-[var(--text-primary)]">
                      Best Practice Setup
                    </td>
                    <td className="py-3.5 px-4 text-gray-400">Basic</td>
                    <td className="py-3.5 px-4 text-cyan-400 font-semibold">Great for Import & AI</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-black">Best for Daily Practice</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-3">
              <Sparkles size={18} className="shrink-0 text-emerald-400" />
              <span>
                <strong>Pro-Tip:</strong> Configure both! Use the <strong>LEETCODE_SESSION cookie</strong> once to import your entire problem history, and use the <strong>Chrome Extension</strong> for smooth zero-click logging as you solve problems daily.
              </span>
            </div>
          </div>

          {/* Troubleshooting FAQ */}
          <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 sm:p-8 shadow-xl space-y-6">
            <h3 className="text-xl font-bold text-[var(--text-primary)] font-display flex items-center gap-2">
              <HelpCircle size={18} className="text-amber-400" />
              Frequently Asked Questions & Troubleshooting
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2">
                <h4 className="font-bold text-[var(--text-primary)]">
                  How long does the LEETCODE_SESSION cookie stay valid?
                </h4>
                <p className="text-[var(--text-muted)] leading-relaxed">
                  LeetCode session cookies typically stay active for 14 to 30 days. If you log out on leetcode.com or clear your cookies, you will need to re-copy the updated cookie value.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2">
                <h4 className="font-bold text-[var(--text-primary)]">
                  Why does the extension show &quot;Installed • Login Needed&quot;?
                </h4>
                <p className="text-[var(--text-muted)] leading-relaxed">
                  The extension communicates with LeetCode cookies in the background. Open a tab on <a href="https://leetcode.com" target="_blank" rel="noreferrer" className="text-[var(--accent-primary)] underline">leetcode.com</a> and make sure your profile is actively logged in.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2">
                <h4 className="font-bold text-[var(--text-primary)]">
                  Is it safe to store my session cookie in DSA Tracker?
                </h4>
                <p className="text-[var(--text-muted)] leading-relaxed">
                  Yes. Your cookie is stored solely on your local database instance and is never transmitted to any third-party servers. It is used strictly for authenticated GraphQL queries to LeetCode.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2">
                <h4 className="font-bold text-[var(--text-primary)]">
                  What happens when Chrome restarts?
                </h4>
                <p className="text-[var(--text-muted)] leading-relaxed">
                  Extensions loaded unpacked stay permanently installed across browser restarts. You only need to reload it if you make modifications to the extension files in the repository.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExtensionHubPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-[var(--text-muted)] animate-pulse">
          Loading Extension & Cookie Guide...
        </div>
      }
    >
      <ExtensionHubContent />
    </Suspense>
  );
}
