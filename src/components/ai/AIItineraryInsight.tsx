import React from 'react';
import { cn } from '@/lib/utils/cn';
import type { ItineraryInsight } from '@/types';

interface AIItineraryInsightProps {
  insight: ItineraryInsight;
  onAccept?: () => void;
  onDismiss?: () => void;
}

export const AIItineraryInsight: React.FC<AIItineraryInsightProps> = ({
  insight,
  onAccept,
  onDismiss
}) => {
  const isWarning = insight.type === 'warning';
  const isSuggestion = insight.type === 'suggestion';
  const isInfo = insight.type === 'info';

  const typeStyles = {
    suggestion: 'border-l-accent-400',
    warning: 'border-l-warning-500',
    info: 'border-l-info-500',
  };

  const icon = isWarning ? '⚠️' : isSuggestion ? '✨' : '💡';
  
  return (
    <div className={cn(
      "flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white border border-warm-200 border-l-4 rounded-xl p-4 shadow-sm animate-in slide-in-from-top-2 duration-300",
      typeStyles[insight.type || 'info']
    )}>
      <div className="flex-1 flex items-start gap-3">
        <span className="text-lg leading-none mt-0.5" role="img" aria-label="insight icon">
          {icon}
        </span>
        <div>
          <p className="text-sm font-medium text-warm-700 leading-relaxed">
            {insight.message}
          </p>
          {insight.suggestion && (
            <p className="text-xs text-warm-500 mt-1">
              {insight.suggestion}
            </p>
          )}
        </div>
      </div>
      
      {(onAccept || onDismiss) && (
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 mt-2 sm:mt-0">
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-xs font-medium px-3 py-1.5 text-warm-500 hover:text-warm-700 hover:bg-warm-50 rounded-md transition-colors"
            >
              Dismiss
            </button>
          )}
          {onAccept && (
            <button
              onClick={onAccept}
              className="text-xs font-medium px-3 py-1.5 text-white bg-accent-400 hover:bg-accent-500 rounded-md transition-colors shadow-sm"
            >
              Apply
            </button>
          )}
        </div>
      )}
    </div>
  );
};
