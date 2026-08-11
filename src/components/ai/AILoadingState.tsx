import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface AILoadingStep {
  label: string;
  completed: boolean;
}

export interface AILoadingStateProps {
  message: string;
  steps?: AILoadingStep[];
  className?: string;
}

export function AILoadingState({ message, steps, className }: AILoadingStateProps) {
  return (
    <div className={cn('flex flex-col gap-4 p-6 bg-white rounded-2xl border border-warm-200', className)}>
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-accent-50 text-accent-500">
          <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p className="text-warm-900 font-medium">{message}</p>
      </div>
      
      {steps && steps.length > 0 && (
        <div className="pl-11 flex flex-col gap-2">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 flex items-center justify-center shrink-0">
                {step.completed ? (
                  <svg className="w-4 h-4 text-accent-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-warm-300 animate-pulse" />
                )}
              </div>
              <span className={cn(step.completed ? 'text-warm-700' : 'text-warm-500')}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
