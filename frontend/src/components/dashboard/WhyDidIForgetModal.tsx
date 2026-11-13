"use client";

import { useEffect, useState } from "react";
import {
  Brain,
  X,
  Loader2,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Copy,
} from "lucide-react";
import { dsaApi } from "@/lib/api";
import { toast } from "sonner";

interface WhyDidIForgetModalProps {
  problemId: string;
  problemTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ForgotAnalysis {
  cognitiveFailurePoint: string;
  missedInvariant: string;
  suggestedNoteDraft: string;
}

export default function WhyDidIForgetModal({
  problemId,
  problemTitle,
  isOpen,
  onClose,
}: WhyDidIForgetModalProps) {
  const [analysis, setAnalysis] = useState<ForgotAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingNote, setSavingNote] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isOpen || !problemId) return;

    setLoading(true);
    setSaved(false);
    dsaApi
      .getForgotAnalysis(problemId)
      .then((res: any) => {
        if (res?.analysis) {
          setAnalysis(res.analysis);
        }
      })
      .catch((err) => {
        console.error("Forgot analysis failed:", err);
        toast.error("Failed to diagnose recall failure");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen, problemId]);

  if (!isOpen) return null;

  const handleSaveToNotes = async () => {
    if (!analysis?.suggestedNoteDraft) return;

    setSavingNote(true);
    try {
      await dsaApi.createNote(problemId, analysis.suggestedNoteDraft, "GOTCHA");
      setSaved(true);
      toast.success("Suggested flashcard note saved to problem notes!");
    } catch {
      toast.error("Failed to save note draft");
    } finally {
      setSavingNote(false);
    }
  };

  const handleCopyNote = () => {
    if (!analysis?.suggestedNoteDraft) return;
    navigator.clipboard.writeText(analysis.suggestedNoteDraft);
    toast.success("Note copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[var(--bg-card)] p-6 shadow-2xl relative space-y-5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Brain size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Why Did I Forget This?
              </h2>
              <p className="text-xs text-gray-400">
                Cognitive diagnosis for &ldquo;{problemTitle}&rdquo;
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
            <Loader2 size={24} className="animate-spin text-purple-400" />
            <p className="text-xs text-gray-400 font-mono">
              Analyzing interval lapse history and cognitive failure points...
            </p>
          </div>
        ) : analysis ? (
          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
            {/* Cognitive Failure Point */}
            <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/15 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400 font-mono flex items-center gap-1.5">
                <AlertCircle size={12} />
                Cognitive Failure Mode
              </span>
              <p className="text-xs text-rose-200/90 leading-relaxed font-medium">
                {analysis.cognitiveFailurePoint}
              </p>
            </div>

            {/* Missed Invariant */}
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/15 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 font-mono flex items-center gap-1.5">
                <Lightbulb size={12} />
                Missed Algorithmic Invariant
              </span>
              <p className="text-xs text-amber-200/90 leading-relaxed font-medium">
                {analysis.missedInvariant}
              </p>
            </div>

            {/* Flashcard Note Draft */}
            <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/15 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400 font-mono flex items-center gap-1.5">
                  <BookOpen size={12} />
                  Suggested Flashcard Note Draft
                </span>
                <button
                  onClick={handleCopyNote}
                  className="p-1 rounded text-purple-300 hover:text-white transition-colors"
                  title="Copy Draft"
                >
                  <Copy size={12} />
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-purple-100 whitespace-pre-wrap leading-relaxed">
                {analysis.suggestedNoteDraft}
              </pre>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-gray-500">
            Diagnosis unavailable at this moment.
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 transition-colors"
          >
            Dismiss
          </button>

          {analysis && (
            <button
              onClick={handleSaveToNotes}
              disabled={savingNote || saved}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                saved
                  ? "bg-emerald-600 text-white cursor-default"
                  : "bg-purple-600 hover:bg-purple-500 text-white active:scale-95"
              }`}
            >
              {savingNote ? (
                <Loader2 size={13} className="animate-spin" />
              ) : saved ? (
                <CheckCircle2 size={13} />
              ) : (
                <BookOpen size={13} />
              )}
              {saved ? "Saved to Notes" : "Save Note with 1 Click"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
