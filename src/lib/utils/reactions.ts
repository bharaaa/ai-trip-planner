import type { TripReaction, ReactionType } from '@/types';

export function getReactionCounts(reactions: TripReaction[]): Record<ReactionType, number> {
  return reactions.reduce(
    (acc, reaction) => {
      acc[reaction.reaction] = (acc[reaction.reaction] || 0) + 1;
      return acc;
    },
    { love: 0, maybe: 0, nope: 0, save: 0, hide: 0 } as Record<ReactionType, number>
  );
}
