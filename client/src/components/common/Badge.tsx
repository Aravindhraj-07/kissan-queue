import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  Clock,
  ArrowRightCircle,
  XCircle,
  Truck,
  CircleDot,
  LucideIcon,
} from 'lucide-react';

interface BadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status = '', size = 'md', className = '' }) => {
  const { t } = useTranslation();
  const normalized = status?.toUpperCase() || 'UNKNOWN';

  let style = 'bg-slate-100 text-[#1F2937] border-slate-300';
  let Icon: LucideIcon = CircleDot;

  switch (normalized) {
    case 'CONFIRMED':
    case 'AVAILABLE':
    case 'COMPLETED':
    case 'DELIVERED':
    case 'ACTIVE':
    case 'PROCURED':
    case 'GRADE A':
      style = 'bg-[#DCFCE7] text-[#166534] border-[#86EFAC]';
      Icon = CheckCircle2;
      break;

    case 'PROCESSING':
    case 'IN_PROGRESS':
    case 'PICKUP_IN_PROGRESS':
      style = 'bg-[#E0F2FE] text-[#0369A1] border-[#7DD3FC]';
      Icon = ArrowRightCircle;
      break;

    case 'IN_TRANSIT':
      style = 'bg-[#E0F2FE] text-[#0369A1] border-[#7DD3FC]';
      Icon = Truck;
      break;

    case 'ARRIVED':
    case 'IN_QUEUE':
    case 'ASSIGNED':
    case 'READY_FOR_PICKUP':
    case 'WAITLISTED':
    case 'PENDING':
    case 'GRADE B':
      style = 'bg-[#FEF9C3] text-[#854D0E] border-[#FDE047]';
      Icon = Clock;
      break;

    case 'CANCELLED':
    case 'NO_SHOW':
    case 'REJECTED':
    case 'SUSPENDED':
    case 'FULL':
    case 'CLOSED':
    case 'GRADE C':
      style = 'bg-[#FFE4E6] text-[#9F1239] border-[#FECDD3]';
      Icon = XCircle;
      break;

    default:
      style = 'bg-slate-100 text-[#1F2937] border-slate-200';
      Icon = CircleDot;
      break;
  }

  const iconSizes = {
    sm: 11,
    md: 13,
    lg: 15,
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm gap-2',
  };

  const formatText = (text: string) => {
    if (!text) return '';
    return text.replace(/_/g, ' ');
  };

  const translatedLabel = t(`status.${normalized}`, {
    defaultValue: formatText(status),
  });

  return (
    <span
      className={`inline-flex items-center font-bold rounded-full border shadow-2xs transition-all duration-150 ${style} ${sizeClasses[size]} ${className}`}
    >
      <Icon size={iconSizes[size]} className="shrink-0" />
      <span>{translatedLabel}</span>
    </span>
  );
};
