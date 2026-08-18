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
        "group cursor-pointer relative rounded-3xl overflow-hidden bg-warm-900",
        featured ? "h-[500px]" : "h-[400px]",
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
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-warm-900 to-warm-800" />
      )}
      
      {/* Rich Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Top Bar: Match Score & Bookmark */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start">
        {idea.fitScore !== undefined ? (
          <div className="bg-black/30 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 rounded-full text-sm font-semibold flex items-center shadow-lg">
            {idea.fitScore}% Match
          </div>
        ) : <div/>}

        {onToggleSave && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(idea.id, !idea.isSaved);
            }}
            className="p-2.5 rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-colors shadow-lg"
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
      <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 flex flex-col justify-end">
        <h3 className={cn("font-bold text-white tracking-tight mb-2 drop-shadow-md", featured ? "text-4xl sm:text-5xl" : "text-3xl")}>
          {idea.destination}
        </h3>
        
        {idea.country && (
          <p className="text-white/80 font-medium flex items-center gap-1.5 mb-4 text-sm sm:text-base">
            <MapPin size={16} className="text-accent-400" />
            {idea.country}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-white/90 mb-6">
          <span className="bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-md">{formatBudgetRange(idea.estimatedBudget.min, idea.estimatedBudget.max)}</span>
          <span className="bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-md">{idea.suggestedDuration} days</span>
        </div>

        {/* Reactions Summary */}
        <div className="flex items-center justify-between pt-4 border-t border-white/20">
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-sm border border-white/10" title="Love">
              ❤️ <span className="font-semibold text-white">{reactionCounts.love}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-sm border border-white/10" title="Maybe">
              👍 <span className="font-semibold text-white">{reactionCounts.maybe}</span>
            </div>
          </div>

          {onExplore && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onExplore();
              }}
              className="text-white text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1"
            >
              Explore &rarr;
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
