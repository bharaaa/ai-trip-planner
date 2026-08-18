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
    <StaggerContainer className={cn(
      "flex overflow-x-auto pb-8 -mx-6 px-6 snap-x snap-mandatory md:grid md:grid-cols-12 md:gap-8 md:overflow-visible md:pb-0 md:px-0 md:mx-0 md:snap-none hide-scrollbar", 
      className
    )}>
      {ideas.map((idea, index) => (
        <StaggerItem 
          key={idea.id}
          className={cn(
            "w-[85vw] shrink-0 snap-center mr-4 md:mr-0 md:w-auto md:shrink md:snap-align-none",
            index === 0 ? "md:col-span-12" : "md:col-span-6"
          )}
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
