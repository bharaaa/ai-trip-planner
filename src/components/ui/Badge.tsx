import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'outline';
  size?: 'sm' | 'md';
}

export function Badge({ className, variant = 'default', size = 'md', children, ...props }: BadgeProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold tracking-wide rounded-full transition-all duration-200';
  
  const variants = {
    default: 'bg-warm-100/80 text-warm-700',
    accent: 'bg-accent-100 text-accent-700',
    success: 'bg-success-100 text-success-700',
    warning: 'bg-yellow-100 text-yellow-700',
    outline: 'border border-warm-200/60 text-warm-600 bg-transparent',
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] uppercase',
    md: 'px-2.5 py-1 text-xs uppercase',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
}
