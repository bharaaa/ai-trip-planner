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
  const completedCount = trip.checkpoints.filter(c => c.completed).length;
  const nextCheckpoint = trip.checkpoints.find(c => !c.completed);

  return (
    <div className={cn('bg-warm-50 rounded-2xl p-6 border border-warm-200', className)}>
      <h3 className="text-lg font-medium text-warm-900 mb-4">Your trip is taking shape.</h3>
      
      <div className="flex flex-col gap-3 mb-6">
        {trip.checkpoints.map(checkpoint => (
          <div 
            key={checkpoint.id} 
            className={cn(
              'flex items-center gap-3 text-sm',
              checkpoint.completed ? 'text-warm-700' : 'text-warm-400'
            )}
          >
            <div className={cn(
              'w-5 h-5 rounded-full flex items-center justify-center border',
              checkpoint.completed 
                ? 'bg-accent-400 border-accent-400 text-white' 
                : 'border-warm-300 bg-white'
            )}>
              {checkpoint.completed && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span className={checkpoint.completed ? 'line-through opacity-70' : ''}>
              {checkpoint.label}
            </span>
          </div>
        ))}
      </div>

      {nextCheckpoint && (
        <div className="bg-white rounded-xl p-4 border border-warm-200">
          <p className="text-sm text-warm-500 mb-1">Next up</p>
          <p className="font-medium text-warm-900">{nextCheckpoint.label}</p>
        </div>
      )}
    </div>
  );
}
