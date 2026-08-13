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
    <div className="flex flex-col mb-4">
      <div className="mb-4 pb-3 border-b border-warm-200/40 flex items-center gap-3">
        <div className="w-7 h-7 bg-accent-400 text-white rounded-full flex items-center justify-center text-xs font-bold">
          {dayIndex + 1}
        </div>
        <div>
          {day.title && (
            <h3 className="text-lg font-semibold text-warm-900 leading-tight">
              {day.title}
            </h3>
          )}
          {day.date && (
            <span className="text-xs uppercase tracking-wider text-warm-500 font-medium">
              {day.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) || day.date.toString()}
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
