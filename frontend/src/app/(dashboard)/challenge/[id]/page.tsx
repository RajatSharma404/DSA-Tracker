"use client";

import React, { useEffect, useState, useRef } from 'react';
import { dsaApi, Problem } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { Timer, AlertTriangle, CheckCircle2, XCircle, ExternalLink, ShieldAlert } from 'lucide-react';
import { CodeEditor } from '@/components/dashboard/CodeEditor';

export default function ChallengeSimulator() {
  const { id } = useParams();
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await dsaApi.getChallenge(id as string);
        setSession(data);
        const startTime = new Date(data.startTime).getTime();
        const durationMs = data.duration * 60 * 1000;
        const now = new Date().getTime();
        const remaining = Math.max(0, Math.floor((startTime + durationMs - now) / 1000));
        
        if (data.status !== 'IN_PROGRESS') {
          setIsFinished(true);
        } else {
          setTimeLeft(remaining);
        }
      } catch (err) {
        router.push('/challenge');
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    if (timeLeft > 0 && !isFinished) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleFinish('FAILED');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timeLeft, isFinished]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleFinish = async (status: 'COMPLETED' | 'FAILED') => {
    setIsFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      await dsaApi.completeChallenge(id as string, status);
      alert(status === 'COMPLETED' ? 'Challenge successfully completed!' : 'Time is up! Challenge failed.');
    } catch (err) {
      console.error(err);
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#050505] -m-10 p-10 relative overflow-hidden">
      {/* Background Pulse for Pressure */}
      {timeLeft < 60 && !isFinished && (
        <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />
      )}

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        <div className="flex justify-between items-center bg-[#0d0d0d] border border-white/5 p-6 rounded-[2rem] sticky top-4 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-4">
             <div className="p-3 rounded-2xl bg-white/5 text-white">
                <ShieldAlert size={24} />
             </div>
             <div>
                <h2 className="text-xl font-black text-white italic tracking-tight uppercase">Active Session</h2>
                <p className="text-xs text-gray-500 font-bold tracking-widest uppercase">FAANG Simulation Mode</p>
             </div>
          </div>

          <div className={`flex items-center gap-4 px-8 py-3 rounded-2xl border-2 transition-all ${timeLeft < 60 ? 'border-red-500/50 bg-red-500/10 text-red-500' : 'border-yellow-500/50 bg-yellow-500/10 text-yellow-500'}`}>
             <Timer size={28} className={timeLeft < 60 ? 'animate-bounce' : ''} />
             <span className="text-4xl font-black tabular-nums">{formatTime(timeLeft)}</span>
          </div>

          <div className="flex gap-3">
             <button 
               onClick={() => handleFinish('COMPLETED')}
               disabled={isFinished}
               className="px-6 py-3 bg-green-500 text-black font-black uppercase tracking-tighter rounded-xl hover:bg-green-400 disabled:opacity-50 transition-all flex items-center gap-2"
             >
                <CheckCircle2 size={18} /> Finish
             </button>
             <button 
               onClick={() => router.push('/challenge')}
               className="px-6 py-3 bg-white/5 text-white font-bold rounded-xl border border-white/10 hover:bg-white/10 transition-all"
             >
                Exit
             </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {session.problems.map((prob: any, idx: number) => (
             <div key={prob.id} className="group overflow-hidden rounded-[2.5rem] bg-[#0d0d0d] border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between">
               <div className="p-8 space-y-6">
                 <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] bg-white/5 px-2 py-1 rounded">Problem 0{idx + 1}</span>
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded border ${
                         prob.difficulty === 'EASY' ? 'text-green-400 border-green-500/20 bg-green-500/10' :
                         prob.difficulty === 'MEDIUM' ? 'text-orange-400 border-orange-500/20 bg-orange-500/10' : 'text-red-400 border-red-500/20 bg-red-500/10'
                      }`}>
                         {prob.difficulty}
                      </span>
                   </div>
                   <h3 className="text-3xl font-black text-white leading-tight">{prob.title}</h3>
                   <div className="flex justify-between items-center text-sm text-gray-400 italic">
                     <p>Topic: {prob.topic.name}</p>
                     <a href={prob.link} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 flex items-center gap-1 transition-colors">
                       LeetCode <ExternalLink size={14} />
                     </a>
                   </div>
                 </div>
               </div>

               <div className="border-t border-white/5 mt-auto bg-[#1a1a1a]/50">
                 <details className="group/code">
                   <summary className="w-full p-4 text-white font-bold flex items-center justify-center gap-2 cursor-pointer outline-none hover:bg-white/5 transition-all text-sm uppercase tracking-widest list-none">
                     <span className="group-open/code:hidden flex items-center gap-2">Expand Code Editor</span>
                     <span className="hidden group-open/code:flex items-center gap-2">Collapse Editor</span>
                   </summary>
                   <div className="p-1 pb-4">
                     <CodeEditor initialCode={`/**\n * Problem: ${prob.title}\n * Language: Javascript\n */\n\nfunction solve() {\n  // Write your logic here\n  \n}\n\nconsole.log(solve());`} />
                   </div>
                 </details>
               </div>
             </div>
          ))}
        </div>

        {timeLeft < 180 && !isFinished && (
           <div className="p-6 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center gap-4 text-red-500 animate-bounce">
              <AlertTriangle size={32} />
              <div>
                <h4 className="font-black italic uppercase">Critical Pressure!</h4>
                <p className="text-sm font-medium opacity-80">Less than 3 minutes remaining. Focus purely on logic and submission!</p>
              </div>
           </div>
        )}

        {isFinished && (
           <div className={`p-10 rounded-[3rem] text-center space-y-6 ${session.status === 'COMPLETED' ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
              <div className="inline-flex p-5 rounded-full bg-white/5 mb-4">
                 {session.status === 'COMPLETED' ? <CheckCircle2 size={64} className="text-green-500" /> : <XCircle size={64} className="text-red-500" />}
              </div>
              <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Challenge {session.status}</h2>
              <p className="text-gray-400 max-w-lg mx-auto">
                {session.status === 'COMPLETED' 
                  ? 'Impressive focus. You handled the pressure and solved the assigned tasks.' 
                  : 'The clock won this round. Use the Spaced Repetition engine to master these topics and try again.'}
              </p>
              <button 
                onClick={() => router.push('/challenge')}
                className="px-10 py-4 bg-white text-black font-black uppercase rounded-2xl hover:scale-105 transition-all"
              >
                Continue Training
              </button>
           </div>
        )}
      </div>
    </div>
  );
}
