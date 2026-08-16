import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive' | 'highlighted' | 'flat';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const baseStyles = 'rounded-[var(--radius-lg)] p-5';
    
    const variants = {
      default: 'bg-white border border-warm-200/60 shadow-xs',
      elevated: 'bg-white border border-warm-200/40 shadow-sm',
      interactive: 'bg-white border border-warm-200/60 cursor-pointer hover:shadow-sm hover:-translate-y-0.5 hover:border-warm-300/80 transition-all duration-300 ease-out',
      highlighted: 'bg-accent-50/50 border border-accent-200/50',
      flat: 'bg-transparent',
    };

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variants[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';
