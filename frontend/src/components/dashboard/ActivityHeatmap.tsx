"use client";

import { useMemo, useState } from "react";

interface ActivityHeatmapProps {
  data: Array<{ date: string; count: number }>;
}

const DAY = 86_400_000;
const WEEKS = 53;

const keyOf = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Accent shades, tuned to read on every theme (level 0 = empty). */
const LEVEL_BG = [
  "var(--bg-tertiary)",
  "color-mix(in oklab, var(--accent-primary) 28%, var(--bg-tertiary))",
  "color-mix(in oklab, var(--accent-primary) 50%, var(--bg-tertiary))",
  "color-mix(in oklab, var(--accent-primary) 74%, var(--bg-tertiary))",
  "var(--accent-primary)",
];

export function buildYearGrid(data: ActivityHeatmapProps["data"], today = new Date()) {
  const counts = new Map<string, number>();
  for (const d of data) counts.set(d.date, (counts.get(d.date) || 0) + d.count);

  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  // Start on the Sunday 52 weeks before this week's Sunday.
  const start = new Date(end.getTime() - ((WEEKS - 1) * 7 + end.getDay()) * DAY);

  const weeks: Array<Array<{ date: string; count: number; future: boolean; month: number; day: number }>> = [];
  for (let w = 0; w < WEEKS; w++) {
    const col = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + w * 7 + d);
      const k = keyOf(date);
      col.push({ date: k, count: counts.get(k) || 0, future: date > end, month: date.getMonth(), day: date.getDate() });
    }
    weeks.push(col);
  }

  const cells = weeks.flat().filter((c) => !c.future);
  const total = cells.reduce((s, c) => s + c.count, 0);
  const activeDays = cells.filter((c) => c.count > 0).length;
  let best = 0;
  let run = 0;
  for (const c of cells) {
    run = c.count > 0 ? run + 1 : 0;
    best = Math.max(best, run);
  }
  // Current streak counts back from today (today may still be empty).
  let current = 0;
  for (let i = cells.length - 1; i >= 0; i--) {
    if (cells[i].count > 0) current++;
    else if (i === cells.length - 1) continue;
    else break;
  }
  const max = Math.max(1, ...cells.map((c) => c.count));
  return { weeks, total, activeDays, best, current, max };
}

const level = (count: number, max: number) => (count === 0 ? 0 : Math.min(4, Math.ceil((count / max) * 4)));
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const grid = useMemo(() => buildYearGrid(data), [data]);
  const [hover, setHover] = useState<{ date: string; count: number } | null>(null);

  const monthLabels = grid.weeks.map((week, i) => {
    const first = week.find((c) => c.day === 1);
    return first && i < WEEKS - 1 ? MONTHS[first.month] : null;
  });

  const summary = [
    { label: "Solved this year", value: grid.total },
    { label: "Active days", value: grid.activeDays },
    { label: "Current streak", value: `${grid.current}d` },
    { label: "Best streak", value: `${grid.best}d` },
  ];

  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
        {summary.map((s) => (
          <div key={s.label}>
            <dt className="text-xs text-[var(--text-muted)]">{s.label}</dt>
            <dd className="text-lg font-semibold tabular text-[var(--text-primary)]">{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div
            className="grid gap-[3px] text-[10px] text-[var(--text-muted)]"
            style={{ gridTemplateColumns: `24px repeat(${WEEKS}, minmax(0, 1fr))` }}
          >
            <span />
            {monthLabels.map((m, i) => (
              <span key={i} className="whitespace-nowrap leading-4">
                {m}
              </span>
            ))}
          </div>
          <div
            className="mt-1 grid gap-[3px]"
            style={{ gridTemplateColumns: `24px repeat(${WEEKS}, minmax(0, 1fr))` }}
            role="img"
            aria-label={`${grid.total} problems solved over the last year across ${grid.activeDays} active days`}
            onMouseLeave={() => setHover(null)}
          >
            <div className="grid grid-rows-7 gap-[3px] text-[10px] leading-none text-[var(--text-muted)]">
              {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
                <span key={i} className="flex items-center">
                  {d}
                </span>
              ))}
            </div>
            {grid.weeks.map((week, w) => (
              <div key={w} className="grid grid-rows-7 gap-[3px]">
                {week.map((c) => (
                  <span
                    key={c.date}
                    className="aspect-square rounded-[3px]"
                    style={{
                      background: c.future ? "transparent" : LEVEL_BG[level(c.count, grid.max)],
                      outline: hover?.date === c.date ? "1px solid var(--text-primary)" : undefined,
                    }}
                    onMouseEnter={() => !c.future && setHover({ date: c.date, count: c.count })}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span aria-live="polite" className="tabular">
          {hover
            ? `${hover.count} solved on ${new Date(`${hover.date}T00:00:00`).toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}`
            : "Hover a day for details"}
        </span>
        <span className="flex items-center gap-1.5">
          Less
          {LEVEL_BG.map((bg, i) => (
            <span key={i} className="h-2.5 w-2.5 rounded-[3px]" style={{ background: bg }} />
          ))}
          More
        </span>
      </div>
    </div>
  );
}
