"use client";

import { useEffect, useState } from "react";
import { dsaApi, MockInterview, Topic } from "@/lib/api";
import {
  Plus,
  Target,
  CalendarDays,
  MessageSquare,
  Timer,
  Zap,
} from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<MockInterview[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [challengeTopicId, setChallengeTopicId] = useState("");
  const [challengeDuration, setChallengeDuration] = useState(30);
  const [startingChallenge, setStartingChallenge] = useState(false);
  const router = useRouter();

  // Form State
  const [date, setDate] = useState("");
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    loadInterviews();
    dsaApi
      .getTopics()
      .then(setTopics)
      .catch((err) => console.error("Failed to load topics", err));
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

  const startMockInterview = async () => {
    if (!challengeTopicId) return;
    setStartingChallenge(true);
    try {
      const session = await dsaApi.startChallenge(
        challengeTopicId,
        challengeDuration,
      );
      router.push(`/challenge/${session.id}`);
    } catch (err) {
      console.error("Failed to start interview mode", err);
    } finally {
      setStartingChallenge(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;

    try {
      await dsaApi.createInterview({
        date,
        score: score ? parseInt(score) : undefined,
        feedback: feedback || undefined,
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
      <div className="mx-auto mt-4 max-w-4xl space-y-8 animate-pulse">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-3">
            <div className="h-8 w-56 rounded-full bg-white/5" />
            <div className="h-4 w-80 rounded-full bg-white/5" />
          </div>
          <div className="h-10 w-36 rounded-xl bg-white/5" />
        </div>
        <div className="rounded-2xl border border-[#222] bg-[#111] p-6 space-y-4">
          <div className="h-5 w-40 rounded-full bg-white/5" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="h-12 rounded-xl bg-white/5" />
            <div className="h-12 rounded-xl bg-white/5" />
          </div>
          <div className="h-28 rounded-xl bg-white/5" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-20 rounded-2xl border border-[#222] bg-[#111]"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in mt-4 fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Mock Interviews
          </h1>
          <p className="text-gray-400">
            Track your performance and feedback from practice sessions.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          <Plus size={18} /> Add Session
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7 rounded-2xl border border-cyan-500/15 bg-cyan-500/5 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="text-cyan-400" size={18} />
            <h2 className="text-lg font-bold text-white">
              Start Interview Mode
            </h2>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Launch a timed challenge from the topic you want to practice most.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                Topic
              </span>
              <select
                value={challengeTopicId}
                onChange={(e) => setChallengeTopicId(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-cyan-400"
              >
                <option value="">Choose a topic</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                Duration
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[20, 30, 45].map((minutes) => (
                  <button
                    key={minutes}
                    type="button"
                    onClick={() => setChallengeDuration(minutes)}
                    className={`rounded-xl border px-3 py-3 text-sm font-bold transition-colors ${challengeDuration === minutes ? "border-cyan-400 bg-cyan-400/10 text-cyan-300" : "border-white/10 bg-black/20 text-gray-400 hover:text-white"}`}
                  >
                    {minutes}m
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={startMockInterview}
            disabled={!challengeTopicId || startingChallenge}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-black transition-transform hover:scale-[1.02] disabled:opacity-50"
          >
            <Timer size={12} />
            {startingChallenge ? "Launching..." : "Enter Arena"}
          </button>
        </div>

        <div className="lg:col-span-5 rounded-2xl border border-white/5 bg-[#0d0d0d] p-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">
            Why it helps
          </h3>
          <div className="mt-3 space-y-3 text-sm text-gray-300">
            <p>Timed practice improves recall under pressure.</p>
            <p>Topic selection keeps sessions focused on your weak spots.</p>
            <p>The result can be logged right below after the run.</p>
          </div>
        </div>
      </div>

      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="bg-[#111] border border-[#222] p-6 rounded-xl space-y-4"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Log New Interview
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">
                Date Setup
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-2.5 text-white focus:outline-none focus:border-white transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">
                Score / 10
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="e.g. 8"
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-2.5 text-white focus:outline-none focus:border-white transition-colors"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">
              Feedback Notes
            </label>
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
            <h3 className="text-lg font-medium text-white mb-1">
              No interviews logged yet
            </h3>
            <p className="text-gray-500">
              Start tracking your mock interview performance.
            </p>
          </div>
        ) : (
          interviews.map((interview) => (
            <div
              key={interview.id}
              className="bg-[#111] border border-[#222] p-6 rounded-xl flex flex-col sm:flex-row gap-6"
            >
              <div className="shrink-0 flex flex-col items-center justify-center p-4 bg-[#1a1a1a] rounded-lg w-24">
                <span className="text-3xl font-bold text-white">
                  {interview.score || "-"}
                </span>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">
                  Score
                </span>
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                  <CalendarDays size={16} />
                  {format(new Date(interview.date), "MMMM d, yyyy")}
                </div>
                {interview.feedback ? (
                  <div className="flex gap-3">
                    <MessageSquare
                      size={18}
                      className="text-gray-500 shrink-0 mt-0.5"
                    />
                    <p className="text-gray-300 leading-relaxed text-sm">
                      {interview.feedback}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-600 italic text-sm">
                    No feedback provided.
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
