import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  onRetry,
  className = '',
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={`bg-rose-50/70 rounded-2xl border border-rose-200 p-8 sm:p-10 text-center flex flex-col items-center justify-center space-y-3 ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center border border-rose-200">
        <AlertCircle size={24} />
      </div>
      <div className="space-y-1 max-w-sm">
        <h3 className="text-sm sm:text-base font-bold text-rose-900">
          {title || t('common.loading')}
        </h3>
        {message && (
          <p className="text-xs text-rose-700 leading-relaxed">{message}</p>
        )}
      </div>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          icon={<RotateCcw size={14} />}
          className="mt-2 border-rose-300 text-rose-800 hover:bg-rose-100"
        >
          {t('common.tryAgain')}
        </Button>
      )}
    </div>
  );
};
