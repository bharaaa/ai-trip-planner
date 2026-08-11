import React from 'react';
import { cn } from '@/lib/utils/cn';
// Use emoji instead of lucide-react

interface RefinementSummaryProps {
  likes: string[];
  dislikes: string[];
  onRefine: () => void;
  className?: string;
}

export const RefinementSummary: React.FC<RefinementSummaryProps> = ({
  likes,
  dislikes,
  onRefine,
  className,
}) => {
  return (
    <div className={cn("bg-accent-50/50 border border-accent-100 rounded-2xl p-6", className)}>
      <div className="flex items-center gap-2 text-accent-600 mb-4">
        <span className="text-lg">✨</span>
        <h3 className="font-semibold text-warm-900">AI Insights</h3>
      </div>
      
      <div className="space-y-4 mb-6">
        <div>
          <p className="text-sm font-medium text-warm-800 mb-2">Your group likes:</p>
          <div className="flex flex-wrap gap-2">
            {likes.map((like, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-warm-200 rounded-lg text-sm text-warm-700 shadow-sm">
                <span className="text-xs text-emerald-500">✔️</span>
                {like}
              </span>
            ))}
          </div>
        </div>
        
        {dislikes.length > 0 && (
          <div>
            <p className="text-sm font-medium text-warm-800 mb-2">Your group doesn't prioritize:</p>
            <div className="flex flex-wrap gap-2">
              {dislikes.map((dislike, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-warm-200 rounded-lg text-sm text-warm-600 shadow-sm opacity-80">
                  <span className="text-xs text-rose-400">✖️</span>
                  {dislike}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-accent-100">
        <p className="text-sm text-warm-600">
          Based on that, we've refined the options.
        </p>
        <button
          onClick={onRefine}
          className="px-4 py-2 bg-accent-400 hover:bg-accent-500 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          See refined ideas
        </button>
      </div>
    </div>
  );
};
