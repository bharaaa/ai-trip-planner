import React from 'react';

import { cn } from '@/lib/utils/cn';
import type { PreferenceCategory } from '@/types';

interface PreferencePickerProps {
  selectedCategories: Map<PreferenceCategory, number>;
  onToggle: (category: PreferenceCategory) => void;
  onRank?: (category: PreferenceCategory, rank: number) => void;
}

const CATEGORIES: { id: PreferenceCategory; label: string; emoji: string }[] = [
  { id: 'beach', label: 'Beach', emoji: '🌊' },
  { id: 'food', label: 'Food', emoji: '🍜' },
  { id: 'nature', label: 'Nature', emoji: '🌿' },
  { id: 'culture', label: 'Culture', emoji: '🏛' },
  { id: 'nightlife', label: 'Nightlife', emoji: '🎉' },
  { id: 'adventure', label: 'Adventure', emoji: '🏕' },
  { id: 'cafes', label: 'Cafés', emoji: '☕' },
  { id: 'shopping', label: 'Shopping', emoji: '🛍' },
];

export const PreferencePicker: React.FC<PreferencePickerProps> = ({
  selectedCategories,
  onToggle,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
      {CATEGORIES.map((category) => {
        const isSelected = selectedCategories.has(category.id);
        
        return (
          <button
            key={category.id}
            onClick={() => onToggle(category.id)}
            aria-pressed={isSelected}
            role="button"
            className={cn(
              "relative flex flex-col items-center justify-center p-5 rounded-2xl border text-center transition-all duration-200 ease-out outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2",
              "hover:scale-[1.02] hover:shadow-sm active:scale-[0.98]",
              isSelected
                ? "border-accent-400 bg-accent-50/50"
                : "border-warm-200/60 bg-white"
            )}
          >
            {isSelected && (
              <div className="absolute top-2.5 right-2.5 bg-accent-400 text-white rounded-full p-0.5 animate-scale-in">
                <span className="text-[10px] text-white">✔️</span>
              </div>
            )}
            <span className="text-3xl mb-2 block" aria-hidden="true">
              {category.emoji}
            </span>
            <span className="text-sm font-medium text-warm-800">{category.label}</span>
          </button>
        );
      })}
    </div>
  );
};
