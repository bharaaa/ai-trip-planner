import React from 'react';
import { cn } from '@/lib/utils/cn';
import type { TripIdea, TripReaction, ReactionType } from '@/types';
import { TripIdeaCard } from './TripIdeaCard';

interface RecommendationGridProps {
  ideas: TripIdea[];
  reactions?: Record<string, TripReaction[]>;
  userReactions?: Record<string, ReactionType>;
  onReact?: (ideaId: string, reaction: ReactionType) => void;
  onExplore?: (ideaId: string) => void;
  className?: string;
}

export const RecommendationGrid: React.FC<RecommendationGridProps> = ({
  ideas,
  reactions = {},
  userReactions = {},
  onReact,
  onExplore,
  className,
}) => {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
      {ideas.map((idea, index) => (
        <TripIdeaCard
          key={idea.id}
          idea={idea}
          reactions={reactions[idea.id]}
          userReaction={userReactions[idea.id]}
          onReact={onReact ? (r) => onReact(idea.id, r) : undefined}
          onExplore={onExplore ? () => onExplore(idea.id) : undefined}
          style={{ animationDelay: `${index * 100}ms` }}
        />
      ))}
    </div>
  );
};
