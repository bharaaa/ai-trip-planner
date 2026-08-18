import React from 'react';
import { cn } from '@/lib/utils/cn';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
  className?: string;
}

export function StepIndicator({ currentStep, totalSteps, labels, className }: StepIndicatorProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="flex items-center">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const step = i + 1;
          const isActive = step === currentStep;
          const isCompleted = step < currentStep;
          
          return (
            <React.Fragment key={step}>
              <div 
                className={cn(
                  "h-2 w-2 rounded-full transition-all duration-500",
                  isActive ? "bg-accent-400 scale-[2] shadow-[0_0_12px_rgba(56,189,248,0.8)]" :
                  isCompleted ? "bg-accent-400 opacity-60" :
                  "bg-white/20"
                )}
              />
              {step < totalSteps && (
                <div 
                  className={cn(
                    "h-[2px] w-8 sm:w-12 mx-3 transition-colors duration-500 rounded-full",
                    isCompleted ? "bg-accent-400/60" : "bg-white/10"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      {labels && labels[currentStep - 1] && (
        <span className="text-sm font-medium text-warm-400 mt-4 tracking-wide uppercase text-[11px]">
          Step {currentStep} of {totalSteps}: {labels[currentStep - 1]}
        </span>
      )}
    </div>
  );
}
