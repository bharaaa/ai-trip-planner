import React from 'react';
import { cn } from '@/lib/utils/cn';
import type { ReactionType } from '@/types';


interface ReactionBarProps {
  ideaId: string;
  currentReaction?: ReactionType;
  onReact: (reaction: ReactionType) => void;
  compact?: boolean;
  className?: string;
}

export const ReactionBar: React.FC<ReactionBarProps> = ({
  currentReaction,
  onReact,
  compact = false,
  className,
}) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex bg-warm-50 rounded-full p-1 border border-warm-200">
        <button
          onClick={() => onReact('love')}
          title="Love"
          className={cn(
            "flex items-center justify-center rounded-full transition-all duration-200 hover:scale-105 active:scale-95",
            compact ? "w-8 h-8" : "w-10 h-10",
            currentReaction === 'love' 
              ? "bg-rose-100 text-rose-600 shadow-sm" 
              : "text-warm-500 hover:text-rose-500 hover:bg-rose-50"
          )}
        >
          <span className={cn(compact ? "text-sm" : "text-base")}>❤️</span>
        </button>
        <button
          onClick={() => onReact('maybe')}
          title="Maybe"
          className={cn(
            "flex items-center justify-center rounded-full transition-all duration-200 hover:scale-105 active:scale-95",
            compact ? "w-8 h-8" : "w-10 h-10",
            currentReaction === 'maybe' 
              ? "bg-amber-100 text-amber-600 shadow-sm" 
              : "text-warm-500 hover:text-amber-500 hover:bg-amber-50"
          )}
        >
          <span className={cn(compact ? "text-sm" : "text-base")}>👍</span>
        </button>
        <button
          onClick={() => onReact('nope')}
          title="Not for us"
          className={cn(
            "flex items-center justify-center rounded-full transition-all duration-200 hover:scale-105 active:scale-95",
            compact ? "w-8 h-8" : "w-10 h-10",
            currentReaction === 'nope' 
              ? "bg-warm-200 text-warm-700 shadow-sm" 
              : "text-warm-500 hover:text-warm-700 hover:bg-warm-200/50"
          )}
        >
          <span className={cn(compact ? "text-sm" : "text-base")}>👎</span>
        </button>
      </div>

      <div className="flex gap-1 ml-2">
        <button 
          title="Save"
          className={cn(
            "flex items-center justify-center rounded-full border border-warm-200 bg-white text-warm-500 hover:bg-warm-50 transition-colors",
            compact ? "w-8 h-8" : "w-10 h-10"
          )}
        >
          <span className={cn(compact ? "text-sm" : "text-base")}>🔖</span>
        </button>
        <button 
          title="Hide"
          className={cn(
            "flex items-center justify-center rounded-full border border-warm-200 bg-white text-warm-500 hover:bg-warm-50 transition-colors",
            compact ? "w-8 h-8" : "w-10 h-10"
          )}
        >
          <span className={cn(compact ? "text-sm" : "text-base")}>👁️‍🗨️</span>
        </button>
      </div>
    </div>
  );
};
