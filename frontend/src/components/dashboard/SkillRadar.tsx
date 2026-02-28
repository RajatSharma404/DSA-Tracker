"use client";

import React, { useEffect, useState } from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { dsaApi } from '@/lib/api';
import { Shield, Target, Trophy, Loader2 } from 'lucide-react';

export default function SkillRadar() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const stats = await dsaApi.getMasteryStats();
        setData(stats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center bg-[#0d0d0d] border border-white/5 rounded-[2rem]">
        <Loader2 className="animate-spin text-blue-500" />
      </div>
    );
  }

  const averageMastery = data.length > 0 
    ? Math.round(data.reduce((acc, curr) => acc + curr.A, 0) / data.length)
    : 0;

  return (
    <div className="relative p-8 rounded-[2rem] bg-[#0d0d0d] border border-white/5 overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-all duration-700" />
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-white tracking-tight uppercase flex items-center gap-2">
            <Target size={20} className="text-blue-400" />
            Mastery Radar
          </h3>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Multi-dimensional skill analysis</p>
        </div>
        <div className="flex flex-col items-end">
           <span className="text-2xl font-black text-white italic">{averageMastery}%</span>
           <span className="text-[9px] font-black text-blue-500/50 uppercase tracking-tighter">Overall Rank</span>
        </div>
      </div>

      <div className="h-[300px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#222" strokeDasharray="3 3" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#666', fontSize: 10, fontWeight: 700 }}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#121212', 
                border: '1px solid #333',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
              itemStyle={{ color: '#60a5fa' }}
            />
            <Radar
              name="Mastery"
              dataKey="A"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              animationDuration={1500}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
         <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2 text-blue-400 mb-1">
               <Shield size={14} />
               <span className="text-[10px] font-black uppercase tracking-widest">Strength</span>
            </div>
            <p className="text-sm font-bold text-white truncate">
               {data.sort((a,b) => b.A - a.A)[0]?.subject || 'N/A'}
            </p>
         </div>
         <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2 text-purple-400 mb-1">
               <Trophy size={14} />
               <span className="text-[10px] font-black uppercase tracking-widest">Growth</span>
            </div>
            <p className="text-sm font-bold text-white truncate">
               {data.sort((a,b) => a.A - b.A).find(d => d.A < 100)?.subject || 'Advanced'}
            </p>
         </div>
      </div>
    </div>
  );
}
