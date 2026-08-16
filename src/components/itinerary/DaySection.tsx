import React from 'react';
import { cn } from '@/lib/utils/cn';
import type { ItineraryDay, ItineraryItem } from '@/types';
import { ActivityCard } from './ActivityCard';
import { Timeline } from './Timeline';

interface DaySectionProps {
  day: ItineraryDay;
  dayIndex: number;
  onUpdateItem?: (itemId: string, updates: Partial<ItineraryItem>) => void;
  onAddItem?: (dayId: string) => void;
  onRemoveItem?: (itemId: string) => void;
  isEditable?: boolean;
}

export const DaySection: React.FC<DaySectionProps> = ({
  day,
  dayIndex,
  onUpdateItem,
  onAddItem,
  onRemoveItem,
  isEditable = true,
}) => {
  return (
    <div className="flex flex-col mb-10 relative">
      <div className="sticky top-0 z-20 bg-warm-50/90 backdrop-blur-md pb-4 pt-2 mb-4 border-b border-warm-200/60 flex items-center gap-4">
        <div className="w-8 h-8 bg-warm-900 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-sm">
          {dayIndex + 1}
        </div>
        <div>
          {day.title && (
            <h3 className="text-xl font-bold text-warm-950 tracking-tight leading-tight">
              {day.title}
            </h3>
          )}
          {day.date && (
            <span className="text-xs uppercase tracking-widest text-warm-500 font-semibold mt-0.5 block">
              {day.date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) || day.date.toString()}
            </span>
          )}
        </div>
      </div>

      <Timeline className="space-y-1">
        {day.items.map((item) => (
          <ActivityCard
            key={item.id}
            item={item}
            isEditable={isEditable}
            onEdit={
              onUpdateItem
                ? (updates) => onUpdateItem(item.id, updates)
                : undefined
            }
            onRemove={onRemoveItem ? () => onRemoveItem(item.id) : undefined}
            onToggleMustDo={
              onUpdateItem
                ? () => onUpdateItem(item.id, { isMustDo: !item.isMustDo })
                : undefined
            }
          />
        ))}
      </Timeline>

      {isEditable && onAddItem && (
        <div className="mt-4 pl-[4.5rem]">
          <button
            onClick={() => onAddItem(day.dayNumber.toString())}
            className="text-sm font-medium text-warm-500 hover:text-accent-500 hover:bg-warm-50 px-4 py-2 rounded-lg transition-colors border border-dashed border-warm-200 w-full text-left"
          >
            + Add activity
          </button>
        </div>
      )}
    </div>
  );
};
