"use client";

import React, { useEffect, useState } from "react";
import { dsaApi, Topic } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Timer, Zap, Trophy, ShieldAlert } from "lucide-react";

export default function ChallengeSelection() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [duration, setDuration] = useState(30);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    dsaApi.getTopics().then(setTopics);
  }, []);

  const handleStart = async () => {
    if (!selectedTopic) return;
    setLoading(true);
    try {
      const session = await dsaApi.startChallenge(selectedTopic, duration);
      router.push(`/challenge/${session.id}`);
    } catch (err) {
      alert("Failed to start challenge");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4">
        <div className="inline-flex p-3 rounded-2xl bg-yellow-500/10 text-yellow-500 mb-2">
          <Zap size={32} />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight italic uppercase">
          Interview Pressure Simulator
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Train your brain to solve problems under strict time constraints and
          psychological pressure.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="p-8 rounded-4xl bg-[#0d0d0d] border border-white/5 space-y-8">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert size={20} className="text-red-500" />
            Challenge Settings
          </h3>

          <div className="space-y-4">
            <label className="block text-xs font-black uppercase text-gray-500 tracking-widest">
              Select Topic
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#222] rounded-xl px-4 py-4 text-white outline-none focus:border-yellow-500/50 transition-colors"
            >
              <option value="">Choose a domain...</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <label className="block text-xs font-black uppercase text-gray-500 tracking-widest">
              Duration (Minutes)
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[20, 30, 45].map((m) => (
                <button
                  key={m}
                  onClick={() => setDuration(m)}
                  className={`py-3 rounded-xl border font-bold transition-all ${duration === m ? "bg-white text-black border-white" : "bg-transparent border-[#222] text-gray-400 hover:border-gray-600"}`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={loading || !selectedTopic}
            className="w-full py-5 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-tighter rounded-2xl transition-all shadow-xl shadow-yellow-500/10 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? "Generating Challenge..." : "Enter the Arena"}
            <Zap size={18} fill="currentColor" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/20">
            <h4 className="font-bold text-blue-400 flex items-center gap-2 mb-2">
              <Timer size={18} /> Forced Focus
            </h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              The clock never stops. Simulate the high-stakes environment where
              every second counts.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-purple-500/5 border border-purple-500/20">
            <h4 className="font-bold text-purple-400 flex items-center gap-2 mb-2">
              <Trophy size={18} /> Performance Metrics
            </h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your results are recorded to track your "Pressure Score"—an
              indicator of your readiness for real FAANG interviews.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
