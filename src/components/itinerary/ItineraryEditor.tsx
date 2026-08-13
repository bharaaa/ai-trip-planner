import React from 'react';
import { cn } from '@/lib/utils/cn';
import { DaySection } from './DaySection';
import { motion, AnimatePresence } from 'motion/react';

interface ItineraryEditorProps {
  itinerary: any;
  onUpdateItem?: (dayId: string, itemId: string, updates: any) => void;
  onAddItem?: (dayId: string) => void;
  onRemoveItem?: (dayId: string, itemId: string) => void;
  onMoveItem?: (itemId: string, fromDayId: string, toDayId: string) => void;
  isEditable?: boolean;
}

export const ItineraryEditor: React.FC<ItineraryEditorProps> = ({
  itinerary,
  onUpdateItem,
  onAddItem,
  onRemoveItem,
  onMoveItem,
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
      {/* Summary Bar */}
      <div className="mb-10 pb-6 border-b border-warm-200">
        <h1 className="text-3xl font-bold text-warm-900 mb-2">{itinerary.destination}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-warm-600">
          {itinerary.startDate && itinerary.endDate && (
            <span className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              {itinerary.startDate} - {itinerary.endDate}
            </span>
          )}
          {itinerary.travelers && (
            <span className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              {itinerary.travelers} Travelers
            </span>
          )}
        </div>
      </div>

      {/* Days List */}
      <div className="space-y-8">
        <AnimatePresence>
          {itinerary.days.map((day: any, index: number) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              key={day.id}
            >
              <DaySection
                key={day.id}
                day={day}
                dayIndex={index}
                isEditable={isEditable}
                onUpdateItem={onUpdateItem ? (itemId, updates) => onUpdateItem(day.id, itemId, updates) : undefined}
                onAddItem={onAddItem ? () => onAddItem(day.id) : undefined}
                onRemoveItem={onRemoveItem ? (itemId) => onRemoveItem(day.id, itemId) : undefined}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
