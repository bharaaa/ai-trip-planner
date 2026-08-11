import React from 'react';
import { cn } from '@/lib/utils/cn';
import type { ItineraryItem } from '@/types';

interface ActivityCardProps {
  item: ItineraryItem;
  onEdit?: (updates: Partial<ItineraryItem>) => void;
  onRemove?: () => void;
  onToggleMustDo?: () => void;
  isEditable?: boolean;
  className?: string;
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
  className
}) => {
  const emoji = emojiMap[item.type] || '📍';

  return (
    <div className={cn(
      "group relative flex items-start gap-4 p-4 bg-white rounded-xl border border-warm-100 hover:border-warm-200 transition-all duration-200",
      item.isMustDo && "border-l-4 border-l-accent-400 pl-3",
      className
    )}>
      {/* Time */}
      <div className="w-16 flex-shrink-0 pt-1 text-sm text-warm-400 font-medium text-right">
        {item.time || <span className="opacity-0">--:--</span>}
      </div>

      {/* Content */}
      <div className="flex-grow">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl" role="img" aria-label={item.type}>{emoji}</span>
          <h4 className="text-base font-semibold text-warm-900">{item.title}</h4>
          {item.isAIGenerated && (
            <span className="ml-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-accent-50 text-accent-600 rounded-full">
              AI
            </span>
          )}
        </div>
        
        {item.description && (
          <p className="text-sm text-warm-600 mt-1 mb-2 leading-relaxed">
            {item.description}
          </p>
        )}

        {item.location && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-warm-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span>{item.location}</span>
          </div>
        )}

        {item.notes && (
          <div className="mt-2 text-xs text-warm-400 bg-warm-50 p-2 rounded-lg">
            {item.notes}
          </div>
        )}
      </div>

      {/* Actions */}
      {isEditable && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <button 
            onClick={onToggleMustDo}
            className="p-2 text-warm-400 hover:text-accent-500 rounded-lg hover:bg-warm-50 transition-colors"
            title="Toggle Must-do"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={item.isMustDo ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          </button>
          {onEdit && (
            <button 
              onClick={() => onEdit({})} 
              className="p-2 text-warm-400 hover:text-warm-700 rounded-lg hover:bg-warm-50 transition-colors"
              title="Edit"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            </button>
          )}
          {onRemove && (
            <button 
              onClick={onRemove}
              className="p-2 text-warm-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
              title="Remove"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
