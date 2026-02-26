"use client";

import { useState, useEffect } from "react";
import { dsaApi, Topic } from "@/lib/api";
import { Plus, Edit2, Trash2, ArrowLeft, Save, X } from "lucide-react";
import Link from "next/link";

export default function AdminTopics() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    orderIndex: 0
  });

  const loadTopics = async () => {
    try {
      const data = await dsaApi.getTopics();
      setTopics(data);
    } catch (error) {
      console.error("Failed to load topics", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTopics();
  }, []);

  const handleEdit = (topic: Topic) => {
    setEditingId(topic.id);
    setFormData({
      name: topic.name,
      description: topic.description || "",
      orderIndex: topic.id === topic.id ? topics.indexOf(topic) : 0 // Fallback
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure? This will delete all problems in this topic!")) {
      await dsaApi.adminDeleteTopic(id);
      loadTopics();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await dsaApi.adminUpdateTopic(editingId, formData);
    } else {
      await dsaApi.adminCreateTopic(formData);
    }
    setEditingId(null);
    setIsAdding(false);
    setFormData({ name: "", description: "", orderIndex: topics.length });
    loadTopics();
  };

  if (loading) return <div className="p-8">Loading topics...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">Manage Topics</h1>
        </div>
        <button 
          onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ name: "", description: "", orderIndex: topics.length }); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold transition-colors"
        >
          <Plus size={18} />
          New Topic
        </button>
      </div>

      {(isAdding || editingId) && (
        <form onSubmit={handleSubmit} className="p-6 bg-[#111] border border-blue-500/30 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Topic Name</label>
              <input 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#050505] border border-[#222] rounded-xl px-4 py-3 focus:border-blue-500 outline-none"
                placeholder="e.g. Arrays & Hashing"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Order Index</label>
              <input 
                type="number"
                value={formData.orderIndex}
                onChange={e => setFormData({ ...formData, orderIndex: parseInt(e.target.value) })}
                className="w-full bg-[#050505] border border-[#222] rounded-xl px-4 py-3 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
            <textarea 
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#050505] border border-[#222] rounded-xl px-4 py-3 focus:border-blue-500 outline-none h-24"
              placeholder="Short description of this module..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
            <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-colors text-sm">
              <Save size={18} />
              {editingId ? "Update Topic" : "Create Topic"}
            </button>
          </div>
        </form>
      )}

      <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#222] bg-white/5">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Order</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Name</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Description</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222]">
            {topics.map((topic, index) => (
              <tr key={topic.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4 font-mono text-gray-500">{index + 1}</td>
                <td className="px-6 py-4 font-bold text-white">{topic.name}</td>
                <td className="px-6 py-4 text-gray-400 text-sm">{topic.description || "-"}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(topic)} className="p-2 hover:bg-blue-500/10 text-blue-400 rounded-lg transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(topic.id)} className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
