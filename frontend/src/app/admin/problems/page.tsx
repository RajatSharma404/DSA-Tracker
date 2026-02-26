"use client";

import { useState, useEffect } from "react";
import { dsaApi, Problem, Topic } from "@/lib/api";
import { Plus, Edit2, Trash2, ArrowLeft, Save, X, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function AdminProblems() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    link: "",
    difficulty: "EASY" as "EASY" | "MEDIUM" | "HARD",
    topicId: "",
    orderIndex: 0
  });

  const loadInitialData = async () => {
    try {
      const topicData = await dsaApi.getTopics();
      setTopics(topicData);
      if (topicData.length > 0) {
        const firstTopicId = topicData[0].id;
        setSelectedTopicId(firstTopicId);
        loadProblems(firstTopicId);
      }
    } catch (error) {
      console.error("Failed to load topics", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProblems = async (topicId: string) => {
    try {
      const probData = await dsaApi.getTopicProblems(topicId);
      setProblems(probData);
    } catch (error) {
      console.error("Failed to load problems", error);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedTopicId) {
      loadProblems(selectedTopicId);
    }
  }, [selectedTopicId]);

  const handleEdit = (prob: Problem) => {
    setEditingId(prob.id);
    setFormData({
      title: prob.title,
      link: prob.link || "",
      difficulty: prob.difficulty,
      topicId: prob.topicId,
      orderIndex: prob.orderIndex
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this problem?")) {
      await dsaApi.adminDeleteProblem(id);
      loadProblems(selectedTopicId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, topicId: selectedTopicId }; // Force current topic
    if (editingId) {
      await dsaApi.adminUpdateProblem(editingId, payload);
    } else {
      await dsaApi.adminCreateProblem({ ...payload, orderIndex: problems.length });
    }
    setEditingId(null);
    setIsAdding(false);
    setFormData({ title: "", link: "", difficulty: "EASY", topicId: selectedTopicId, orderIndex: 0 });
    loadProblems(selectedTopicId);
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">Manage Problems</h1>
        </div>
        
        <div className="flex items-center gap-4">
            <select 
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="bg-[#111] border border-[#222] rounded-xl px-4 py-2 text-sm focus:border-blue-500 outline-none"
            >
                {topics.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                ))}
            </select>
            
            <button 
                onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ ...formData, topicId: selectedTopicId }); }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-bold transition-colors whitespace-nowrap"
            >
                <Plus size={18} />
                New Problem
            </button>
        </div>
      </div>

      {(isAdding || editingId) && (
        <form onSubmit={handleSubmit} className="p-6 bg-[#111] border border-purple-500/30 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Problem Title</label>
              <input 
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-[#050505] border border-[#222] rounded-xl px-4 py-3 focus:border-purple-500 outline-none"
                placeholder="e.g. Two Sum"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Difficulty</label>
              <select 
                value={formData.difficulty}
                onChange={e => setFormData({ ...formData, difficulty: e.target.value as any })}
                className="w-full bg-[#050505] border border-[#222] rounded-xl px-4 py-3 focus:border-purple-500 outline-none"
              >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Problem Link (URL)</label>
            <input 
              value={formData.link}
              onChange={e => setFormData({ ...formData, link: e.target.value })}
              className="w-full bg-[#050505] border border-[#222] rounded-xl px-4 py-3 focus:border-purple-500 outline-none"
              placeholder="https://leetcode.com/problems/..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
            <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-colors text-sm">
              <Save size={18} />
              {editingId ? "Update Problem" : "Add Problem"}
            </button>
          </div>
        </form>
      )}

      <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#222] bg-white/5">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Problem</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Difficulty</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222]">
            {problems.length > 0 ? (
                problems.map((prob) => (
                    <tr key={prob.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className={`h-2 w-2 rounded-full ${
                             prob.difficulty === 'EASY' ? 'bg-green-500/50' : 
                             prob.difficulty === 'MEDIUM' ? 'bg-orange-500/50' : 'bg-red-500/50'
                        }`} />
                      </td>
                      <td className="px-6 py-4 font-bold text-white">
                        <div className="flex items-center gap-2">
                            {prob.title}
                            {prob.link && (
                                <a href={prob.link} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-white transition-colors">
                                    <ExternalLink size={14} />
                                </a>
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded ${
                            prob.difficulty === 'EASY' ? 'text-green-400 bg-green-400/10' : 
                            prob.difficulty === 'MEDIUM' ? 'text-orange-400 bg-orange-400/10' : 'text-red-400 bg-red-400/10'
                        }`}>
                            {prob.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEdit(prob)} className="p-2 hover:bg-purple-500/10 text-purple-400 rounded-lg transition-colors">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDelete(prob.id)} className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                ))
            ) : (
                <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">No problems found for this topic.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
