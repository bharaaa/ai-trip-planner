import React from 'react';
import { cn } from '@/lib/utils/cn';
import type { ItineraryDay, ItineraryItem } from '@/types';
import { ActivityCard } from './ActivityCard';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';

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
    <div className="flex flex-col mb-20 relative">
      
      {/* Day Header */}
      <div className="sticky top-[76px] z-20 bg-warm-950/95 backdrop-blur-md pb-6 pt-6 mb-8 border-b border-white/5 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-baseline gap-4">
            <span className="text-7xl sm:text-8xl font-black text-white/[0.07] leading-none tracking-tighter select-none">
              {String(dayIndex + 1).padStart(2, '0')}
            </span>
            <div className="-ml-2">
              <span className="text-xs font-bold tracking-[0.2em] text-accent-400 uppercase block mb-1">
                Day {dayIndex + 1}
              </span>
              {day.title && (
                <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
                  {day.title}
                </h3>
              )}
              {day.date && (
                <span className="text-sm font-medium text-white/30 mt-1 block">
                  {day.date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) || day.date.toString()}
                </span>
              )}
            </div>
          </div>
          
          {isEditable && onAddItem && (
            <button
              onClick={() => onAddItem(day.dayNumber.toString())}
              className="text-sm font-bold text-white/40 hover:text-white hover:bg-white/10 px-4 py-2.5 rounded-full transition-all border border-white/10 flex items-center justify-center gap-2 self-start sm:self-auto"
            >
              <Plus size={16} /> Add
            </button>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative pl-2 sm:pl-4">
        
        {/* Vertical Line */}
        {day.items.length > 0 && (
          <div className="absolute left-[5.4rem] sm:left-[6.9rem] top-4 bottom-12 w-px bg-white/10" />
        )}

        {/* Activities */}
        <div className="space-y-0">
          {day.items.map((item, index) => (
            <ActivityCard
              key={item.id}
              item={item}
              isEditable={isEditable}
              isLast={index === day.items.length - 1}
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
          
          {day.items.length === 0 && (
            <div className="py-16 px-8 rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center ml-16 sm:ml-20">
              <p className="text-white/60 font-medium mb-1">Nothing planned yet</p>
              <p className="text-sm text-white/30 mb-6">Start adding activities for this day.</p>
              {isEditable && onAddItem && (
                <button
                  onClick={() => onAddItem(day.dayNumber.toString())}
                  className="text-sm font-bold text-accent-400 hover:text-accent-300 transition-colors flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add the first activity
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
