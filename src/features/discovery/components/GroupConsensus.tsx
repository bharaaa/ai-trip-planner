import React from 'react';
import { cn } from '@/lib/utils/cn';
import type { TripReaction } from '@/types';
import { motion } from 'motion/react';

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
    <div className={cn("bg-white/5 border border-white/10 rounded-2xl p-6 shadow-sm", className)}>
      <h3 className="text-lg font-bold text-white mb-1">
        Consensus on {ideaName}
      </h3>
      <p className="text-sm text-warm-400 mb-6">Based on your group's reactions</p>

      <div className="mb-6">
        <div className="flex justify-between text-sm font-bold mb-2">
          <span className="text-warm-300">Group Fit</span>
          <span className="text-accent-400">~{fitScore}%</span>
        </div>
        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-accent-500 rounded-full shadow-[0_0_10px_rgba(var(--accent-500),0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${fitScore}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <p className="text-xs text-warm-500 mt-2 italic">
          *Scores are estimates to guide discussion, not mathematical certainty.
        </p>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center shadow-sm">
          <span className="text-xl mb-1">❤️</span>
          <span className="text-lg font-bold text-rose-400">{counts.love}</span>
          <span className="text-xs text-warm-400 font-medium">Love it</span>
        </div>
        <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center shadow-sm">
          <span className="text-xl mb-1">👍</span>
          <span className="text-lg font-bold text-amber-400">{counts.maybe}</span>
          <span className="text-xs text-warm-400 font-medium">Maybe</span>
        </div>
        <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center shadow-sm">
          <span className="text-xl mb-1">👎</span>
          <span className="text-lg font-bold text-warm-400">{counts.nope}</span>
          <span className="text-xs text-warm-500 font-medium">Not for us</span>
        </div>
      </div>
    </div>
  );
};
