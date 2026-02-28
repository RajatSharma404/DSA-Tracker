"use client";

import React, { useState, useEffect } from 'react';
import { dsaApi } from '@/lib/api';
import { StickyNote, Plus, Trash2, Loader2, X, Save, Tag } from 'lucide-react';

interface Note {
  id: string;
  content: string;
  type: string;
  createdAt: string;
}

interface ProblemNotesProps {
  problemId: string;
}

const NOTE_TYPES = [
  { value: 'LEARNING', label: '💡 Learning', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { value: 'GOTCHA', label: '⚠️ Gotcha', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { value: 'TIP', label: '✨ Tip', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
];

export default function ProblemNotes({ problemId }: ProblemNotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState('LEARNING');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadNotes();
  }, [problemId]);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const data = await dsaApi.getNotes(problemId);
      setNotes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newContent.trim()) return;
    setSaving(true);
    try {
      const note = await dsaApi.createNote(problemId, newContent, newType);
      setNotes([note, ...notes]);
      setNewContent('');
      setNewType('LEARNING');
      setIsAdding(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    try {
      await dsaApi.deleteNote(noteId);
      setNotes(notes.filter(n => n.id !== noteId));
    } catch (err) {
      console.error(err);
    }
  };

  const getTypeStyle = (type: string) => {
    return NOTE_TYPES.find(t => t.value === type) || NOTE_TYPES[0];
  };

  return (
    <div className="mt-3">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <StickyNote size={12} className="text-amber-400" />
          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
            Notes {notes.length > 0 && `(${notes.length})`}
          </span>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20 text-[9px] font-black uppercase tracking-widest hover:bg-amber-500/20 transition-all"
          >
            <Plus size={10} />
            Add
          </button>
        )}
      </div>

      {/* Add Note Form */}
      {isAdding && (
        <div className="p-3 bg-[#0c0c10] border border-white/10 rounded-xl mb-3 animate-in slide-in-from-top-2 fade-in duration-200">
          {/* Type Selector */}
          <div className="flex gap-1.5 mb-2">
            {NOTE_TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => setNewType(t.value)}
                className={`px-2 py-1 rounded-lg text-[9px] font-black border transition-all ${
                  newType === t.value ? t.color : 'bg-white/5 text-gray-600 border-white/5'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Write your note... (gotchas, learnings, interview tips)"
            className="w-full bg-transparent border border-white/5 rounded-lg p-2.5 text-xs text-white placeholder:text-gray-700 outline-none resize-none h-20 focus:border-amber-500/30 transition-colors"
          />
          <div className="flex items-center justify-end gap-2 mt-2">
            <button
              onClick={() => { setIsAdding(false); setNewContent(''); }}
              className="px-3 py-1.5 text-[10px] font-bold text-gray-500 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={saving || !newContent.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-black rounded-lg text-[10px] font-black uppercase tracking-widest disabled:opacity-40 transition-all hover:shadow-lg hover:shadow-amber-500/20"
            >
              {saving ? <Loader2 size={10} className="animate-spin" /> : <Save size={10} />}
              Save
            </button>
          </div>
        </div>
      )}

      {/* Notes List */}
      {notes.length > 0 && (
        <div className="space-y-1.5">
          {notes.map(note => {
            const style = getTypeStyle(note.type);
            return (
              <div key={note.id} className="flex items-start gap-2 p-2.5 bg-white/[0.02] rounded-lg border border-white/5 group hover:border-white/10 transition-all">
                <span className={`shrink-0 px-1.5 py-0.5 ${style.color} border rounded text-[8px] font-black mt-0.5`}>
                  {style.label}
                </span>
                <p className="flex-1 text-[11px] text-gray-300 leading-relaxed break-words whitespace-pre-wrap min-w-0">{note.content}</p>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="shrink-0 p-1 text-gray-700 hover:text-red-400 rounded transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {loading && notes.length === 0 && (
        <div className="py-3 text-center">
          <Loader2 size={14} className="animate-spin text-gray-600 mx-auto" />
        </div>
      )}
    </div>
  );
}
