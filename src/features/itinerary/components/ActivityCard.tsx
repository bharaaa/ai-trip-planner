import React from 'react';
import { cn } from '@/lib/utils/cn';
import type { ItineraryItem } from '@/types';
import { motion } from 'motion/react';
import { MapPin, Clock, MoreHorizontal, Sparkles } from 'lucide-react';

interface ActivityCardProps {
  item: ItineraryItem;
  onEdit?: (updates: Partial<ItineraryItem>) => void;
  onRemove?: () => void;
  onToggleMustDo?: () => void;
  isEditable?: boolean;
  className?: string;
  isLast?: boolean;
}

const emojiMap: Record<string, string> = {
  arrival: '✈️',
  departure: '✈️',
  accommodation: '🏨',
  food: '🍜',
  beach: '🏖',
  nature: '🌿',
  culture: '🏛',
  adventure: '🏕',
  shopping: '🛍',
  nightlife: '🎉',
  transport: '🚗',
  free_time: '☕',
  custom: '📍'
};

export const ActivityCard: React.FC<ActivityCardProps> = ({
  item,
  onEdit,
  onRemove,
  onToggleMustDo,
  isEditable = true,
  className,
  isLast
}) => {
  const emoji = emojiMap[item.type] || '📍';

  return (
    <motion.div layout className={cn("group relative flex gap-6 sm:gap-8", className)}>
      
      {/* Left Column: Time & Node */}
      <div className="flex flex-col items-end w-16 sm:w-20 shrink-0 pt-1 relative">
        <span className="text-sm font-bold text-white tracking-tight">{item.time || 'TBD'}</span>
        
        {/* The Node */}
        <div className="absolute right-[-1.65rem] sm:right-[-2.15rem] top-1.5 z-10">
          <div className={cn(
            "w-4 h-4 rounded-full border-[3px] border-warm-950 shadow-sm flex items-center justify-center transition-all duration-300",
            item.isMustDo ? "bg-accent-500 scale-125" : "bg-white/20 group-hover:bg-white/40 group-hover:scale-110"
          )} />
        </div>
      </div>

      {/* Right Column: Content Card */}
      <div className="flex-1 pb-10">
        <div className="relative bg-white/5 rounded-3xl p-5 sm:p-6 border border-white/10 shadow-sm hover:shadow-md transition-all duration-300 group-hover:border-white/20">
          
          <div className="flex justify-between items-start mb-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl shrink-0 shadow-inner">
                {emoji}
              </div>
              <div>
                <h4 className="text-lg font-bold text-white tracking-tight leading-tight flex items-center gap-2">
                  {item.title}
                  {item.isAIGenerated && (
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-accent-500/20 text-accent-400 px-1.5 py-0.5 rounded flex-shrink-0">
                      <Sparkles size={10} /> AI
                    </span>
                  )}
                </h4>
                {item.location && (
                  <p className="text-sm font-medium text-warm-400 flex items-center gap-1 mt-1">
                    <MapPin size={14} className="text-warm-500" />
                    {item.location}
                  </p>
                )}
              </div>
            </div>
            
            {/* Quick Actions */}
            {isEditable && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-warm-950/80 backdrop-blur-sm rounded-full px-2 py-1 border border-white/10 shadow-xs absolute right-4 top-4">
                <button 
                  onClick={onToggleMustDo}
                  className={cn("p-1.5 rounded-full transition-colors", item.isMustDo ? "text-accent-400 bg-accent-500/20" : "text-warm-400 hover:text-accent-400 hover:bg-white/10")}
                  title={item.isMustDo ? "Remove Must-do" : "Mark as Must-do"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={item.isMustDo ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                </button>
                {onEdit && (
                  <button 
                    onClick={() => onEdit({})} 
                    className="p-1.5 text-warm-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                    title="Edit Activity"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                  </button>
                )}
                {onRemove && (
                  <button 
                    onClick={onRemove}
                    className="p-1.5 text-warm-400 hover:text-error-400 rounded-full hover:bg-error-500/20 transition-colors"
                    title="Remove Activity"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                )}
              </div>
            )}
          </div>
          
          {item.description && (
            <p className="text-[15px] text-warm-300 leading-relaxed pl-12 sm:pl-14 pr-2">
              {item.description}
            </p>
          )}

          {item.notes && (
            <div className="mt-4 ml-12 sm:ml-14 bg-accent-500/10 p-3 rounded-2xl border border-accent-500/20">
              <p className="text-[13px] text-accent-300 italic flex items-start gap-2">
                <span className="text-accent-400 mt-0.5">💡</span>
                {item.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
