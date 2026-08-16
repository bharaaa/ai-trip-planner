import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils/cn';
import type { TripIdea, TripReaction, ReactionType } from '@/types';
import { getReactionCounts } from '@/lib/utils/reactions';
import { formatBudgetRange } from '@/lib/utils/formatting';

interface TripIdeaCardProps {
  idea: TripIdea;
  featured?: boolean;
  reactions?: TripReaction[];
  userReaction?: ReactionType;
  onReact?: (reaction: ReactionType) => void;
  onExplore?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const getGradient = (destinationName: string) => {
  const normalized = (destinationName || '').toLowerCase();
  if (normalized.includes('yogyakarta')) return 'from-amber-100 to-orange-200';
  if (normalized.includes('bali')) return 'from-cyan-100 to-teal-200';
  if (normalized.includes('malang')) return 'from-emerald-100 to-green-200';
  if (normalized.includes('lombok')) return 'from-sky-100 to-blue-200';
  if (normalized.includes('bandung')) return 'from-violet-100 to-purple-200';
  return 'from-warm-100 to-warm-200';
};

export const TripIdeaCard: React.FC<TripIdeaCardProps> = ({
  idea,
  featured,
  reactions = [],
  userReaction,
  onReact,
  onExplore,
  className,
  style,
}) => {
  const reactionCounts = getReactionCounts(reactions);

  return (
    <motion.div 
      layoutId={`destination-${idea.id}`}
      className={cn(
        "flex flex-col group cursor-pointer animate-slide-up h-full bg-white rounded-[var(--radius-xl)] shadow-xs hover:shadow-md transition-all duration-300 border border-warm-200/60 overflow-hidden",
        className
      )}
      style={style}
      onClick={onExplore}
    >
      {/* Header Image */}
      <div className={cn(
        "w-full relative overflow-hidden transition-transform duration-700 group-hover:scale-105",
        featured ? "aspect-[16/9] md:aspect-[21/9]" : "aspect-[4/3]",
        getGradient(idea.destination)
      )}>
        {idea.imageUrl && (
          <img 
            src={idea.imageUrl} 
            alt={idea.destination} 
            className="w-full h-full object-cover" 
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-transparent" />
      </div>

      <div className="flex flex-col flex-grow p-5 md:p-6">
        {/* Destination */}
        <div className="flex items-center gap-3 mb-1">
          <h3 className={cn("font-semibold text-warm-900 tracking-tight", featured ? "text-3xl" : "text-2xl")}>
            {idea.destination}
          </h3>
          {idea.fitScore !== undefined && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent-50 text-accent-700 border border-accent-100">
              {idea.fitScore}% match
            </span>
          )}
        </div>

        {/* Title */}
        {idea.title && (
          <p className="text-warm-700 font-medium text-sm mb-3">{idea.title}</p>
        )}

        {/* AI Insight / Summary */}
        {(idea.summary || idea.reasons?.[0]) && (
          <p className="text-warm-600 mb-4 leading-relaxed text-sm">
            {idea.summary || idea.reasons?.[0]}
          </p>
        )}

        {/* Key Info */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-warm-500 mb-3 font-medium">
          <div className="flex items-center gap-1.5">
            <span>💳</span>
            {formatBudgetRange(idea.estimatedBudget.min, idea.estimatedBudget.max)}
          </div>
          <div className="flex items-center gap-1.5">
            <span>⏰</span>
            {idea.suggestedDuration} days
          </div>
          {idea.travelStyle && (
            <div className="flex items-center gap-1.5">
              <span>✨</span>
              {idea.travelStyle}
            </div>
          )}
        </div>

        {/* Key Activities */}
        {idea.keyActivities && idea.keyActivities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {idea.keyActivities.slice(0, 4).map((activity, idx) => (
              <span key={idx} className="px-2 py-1 bg-warm-100 text-warm-700 rounded-md text-xs font-medium border border-warm-200">
                {activity}
              </span>
            ))}
          </div>
        )}

        {/* Reactions Summary & Actions */}
        <div className="flex items-center justify-between pt-4 mt-auto border-t border-warm-100">
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 bg-warm-50 px-2.5 py-1 rounded-full text-sm border border-warm-200/60" title="Love">
              ❤️ <span className="font-semibold text-warm-700">{reactionCounts.love}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-warm-50 px-2.5 py-1 rounded-full text-sm border border-warm-200/60" title="Maybe">
              👍 <span className="font-semibold text-warm-700">{reactionCounts.maybe}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-warm-50 px-2.5 py-1 rounded-full text-sm border border-warm-200/60" title="No">
              👎 <span className="font-semibold text-warm-700">{reactionCounts.nope}</span>
            </div>
          </div>

          {onExplore && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onExplore();
              }}
              className="text-accent-500 text-sm font-semibold hover:text-accent-600 transition-colors flex items-center gap-1"
            >
              Explore details &rarr;
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
