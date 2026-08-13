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
                  "h-3 w-3 rounded-full transition-all duration-300",
                  isActive ? "bg-accent-400 scale-125" :
                  isCompleted ? "bg-accent-400" :
                  "bg-warm-200"
                )}
              />
              {step < totalSteps && (
                <div 
                  className={cn(
                    "h-0.5 w-8 sm:w-12 mx-1 transition-colors duration-300",
                    isCompleted ? "bg-accent-400" : "bg-warm-200"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      {labels && labels[currentStep - 1] && (
        <span className="text-sm font-medium text-warm-600 mt-2">
          Step {currentStep} of {totalSteps}: {labels[currentStep - 1]}
        </span>
      )}
    </div>
  );
}
