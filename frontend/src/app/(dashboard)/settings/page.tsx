"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { dsaApi } from "@/lib/api";
import { ThemeSelector } from "@/components/ui/ThemeSelector";
import { Palette, Key, Type, Sparkles, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [leetcodeSession, setLeetcodeSession] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await dsaApi.getUserSettings();
      if (response.leetcodeSession) {
        setLeetcodeSession(response.leetcodeSession);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    try {
      await dsaApi.updateLeetcodeSession(leetcodeSession);
      setMessage("✅ LeetCode session saved successfully!");
    } catch (error) {
      setMessage("❌ Failed to save settings");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-[var(--text-primary)] mb-2 flex items-center gap-3">
          <Sparkles className="w-7 h-7 text-[var(--accent-primary)]" />
          Settings & Customization
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Customize your interface visual theme, typography system, and external service integrations.
        </p>
      </div>

      {/* Theme & Visual Appearance Section */}
      <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Appearance & Theme Engine
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Select your preferred color theme. Changes apply dynamically across the entire application.
              </p>
            </div>
          </div>
        </div>

        <ThemeSelector variant="grid" />

        {/* Typography Preview */}
        <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            <Type className="w-4 h-4 text-[var(--accent-primary)]" />
            Typography System
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
              <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                UI Primary Font (Outfit)
              </div>
              <div className="text-sm font-sans font-medium text-[var(--text-primary)]">
                The quick brown fox jumps over the lazy dog.
              </div>
            </div>
            <div className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
              <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                Code & Editor Font (JetBrains Mono)
              </div>
              <div className="text-xs font-mono text-[var(--accent-primary)]">
                function solve(nums) &#123; return nums.sort(); &#125;
              </div>
            </div>
            <div className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
              <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                Display Headings (Space Grotesk)
              </div>
              <div className="text-base font-display font-bold text-[var(--text-primary)]">
                Algorithm Mastery 2.0
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LeetCode Integration Section */}
      <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-xl space-y-6">
        <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] pb-4">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              LeetCode Integration
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Sync your real-time submission progress and runtime metrics automatically.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] space-y-2">
          <h3 className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[var(--accent-primary)]" />
            How to get your LeetCode Session Cookie:
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-[var(--text-muted)]">
            <li>
              Go to{" "}
              <a
                href="https://leetcode.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent-primary)] underline hover:opacity-80"
              >
                LeetCode.com
              </a>{" "}
              and sign in to your account
            </li>
            <li>Press F12 to open Chrome Developer Tools</li>
            <li>
              Navigate to <strong>Application</strong> tab → <strong>Cookies</strong> → <strong>https://leetcode.com</strong>
            </li>
            <li>
              Locate the cookie named <strong>LEETCODE_SESSION</strong> and copy its value
            </li>
          </ol>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="leetcodeSession"
            className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider"
          >
            LeetCode Session Cookie
          </label>
          <input
            id="leetcodeSession"
            type="password"
            value={leetcodeSession}
            onChange={(e) => setLeetcodeSession(e.target.value)}
            placeholder="Paste your LEETCODE_SESSION cookie value here"
            className="w-full px-4 py-2.5 text-xs font-mono border border-[var(--border-medium)] rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-all"
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={loading || !leetcodeSession}
            className="px-6 py-2.5 text-xs font-semibold rounded-xl bg-[var(--accent-primary)] text-[var(--bg-primary)] hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md"
          >
            {loading ? "Saving..." : "Save Session Cookie"}
          </button>

          {message && (
            <span className="text-xs font-medium text-[var(--text-secondary)] animate-in fade-in">
              {message}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
