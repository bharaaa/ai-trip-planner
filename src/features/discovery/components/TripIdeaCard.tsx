import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils/cn';
import type { TripIdea, TripReaction, ReactionType } from '@/types';
import { getReactionCounts } from '@/lib/utils/reactions';
import { formatBudgetRange } from '@/lib/utils/formatting';
import { Bookmark, MapPin } from 'lucide-react';

interface TripIdeaCardProps {
  idea: TripIdea;
  featured?: boolean;
  reactions?: TripReaction[];
  userReaction?: ReactionType;
  onReact?: (reaction: ReactionType) => void;
  onToggleSave?: (ideaId: string, isSaved: boolean) => void;
  onExplore?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const TripIdeaCard: React.FC<TripIdeaCardProps> = ({
  idea,
  featured,
  reactions = [],
  userReaction,
  onReact,
  onToggleSave,
  onExplore,
  className,
  style,
}) => {
  const reactionCounts = getReactionCounts(reactions);

  return (
    <motion.div 
      layoutId={`destination-${idea.id}`}
      className={cn(
        "group cursor-pointer relative rounded-[2.5rem] overflow-hidden bg-warm-900 border border-white/5",
        featured ? "h-[600px]" : "h-[500px]",
        className
      )}
      style={style}
      onClick={onExplore}
    >
      {/* Full Background Image */}
      {idea.imageUrl ? (
        <img 
          src={idea.imageUrl} 
          alt={idea.destination} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-warm-900 to-warm-800" />
      )}
      
      {/* Rich Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-warm-950 via-warm-950/20 to-transparent opacity-90 transition-opacity duration-700" />
      
      {/* Top Bar: Match Score & Bookmark */}
      <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start">
        {idea.fitScore !== undefined ? (
          <div className="bg-white/10 backdrop-blur-xl border border-white/10 text-white px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase flex items-center shadow-xl">
            {idea.fitScore}% Match
          </div>
        ) : <div/>}

        {onToggleSave && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(idea.id, !idea.isSaved);
            }}
            className="p-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 text-white hover:bg-white/20 transition-all shadow-xl"
            aria-label={idea.isSaved ? "Unsave idea" : "Save idea"}
          >
            <Bookmark 
              size={20} 
              className={idea.isSaved ? "fill-white" : ""} 
              strokeWidth={idea.isSaved ? 2 : 1.5}
            />
          </button>
        )}
      </div>

      {/* Bottom Content Area */}
      <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col justify-end">
        <h3 className={cn("font-black text-white tracking-tighter mb-1 drop-shadow-lg", featured ? "text-5xl sm:text-6xl" : "text-4xl")}>
          {idea.destination}
        </h3>
        
        {idea.country && (
          <p className="text-warm-300 font-medium tracking-wide flex items-center gap-2 mb-6 text-sm">
            <MapPin size={14} className="text-accent-400" />
            {idea.country}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold tracking-widest uppercase text-white mb-8">
          <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">{formatBudgetRange(idea.estimatedBudget.min, idea.estimatedBudget.max)}</span>
          <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">{idea.suggestedDuration} days</span>
        </div>

        {/* Reactions Summary */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-full text-xs border border-white/10 hover:bg-white/10 transition-colors" title="Love">
              <span className="text-base">❤️</span> <span className="font-bold text-white">{reactionCounts.love}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-full text-xs border border-white/10 hover:bg-white/10 transition-colors" title="Maybe">
              <span className="text-base">👍</span> <span className="font-bold text-white">{reactionCounts.maybe}</span>
            </div>
          </div>

          {onExplore && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onExplore();
              }}
              className="text-accent-400 text-xs font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center gap-2"
            >
              Explore <span className="text-lg leading-none">&rarr;</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
