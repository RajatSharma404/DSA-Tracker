"use client";

import React, { useState, useEffect } from "react";
import { Terminal, Shield, CheckCircle, Radio, Sparkles } from "lucide-react";
import { cityAudio } from "@/lib/cityAudio";

const LOGS = [
  { id: 1, time: "09:40:12", source: "SECTOR-0 CORE", msg: "Spatial physics matrix compiled successfully (WebGL 2.0)", type: "success" },
  { id: 2, time: "09:41:05", source: "DP SPIRE", msg: "Dynamic Programming Singularity boss floor synchronized", type: "info" },
  { id: 3, time: "09:42:33", source: "PVP ENGINE", msg: "1v1 Rooftop latency benchmark: 14ms across 12 node clusters", type: "info" },
  { id: 4, time: "09:43:18", source: "CITIZEN REGISTRY", msg: "VIP Citizen waitlist active: Early access slots filling", type: "warning" },
  { id: 5, time: "09:44:00", source: "AUDIO SYNTH", msg: "Synthesizer soundscapes active across all 6 districts", type: "success" },
];

export function CityTransmissionFeed() {
  const [activeLogs, setActiveLogs] = useState(LOGS);

  const handleBeep = () => {
    cityAudio.playHover();
  };

  return (
    <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-[var(--accent-primary)]" />
          <h3 className="font-bold text-sm text-[var(--text-primary)] font-display">
            Live Central Spire Transmissions
          </h3>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>NET LINK ESTABLISHED</span>
        </div>
      </div>

      <div className="space-y-2 font-mono text-xs max-h-48 overflow-y-auto no-scrollbar">
        {activeLogs.map((log) => (
          <div
            key={log.id}
            onMouseEnter={handleBeep}
            className="flex items-start gap-2.5 p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/40 transition-colors"
          >
            <span className="text-[10px] text-[var(--text-muted)] shrink-0">[{log.time}]</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] shrink-0">
              {log.source}
            </span>
            <span className="text-[var(--text-secondary)] text-[11px] truncate">{log.msg}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-muted)]">
        <span>ENCRYPTION: QUANTUM SHA-512</span>
        <span>SECTOR: 07 // NODE ONLINE</span>
      </div>
    </div>
  );
}
