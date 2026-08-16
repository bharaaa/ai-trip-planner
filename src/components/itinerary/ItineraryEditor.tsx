import React from 'react';
import { cn } from '@/lib/utils/cn';
import type { Itinerary, ItineraryDay, ItineraryItem } from '@/types';
import { DaySection } from './DaySection';
import { motion, AnimatePresence } from 'motion/react';

interface ItineraryEditorProps {
  itinerary: Itinerary;
  onUpdateItem?: (dayId: string, itemId: string, updates: Partial<ItineraryItem>) => void;
  onAddItem?: (dayId: string) => void;
  onRemoveItem?: (dayId: string, itemId: string) => void;
  isEditable?: boolean;
}

export const ItineraryEditor: React.FC<ItineraryEditorProps> = ({
  itinerary,
  onUpdateItem,
  onAddItem,
  onRemoveItem,
  isEditable = true
}) => {
  if (!itinerary || !itinerary.days || itinerary.days.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="w-16 h-16 bg-warm-50 text-warm-400 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
        </div>
        <h3 className="text-lg font-semibold text-warm-900 mb-2">No itinerary yet</h3>
        <p className="text-warm-500 max-w-sm">
          Generate an itinerary with AI or start adding days and activities manually.
        </p>
      </div>
    );
  }

  return (
      <div className="flex flex-col w-full max-w-3xl mx-auto">
      {/* Days List */}
      <div className="space-y-8">
        <AnimatePresence>
          {itinerary.days.map((day: ItineraryDay, index: number) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              key={day.dayNumber}
            >
              <DaySection
                key={day.dayNumber}
                day={day}
                dayIndex={index}
                isEditable={isEditable}
                onUpdateItem={onUpdateItem ? (itemId, updates) => onUpdateItem(day.dayNumber.toString(), itemId, updates) : undefined}
                onAddItem={onAddItem ? () => onAddItem(day.dayNumber.toString()) : undefined}
                onRemoveItem={onRemoveItem ? (itemId) => onRemoveItem(day.dayNumber.toString(), itemId) : undefined}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
