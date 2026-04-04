/**
 * Review Form Component - Code Input and Submission Selection
 */

"use client";

import { useState, useEffect } from "react";
import { Code, Loader2, Zap, Trash2, Terminal, Sparkles } from "lucide-react";
import { useAsync } from "@/hooks";
import { dsaApi } from "@/lib/api";
import { useToastNotification } from "@/components/providers/ToastProvider";

interface ReviewFormProps {
  problemId: string;
  problemTitle: string;
  code: string;
  onCodeChange: (code: string) => void;
  onReview: () => Promise<void>;
  isReviewing: boolean;
}

interface Submission {
  id: string;
  statusDisplay: string;
  lang: string;
  timestamp: number;
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");

export function ReviewForm({
  problemId,
  problemTitle,
  code,
  onCodeChange,
  onReview,
  isReviewing,
}: ReviewFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<
    string | null
  >(null);
  const { success, error } = useToastNotification();

  const {
    data: submissions,
    loading: fetchingSubs,
    execute: loadSubmissions,
  } = useAsync(async () => {
    const slug = slugify(problemTitle);
    return (await dsaApi.getLeetcodeSubmissions(slug)) || [];
  });

  useEffect(() => {
    if (isOpen && submissions === null) {
      loadSubmissions();
    }
  }, [isOpen]);

  const handleSelectSubmission = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const subId = e.target.value;
    setSelectedSubmissionId(subId);
    if (!subId) return;

    onCodeChange("// Fetching submission code...\n");
    try {
      const details = await dsaApi.getLeetcodeSubmissionCode(subId);
      if (details?.code) {
        onCodeChange(details.code);
        success("Code loaded from LeetCode");
      } else {
        onCodeChange("// Failed to get code for submission");
        error("Failed to load code");
      }
    } catch (err) {
      onCodeChange("// Error fetching code. Make sure your session is valid.");
      error("Error loading code from LeetCode");
    }
  };

  const handleClear = () => {
    if (window.confirm("Clear code and results?")) {
      onCodeChange("");
      setSelectedSubmissionId(null);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-full transition-all duration-500 overflow-hidden
          ${
            isOpen
              ? "bg-blue-600 text-white border border-blue-400/50 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
              : "bg-white/5 text-blue-400 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5"
          }
        `}
      >
        <span
          className={`absolute inset-0 bg-linear-to-r from-blue-600 to-cyan-500 transition-opacity duration-500 ${isOpen ? "opacity-100" : "opacity-0"}`}
        />
        <span className="relative z-10 flex items-center gap-2">
          {isOpen ? (
            <>
              <Terminal size={14} />
              Exit Architect Mode
            </>
          ) : (
            <>
              <Sparkles size={14} className="group-hover:animate-pulse" />
              Begin Code Analysis
            </>
          )}
        </span>
      </button>

      {isOpen && (
        <div className="mt-6 space-y-6 animate-in slide-in-from-top-4 fade-in duration-700 ease-out overflow-hidden min-w-0">
          {/* Editor Section */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-linear-to-r from-blue-600/20 to-cyan-500/20 rounded-4xl blur-xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>

            <div className="relative bg-[#080808] border border-white/10 rounded-3xl overflow-hidden shadow-2xl min-w-0">
              {/* Terminal Header */}
              <div className="bg-[#121212] border-b border-white/5 px-6 py-3.5 flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56] opacity-80"></div>
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e] opacity-80"></div>
                  <div className="w-3 h-3 rounded-full bg-[#27c93f] opacity-80"></div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/10 rounded border border-blue-500/20">
                  <Code size={10} className="text-blue-400" />
                  <span className="text-[9px] font-black text-blue-400 tracking-widest uppercase">
                    solution
                  </span>
                </div>
              </div>

              {/* Submissions Dropdown */}
              {submissions && submissions.length > 0 && (
                <div className="px-6 py-3 bg-[#0c0c0c] border-b border-white/5 flex gap-3 flex-wrap items-center">
                  <span className="text-[10px] uppercase font-black tracking-widest text-blue-400 flex items-center gap-2">
                    <Zap size={12} className="text-yellow-400" />
                    Sync Solution from LeetCode
                  </span>
                  <select
                    className="bg-black border border-white/10 rounded-md text-xs font-mono text-gray-300 px-3 py-1.5 focus:border-blue-500 outline-none hover:bg-white/5 transition"
                    onChange={handleSelectSubmission}
                    value={selectedSubmissionId || ""}
                  >
                    <option value="">-- Manual Code Input --</option>
                    {submissions.map((s: Submission) => (
                      <option key={s.id} value={s.id}>
                        {s.statusDisplay} ({s.lang}) -{" "}
                        {new Date(s.timestamp * 1000).toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {fetchingSubs && submissions === null && (
                <div className="px-6 py-3 bg-[#0c0c0c] border-b border-white/5 text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Loader2 size={12} className="animate-spin text-blue-400" />
                  Checking LeetCode for recent submissions...
                </div>
              )}

              {/* Textarea */}
              <div className="relative">
                <textarea
                  value={code}
                  onChange={(e) => onCodeChange(e.target.value)}
                  spellCheck={false}
                  placeholder={`// Paste your ${problemTitle} solution here...\n\nfunction solution() {\n  \n}`}
                  className="w-full h-56 bg-transparent p-6 text-sm font-mono text-blue-50/90 placeholder:text-white/10 outline-none resize-none leading-relaxed selection:bg-blue-500/30"
                />
                {code.length === 0 && (
                  <div className="absolute top-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-white/5 pointer-events-none">
                    <Terminal size={40} />
                    <span className="text-[10px] font-bold tracking-[0.3em] uppercase">
                      Awaiting Source Code
                    </span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-[#0a0a0a] border-t border-white/5 flex items-center justify-between">
                <button
                  onClick={handleClear}
                  className="p-2 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                  aria-label="Clear code"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={onReview}
                  disabled={isReviewing || !code.trim()}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300
                    ${
                      isReviewing || !code.trim()
                        ? "bg-white/5 text-white/20 cursor-not-allowed"
                        : "bg-white text-black hover:scale-105 active:scale-95 shadow-xl shadow-white/10"
                    }
                  `}
                  aria-label={
                    isReviewing ? "Processing analysis" : "Run code analysis"
                  }
                >
                  {isReviewing ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      Run Analysis
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
