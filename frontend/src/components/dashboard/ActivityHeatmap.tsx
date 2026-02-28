"use client";

import React, { useMemo, useState } from 'react';
import { format, subYears, eachDayOfInterval, isSameDay, startOfToday, startOfWeek, endOfWeek, isFirstDayOfMonth, getYear, startOfYear, endOfYear, eachYearOfInterval, isSameMonth } from 'date-fns';
import { Calendar } from 'lucide-react';

interface ActivityHeatmapProps {
  data: Array<{ date: string, count: number }>;
}

export default function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const today = startOfToday();
  const [selectedYear, setSelectedYear] = useState<number>(getYear(today));

  // Determine available years from data and current date
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(getYear(today));
    data.forEach(entry => {
      years.add(getYear(new Date(entry.date)));
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [data, today]);

  const { startDate, endDate } = useMemo(() => {
    if (selectedYear === getYear(today)) {
      const end = today;
      const start = startOfWeek(subYears(today, 1));
      return { startDate: start, endDate: end };
    } else {
      const start = startOfWeek(startOfYear(new Date(selectedYear, 0, 1)));
      const end = endOfYear(new Date(selectedYear, 11, 31));
      return { startDate: start, endDate: end };
    }
  }, [selectedYear, today]);

  const days = useMemo(() => {
    return eachDayOfInterval({
      start: startDate,
      end: endDate
    });
  }, [startDate, endDate]);

  const getColor = (count: number) => {
    if (count === 0) return 'bg-[#1a1a1a]';
    if (count <= 2) return 'bg-blue-900/40';
    if (count <= 4) return 'bg-blue-700/60';
    if (count <= 6) return 'bg-blue-500/80';
    return 'bg-blue-400';
  };

  // Group days into weeks
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  days.forEach((day, i) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || i === days.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  // Calculate month labels and their positions
  const monthLabels = useMemo(() => {
    const labels: Array<{ label: string, index: number }> = [];
    weeks.forEach((week, index) => {
      const firstDay = week[0];
      if (index === 0 || !isSameMonth(firstDay, weeks[index - 1][0])) {
        // Avoid overlapping labels if too close
        if (labels.length === 0 || index - labels[labels.length - 1].index > 2) {
          labels.push({
            label: format(firstDay, 'MMM'),
            index
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
              <span>{data.reduce((acc, curr) => acc + curr.count, 0)} Solved</span>
           </div>
        </div>
        
        {/* Year Selection */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
          {availableYears.map(year => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                selectedYear === year 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      <div className="relative border border-white/5 bg-white/[0.01] p-6 rounded-[2rem] overflow-hidden group/heatmap">
        {/* Watermark Icon */}
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover/heatmap:opacity-[0.05] transition-opacity duration-700">
           <Calendar size={120} className="text-white" />
        </div>
        
        {/* Month labels */}
        <div className="flex mb-3 text-[9px] text-gray-500 font-black uppercase tracking-widest h-4">
          <div className="w-10 shrink-0" />
          <div className="flex-1 relative flex">
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
             <span className="h-[11px] leading-[11px]">Mon</span>
             <span className="h-[11px] leading-[11px] opacity-0">Tue</span>
             <span className="h-[11px] leading-[11px]">Wed</span>
             <span className="h-[11px] leading-[11px] opacity-0">Thu</span>
             <span className="h-[11px] leading-[11px]">Fri</span>
             <span className="h-[11px] leading-[11px] opacity-0">Sat</span>
             <span className="h-[11px] leading-[11px] opacity-0">Sun</span>
          </div>

          {/* The Grid */}
          <div className="flex gap-[4px] flex-1 overflow-x-auto scrollbar-hide pb-2">
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-[4px]">
                {week.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const entry = data.find(d => d.date === dateStr);
                  const count = entry ? entry.count : 0;
                  const isOutside = selectedYear !== getYear(today) && getYear(day) !== selectedYear;

                  return (
                    <div
                      key={dateStr}
                      title={isOutside ? undefined : `${count} problems on ${format(day, 'MMM d, yyyy')}`}
                      className={`w-[11px] h-[11px] rounded-[2px] transition-all hover:scale-125 hover:z-10 ${isOutside ? 'opacity-0' : getColor(count)}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-gray-600">
          <div className="flex items-center gap-2">
             <span className="opacity-50">Mastery Consistency</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="opacity-50">Less</span>
            <div className="flex gap-[4px]">
                <div className="w-[10px] h-[10px] bg-[#1a1a1a] rounded-[2px]" />
                <div className="w-[10px] h-[10px] bg-blue-900/40 rounded-[2px]" />
                <div className="w-[10px] h-[10px] bg-blue-700/60 rounded-[2px]" />
                <div className="w-[10px] h-[10px] bg-blue-500/80 rounded-[2px]" />
                <div className="w-[10px] h-[10px] bg-blue-400 rounded-[2px]" />
            </div>
            <span className="opacity-50">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
