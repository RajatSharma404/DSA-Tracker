"use client";

import dynamic from "next/dynamic";
import { Telescope } from "lucide-react";

const RetentionForecast = dynamic(
  () => import("@/components/insights/RetentionForecast").then((m) => m.RetentionForecast),
  { ssr: false, loading: () => <div className="surface h-[420px] shimmer" /> },
);
const DsaDna = dynamic(() => import("@/components/insights/DsaDna").then((m) => m.DsaDna), {
  ssr: false,
  loading: () => <div className="surface h-[520px] shimmer" />,
});
const LeetCodeLivePanel = dynamic(
  () => import("@/components/insights/LeetCodeLivePanel").then((m) => m.LeetCodeLivePanel),
  { ssr: false, loading: () => <div className="surface h-[320px] shimmer" /> },
);

export default function InsightsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <header className="flex items-center gap-3">
        <span className="grid place-items-center w-11 h-11 rounded-2xl bg-[var(--accent-primary)]/12 text-[var(--accent-primary)] border border-[var(--accent-primary)]/25">
          <Telescope size={20} />
        </span>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Insights Lab</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Predict what you&apos;ll forget, see your skill fingerprint, and mirror your LeetCode profile.
          </p>
        </div>
      </header>

      <RetentionForecast />
      <div className="grid gap-6 xl:grid-cols-2">
        <DsaDna />
        <LeetCodeLivePanel />
      </div>
    </div>
  );
}
