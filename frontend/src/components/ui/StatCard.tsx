"use client";

import React, { useRef, useState, useEffect } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType<{ size?: number | string; className?: string }>;
  description?: string;
  trend?: string;
  trendUp?: boolean;
}

function useCountUp(target: number, duration = 1000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isNaN(target) || target <= 0) {
      setCount(target);
      return;
    }

    let start: number | null = null;
    let animationFrameId: number;

    const tick = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [target, duration]);

  return count;
}

function AnimatedValue({ rawValue }: { rawValue: string | number }) {
  const str = String(rawValue).trim();
  const match = str.match(/^([0-9]+)(\D.*)?$/);

  const numPart = match ? parseInt(match[1], 10) : NaN;
  const suffix = match ? match[2] || "" : "";
  const animatedNumber = useCountUp(isNaN(numPart) ? 0 : numPart, 1100);

  if (isNaN(numPart)) {
    return <>{rawValue}</>;
  }

  return (
    <>
      {animatedNumber}
      {suffix}
    </>
  );
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendUp,
}: StatCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -5;
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 5;
    card.style.transform = `perspective(1400px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(2px)`;
    card.style.boxShadow = `${rotateY * -1.2}px ${rotateX * 1.2}px 24px var(--accent-glow)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = `perspective(1400px) rotateX(0deg) rotateY(0deg) translateZ(0px)`;
    card.style.boxShadow = ``;
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] flex flex-col justify-between cursor-default relative overflow-hidden shadow-lg transition-colors group"
      style={{
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        willChange: "transform",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.06),transparent_42%)]" />
      <div className="flex items-center justify-between text-[var(--text-muted)]">
        <span className="text-sm font-medium">{title}</span>
        <Icon
          size={20}
          className={
            title.includes("Streak")
              ? "text-orange-400"
              : "text-[var(--accent-primary)]"
          }
        />
      </div>

      <div className="mt-4">
        <h3 className="text-3xl font-black tracking-tight text-[var(--text-primary)] font-display">
          <AnimatedValue rawValue={value} />
        </h3>
      </div>

      {(description || trend) && (
        <div className="mt-2 flex items-center text-sm">
          {trend && (
            <span
              className={`mr-2 font-medium ${
                trendUp ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {trendUp ? "↑" : "↓"} {trend}
            </span>
          )}
          {description && (
            <span className="text-[var(--text-muted)] text-xs">{description}</span>
          )}
        </div>
      )}
    </div>
  );
}
