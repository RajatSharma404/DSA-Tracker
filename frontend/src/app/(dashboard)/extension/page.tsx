"use client";

import React, { useState } from "react";
import {
  Puzzle,
  Key,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Zap,
  Download,
  Terminal,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export default function ExtensionHubPage() {
  const [apiToken, setApiToken] = useState("dsa_live_9a87f8e71b2c45d6e890");
  const [copied, setCopied] = useState(false);
  const [syncLeetcode, setSyncLeetcode] = useState(true);
  const [syncCodeforces, setSyncCodeforces] = useState(true);

  const handleCopyToken = () => {
    navigator.clipboard.writeText(apiToken);
    setCopied(true);
    toast.success("API Token copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateToken = () => {
    const newToken = `dsa_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 10)}`;
    setApiToken(newToken);
    toast.success("New API Token generated!");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Puzzle size={13} />
            <span>Browser Auto-Sync Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            DSA Tracker Extension Hub
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Automatically capture, record solve times, and sync LeetCode and Codeforces solutions directly to your database.
          </p>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-emerald-500/20 bg-linear-to-r from-[#081810] via-[#091212] to-[#080a14] p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-emerald-500/15 blur-[100px] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-black uppercase tracking-wider">
              <Zap size={13} /> Real-Time Background Synchronization
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Zero-Click Background Sync
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-medium">
              Install the DSA Tracker Chrome extension. Every time you hit &quot;Submit&quot; on LeetCode or Codeforces, your solve time, code snippet, and time complexity are automatically synced into your SM-2 review queue.
            </p>
          </div>

          {/* Sync Status Badge */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-black/50 border border-white/10 backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase">Engine Status</span>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active & Listening
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs pt-1">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-gray-400 font-sans uppercase">Synced Solves</span>
                <div className="text-lg font-black text-white mt-0.5">142 Solves</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-gray-400 font-sans uppercase">Last Activity</span>
                <div className="text-lg font-black text-emerald-400 mt-0.5">2m ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* API Key Connection Card */}
      <div className="rounded-3xl border border-white/10 bg-[#0a0a0f] p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="space-y-1">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Key size={18} className="text-emerald-400" />
            Your Private Extension API Key
          </h3>
          <p className="text-xs text-gray-400">
            Paste this authentication token into the extension settings popup to connect your account.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full flex-1 p-3.5 rounded-2xl bg-black/60 border border-white/10 font-mono text-xs text-emerald-300 truncate">
            {apiToken}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyToken}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-black font-extrabold text-xs uppercase tracking-wider hover:bg-gray-200 transition-all shadow-md cursor-pointer"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copied ? "Copied!" : "Copy Token"}</span>
            </button>

            <button
              onClick={handleRegenerateToken}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
              title="Regenerate Token"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 4-Step Quick Install Guide */}
      <div className="rounded-3xl border border-white/10 bg-[#0a0a0f] p-6 sm:p-8 space-y-6 shadow-xl">
        <h3 className="text-base font-black text-white flex items-center gap-2">
          <Terminal size={18} className="text-cyan-400" />
          4-Step Installation Guide
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
            <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-black">
              1
            </div>
            <h4 className="font-bold text-white">Enable Developer Mode</h4>
            <p className="text-gray-400 leading-relaxed text-[11px]">
              Navigate to <code className="text-cyan-300 font-mono">chrome://extensions</code> in Chrome and toggle Developer mode on.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
            <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-black">
              2
            </div>
            <h4 className="font-bold text-white">Load Unpacked Extension</h4>
            <p className="text-gray-400 leading-relaxed text-[11px]">
              Click &quot;Load unpacked&quot; and select the <code className="text-cyan-300 font-mono">/extension</code> directory in this repository.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
            <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-black">
              3
            </div>
            <h4 className="font-bold text-white">Paste Your API Key</h4>
            <p className="text-gray-400 leading-relaxed text-[11px]">
              Click the DSA Tracker extension icon in your browser toolbar and paste your API key above.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black">
              4
            </div>
            <h4 className="font-bold text-white">Auto-Sync in Action</h4>
            <p className="text-gray-400 leading-relaxed text-[11px]">
              Solve any problem on LeetCode or Codeforces. Submissions are synced instantly!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
