import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'warning' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-extrabold rounded-xl transition-all duration-150 ease-out cursor-pointer select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.97] active:shadow-none';

  const variants = {
    primary:
      'bg-[#15803D] hover:bg-[#166534] active:bg-[#14532D] text-white border border-[#166534] shadow-2xs hover:shadow-xs hover:-translate-y-0.5 focus-visible:ring-[#15803D]',
    secondary:
      'bg-white hover:bg-slate-50 active:bg-slate-100 text-[#15803D] border border-slate-300 hover:border-[#15803D] shadow-2xs hover:shadow-xs hover:-translate-y-0.5 focus-visible:ring-[#15803D]',
    warning:
      'bg-[#EAB308] hover:bg-[#CA8A04] active:bg-[#A16207] text-[#1F2937] border border-[#CA8A04] shadow-2xs hover:shadow-xs hover:-translate-y-0.5 focus-visible:ring-[#EAB308]',
    danger:
      'bg-[#E11D48] hover:bg-[#BE123C] active:bg-[#9F1239] text-white border border-[#BE123C] shadow-2xs hover:shadow-xs hover:-translate-y-0.5 focus-visible:ring-[#E11D48]',
    ghost:
      'bg-transparent hover:bg-slate-100 active:bg-slate-200 text-[#4B5563] hover:text-[#1F2937] border border-transparent focus-visible:ring-slate-400',
    outline:
      'bg-transparent hover:bg-slate-50 active:bg-slate-100 text-[#1F2937] border border-slate-300 hover:border-slate-400 focus-visible:ring-slate-400 hover:-translate-y-0.5',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-xs sm:text-sm gap-2',
    lg: 'px-6 py-3 text-sm sm:text-base gap-2.5 rounded-2xl',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} className="animate-spin" />
      ) : icon ? (
        <span className="shrink-0 transition-transform group-hover:scale-110">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};
