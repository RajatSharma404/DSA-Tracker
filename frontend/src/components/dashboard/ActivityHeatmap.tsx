"use client";

import React, { useMemo, useState } from "react";
import {
  format,
  eachDayOfInterval,
  getYear,
  startOfYear,
  endOfYear,
  isSameMonth,
} from "date-fns";
import { Calendar } from "lucide-react";

interface ActivityHeatmapProps {
  data: Array<{ date: string; count: number }>;
}

export default function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const today = new Date();
  const currentYear = getYear(today);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const isValidActivityYear = (year: number) =>
    year >= 2000 && year <= currentYear;

  // Determine available years from data and current year
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(currentYear);
    data.forEach((entry) => {
      const parsedYear = getYear(new Date(entry.date));
      if (isValidActivityYear(parsedYear)) {
        years.add(parsedYear);
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [data, currentYear]);

  React.useEffect(() => {
    if (!availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0] ?? currentYear);
    }
  }, [availableYears, selectedYear, currentYear]);

  // Always show Jan 1 → Dec 31 (clamp future days to today for current year)
  const { startDate, endDate } = useMemo(() => {
    // Use exact Jan 1 — do NOT go back to start-of-week as that bleeds into December
    const yearStart = startOfYear(new Date(selectedYear, 0, 1));
    const yearEnd = endOfYear(new Date(selectedYear, 11, 31));
    return {
      startDate: yearStart,
      endDate: selectedYear === currentYear ? today : yearEnd,
    };
  }, [selectedYear, currentYear]);

  const days = useMemo(() => {
    return eachDayOfInterval({
      start: startDate,
      end: endDate,
    });
  }, [startDate, endDate]);

  const activityByDate = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((entry) => {
      const normalizedDate = String(entry.date).split("T")[0];
      if (!normalizedDate) return;
      map.set(normalizedDate, (map.get(normalizedDate) || 0) + entry.count);
    });
    return map;
  }, [data]);

  const getColor = (count: number) => {
    if (count === 0) return "bg-[#1a1a1a]";
    if (count <= 2) return "bg-blue-900/40";
    if (count <= 4) return "bg-blue-700/60";
    if (count <= 6) return "bg-blue-500/80";
    return "bg-blue-400";
  };

  // Group days into Monday-first weeks, padded with null placeholders.
  const weeks = useMemo(() => {
    const paddedDays: Array<Date | null> = [];
    const mondayFirstOffset = (startDate.getDay() + 6) % 7;

    for (let i = 0; i < mondayFirstOffset; i += 1) {
      paddedDays.push(null);
    }

    paddedDays.push(...days);

    while (paddedDays.length % 7 !== 0) {
      paddedDays.push(null);
    }

    const grouped: Array<Array<Date | null>> = [];
    for (let i = 0; i < paddedDays.length; i += 7) {
      grouped.push(paddedDays.slice(i, i + 7));
    }

    return grouped;
  }, [days, startDate]);

  // Calculate month labels and their positions
  const monthLabels = useMemo(() => {
    const labels: Array<{ label: string; index: number }> = [];
    weeks.forEach((week, index) => {
      const firstDay = week.find((d) => d !== null);
      if (!firstDay) return;

      const prevFirstDay =
        index > 0 ? weeks[index - 1].find((d) => d !== null) : null;

      if (
        index === 0 ||
        !prevFirstDay ||
        !isSameMonth(firstDay, prevFirstDay)
      ) {
        // Avoid overlapping labels if too close
        if (
          labels.length === 0 ||
          index - labels[labels.length - 1].index > 2
        ) {
          labels.push({
            label: format(firstDay, "MMM"),
            index,
          });
        }
      }
    });
    return labels;
  }, [weeks]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-widest text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>
              {data.reduce((acc, curr) => acc + curr.count, 0)} Solved
            </span>
          </div>
        </div>

        {/* Year Selection */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
          {availableYears.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                selectedYear === year
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      <div className="relative border border-white/5 bg-white/1 p-6 rounded-4xl overflow-hidden group/heatmap">
        {/* Watermark Icon */}
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover/heatmap:opacity-[0.05] transition-opacity duration-700">
          <Calendar size={120} className="text-white" />
        </div>

        <div className="overflow-x-auto scrollbar-hide pb-4 w-full">
          <div className="min-w-max flex flex-col">
            {/* Month labels */}
            <div className="flex mb-3 text-[9px] text-gray-500 font-black uppercase tracking-widest h-4">
              <div className="w-10 shrink-0" />
              <div
                className="relative ml-4"
                style={{ width: `${weeks.length * 15 - 4}px` }}
              >
                {monthLabels.map((ml, i) => (
                  <div
                    key={i}
                    className="absolute transition-all duration-500"
                    style={{ left: `${(ml.index / weeks.length) * 100}%` }}
                  >
                    {ml.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              {/* Day labels */}
              <div className="flex flex-col justify-between text-[8px] text-gray-600 font-black uppercase py-1 w-10 shrink-0">
                <span className="h-2.75 leading-2.75">Mon</span>
                <span className="h-2.75 leading-2.75 opacity-0">Tue</span>
                <span className="h-2.75 leading-2.75">Wed</span>
                <span className="h-2.75 leading-2.75 opacity-0">Thu</span>
                <span className="h-2.75 leading-2.75">Fri</span>
                <span className="h-2.75 leading-2.75 opacity-0">Sat</span>
                <span className="h-2.75 leading-2.75 opacity-0">Sun</span>
              </div>

              {/* The Grid */}
              <div className="flex gap-1 flex-1">
                {weeks.map((week, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-1">
                    {week.map((day, dayIdx) => {
                      const dateStr = day ? format(day, "yyyy-MM-dd") : "";
                      const count = dateStr
                        ? (activityByDate.get(dateStr) ?? 0)
                        : 0;
                      const isPlaceholder = !day;

                      return (
                        <div
                          key={dateStr || `placeholder-${weekIdx}-${dayIdx}`}
                          title={
                            isPlaceholder
                              ? undefined
                              : `${count} problems on ${format(day, "MMM d, yyyy")}`
                          }
                          className={`w-2.75 h-2.75 rounded-xs transition-all ${isPlaceholder ? "opacity-0" : `hover:scale-125 hover:z-10 ${getColor(count)}`}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-gray-600">
          <div className="flex items-center gap-2">
            <span className="opacity-50">Mastery Consistency</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="opacity-50">Less</span>
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 bg-[#1a1a1a] rounded-xs" />
              <div className="w-2.5 h-2.5 bg-blue-900/40 rounded-xs" />
              <div className="w-2.5 h-2.5 bg-blue-700/60 rounded-xs" />
              <div className="w-2.5 h-2.5 bg-blue-500/80 rounded-xs" />
              <div className="w-2.5 h-2.5 bg-blue-400 rounded-xs" />
            </div>
            <span className="opacity-50">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
