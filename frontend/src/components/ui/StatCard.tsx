"use client";

import { useRef } from "react";
import { CheckCircle2, Flame, AlertCircle } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  trend?: string;
  trendUp?: boolean;
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
    const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -12;
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 12;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(12px)`;
    card.style.boxShadow = `${rotateY * -2}px ${rotateX * 2}px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = `perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)`;
    card.style.boxShadow = ``;
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="p-6 rounded-2xl bg-[#111] border border-[#222] flex flex-col justify-between cursor-default"
      style={{
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        willChange: "transform",
      }}
    >
      <div className="flex items-center justify-between text-gray-400">
        <span className="text-sm font-medium">{title}</span>
        <Icon
          size={20}
          className={title.includes("Streak") ? "text-orange-500" : ""}
        />
      </div>

      <div className="mt-4">
        <h3 className="text-3xl font-bold text-white">{value}</h3>
      </div>

      {(description || trend) && (
        <div className="mt-2 flex items-center text-sm">
          {trend && (
            <span
              className={`mr-2 font-medium ${trendUp ? "text-green-500" : "text-red-500"}`}
            >
              {trendUp ? "↑" : "↓"} {trend}
            </span>
          )}
          {description && <span className="text-gray-500">{description}</span>}
        </div>
      )}
    </div>
  );
}
