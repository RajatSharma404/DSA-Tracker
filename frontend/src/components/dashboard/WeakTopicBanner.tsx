"use client";

import { useEffect, useState } from "react";
import { dsaApi, WeakTopicStats } from "@/lib/api";
import { X, ArrowRight, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface WeakTopicBannerProps {
  initialTopic?: WeakTopicStats | null;
  className?: string;
}

export default function WeakTopicBanner({
  initialTopic,
  className = "",
}: WeakTopicBannerProps) {
  const [weakTopic, setWeakTopic] = useState<WeakTopicStats | null>(
    initialTopic ?? null,
  );
  const [isDismissed, setIsDismissed] = useState(true); // Default true to prevent flicker before localStorage read
  const [loading, setLoading] = useState(initialTopic === undefined);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const dismissedDate =
      typeof window !== "undefined"
        ? localStorage.getItem("weakTopicDismissedDate")
        : null;

    if (dismissedDate === today) {
      setIsDismissed(true);
      setLoading(false);
      return;
    }

    setIsDismissed(false);

    if (initialTopic !== undefined) {
      setWeakTopic(initialTopic);
      setLoading(false);
      return;
    }

    let isMounted = true;
    dsaApi
      .getWeakTopic()
      .then((topic) => {
        if (isMounted) {
          setWeakTopic(topic);
        }
      })
      .catch((err) => {
        console.error("Failed to load weak topic banner stats:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [initialTopic]);

  const handleDismiss = () => {
    const today = new Date().toISOString().split("T")[0];
    if (typeof window !== "undefined") {
      localStorage.setItem("weakTopicDismissedDate", today);
    }
    setIsDismissed(true);
  };

  if (isDismissed || loading || !weakTopic) {
    return null;
  }

  const topicName = weakTopic.name || weakTopic.topic;
  const percentage = weakTopic.percentage ?? Math.round(weakTopic.solve_rate * 100);

  return (
    <div
      id="weak-topic-banner"
      role="alert"
      className={`rounded-2xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-md px-5 py-3.5 text-amber-200 shadow-lg relative flex items-center justify-between gap-4 transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-lg shrink-0 select-none" aria-hidden="true">
          ⚠️
        </span>
        <p className="text-sm font-semibold text-amber-100 tracking-tight leading-snug">
          You&apos;ve only solved {percentage}% of {topicName} problems. Focus here today.
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <Link
          href={`/topics?focus=${encodeURIComponent(weakTopic.id || topicName)}`}
          className="hidden sm:inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 hover:underline transition-colors"
        >
          <span>Practice</span>
          <ArrowRight size={13} />
        </Link>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss weak topic alert"
          className="p-1.5 rounded-lg text-amber-300 hover:text-white hover:bg-amber-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
export { WeakTopicBanner };
