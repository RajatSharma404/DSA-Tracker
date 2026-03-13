import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { BookOpen, CheckCircle2, Circle } from 'lucide-react';

interface TopicNodeProps {
  data: {
    label: string;
    description?: string;
    progressPercentage: number;
    solvedProblems: number;
    totalProblems: number;
  };
}

const TopicNode = ({ data }: TopicNodeProps) => {
  const isCompleted = data.progressPercentage === 100;

  return (
    <div className={`px-5 py-4 rounded-2xl border-2 shadow-2xl backdrop-blur-xl transition-all duration-500 min-w-[240px]
      ${isCompleted 
        ? 'bg-green-500/10 border-green-500 shadow-green-500/20' 
        : 'bg-[#111] border-blue-500/50 hover:border-blue-400 shadow-blue-500/10'}
    `}>
      <Handle type="target" position={Position.Top} className="!bg-blue-500" />
      
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
          <BookOpen size={20} />
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Topic</p>
          <p className={`text-xs font-bold ${isCompleted ? 'text-green-400' : 'text-blue-400'}`}>
            {data.solvedProblems}/{data.totalProblems}
          </p>
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-black text-white leading-none">{data.label}</h3>
        {data.description && <p className="text-xs text-gray-400 line-clamp-1">{data.description}</p>}
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter mb-1 text-gray-500">
          <span>Progress</span>
          <span>{data.progressPercentage}%</span>
        </div>
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
            style={{ width: `${data.progressPercentage}%` }}
          />
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
    </div>
  );
};

export default memo(TopicNode);
