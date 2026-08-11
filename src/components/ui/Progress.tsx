import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md';
}

export function Progress({ value, label, showValue, size = 'md', className, ...props }: ProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  
  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
  };

  return (
    <div className={cn('w-full', className)} {...props}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5 text-sm">
          {label && <span className="font-medium text-warm-700">{label}</span>}
          {showValue && <span className="text-warm-500">{clampedValue}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-warm-100 rounded-full overflow-hidden', sizes[size])}>
        <div 
          className="h-full bg-accent-400 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
