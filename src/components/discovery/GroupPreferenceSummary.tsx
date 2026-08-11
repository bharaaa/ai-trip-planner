import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';

interface PreferenceScore {
  category: string;
  label: string;
  score: number; // 0 to 100
  emoji: string;
}

interface GroupPreferenceSummaryProps {
  preferences: PreferenceScore[];
  className?: string;
}

export const GroupPreferenceSummary: React.FC<GroupPreferenceSummaryProps> = ({
  preferences,
  className,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Delay animation trigger slightly for effect
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const sortedPreferences = [...preferences].sort((a, b) => b.score - a.score);

  return (
    <div className={cn("bg-white border border-warm-200 rounded-2xl p-6", className)}>
      <h3 className="text-lg font-semibold text-warm-900 mb-6">
        Your group seems to like
      </h3>
      <div className="space-y-4">
        {sortedPreferences.map((pref) => (
          <div key={pref.category} className="flex items-center gap-4">
            <div className="flex items-center gap-2 w-32 shrink-0">
              <span className="text-xl">{pref.emoji}</span>
              <span className="text-sm font-medium text-warm-700">{pref.label}</span>
            </div>
            <div className="flex-grow h-2.5 bg-warm-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-400 rounded-full transition-all duration-1000 ease-out"
                style={{ width: mounted ? `${pref.score}%` : '0%' }}
              />
            </div>
            <div className="w-8 text-right text-sm font-semibold text-warm-500 shrink-0">
              {pref.score}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
