import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  color?: "blue" | "sky" | "indigo" | "emerald" | "rose" | "amber" | "purple";
  change?: {
    value: string;
    isPositive: boolean;
  };
  onClick?: () => void;
  className?: string;
}

const colorStyles = {
  blue: {
    bg: "bg-blue-50 text-blue-600",
    border: "border-blue-100",
  },
  sky: {
    bg: "bg-sky-50 text-sky-600",
    border: "border-sky-100",
  },
  indigo: {
    bg: "bg-blue-50 text-blue-700",
    border: "border-blue-100",
  },
  emerald: {
    bg: "bg-emerald-50 text-emerald-600",
    border: "border-emerald-100",
  },
  rose: {
    bg: "bg-rose-50 text-rose-600",
    border: "border-rose-100",
  },
  amber: {
    bg: "bg-amber-50 text-amber-600",
    border: "border-amber-100",
  },
  purple: {
    bg: "bg-indigo-50 text-indigo-600",
    border: "border-indigo-100",
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "blue",
  change,
  onClick,
  className,
}) => {
  const style = colorStyles[color] || colorStyles.blue;

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border shadow-xs transition-all duration-200",
        style.border,
        onClick && "cursor-pointer hover:shadow-md hover:-translate-y-0.5",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-slate-500 truncate whitespace-nowrap">
            {title}
          </p>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-800 mt-1 sm:mt-1.5 tracking-tight truncate whitespace-nowrap">
            {value}
          </h3>
          {subtitle && (
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1 truncate whitespace-nowrap">
              {subtitle}
            </p>
          )}
          {change && (
            <div className="flex items-center gap-1 mt-1.5 text-xs font-medium whitespace-nowrap">
              <span className={change.isPositive ? "text-emerald-600" : "text-rose-600"}>
                {change.isPositive ? "↑" : "↓"} {change.value}
              </span>
              <span className="text-slate-400">จากเดือนก่อน</span>
            </div>
          )}
        </div>
        <div className={cn("p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-2xs", style.bg)}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>
    </div>
  );
};
