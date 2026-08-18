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
    <div className="flex flex-col mb-16 relative">
      
      {/* Editorial Day Header */}
      <div className="sticky top-[60px] z-20 bg-warm-950/95 backdrop-blur-md pb-6 pt-4 mb-6 border-b border-white/10 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-bold tracking-widest text-accent-400 uppercase bg-accent-500/20 px-3 py-1 rounded-full">
                Day {dayIndex + 1}
              </span>
              {day.date && (
                <span className="text-sm font-bold text-warm-400">
                  {day.date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }) || day.date.toString()}
                </span>
              )}
            </div>
            {day.title && (
              <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
                {day.title}
              </h3>
            )}
          </div>
          
          {isEditable && onAddItem && (
            <button
              onClick={() => onAddItem(day.dayNumber.toString())}
              className="text-sm font-bold text-warm-300 hover:text-white hover:bg-white/10 px-4 py-2.5 rounded-xl transition-colors border border-white/20 shadow-sm flex items-center justify-center gap-2 self-start sm:self-auto"
            >
              <Plus size={16} /> Add activity
            </button>
          )}
        </div>
      </div>

      {/* The Timeline Container */}
      <div className="relative pl-2 sm:pl-4">
        
        {/* The Continuous Vertical Line */}
        {day.items.length > 0 && (
          <div className="absolute left-[5.4rem] sm:left-[6.9rem] top-4 bottom-12 w-1 bg-white/10 rounded-full" />
        )}

        {/* The Activities */}
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
            <div className="py-12 px-6 rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-center bg-white/5 ml-16 sm:ml-20">
              <span className="text-4xl mb-4">✍️</span>
              <p className="text-white font-medium mb-1">A blank canvas.</p>
              <p className="text-sm text-warm-400 mb-4">Start planning activities for this day.</p>
              {isEditable && onAddItem && (
                <button
                  onClick={() => onAddItem(day.dayNumber.toString())}
                  className="text-sm font-bold text-accent-400 bg-accent-500/20 hover:bg-accent-500/30 px-5 py-2.5 rounded-full transition-colors"
                >
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
