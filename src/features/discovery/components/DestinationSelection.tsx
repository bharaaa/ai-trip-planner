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
    <div className={cn("bg-white border-2 border-accent-400 rounded-2xl overflow-hidden shadow-xl animate-scale-in", className)}>
      <div className="bg-accent-400 p-8 text-center text-white">
        <div className="inline-flex items-center justify-center p-3 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
          <span className="text-3xl">✅</span>
        </div>
        <h2 className="text-sm font-medium text-accent-50 uppercase tracking-wider mb-2">
          Destination Decided
        </h2>
        <h3 className="text-3xl md:text-4xl font-bold mb-2">
          {destination.name} {destination.countryFlagEmoji}
        </h3>
        <p className="text-accent-100">
          Ready to start planning your perfect trip!
        </p>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-warm-50 p-6 rounded-xl">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="p-2 bg-white rounded-lg text-warm-500 shadow-sm">
              <span className="text-lg">👥</span>
            </div>
            <div>
              <p className="text-xs text-warm-500 uppercase tracking-wider font-medium mb-1">Travelers</p>
              <p className="text-sm font-semibold text-warm-900">{travelers} people</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center text-center gap-2">
            <div className="p-2 bg-white rounded-lg text-warm-500 shadow-sm">
              <span className="text-lg">📅</span>
            </div>
            <div>
              <p className="text-xs text-warm-500 uppercase tracking-wider font-medium mb-1">Dates</p>
              <p className="text-sm font-semibold text-warm-900">{dates}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center text-center gap-2">
            <div className="p-2 bg-white rounded-lg text-warm-500 shadow-sm">
              <span className="text-lg">💳</span>
            </div>
            <div>
              <p className="text-xs text-warm-500 uppercase tracking-wider font-medium mb-1">Est. Budget</p>
              <p className="text-sm font-semibold text-warm-900">
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
                className="px-6 py-3 text-sm font-medium text-warm-600 hover:text-warm-900 hover:bg-warm-100 rounded-xl transition-colors order-2 sm:order-1"
              >
                Change destination
              </button>
            )}
            <button
              onClick={onConfirm}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-warm-900 hover:bg-black text-white text-base font-semibold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md order-1 sm:order-2"
            >
              Start planning
              <span className="text-lg">➡️</span>
            </button>
          </div>
        ) : (
          <div className="text-center p-4 bg-warm-100/50 rounded-xl">
            <p className="text-sm font-medium text-warm-600">Waiting for the trip organizer to finalize the destination...</p>
          </div>
        )}
      </div>
    </div>
  );
};
