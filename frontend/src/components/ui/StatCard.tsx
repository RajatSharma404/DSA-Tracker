import { CheckCircle2, Flame, AlertCircle } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  trend?: string;
  trendUp?: boolean;
}

export function StatCard({ title, value, icon: Icon, description, trend, trendUp }: StatCardProps) {
  return (
    <div className="p-6 rounded-2xl bg-[#111] border border-[#222] flex flex-col justify-between">
      <div className="flex items-center justify-between text-gray-400">
        <span className="text-sm font-medium">{title}</span>
        <Icon size={20} className={title.includes("Streak") ? "text-orange-500" : ""} />
      </div>
      
      <div className="mt-4">
        <h3 className="text-3xl font-bold text-white">{value}</h3>
      </div>
      
      {(description || trend) && (
        <div className="mt-2 flex items-center text-sm">
          {trend && (
            <span className={`mr-2 font-medium ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </span>
          )}
          {description && <span className="text-gray-500">{description}</span>}
        </div>
      )}
    </div>
  );
}
