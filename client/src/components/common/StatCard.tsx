import React, { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  color?: 'green' | 'amber' | 'blue' | 'purple' | 'rose' | 'slate';
  trend?: string;
  trendType?: 'up' | 'down' | 'neutral';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = 'green',
  trend,
  trendType = 'up',
  className = '',
}) => {
  const accentColors = {
    green: 'text-[#15803D] bg-[#DCFCE7] border-[#86EFAC]',
    amber: 'text-[#854D0E] bg-[#FEF9C3] border-[#FDE047]',
    blue: 'text-[#0369A1] bg-[#E0F2FE] border-[#7DD3FC]',
    purple: 'text-[#6B21A8] bg-[#F3E8FF] border-[#D8B4FE]',
    rose: 'text-[#9F1239] bg-[#FFE4E6] border-[#FECDD3]',
    slate: 'text-[#1F2937] bg-slate-100 border-slate-200',
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-xs transition flex flex-col justify-between ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight">
            {value}
          </h3>
        </div>
        {icon && (
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${accentColors[color]}`}
          >
            {icon}
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-[#4B5563]">
          <span className="truncate">{subtitle}</span>
          {trend && (
            <span
              className={`font-bold shrink-0 ${
                trendType === 'up'
                  ? 'text-[#15803D]'
                  : trendType === 'down'
                  ? 'text-rose-600'
                  : 'text-[#4B5563]'
              }`}
            >
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
