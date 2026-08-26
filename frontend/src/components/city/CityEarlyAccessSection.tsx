"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Copy,
  Check,
  Share2,
  Crown,
  QrCode,
  Fingerprint,
  X,
  Building2,
} from "lucide-react";
import { cityAudio } from "@/lib/cityAudio";
import confetti from "canvas-confetti";
import { toast } from "sonner";

export interface CitizenPassData {
  citizenId: string;
  name: string;
  architectClass: string;
  joinedAt: string;
  sectorRank: number;
}

const ARCHITECT_CLASSES = [
  "Master of Graphs",
  "Dynamic Programmer",
  "Tree Weaver",
  "Bitwise Sorcerer",
  "Speed Gladiator",
  "Data Flow Alchemist",
];

export function CityEarlyAccessSection() {
  const [name, setName] = useState("");
  const [architectClass, setArchitectClass] = useState(ARCHITECT_CLASSES[0]);
  const [passData, setPassData] = useState<CitizenPassData | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("dsa_city_citizen_pass");
      if (saved) {
        setPassData(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please provide an architect alias or email");
      return;
    }

    setIsSubmitting(true);
    cityAudio.playPassUnlocked();

    setTimeout(() => {
      const randomRank = Math.floor(Math.random() * 450) + 120;
      const citizenId = `DSA-${Math.floor(1000 + Math.random() * 9000)}-VIP`;

      const newPass: CitizenPassData = {
        citizenId,
        name: name.trim(),
        architectClass,
        joinedAt: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        sectorRank: randomRank,
      };

      try {
        localStorage.setItem("dsa_city_citizen_pass", JSON.stringify(newPass));
      } catch {
        // ignore
      }

      setPassData(newPass);
      setIsSubmitting(false);

      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#00f0ff", "#ec4899", "#facc15", "#10b981"],
        });
      } catch {
        // ignore
      }

      toast.success("VIP Citizen Pass granted! Welcome to Sector 07.");
    }, 400);
  };

  const handleCopyPass = () => {
    if (!passData) return;
    cityAudio.playSelect();
    navigator.clipboard.writeText(
      `DSA CITY CITIZEN PASS: ${passData.citizenId} | Architect: ${passData.name} (${passData.architectClass}) | Sector Rank: #${passData.sectorRank}`
    );
    setCopied(true);
    toast.success("Pass details copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevoke = () => {
    cityAudio.playGlitch();
    try {
      localStorage.removeItem("dsa_city_citizen_pass");
    } catch {
      // ignore
    }
    setPassData(null);
    toast.info("Citizen registry cleared. You may re-register.");
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[var(--accent-primary)]/30 bg-gradient-to-b from-[var(--bg-card)] via-[var(--bg-card)] to-[var(--bg-secondary)] p-6 sm:p-10 shadow-2xl">
      {/* Background glow flares */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-[var(--accent-primary)]/10 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        {/* Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30 text-[var(--accent-primary)] text-xs font-bold uppercase tracking-widest">
            <Crown size={14} className="text-amber-400" />
            <span>VIP Early Access Protocol</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] font-display tracking-tight">
            Claim Your Metropolitan Citizen Pass
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-xl mx-auto">
            Reserve your personal skyscraper plot in Sector 07. VIP Citizens receive exclusive day-1 neon cosmetics, leaderboard multipliers, and closed beta access.
          </p>
        </div>

        {passData ? (
          /* Holographic Citizen Pass Card */
          <div className="space-y-6 flex flex-col items-center">
            <div className="w-full max-w-md relative group">
              {/* Card Holographic Container */}
              <div className="relative overflow-hidden rounded-3xl border-2 border-[var(--accent-primary)] bg-gradient-to-br from-[#0b1329] via-[#0f172a] to-[#1e1b4b] p-6 sm:p-7 shadow-[0_0_50px_rgba(0,240,255,0.25)] text-white space-y-5">
                {/* Holographic light sweep sheen */}
                <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45 pointer-events-none group-hover:translate-x-full transition-transform duration-1000" />

                {/* Top header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-cyan-400/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300">
                      <Building2 size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono tracking-widest text-cyan-400 font-bold uppercase">
                        DSA METROPOLIS
                      </p>
                      <p className="text-xs font-black tracking-wider uppercase font-display">
                        Sector 07 Citizen Pass
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold">
                    <ShieldCheck size={12} />
                    <span>VERIFIED VIP</span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-mono uppercase tracking-widest text-slate-400">
                        ARCHITECT ALIAS
                      </p>
                      <p className="text-lg font-black text-white font-display">
                        {passData.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-mono uppercase tracking-widest text-slate-400">
                        SECTOR RANK
                      </p>
                      <p className="text-base font-black text-amber-300 font-mono">
                        #{passData.sectorRank}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 font-mono text-xs">
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-slate-400">CLASS</p>
                      <p className="font-bold text-cyan-300 text-[11px] truncate">
                        {passData.architectClass}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] uppercase tracking-widest text-slate-400">ISSUED</p>
                      <p className="font-bold text-slate-200 text-[11px]">{passData.joinedAt}</p>
                    </div>
                  </div>
                </div>

                {/* Barcode & Security Chip footer */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between font-mono text-[10px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <Fingerprint size={20} className="text-cyan-400" />
                    <div>
                      <p className="text-white font-bold">{passData.citizenId}</p>
                      <p className="text-[8px] text-slate-500">AUTHENTICATED HARDWARE KEY</p>
                    </div>
                  </div>
                  <QrCode size={28} className="text-cyan-300/80" />
                </div>
              </div>
            </div>

            {/* Actions for pass */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleCopyPass}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[var(--accent-primary)] hover:brightness-110 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 cursor-pointer font-display"
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                <span>{copied ? "Pass Copied!" : "Copy Pass Code"}</span>
              </button>

              <button
                onClick={handleRevoke}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <X size={13} />
                <span>Re-register</span>
              </button>
            </div>
          </div>
        ) : (
          /* Registration Form */
          <form
            onSubmit={handleRegister}
            className="max-w-lg mx-auto bg-[var(--bg-secondary)]/90 backdrop-blur-md rounded-3xl border border-[var(--border-subtle)] p-6 sm:p-8 space-y-4 shadow-xl"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] font-mono">
                Architect Alias / Email
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. CyberGladiator or alex@code.dev"
                required
                className="w-full px-4 py-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none focus:border-[var(--accent-primary)] font-mono transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] font-mono">
                Architect Specialization Class
              </label>
              <select
                value={architectClass}
                onChange={(e) => setArchitectClass(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-primary)] font-mono transition-colors cursor-pointer"
              >
                {ARCHITECT_CLASSES.map((cls) => (
                  <option key={cls} value={cls} className="bg-[var(--bg-card)] text-[var(--text-primary)]">
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-2xl bg-[var(--accent-primary)] hover:brightness-110 text-black font-black text-sm uppercase tracking-widest font-display transition-all shadow-[0_0_25px_var(--accent-glow)] active:scale-98 cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              <Zap size={16} className="fill-current" />
              <span>{isSubmitting ? "Generating Citizen Pass..." : "Mint VIP Citizen Pass"}</span>
            </button>

            <p className="text-[11px] text-center text-[var(--text-muted)] font-mono pt-1">
              Zero fees. Immediate pass minting with simulated cryptographic sector keys.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
