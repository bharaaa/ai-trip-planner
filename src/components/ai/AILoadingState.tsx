import React from 'react';
import { cn } from '@/lib/utils/cn';
import { StaggerContainer } from '@/components/motion/StaggerContainer';
import { StaggerItem } from '@/components/motion/StaggerItem';

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
    <div className={cn('flex flex-col items-center justify-center gap-6 p-8 bg-warm-50 rounded-2xl max-w-lg mx-auto border border-warm-200/50 shadow-sm', className)}>
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 bg-accent-400 rounded-full dot-pulse" style={{ animationDelay: '0ms' }} />
          <div className="w-2.5 h-2.5 bg-accent-400 rounded-full dot-pulse" style={{ animationDelay: '150ms' }} />
          <div className="w-2.5 h-2.5 bg-accent-400 rounded-full dot-pulse" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="text-warm-900 font-semibold text-lg">{message}</p>
      </div>
      
      {steps && steps.length > 0 && (
        <StaggerContainer className="flex flex-col gap-3 w-full max-w-sm mt-2">
          {steps.map((step, i) => (
            <StaggerItem key={i} className="flex items-center gap-3 text-sm bg-white p-3 rounded-xl border border-warm-200 shadow-xs">
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                {step.completed ? (
                  <div className="w-5 h-5 rounded-full bg-accent-400 text-white flex items-center justify-center">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-2 h-2 rounded-full bg-warm-200 animate-pulse" />
                )}
              </div>
              <span className={cn('font-medium', step.completed ? 'text-warm-900' : 'text-warm-500')}>
                {step.label}
              </span>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </div>
  );
}
