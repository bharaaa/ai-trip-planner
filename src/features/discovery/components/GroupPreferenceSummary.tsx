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
    <div className={cn("bg-white/5 border border-white/10 rounded-2xl p-6 shadow-sm", className)}>
      <h3 className="text-lg font-bold text-white tracking-tight mb-6">
        Your group seems to like
      </h3>
      <div className="space-y-4">
        {sortedPreferences.map((pref) => (
          <div key={pref.category} className="flex items-center gap-4">
            <div className="flex items-center gap-2 w-32 shrink-0">
              <span className="text-xl">{pref.emoji}</span>
              <span className="text-sm font-medium text-warm-300">{pref.label}</span>
            </div>
            <div className="flex-grow h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(var(--accent-500),0.5)]"
                style={{ width: mounted ? `${pref.score}%` : '0%' }}
              />
            </div>
            <div className="w-8 text-right text-sm font-bold text-white shrink-0">
              {pref.score}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
