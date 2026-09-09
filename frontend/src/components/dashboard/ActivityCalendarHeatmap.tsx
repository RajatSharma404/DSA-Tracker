"use client";

import { useEffect, useState, useMemo } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import { dsaApi, HeatmapDay } from "@/lib/api";
import { Flame, Calendar as CalendarIcon } from "lucide-react";

interface ActivityCalendarHeatmapProps {
  data?: HeatmapDay[];
  className?: string;
}

export default function ActivityCalendarHeatmap({
  data: propData,
  className = "",
}: ActivityCalendarHeatmapProps) {
  const [heatmapData, setHeatmapData] = useState<HeatmapDay[]>(propData ?? []);
  const [loading, setLoading] = useState(propData === undefined);

  useEffect(() => {
    if (propData !== undefined) {
      setHeatmapData(propData);
      setLoading(false);
      return;
    }

    let isMounted = true;
    dsaApi
      .getHeatmap()
      .then((res) => {
        if (isMounted && res) {
          setHeatmapData(res);
        }
      })
      .catch((err) => {
        console.error("Failed to load activity heatmap data:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [propData]);

  const { today, yearAgo, totalSolvesYear } = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 364);

    const total = heatmapData.reduce((acc, curr) => acc + (curr.count || 0), 0);

    return {
      today: end,
      yearAgo: start,
      totalSolvesYear: total,
    };
  }, [heatmapData]);

  const getClassForValue = (value?: { date?: string; count?: number } | any): string => {
    if (!value || !value.count || value.count === 0) {
      return "color-scale-0";
    }
    if (value.count <= 2) {
      return "color-scale-1";
    }
    if (value.count <= 4) {
      return "color-scale-2";
    }
    return "color-scale-3";
  };

  return (
    <div
      id="activity-calendar-heatmap"
      className={`p-6 sm:p-8 rounded-[2.5rem] bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xl relative overflow-hidden transition-all duration-300 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 shadow-[0_0_10px_var(--accent-glow)]">
            <CalendarIcon size={20} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)] tracking-tight uppercase font-display">
              Activity Heatmap
            </h2>
            <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-0.5 font-mono">
              365-Day GitHub-style consistency trail &bull; {totalSolvesYear} problems solved in the last year
            </p>
          </div>
        </div>

        {/* Heatmap Legend */}
        <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-muted)] font-mono self-end sm:self-auto">
          <span>Less</span>
          <span
            className="w-3 h-3 rounded-[3px]"
            style={{ backgroundColor: "var(--muted)", opacity: 0.25 }}
            title="0 solves"
          />
          <span
            className="w-3 h-3 rounded-[3px]"
            style={{ backgroundColor: "var(--accent-primary)", opacity: 0.45 }}
            title="1-2 solves"
          />
          <span
            className="w-3 h-3 rounded-[3px]"
            style={{ backgroundColor: "var(--accent-primary)", opacity: 0.75 }}
            title="3-4 solves"
          />
          <span
            className="w-3 h-3 rounded-[3px]"
            style={{ backgroundColor: "var(--accent-primary)", opacity: 1 }}
            title="5+ solves"
          />
          <span>More</span>
        </div>
      </div>

      {loading ? (
        <div className="h-32 w-full bg-[var(--bg-tertiary)] animate-pulse rounded-2xl" />
      ) : (
        <div className="overflow-x-auto pb-2 scrollbar-none">
          <div className="min-w-[680px]">
            <CalendarHeatmap
              startDate={yearAgo}
              endDate={today}
              values={heatmapData}
              classForValue={getClassForValue}
              titleForValue={(value) => {
                if (!value || !value.date) return "No activity";
                return `${value.date}: ${value.count || 0} ${
                  value.count === 1 ? "problem" : "problems"
                } solved`;
              }}
              showWeekdayLabels={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
export { ActivityCalendarHeatmap };
