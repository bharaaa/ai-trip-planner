import React from 'react';
import { cn } from '@/lib/utils/cn';
import { StaggerContainer } from '@/components/motion/StaggerContainer';
import { StaggerItem } from '@/components/motion/StaggerItem';
import type { TripIdea, TripReaction, ReactionType } from '@/types';
import { TripIdeaCard } from './TripIdeaCard';

interface RecommendationGridProps {
  ideas: TripIdea[];
  reactions?: Record<string, TripReaction[]>;
  userReactions?: Record<string, ReactionType>;
  onReact?: (ideaId: string, reaction: ReactionType) => void;
  onToggleSave?: (ideaId: string, isSaved: boolean) => void;
  onExplore?: (ideaId: string) => void;
  className?: string;
}

export const RecommendationGrid: React.FC<RecommendationGridProps> = ({
  ideas,
  reactions = {},
  userReactions = {},
  onReact,
  onToggleSave,
  onExplore,
  className,
}) => {
  return (
    <StaggerContainer className={cn("grid grid-cols-1 md:grid-cols-12 gap-8", className)}>
      {ideas.map((idea, index) => (
        <StaggerItem 
          key={idea.id}
          className={cn(index === 0 ? "col-span-12" : "col-span-12 md:col-span-6")}
        >
          <TripIdeaCard
            idea={idea}
            featured={index === 0}
            reactions={reactions[idea.id]}
            userReaction={userReactions[idea.id]}
            onReact={onReact ? (r) => onReact(idea.id, r) : undefined}
            onToggleSave={onToggleSave}
            onExplore={onExplore ? () => onExplore(idea.id) : undefined}
          />
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
};
