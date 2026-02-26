"use client";

import { useEffect, useState } from "react";
import { dsaApi, Topic, Problem } from "@/lib/api";
import { ChevronDown, ChevronRight, CheckCircle2, Circle, Clock, ExternalLink, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import AIMentorHint from "@/components/dashboard/AIMentorHint";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  useEffect(() => {
    async function loadTopics() {
      try {
        const data = await dsaApi.getTopics();
        setTopics(data);
      } catch (err) {
        console.error("Failed to load topics", err);
      } finally {
        setLoading(false);
      }
    }
    loadTopics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-600 border-t-white"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in mt-4 fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">DSA Topics</h1>
        <p className="text-gray-400">Master these topics sequentially to build a strong foundation.</p>
      </div>

      <div className="space-y-4">
        {topics.map((topic, index) => (
          <TopicAccordion 
            key={topic.id} 
            topic={topic} 
            index={index}
            isExpanded={expandedTopic === topic.id}
            onToggle={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
          />
        ))}
      </div>
    </div>
  );
}

function TopicAccordion({ topic, index, isExpanded, onToggle }: { topic: Topic, index: number, isExpanded: boolean, onToggle: () => void }) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isExpanded && problems.length === 0) {
      setLoading(true);
      dsaApi.getTopicProblems(topic.id)
        .then(setProblems)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isExpanded, topic.id, problems.length]);

  const handleProgressUpdate = async (problemId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'DONE' ? 'TODO' : 'DONE';
    
    // Optimistic UI update
    setProblems(prev => prev.map(p => 
      p.id === problemId ? { ...p, status: newStatus as any } : p
    ));

    try {
      await dsaApi.updateProgress(problemId, newStatus as any, 0);
    } catch(err) {
      console.error("Failed to update progress:", err);
      // Revert on error
      setProblems(prev => prev.map(p => 
        p.id === problemId ? { ...p, status: currentStatus as any } : p
      ));
    }
  }

  return (
    <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden transition-all duration-300">
      <div 
        onClick={onToggle}
        className="flex items-center justify-between p-5 cursor-pointer hover:bg-[#1a1a1a] transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#222] text-sm font-medium text-gray-400">
            {index + 1}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-white">{topic.name}</h3>
            {topic.description && <p className="text-sm text-gray-400 mt-1">{topic.description}</p>}
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-medium text-gray-300">{topic.progressPercentage}%</span>
            <div className="w-24 h-1.5 bg-[#222] rounded-full mt-2 hidden sm:block">
              <div 
                className="h-full bg-white transition-all duration-500 rounded-full"
                style={{ width: `${topic.progressPercentage}%` }}
              />
            </div>
          </div>
          <div className="text-gray-500">
            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-[#222] bg-[#0a0a0a] p-2 sm:p-4 space-y-4">
          <TopicStrategy topicId={topic.id} />
          {loading ? (
             <div className="py-8 text-center text-gray-500 text-sm animate-pulse">Loading problems...</div>
          ) : (
            <div className="space-y-2">
              {problems.map(problem => (
                <div 
                  key={problem.id}
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-transparent transition-all",
                    problem.status === 'DONE' 
                      ? "bg-[#111]/50 opacity-70" 
                      : "bg-[#111] hover:border-[#333]"
                  )}
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProgressUpdate(problem.id, problem.status);
                      }}
                      className="mt-1 sm:mt-0 flex-shrink-0 focus:outline-none"
                    >
                      {problem.status === 'DONE' ? (
                        <CheckCircle2 size={20} className="text-green-500" />
                      ) : (
                        <Circle size={20} className="text-gray-500 hover:text-white transition-colors" />
                      )}
                    </button>
                    <div>
                      <span className={cn(
                        "font-medium tracking-tight",
                        problem.status === 'DONE' && "line-through text-gray-500"
                      )}>
                        {problem.title}
                      </span>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium tracking-wide",
                          problem.difficulty === 'EASY' && "bg-green-500/10 text-green-500",
                          problem.difficulty === 'MEDIUM' && "bg-yellow-500/10 text-yellow-500",
                          problem.difficulty === 'HARD' && "bg-red-500/10 text-red-500",
                        )}>
                          {problem.difficulty}
                        </span>
                        {problem.status === 'DONE' && problem.timeSpent > 0 && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock size={12} /> {problem.timeSpent}m
                          </span>
                        )}
                      </div>
                      {problem.status !== 'DONE' && (
                        <AIMentorHint problemId={problem.id} problemTitle={problem.title} />
                      )}
                    </div>
                  </div>
                  
                  {problem.link && (
                    <a 
                      href={problem.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-4 sm:mt-0 flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-3 py-1.5 rounded w-fit sm:w-auto"
                    >
                      Solve <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TopicStrategy({ topicId }: { topicId: string }) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchStrategy = async () => {
    if (explanation) {
      setIsOpen(!isOpen);
      return;
    }
    setLoading(true);
    setIsOpen(true);
    try {
      const res = await dsaApi.getPatternExplanation(topicId);
      setExplanation(res.explanation);
    } catch (err) {
      setExplanation("Failed to load strategy.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <button 
        onClick={fetchStrategy}
        className="flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
      >
        <Sparkles size={14} />
        {isOpen ? 'Hide Mentor Strategy' : 'Show AI Mentor Strategy for this Topic'}
      </button>
      
      {isOpen && (
        <div className="mt-4 p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl animate-in fade-in zoom-in-95">
          <div className="prose prose-invert prose-sm max-w-none">
            {loading ? (
              <div className="flex items-center gap-3 text-gray-500">
                <Loader2 size={16} className="animate-spin" />
                Analyzing patterns...
              </div>
            ) : (
              <div className="whitespace-pre-wrap text-gray-300 font-medium leading-relaxed">
                {explanation}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
