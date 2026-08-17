import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface Checkpoint {
  id: string;
  label: string;
  completed: boolean;
}

export interface TripProgressProps {
  trip: {
    checkpoints: Checkpoint[];
  };
  className?: string;
}

export function TripProgress({ trip, className }: TripProgressProps) {
  const checkpoints = trip.checkpoints;
  const firstIncompleteIndex = checkpoints.findIndex(c => !c.completed);
  
  return (
    <div className={cn('py-2', className)}>
      <div className="flex items-center justify-between relative">
        {/* Connecting Lines Base */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-warm-200 -z-10" />
        
        {checkpoints.map((checkpoint, index) => {
          const isCompleted = checkpoint.completed;
          const isActive = !isCompleted && index === firstIncompleteIndex;
          
          return (
            <div key={checkpoint.id} className="relative flex flex-col items-center gap-2 group">
              {/* Progress Line */}
              {isCompleted && index < checkpoints.length - 1 && (
                <div 
                  className="absolute left-1/2 top-3 -translate-y-1/2 h-0.5 bg-accent-400 -z-10"
                  style={{ width: '100%', right: '-100%' }}
                />
              )}
              
              {/* Node */}
              <div 
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors',
                  isCompleted ? 'bg-accent-400 text-white' : 
                  isActive ? 'bg-white border-2 border-accent-400 animate-pulse-subtle' : 
                  'bg-warm-200 text-transparent'
                )}
              >
                {isCompleted && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              
              {/* Label */}
              <span 
                className={cn(
                  'text-xs font-medium absolute top-8 whitespace-nowrap',
                  isCompleted ? 'text-warm-900' :
                  isActive ? 'text-warm-900' : 'text-warm-400'
                )}
              >
                {checkpoint.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-6" /> {/* Spacer for absolute labels */}
    </div>
  );
}
