import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  labels?: { left?: string; right?: string };
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, min = 0, max = 100, value, onChange, labels, ...props }, ref) => {
    return (
      <div className={cn('w-full flex flex-col gap-2', className)}>
        <input
          type="range"
          ref={ref}
          min={min}
          max={max}
          value={value}
          onChange={onChange}
          className="w-full h-2 bg-warm-200 rounded-lg appearance-none cursor-pointer accent-accent-400"
          {...props}
        />
        {labels && (
          <div className="flex justify-between text-xs text-warm-500">
            <span>{labels.left}</span>
            <span>{labels.right}</span>
          </div>
        )}
      </div>
    );
  }
);
Slider.displayName = 'Slider';
