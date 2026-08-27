import React from 'react';
import { Check, Clock, Radio, Scale, CheckCircle2, Truck, Box, Navigation } from 'lucide-react';

export type FlowType = 'PROCUREMENT' | 'LOGISTICS';

interface TimelineProps {
  currentStatus: string;
  type?: FlowType;
  className?: string;
}

interface Step {
  key: string;
  label: string;
  icon: React.ReactNode;
}

export const Timeline: React.FC<TimelineProps> = ({
  currentStatus,
  type = 'PROCUREMENT',
  className = '',
}) => {
  const procurementSteps: Step[] = [
    { key: 'CONFIRMED', label: 'Slot Booked', icon: <Check size={13} /> },
    { key: 'ARRIVED', label: 'Gate Arrived', icon: <Radio size={13} /> },
    { key: 'WAITING', label: 'In Live Queue', icon: <Clock size={13} /> },
    { key: 'PROCESSING', label: 'Weighbridge', icon: <Scale size={13} /> },
    { key: 'COMPLETED', label: 'DBT Payout', icon: <CheckCircle2 size={13} /> },
  ];

  const logisticsSteps: Step[] = [
    { key: 'READY_FOR_PICKUP', label: 'Ready for Pickup', icon: <Box size={13} /> },
    { key: 'ASSIGNED', label: 'Fleet Assigned', icon: <Truck size={13} /> },
    { key: 'IN_TRANSIT', label: 'In Transit', icon: <Navigation size={13} /> },
    { key: 'DELIVERED', label: 'Silo Delivered', icon: <CheckCircle2 size={13} /> },
  ];

  const steps = type === 'PROCUREMENT' ? procurementSteps : logisticsSteps;

  // Compute active step index
  const getActiveIndex = (status: string): number => {
    const s = status.toUpperCase();
    if (type === 'PROCUREMENT') {
      if (s === 'PENDING' || s === 'CONFIRMED') return 0;
      if (s === 'ARRIVED') return 1;
      if (s === 'WAITING' || s === 'CALLED') return 2;
      if (s === 'PROCESSING' || s === 'IN_PROGRESS') return 3;
      if (s === 'COMPLETED' || s === 'PROCURED') return 4;
      return 0;
    } else {
      if (s === 'READY_FOR_PICKUP') return 0;
      if (s === 'ASSIGNED') return 1;
      if (s === 'PICKED_UP' || s === 'IN_TRANSIT' || s === 'PICKUP_IN_PROGRESS') return 2;
      if (s === 'DELIVERED' || s === 'COMPLETED') return 3;
      return 0;
    }
  };

  const activeIndex = getActiveIndex(currentStatus);
  const isCancelled = currentStatus === 'CANCELLED' || currentStatus === 'REJECTED' || currentStatus === 'NO_SHOW';

  if (isCancelled) {
    return (
      <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center justify-between">
        <span>Status: {currentStatus}</span>
        <span className="text-[11px] bg-rose-200 text-rose-900 px-2 py-0.5 rounded font-bold">Cancelled / Void</span>
      </div>
    );
  }

  return (
    <div className={`w-full py-2 ${className}`}>
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-1 bg-slate-200 -z-0"></div>
        <div
          className="absolute top-1/2 left-4 -translate-y-1/2 h-1 bg-[#15803D] transition-all duration-500 -z-0"
          style={{
            width: `${(activeIndex / (steps.length - 1)) * 100}%`,
            maxWidth: 'calc(100% - 32px)',
          }}
        ></div>

        {steps.map((step, index) => {
          const isDone = index < activeIndex;
          const isCurrent = index === activeIndex;
          const isUpcoming = index > activeIndex;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                  isDone
                    ? 'bg-[#15803D] text-white ring-4 ring-[#DCFCE7]'
                    : isCurrent
                    ? 'bg-[#15803D] text-white ring-4 ring-[#DCFCE7] animate-pulse'
                    : 'bg-white text-slate-400 border-2 border-slate-300'
                }`}
              >
                {isDone ? <Check size={14} className="stroke-[3]" /> : step.icon}
              </div>
              <span
                className={`text-[10px] sm:text-[11px] font-bold mt-1.5 text-center leading-tight whitespace-nowrap ${
                  isCurrent
                    ? 'text-[#166534] font-extrabold'
                    : isDone
                    ? 'text-[#1F2937]'
                    : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
