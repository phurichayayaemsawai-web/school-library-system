import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'indigo' | 'emerald' | 'rose' | 'amber' | 'blue' | 'purple';
  change?: {
    value: string;
    isPositive: boolean;
  };
  onClick?: () => void;
  className?: string;
}

const colorMap = {
  indigo: {
    bg: 'bg-indigo-50 text-indigo-600',
    border: 'border-indigo-100',
    ring: 'hover:border-indigo-300',
  },
  emerald: {
    bg: 'bg-emerald-50 text-emerald-600',
    border: 'border-emerald-100',
    ring: 'hover:border-emerald-300',
  },
  rose: {
    bg: 'bg-rose-50 text-rose-600',
    border: 'border-rose-100',
    ring: 'hover:border-rose-300',
  },
  amber: {
    bg: 'bg-amber-50 text-amber-600',
    border: 'border-amber-100',
    ring: 'hover:border-amber-300',
  },
  blue: {
    bg: 'bg-blue-50 text-blue-600',
    border: 'border-blue-100',
    ring: 'hover:border-blue-300',
  },
  purple: {
    bg: 'bg-purple-50 text-purple-600',
    border: 'border-purple-100',
    ring: 'hover:border-purple-300',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'indigo',
  change,
  onClick,
  className,
}) => {
  const styles = colorMap[color];

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl p-6 border shadow-sm transition-all duration-200',
        styles.border,
        onClick && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800 mt-2 tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          {change && (
            <div className="flex items-center gap-1 mt-2 text-xs font-medium">
              <span className={change.isPositive ? 'text-emerald-600' : 'text-rose-600'}>
                {change.isPositive ? '↑' : '↓'} {change.value}
              </span>
              <span className="text-slate-400">จากเดือนก่อน</span>
            </div>
          )}
        </div>
        <div className={cn('p-3.5 rounded-xl flex items-center justify-center', styles.bg)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
