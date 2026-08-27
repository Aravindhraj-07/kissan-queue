import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading verified records from central database...',
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-3 ${className}`}
    >
      <Loader2 size={28} className="animate-spin text-[#15803D]" />
      <p className="text-xs font-semibold text-[#4B5563]">{message}</p>
    </div>
  );
};

export const CardSkeleton: React.FC = () => (
  <div className="bg-white p-5 rounded-2xl border border-slate-200 animate-pulse space-y-3">
    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
    <div className="h-7 bg-slate-200 rounded w-1/2"></div>
    <div className="h-3 bg-slate-100 rounded w-2/3"></div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
    <div className="h-10 bg-slate-100 border-b border-slate-200"></div>
    <div className="divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex items-center justify-between space-x-4">
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/6"></div>
          <div className="h-4 bg-slate-100 rounded w-1/8"></div>
        </div>
      ))}
    </div>
  </div>
);
