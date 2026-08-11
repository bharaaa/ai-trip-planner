import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface AIInsightCardProps {
  message: string;
  type?: 'suggestion' | 'warning' | 'info';
  action?: React.ReactNode;
  className?: string;
}

export function AIInsightCard({ message, type = 'info', action, className }: AIInsightCardProps) {
  const typeStyles = {
    suggestion: 'border-l-accent-400 bg-accent-50/50',
    warning: 'border-l-amber-400 bg-amber-50/50',
    info: 'border-l-blue-400 bg-blue-50/50',
  };

  return (
    <div className={cn(
      'rounded-xl border border-warm-200 border-l-4 p-4',
      typeStyles[type],
      className
    )}>
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="text-sm text-warm-800 leading-relaxed">
            {message}
          </p>
          {action && <div className="mt-3">{action}</div>}
        </div>
      </div>
    </div>
  );
}
