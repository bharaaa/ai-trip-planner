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
      <div className="flex bg-white/10 rounded-full p-1 border border-white/5">
        <button
          onClick={() => onReact('love')}
          title="Love"
          className={cn(
            "flex items-center justify-center rounded-full transition-all duration-200 hover:scale-105 active:scale-95",
            compact ? "w-8 h-8" : "w-10 h-10",
            currentReaction === 'love' 
              ? "bg-rose-500/20 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.3)]" 
              : "text-warm-400 hover:text-rose-400 hover:bg-rose-500/10"
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
              ? "bg-amber-500/20 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]" 
              : "text-warm-400 hover:text-amber-400 hover:bg-amber-500/10"
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
              ? "bg-white/20 text-white shadow-sm" 
              : "text-warm-400 hover:text-white hover:bg-white/10"
          )}
        >
          <span className={cn(compact ? "text-sm" : "text-base")}>👎</span>
        </button>
      </div>

      <div className="flex gap-1 ml-2">
        <button 
          title="Save"
          className={cn(
            "flex items-center justify-center rounded-full border border-white/10 bg-white/5 text-warm-400 hover:bg-white/10 hover:text-white transition-colors",
            compact ? "w-8 h-8" : "w-10 h-10"
          )}
        >
          <span className={cn(compact ? "text-sm" : "text-base")}>🔖</span>
        </button>
        <button 
          title="Hide"
          className={cn(
            "flex items-center justify-center rounded-full border border-white/10 bg-white/5 text-warm-400 hover:bg-white/10 hover:text-white transition-colors",
            compact ? "w-8 h-8" : "w-10 h-10"
          )}
        >
          <span className={cn(compact ? "text-sm" : "text-base")}>👁️‍🗨️</span>
        </button>
      </div>
    </div>
  );
};
