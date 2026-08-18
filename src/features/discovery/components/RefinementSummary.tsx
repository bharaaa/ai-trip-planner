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
    <div className={cn("bg-accent-950/30 border border-accent-500/20 rounded-2xl p-6", className)}>
      <div className="flex items-center gap-2 text-accent-400 mb-4">
        <span className="text-lg">✨</span>
        <h3 className="font-bold text-white tracking-tight">AI Insights</h3>
      </div>
      
      <div className="space-y-4 mb-6">
        <div>
          <p className="text-sm font-medium text-warm-300 mb-2">Your group likes:</p>
          <div className="flex flex-wrap gap-2">
            {likes.map((like, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 border border-white/5 rounded-lg text-sm text-white shadow-sm">
                <span className="text-xs text-emerald-400">✔️</span>
                {like}
              </span>
            ))}
          </div>
        </div>
        
        {dislikes.length > 0 && (
          <div>
            <p className="text-sm font-medium text-warm-300 mb-2">Your group doesn't prioritize:</p>
            <div className="flex flex-wrap gap-2">
              {dislikes.map((dislike, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/5 rounded-lg text-sm text-warm-300 shadow-sm opacity-80">
                  <span className="text-xs text-rose-400">✖️</span>
                  {dislike}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-accent-500/20">
        <p className="text-sm text-warm-400">
          Based on that, we've refined the options.
        </p>
        <button
          onClick={onRefine}
          className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white text-sm font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(var(--accent-500),0.3)]"
        >
          See refined ideas
        </button>
      </div>
    </div>
  );
};
