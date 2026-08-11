import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive' | 'highlighted';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const baseStyles = 'rounded-2xl p-6 transition-all duration-200';
    
    const variants = {
      default: 'bg-white border border-warm-200',
      elevated: 'bg-white border border-warm-200 shadow-md', // shadow-card isn't standard, use shadow-md
      interactive: 'bg-white border border-warm-200 hover:shadow-md hover:border-warm-300 cursor-pointer',
      highlighted: 'bg-accent-50/30 border border-accent-200',
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
