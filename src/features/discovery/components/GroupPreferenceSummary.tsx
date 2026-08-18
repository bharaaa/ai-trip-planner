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
    <div className={cn("space-y-6", className)}>
      <h3 className="text-[10px] font-bold tracking-widest text-warm-500 uppercase">
        The Group Vibe
      </h3>
      <div className="space-y-5">
        {sortedPreferences.map((pref) => (
          <div key={pref.category} className="flex items-center gap-4">
            <div className="flex items-center gap-3 w-28 shrink-0">
              <span className="text-lg opacity-80">{pref.emoji}</span>
              <span className="text-xs font-bold tracking-wide text-white">{pref.label}</span>
            </div>
            <div className="flex-grow h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(var(--accent-400),0.8)]"
                style={{ width: mounted ? `${pref.score}%` : '0%' }}
              />
            </div>
            <div className="w-8 text-right text-[10px] font-bold text-warm-500 shrink-0">
              {pref.score}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
