import React from 'react';
import { cn } from '@/lib/utils/cn';
import { getInsightBorderClass, getInsightIcon } from './utils';

export interface AIInsightCardProps {
  message: string;
  type?: 'suggestion' | 'warning' | 'info';
  action?: React.ReactNode;
  className?: string;
}

export function AIInsightCard({ message, type = 'info', action, className }: AIInsightCardProps) {
  const borderClass = getInsightBorderClass(type);
  const icon = getInsightIcon(type);

  return (
    <div className={cn(
      'rounded-xl border border-warm-200 border-l-4 p-4 bg-white shadow-sm',
      borderClass,
      className
    )}>
      <div className="flex items-start gap-3">
        <span className="text-lg leading-none mt-0.5" role="img" aria-label="insight icon">
          {icon}
        </span>
        <div className="flex-1">
          <p className="text-sm text-warm-700 leading-relaxed font-medium">
            {message}
          </p>
          {action && <div className="mt-3">{action}</div>}
        </div>
      </div>
    </div>
  );
}
