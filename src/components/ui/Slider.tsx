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
          className={cn(
            "w-full appearance-none h-1.5 bg-warm-200 rounded-full outline-none cursor-pointer",
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-accent-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white",
            "[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-accent-400 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:shadow-sm [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white"
          )}
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
