import React from 'react';
import { cn } from '@/lib/utils/cn';
import { formatBudgetRange } from '@/lib/utils/formatting';
// Use emoji instead of lucide-react

interface DestinationSelectionProps {
  destination: {
    name: string;
    countryFlagEmoji?: string;
  };
  travelers: number;
  dates: string; // e.g. 'Oct 12 - Oct 18, 2024'
  budget: { min: number; max: number };
  onConfirm: () => void;
  onChangeDestination?: () => void;
  isAdmin?: boolean;
  className?: string;
}

export const DestinationSelection: React.FC<DestinationSelectionProps> = ({
  destination,
  travelers,
  dates,
  budget,
  onConfirm,
  onChangeDestination,
  isAdmin = false,
  className,
}) => {
  return (
    <div className={cn("bg-white/5 border border-accent-500/30 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md animate-scale-in", className)}>
      <div className="bg-accent-500/20 border-b border-accent-500/30 p-8 text-center text-white">
        <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full mb-4 backdrop-blur-sm border border-white/20">
          <span className="text-3xl">✅</span>
        </div>
        <h2 className="text-sm font-medium text-accent-300 uppercase tracking-widest mb-2">
          Destination Decided
        </h2>
        <h3 className="text-3xl md:text-4xl font-bold mb-2 text-white">
          {destination.name} {destination.countryFlagEmoji}
        </h3>
        <p className="text-warm-300">
          Ready to start planning your perfect trip!
        </p>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-white/5 border border-white/10 p-6 rounded-xl">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="p-2 bg-white/10 rounded-lg text-warm-200 border border-white/5">
              <span className="text-lg">👥</span>
            </div>
            <div>
              <p className="text-xs text-warm-400 uppercase tracking-wider font-medium mb-1">Travelers</p>
              <p className="text-sm font-semibold text-white">{travelers} people</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center text-center gap-2">
            <div className="p-2 bg-white/10 rounded-lg text-warm-200 border border-white/5">
              <span className="text-lg">📅</span>
            </div>
            <div>
              <p className="text-xs text-warm-400 uppercase tracking-wider font-medium mb-1">Dates</p>
              <p className="text-sm font-semibold text-white">{dates}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center text-center gap-2">
            <div className="p-2 bg-white/10 rounded-lg text-warm-200 border border-white/5">
              <span className="text-lg">💳</span>
            </div>
            <div>
              <p className="text-xs text-warm-400 uppercase tracking-wider font-medium mb-1">Est. Budget</p>
              <p className="text-sm font-semibold text-white">
                {formatBudgetRange(budget.min, budget.max)}
              </p>
            </div>
          </div>
        </div>

        {isAdmin ? (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {onChangeDestination && (
              <button
                onClick={onChangeDestination}
                className="px-6 py-3 text-sm font-bold text-warm-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors order-2 sm:order-1"
              >
                Change destination
              </button>
            )}
            <button
              onClick={onConfirm}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-accent-500 hover:bg-accent-600 text-white text-base font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(var(--accent-500),0.3)] order-1 sm:order-2"
            >
              Start planning
              <span className="text-lg">➡️</span>
            </button>
          </div>
        ) : (
          <div className="text-center p-4 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-sm font-medium text-warm-400">Waiting for the trip organizer to finalize the destination...</p>
          </div>
        )}
      </div>
    </div>
  );
};
