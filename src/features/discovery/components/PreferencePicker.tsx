import React from 'react';
import { Check } from 'lucide-react';
import { motion } from 'motion/react';

import { cn } from '@/lib/utils/cn';
import type { PreferenceCategory } from '@/types';

interface PreferencePickerProps {
  selectedCategories: Map<PreferenceCategory, number>;
  onToggle: (category: PreferenceCategory) => void;
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
      {CATEGORIES.map((category, i) => {
        const isSelected = selectedCategories.has(category.id);
        
        return (
          <motion.button
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => onToggle(category.id)}
            aria-pressed={isSelected}
            role="button"
            className={cn(
              "relative flex flex-col items-center justify-center p-6 rounded-2xl border text-center transition-all duration-300 ease-out outline-none",
              "hover:scale-[1.04] active:scale-[0.97]",
              isSelected
                ? "border-accent-400 bg-accent-500/15 shadow-[0_0_20px_rgba(14,165,233,0.15)]"
                : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
            )}
          >
            {isSelected && (
              <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }} 
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                className="absolute top-2.5 right-2.5 bg-accent-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-[0_0_10px_rgba(14,165,233,0.5)]"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </motion.div>
            )}
            <span className="text-4xl mb-3 block" aria-hidden="true">
              {category.emoji}
            </span>
            <span className={cn(
              "text-sm font-semibold transition-colors",
              isSelected ? "text-white" : "text-white/60"
            )}>{category.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
};
