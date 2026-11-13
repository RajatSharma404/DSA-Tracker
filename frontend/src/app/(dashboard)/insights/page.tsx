"use client";

import dynamic from "next/dynamic";

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
      <header>
        <div>
          <h1 className="font-serif-display text-4xl leading-tight text-[var(--text-primary)]">Insights</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-[var(--text-secondary)]">What you&apos;re about to forget, your skill fingerprint, and your LeetCode profile.</p>
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
