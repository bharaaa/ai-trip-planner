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
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const step = i + 1;
          const isActive = step === currentStep;
          const isCompleted = step < currentStep;
          
          return (
            <React.Fragment key={step}>
              <div 
                className={cn(
                  "h-2.5 w-2.5 rounded-full transition-all duration-300",
                  isActive ? "bg-accent-400 scale-125" :
                  isCompleted ? "bg-accent-400" :
                  "bg-warm-300 outline outline-1 outline-warm-300"
                )}
              />
              {step < totalSteps && (
                <div 
                  className={cn(
                    "h-px w-8 transition-colors duration-300",
                    isCompleted ? "bg-accent-400" : "bg-warm-200"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      {labels && labels[currentStep - 1] && (
        <span className="text-sm font-medium text-warm-600">
          Step {currentStep} of {totalSteps}: {labels[currentStep - 1]}
        </span>
      )}
    </div>
  );
}
