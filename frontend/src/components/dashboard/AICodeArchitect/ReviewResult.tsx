/**
 * Review Result Component - Displays the analysis result
 */

"use client";

import { ShieldCheck, Copy, Check, Info } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { StructuredReview, StructuredReport } from "./StructuredReport";
import AlgoPlayground from "../AlgoPlayground";
import { useState } from "react";
import { useToastNotification } from "@/components/providers/ToastProvider";

interface ReviewResultProps {
  loading: boolean;
  review: {
    type: "structured" | "markdown";
    data: StructuredReview | string;
  } | null;
  problemId: string;
  problemTitle: string;
  code: string;
}

export function ReviewResult({
  loading,
  review,
  problemId,
  problemTitle,
  code,
}: ReviewResultProps) {
  const [copied, setCopied] = useState(false);
  const { success } = useToastNotification();

  const handleCopy = () => {
    if (!review) return;
    const text =
      review.type === "structured"
        ? JSON.stringify(review.data, null, 2)
        : String(review.data);
    navigator.clipboard.writeText(text);
    setCopied(true);
    success("Analysis copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!loading && !review) {
    return null;
  }

  return (
    <div className="p-5 sm:p-8 rounded-4xl bg-[#0c0c10] border border-white/5 relative overflow-hidden min-w-0">
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h4 className="text-base font-black text-white tracking-tight uppercase flex items-center gap-2">
              Architect&apos;s Report
              {review && !loading && (
                <span className="hidden sm:inline-block text-[9px] not-italic px-2 py-0.5 bg-blue-500/20 rounded border border-blue-500/30 text-blue-400">
                  VERIFIED
                </span>
              )}
            </h4>
            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mt-0.5">
              Neural Code Review
            </p>
          </div>
        </div>

        {review && !loading && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-gray-400 transition-all border border-white/5"
            aria-label="Copy analysis"
          >
            {copied ? (
              <>
                <Check size={14} className="text-green-400" />
                Copied
              </>
            ) : (
              <>
                <Copy size={14} />
                Copy
              </>
            )}
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-6 py-8">
          <div className="flex items-center gap-3 justify-center">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">
              Deconstructing solution...
            </span>
          </div>
          <div className="space-y-3 max-w-md mx-auto">
            <div className="h-3 bg-white/5 rounded-full w-full animate-pulse" />
            <div className="h-3 bg-white/5 rounded-full w-4/5 animate-pulse" />
            <div className="h-3 bg-white/5 rounded-full w-1/2 animate-pulse" />
          </div>
        </div>
      ) : (
        <div className="relative min-w-0">
          {/* Render structured or markdown based on response type */}
          {review?.type === "structured" ? (
            <StructuredReport data={review.data as StructuredReview} />
          ) : (
            <div
              className="architect-report prose prose-invert prose-sm max-w-none min-w-0
                text-gray-300/90 leading-relaxed
                prose-headings:text-white prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight
                prose-strong:text-blue-400 prose-strong:font-black
                prose-code:bg-white/10 prose-code:text-blue-200 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                prose-ul:border-l prose-ul:border-blue-500/20 prose-ul:pl-6 prose-li:my-2
              "
            >
              <ReactMarkdown>
                {review?.data ? String(review.data) : ""}
              </ReactMarkdown>
            </div>
          )}

          <div className="mt-8">
            <AlgoPlayground
              problemId={problemId}
              problemTitle={problemTitle}
              initialCode={code}
            />
          </div>

          <div className="mt-6 pt-5 border-t border-white/5 flex items-start gap-3">
            <Info size={13} className="text-gray-700 mt-0.5 shrink-0" />
            <p className="text-[9px] text-gray-700 font-medium leading-normal italic">
              AI-generated analysis optimized for learning. Cross-verify with
              official documentation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
