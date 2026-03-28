import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { BookOpen, ChevronDown, ChevronRight } from 'lucide-react';

interface TopicNodeProps {
  data: {
    label: string;
    description?: string;
    progressPercentage: number;
    solvedProblems: number;
    totalProblems: number;
    expanded?: boolean;
    hiddenCount?: number;
    onToggle?: () => void;
  };
}

const TopicNode = ({ data }: TopicNodeProps) => {
  const isCompleted = data.progressPercentage === 100;
  const [transform, setTransform] = useState('perspective(2200px) rotateX(0deg) rotateY(0deg) translateZ(0px)');
  const [glow, setGlow] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateY = ((x - rect.width / 2) / rect.width) * 1.15;
    const rotateX = -((y - rect.height / 2) / rect.height) * 0.95;

    setTransform(`perspective(2200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0px)`);
    setGlow({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };

  const resetTilt = () => {
    setTransform('perspective(2200px) rotateX(0deg) rotateY(0deg) translateZ(0px)');
    setGlow({ x: 50, y: 50 });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTilt}
      className={`relative px-5 py-4 rounded-2xl border-2 shadow-2xl backdrop-blur-xl transition-all duration-500 min-w-60 overflow-hidden will-change-transform
        ${isCompleted 
          ? 'bg-green-500/10 border-green-500 shadow-green-500/20' 
          : 'bg-[#111] border-blue-500/50 hover:border-blue-400 shadow-blue-500/10'}
      `}
      style={{ transform, transformStyle: 'flat' }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(96,165,250,0.08), transparent 40%)`,
        }}
      />
      <Handle type="target" position={Position.Top} className="bg-blue-500!" />
      
      <div className="relative z-10 flex items-center justify-between mb-3">
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

      <div className="relative z-10 space-y-1">
        <h3 className="text-lg font-black text-white leading-none">{data.label}</h3>
        {data.description && <p className="text-xs text-gray-400 line-clamp-1">{data.description}</p>}
      </div>

      <div className="relative z-10 mt-4">
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

      <div className="relative z-10 mt-3 flex items-center justify-between gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onToggle?.();
          }}
          className="px-2 py-1 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-bold uppercase tracking-wider text-gray-300 transition-colors"
        >
          {data.expanded ? 'Hide Problems' : 'Show Problems'}
        </button>
        {(data.hiddenCount || 0) > 0 && (
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">
            +{data.hiddenCount} hidden
          </span>
        )}
        <span className="text-gray-500">{data.expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}</span>
      </div>

      <Handle type="source" position={Position.Bottom} className="bg-blue-500!" />
    </div>
  );
};

export default memo(TopicNode);
