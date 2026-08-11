import React from 'react';
import { cn } from '@/lib/utils/cn';
import type { TripReaction } from '@/types';

interface GroupConsensusProps {
  ideaName: string;
  reactions: TripReaction[];
  fitScore: number;
  className?: string;
}

export const GroupConsensus: React.FC<GroupConsensusProps> = ({
  ideaName,
  reactions,
  fitScore,
  className,
}) => {
  const counts = reactions.reduce(
    (acc, r) => {
      acc[r.reaction] = (acc[r.reaction] || 0) + 1;
      return acc;
    },
    { love: 0, maybe: 0, nope: 0 } as Record<string, number>
  );

  return (
    <div className={cn("bg-white border border-warm-200 rounded-2xl p-6", className)}>
      <h3 className="text-lg font-semibold text-warm-900 mb-1">
        Consensus on {ideaName}
      </h3>
      <p className="text-sm text-warm-500 mb-6">Based on your group's reactions</p>

      <div className="mb-6">
        <div className="flex justify-between text-sm font-medium mb-2">
          <span className="text-warm-700">Group Fit</span>
          <span className="text-accent-500">~{fitScore}%</span>
        </div>
        <div className="h-2 w-full bg-warm-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-accent-400 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${fitScore}%` }}
          />
        </div>
        <p className="text-xs text-warm-400 mt-2 italic">
          *Scores are estimates to guide discussion, not mathematical certainty.
        </p>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 bg-rose-50 border border-rose-100 rounded-xl p-3 flex flex-col items-center">
          <span className="text-xl mb-1">❤️</span>
          <span className="text-lg font-bold text-rose-700">{counts.love}</span>
          <span className="text-xs text-rose-600 font-medium">Love it</span>
        </div>
        <div className="flex-1 bg-amber-50 border border-amber-100 rounded-xl p-3 flex flex-col items-center">
          <span className="text-xl mb-1">👍</span>
          <span className="text-lg font-bold text-amber-700">{counts.maybe}</span>
          <span className="text-xs text-amber-600 font-medium">Maybe</span>
        </div>
        <div className="flex-1 bg-warm-100 border border-warm-200 rounded-xl p-3 flex flex-col items-center">
          <span className="text-xl mb-1">👎</span>
          <span className="text-lg font-bold text-warm-700">{counts.nope}</span>
          <span className="text-xs text-warm-600 font-medium">Not for us</span>
        </div>
      </div>
    </div>
  );
};
