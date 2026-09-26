import React, { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  highlight?: boolean;
}

export function StatCard({ title, value, subtitle, icon, trend, highlight }: StatCardProps) {
  return (
    <div
      className={`p-3 rounded-lg border transition-all ${
        highlight
          ? 'bg-white border-[#E4E8EE]'
          : 'bg-white border-[#E4E8EE]'
      }`}
    >
      <div className="flex items-center justify-between text-[10px] text-[#7D899B] mb-1.5 font-medium">
        <span className="truncate">{title}</span>
        {icon && <span className="shrink-0 text-[#7D899B]">{icon}</span>}
      </div>

      <div className="text-lg sm:text-xl font-bold tracking-tight text-[#172033] mb-0.5 tabular-nums">
        {value}
      </div>

      {(subtitle || trend) && (
        <div className="flex items-center gap-1.5 text-[9px] text-[#7D899B]">
          {trend && (
            <span
              className={`font-semibold tabular-nums ${
                trend.isPositive ? 'text-[#304C70]' : 'text-[#B86B6B]'
              }`}
            >
              {trend.value}
            </span>
          )}
          {trend && trend.label && <span className="text-[#7D899B]">·</span>}
          {trend && trend.label && <span className="text-[#7D899B]">{trend.label}</span>}
          {subtitle && !trend && <span className="truncate text-[#7D899B]">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
