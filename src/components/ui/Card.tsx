import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive' | 'highlighted' | 'flat';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const baseStyles = 'rounded-2xl p-5';
    
    const variants = {
      default: 'bg-white border border-warm-200/40 shadow-xs',
      elevated: 'bg-white shadow-md',
      interactive: 'bg-white cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',
      highlighted: 'bg-accent-50/30 border border-accent-200/40',
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
