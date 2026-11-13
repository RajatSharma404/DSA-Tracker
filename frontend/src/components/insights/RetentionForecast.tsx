"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BrainCircuit, ArrowRight, Info } from "lucide-react";
import { dsaApi, type RetentionReport } from "@/lib/api";

const pct = (n: number) => `${Math.round(n * 100)}%`;

const recallTone = (r: number) =>
  r >= 0.85 ? "text-emerald-400" : r >= 0.7 ? "text-amber-400" : "text-rose-400";

export function RetentionForecast() {
  const [report, setReport] = useState<RetentionReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dsaApi
      .getRetentionReport()
      .then(setReport)
      .catch(() => setError("Couldn't load your memory model right now."));
  }, []);

  const week = report?.forecast[7];
  const month = report?.forecast[30];
  const chartData = useMemo(
    () => (report?.forecast ?? []).map((f) => ({ ...f, recallPct: Math.round(f.averageRecall * 100) })),
    [report],
  );

  if (error) {
    return <div className="surface p-6 text-sm text-[var(--text-muted)]">{error}</div>;
  }
  if (!report) {
    return <div className="surface h-[420px] shimmer" aria-busy="true" />;
  }
  if (report.total === 0) {
    return (
      <div className="surface p-8 text-center">
        <BrainCircuit className="mx-auto mb-3 text-[var(--accent-primary)]" />
        <p className="font-semibold">No memories to model yet</p>
        <p className="text-sm text-[var(--text-muted)] mt-1">Solve a few problems and your forgetting curve appears here.</p>
      </div>
    );
  }

  return (
    <section className="surface p-5 sm:p-6" aria-labelledby="retention-title">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Memory forecast</p>
          <h2 id="retention-title" className="font-display text-xl font-bold mt-1">
            How much you&apos;ll still remember
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-1 max-w-xl">
            A forgetting-curve model over your solve and review history predicts which patterns are slipping
            before you notice.
          </p>
        </div>
        <div className="flex gap-6">
          <div>
            <div className="eyebrow">Recall today</div>
            <div className="font-display text-3xl font-bold">{pct(report.averageRecall)}</div>
          </div>
          <div>
            <div className="eyebrow">At risk now</div>
            <div className="font-display text-3xl font-bold text-rose-400">{report.atRiskNow}</div>
          </div>
          <div className="hidden sm:block">
            <div className="eyebrow">In 7 days</div>
            <div className="font-display text-3xl font-bold">{week ? week.atRisk : "—"}</div>
          </div>
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 h-64" role="img" aria-label={`Average recall falls from ${pct(report.averageRecall)} today to ${month ? pct(month.averageRecall) : "?"} in 30 days without review`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
              <defs>
                <linearGradient id="recallFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border-subtle)" vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                tickFormatter={(d) => (d === 0 ? "Today" : `+${d}d`)}
                interval={6}
              />
              <YAxis
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                tickFormatter={(v) => `${v}%`}
              />
              <ReferenceLine
                y={report.threshold * 100}
                stroke="var(--text-muted)"
                strokeDasharray="4 4"
                label={{ value: "at-risk line", position: "insideTopRight", fill: "var(--text-muted)", fontSize: 10 }}
              />
              <Tooltip
                cursor={{ stroke: "var(--border-strong)" }}
                contentStyle={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-medium)",
                  borderRadius: 12,
                  fontSize: 12,
                  color: "var(--text-primary)",
                }}
                labelFormatter={(d) => (d === 0 ? "Today" : `In ${d} days`)}
                formatter={(_v, _n, item) => {
                  const p = item.payload as { recallPct: number; atRisk: number };
                  return [`${p.recallPct}% avg recall · ${p.atRisk} at risk`, "Without review"];
                }}
              />
              <Area
                type="monotone"
                dataKey="recallPct"
                stroke="var(--accent-primary)"
                strokeWidth={2}
                fill="url(#recallFill)"
                activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--bg-card)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">Fading fastest</h3>
            <Link href="/review" className="text-xs text-[var(--accent-primary)] inline-flex items-center gap-1 hover:underline">
              Review queue <ArrowRight size={12} />
            </Link>
          </div>
          <ul className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {report.items.slice(0, 8).map((item) => (
              <li key={item.problemId}>
                <Link
                  href={`/problems/${item.problemId}`}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{item.title}</div>
                    <div className="text-[11px] text-[var(--text-muted)] truncate">
                      {item.topic} · last touched {Math.round(item.daysSinceReview)}d ago
                    </div>
                  </div>
                  <span className={`font-mono text-sm font-bold ${recallTone(item.recall)}`}>{pct(item.recall)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {report.topics.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold mb-3">Recall by topic</h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {report.topics.slice(0, 9).map((t) => (
              <div key={t.topic} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="truncate font-medium">{t.topic}</span>
                  <span className="font-mono text-[var(--text-secondary)]">{pct(t.averageRecall)}</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--accent-primary)]"
                    style={{ width: pct(t.averageRecall), opacity: 0.4 + t.averageRecall * 0.6 }}
                  />
                </div>
                <div className="mt-1 text-[10px] text-[var(--text-muted)]">
                  {t.count} solved{t.atRisk ? ` · ${t.atRisk} at risk` : ""}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mt-5 flex items-start gap-1.5 text-[11px] text-[var(--text-muted)]">
        <Info size={12} className="mt-px shrink-0" />
        Model: power forgetting curve R = (1 + t/9S)⁻¹, with stability S from your spaced-repetition interval,
        ease and problem difficulty. Reviewing an item resets its curve.
      </p>
    </section>
  );
}
