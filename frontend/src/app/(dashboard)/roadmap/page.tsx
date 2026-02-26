"use client";

import RoadmapGraph from "@/components/roadmap/RoadmapGraph";
import { Network, Activity, Info } from "lucide-react";

export default function RoadmapPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-4">
             <Network size={12} /> Live Visualizer
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            The Interactive <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Curriculum</span>
          </h1>
          <p className="text-gray-400 mt-2 max-w-xl text-sm font-medium">
            Explore your learning journey through a live graph. Follow the optimal path from fundamentals to advanced algorithmic mastery.
          </p>
        </div>

        <div className="flex items-center gap-6 pb-2">
            <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Navigation</span>
                <span className="text-xs text-white">Pan & Zoom</span>
            </div>
            <div className="flex flex-col border-l border-white/10 pl-6">
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Real-time</span>
                <span className="text-xs text-white">Auto-updating</span>
            </div>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        <RoadmapGraph />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-8 rounded-[2rem] bg-[#0d0d0d] border border-white/5 flex items-start gap-6">
           <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400">
             <Activity size={24} />
           </div>
           <div>
             <h3 className="text-lg font-bold text-white mb-2">Hierarchical Flow</h3>
             <p className="text-sm text-gray-500 leading-relaxed">
               The curriculum is structured following dependent patterns. Mastering "Arrays" unlocks "Two Pointers", which branches out to "Sliding Window" and more.
             </p>
           </div>
        </div>
        <div className="p-8 rounded-[2rem] bg-[#0d0d0d] border border-white/5 flex items-start gap-6">
           <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-400">
             <Info size={24} />
           </div>
           <div>
             <h3 className="text-lg font-bold text-white mb-2">Live Progress</h3>
             <p className="text-sm text-gray-500 leading-relaxed">
               Every block you complete in your topics page is instantly reflected here. Nodes turn green and edges turn solid as you pave your path to mastery.
             </p>
           </div>
        </div>
      </div>
    </div>
  );
}
