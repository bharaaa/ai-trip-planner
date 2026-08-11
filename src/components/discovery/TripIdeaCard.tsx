import React from 'react';
import { cn } from '@/lib/utils/cn';
import type { TripIdea, TripReaction, ReactionType } from '@/types';
import { formatBudgetRange } from '@/lib/utils/formatting';
// Use emojis instead of lucide-react

interface TripIdeaCardProps {
  idea: TripIdea;
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
  reactions = [],
  userReaction,
  onReact,
  onExplore,
  className,
  style,
}) => {
  const reactionCounts = reactions.reduce(
    (acc, reaction) => {
      acc[reaction.reaction] = (acc[reaction.reaction] || 0) + 1;
      return acc;
    },
    { love: 0, maybe: 0, no: 0 } as Record<string, number>
  );

  return (
    <div 
      className={cn(
        "flex flex-col bg-white border border-warm-200 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg animate-slide-up",
        className
      )}
      style={style}
    >
      {/* Header Image Placeholder */}
      <div className={cn("h-40 w-full bg-gradient-to-br", getGradient(idea.destination))} />

      <div className="p-6 flex flex-col flex-grow">
        {/* Destination & Badges */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-warm-900 flex items-center gap-2">
            {idea.destination}
          </h3>
          <div className="flex flex-wrap gap-1 justify-end">
            {(idea as any).tags?.slice(0, 3).map((tag: string, i: number) => (
              <span key={i} className="text-xs px-2 py-1 bg-warm-50 text-warm-700 rounded-lg whitespace-nowrap">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Group Fit Section */}
        {idea.fitScore !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-warm-500 mb-1">
              <span>AI-estimated group fit</span>
              <span className="font-medium">{idea.fitScore}%</span>
            </div>
            <div className="h-1.5 w-full bg-warm-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent-400 rounded-full"
                style={{ width: `${idea.fitScore}%` }}
              />
            </div>
          </div>
        )}

        {/* Key Info */}
        <div className="flex gap-4 text-sm text-warm-600 mb-4">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">💳</span>
            {formatBudgetRange(idea.estimatedBudget.min, idea.estimatedBudget.max)}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">⏰</span>
            {idea.suggestedDuration} days
          </div>
        </div>

        {/* Reasons */}
        <div className="mb-6 flex-grow">
          <h4 className="text-sm font-medium text-warm-800 mb-2">Fits your group because...</h4>
          <ul className="space-y-1.5">
            {idea.reasons?.map((reason: string, i: number) => (
              <li key={i} className="text-sm text-warm-600 flex items-start gap-2">
                <span className="text-xs text-accent-400 mt-0.5 shrink-0">✅</span>
                <span className="leading-tight">{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Highlights */}
        {idea.highlights && idea.highlights.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {idea.highlights.slice(0, 3).map((highlight, i) => (
              <span key={i} className="text-xs px-2.5 py-1 border border-warm-200 text-warm-600 rounded-lg">
                {highlight}
              </span>
            ))}
          </div>
        )}

        {/* Reactions Summary & Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-warm-100 mt-auto">
          {reactions.length > 0 ? (
            <div className="flex gap-3 text-sm">
              <span className="flex items-center gap-1 text-warm-600" title="Love">
                ❤️ {reactionCounts.love}
              </span>
              <span className="flex items-center gap-1 text-warm-600" title="Maybe">
                👍 {reactionCounts.maybe}
              </span>
              <span className="flex items-center gap-1 text-warm-600" title="No">
                👎 {reactionCounts.nope}
              </span>
            </div>
          ) : (
            <div className="text-xs text-warm-400">No reactions yet</div>
          )}

          {onExplore && (
            <button 
              onClick={onExplore}
              className="px-4 py-2 bg-warm-900 hover:bg-warm-800 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Explore
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
