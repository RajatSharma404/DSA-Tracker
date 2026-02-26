"use client";

import React, { useMemo } from 'react';
import { format, subYears, eachDayOfInterval, isSameDay, startOfToday, startOfWeek, addDays } from 'date-fns';

interface ActivityHeatmapProps {
  data: Array<{ date: string, count: number }>;
}

export default function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const today = startOfToday();
  const yearAgo = subYears(today, 1);
  const startDate = startOfWeek(yearAgo);

  const days = useMemo(() => {
    return eachDayOfInterval({
      start: startDate,
      end: today
    });
  }, [startDate, today]);

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

  return (
    <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
      <div className="flex gap-1 min-w-max">
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="flex flex-col gap-1">
            {week.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const entry = data.find(d => d.date === dateStr);
              const count = entry ? entry.count : 0;
              
              return (
                <div
                  key={dateStr}
                  title={`${count} problems on ${format(day, 'MMM d, yyyy')}`}
                  className={`w-3 h-3 rounded-[2px] transition-all hover:scale-125 hover:z-10 ${getColor(count)}`}
                />
              );
            })}
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex items-center justify-between text-[10px] font-bold text-gray-600 uppercase tracking-widest">
        <div className="flex gap-4">
           <span>{format(yearAgo, 'MMM yyyy')}</span>
           <span>{format(today, 'MMM yyyy')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          <div className="w-2.5 h-2.5 bg-[#1a1a1a] rounded-[1px]" />
          <div className="w-2.5 h-2.5 bg-blue-900/40 rounded-[1px]" />
          <div className="w-2.5 h-2.5 bg-blue-500/80 rounded-[1px]" />
          <div className="w-2.5 h-2.5 bg-blue-400 rounded-[1px]" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
