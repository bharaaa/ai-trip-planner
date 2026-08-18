import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  labels?: { left?: string; right?: string };
  theme?: 'light' | 'dark';
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, min = 0, max = 100, value, onChange, labels, theme = 'light', ...props }, ref) => {
    const percentage = ((Number(value) - Number(min)) / (Number(max) - Number(min))) * 100;
    
    return (
      <div className={cn('w-full flex flex-col gap-3', className)}>
        <div className="relative">
          <input
            type="range"
            ref={ref}
            min={min}
            max={max}
            value={value}
            onChange={onChange}
            className={cn(
              "w-full appearance-none h-1.5 rounded-full outline-none cursor-pointer",
              theme === 'dark' ? "bg-white/10" : "bg-warm-200",
              "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-accent-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(14,165,233,0.5)] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing",
              "[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:bg-accent-400 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:shadow-[0_0_12px_rgba(14,165,233,0.5)] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:cursor-grab"
            )}
            style={{
              background: theme === 'dark'
                ? `linear-gradient(to right, rgba(14,165,233,0.5) 0%, rgba(14,165,233,0.5) ${percentage}%, rgba(255,255,255,0.1) ${percentage}%, rgba(255,255,255,0.1) 100%)`
                : undefined
            }}
            {...props}
          />
        </div>
        {labels && (
          <div className={cn(
            "flex justify-between text-xs font-medium",
            theme === 'dark' ? "text-white/40" : "text-warm-500"
          )}>
            <span>{labels.left}</span>
            <span>{labels.right}</span>
          </div>
        )}
      </div>
    );
  }
);
Slider.displayName = 'Slider';
