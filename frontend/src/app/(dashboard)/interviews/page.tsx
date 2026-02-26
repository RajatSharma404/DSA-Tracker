"use client";

import { useEffect, useState } from "react";
import { dsaApi, MockInterview } from "@/lib/api";
import { Plus, Target, CalendarDays, MessageSquare } from "lucide-react";
import { format } from "date-fns";

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<MockInterview[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [date, setDate] = useState("");
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    loadInterviews();
  }, []);

  async function loadInterviews() {
    try {
      const data = await dsaApi.getInterviews();
      setInterviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    
    try {
      await dsaApi.createInterview({
        date,
        score: score ? parseInt(score) : undefined,
        feedback: feedback || undefined
      });
      setIsAdding(false);
      setDate("");
      setScore("");
      setFeedback("");
      loadInterviews();
    } catch (err) {
      console.error("Failed to add interview", err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-600 border-t-white"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in mt-4 fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Mock Interviews</h1>
          <p className="text-gray-400">Track your performance and feedback from practice sessions.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          <Plus size={18} /> Add Session
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-[#111] border border-[#222] p-6 rounded-xl space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">Log New Interview</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Date Setup</label>
              <input 
                type="date" 
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-2.5 text-white focus:outline-none focus:border-white transition-colors"
               />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Score / 10</label>
              <input 
                type="number" 
                min="0" max="10"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="e.g. 8"
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-2.5 text-white focus:outline-none focus:border-white transition-colors"
               />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Feedback Notes</label>
            <textarea 
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What went well? What needs improvement?"
              rows={3}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white focus:outline-none focus:border-white transition-colors"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-lg font-medium text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="bg-white text-black px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Save Notes
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {interviews.length === 0 && !isAdding ? (
          <div className="text-center py-12 border border-dashed border-[#333] rounded-2xl bg-[#111]/50">
             <Target className="mx-auto h-12 w-12 text-gray-600 mb-4" />
             <h3 className="text-lg font-medium text-white mb-1">No interviews logged yet</h3>
             <p className="text-gray-500">Start tracking your mock interview performance.</p>
          </div>
        ) : (
          interviews.map((interview) => (
            <div key={interview.id} className="bg-[#111] border border-[#222] p-6 rounded-xl flex flex-col sm:flex-row gap-6">
              <div className="flex-shrink-0 flex flex-col items-center justify-center p-4 bg-[#1a1a1a] rounded-lg w-24">
                 <span className="text-3xl font-bold text-white">{interview.score || '-'}</span>
                 <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Score</span>
              </div>
              <div className="flex-1 space-y-3">
                 <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                    <CalendarDays size={16} />
                    {format(new Date(interview.date), 'MMMM d, yyyy')}
                 </div>
                 {interview.feedback ? (
                    <div className="flex gap-3">
                        <MessageSquare size={18} className="text-gray-500 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-300 leading-relaxed text-sm">{interview.feedback}</p>
                    </div>
                 ) : (
                    <p className="text-gray-600 italic text-sm">No feedback provided.</p>
                 )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
