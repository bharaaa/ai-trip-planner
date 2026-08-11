import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
}

export function Skeleton({ className, variant = 'text', ...props }: SkeletonProps) {
  const variants = {
    text: 'h-4 rounded w-full',
    circular: 'rounded-full aspect-square',
    rectangular: 'rounded-xl w-full h-full min-h-[100px]',
  };

  return (
    <div 
      className={cn('animate-pulse bg-warm-200', variants[variant], className)}
      {...props}
    />
  );
}
