"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Lightbulb,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { dsaApi } from "@/lib/api";
import { toast } from "sonner";

interface MistakePattern {
  pattern: string;
  frequency: "common" | "occasional";
  affectedTopics: string[];
  exampleProblemIds: string[];
  recommendation: string;
}

export default function MistakePatternsCard() {
  const [patterns, setPatterns] = useState<MistakePattern[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPatterns = async () => {
    try {
      const res = await dsaApi.getMistakePatterns();
      if (res?.patterns) {
        setPatterns(res.patterns);
      }
      if (res?.message) {
        setMessage(res.message);
      }
    } catch {
      // Degrade gracefully
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPatterns();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPatterns();
    toast.success("Mistake patterns updated!");
  };

  if (loading) {
    return (
      <div className="p-6 rounded-3xl border border-white/5 bg-[var(--bg-secondary)] animate-pulse h-44" />
    );
  }

  return (
    <div className="p-6 rounded-3xl border border-white/5 bg-[var(--bg-secondary)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              AI Mistake Pattern Detection
            </h2>
            <p className="text-xs text-gray-400">
              Cross-topic recurring pitfalls identified from your non-accepted submissions
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-xs font-semibold transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {patterns.length === 0 ? (
        <div className="p-6 border border-dashed border-white/10 rounded-2xl text-center space-y-2">
          <Sparkles size={24} className="mx-auto text-amber-400/60" />
          <p className="text-xs text-gray-300 font-medium">
            {message || "No significant mistake patterns detected yet."}
          </p>
          <p className="text-[11px] text-gray-500">
            Keep practicing and submitting solutions; our pattern recognition engine will cluster recurring error modes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {patterns.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between space-y-3 hover:border-amber-500/30 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-sm text-white leading-snug">
                    {item.pattern}
                  </h3>
                  <span
                    className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full border uppercase tracking-wider shrink-0 ${
                      item.frequency === "common"
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}
                  >
                    {item.frequency}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {item.affectedTopics.map((topic, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-gray-400 border border-white/5 font-mono"
                    >
                      {topic}
                    </span>
                  ))}
                </div>

                <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[11px] text-amber-200/90 leading-relaxed">
                  <span className="font-semibold text-amber-400">Tactical fix:</span>{" "}
                  {item.recommendation}
                </div>
              </div>

              {item.exampleProblemIds.length > 0 && (
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
                  <span>Examples ({item.exampleProblemIds.length}):</span>
                  <div className="flex items-center gap-1.5">
                    {item.exampleProblemIds.slice(0, 3).map((probId, i) => (
                      <Link
                        key={i}
                        href={`/problems/${probId}`}
                        className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-gray-300 font-mono text-[10px] inline-flex items-center gap-1"
                      >
                        P{i + 1}
                        <ExternalLink size={9} />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

