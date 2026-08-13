import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ name, src, size = 'md', className, ...props }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .filter(Boolean)
      .map(part => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full overflow-hidden shrink-0',
        sizes[size],
        !src && 'bg-warm-200 text-warm-600 font-medium',
        className
      )}
      {...props}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarGroup({ children, max = 4, size = 'md', className, ...props }: AvatarGroupProps) {
  const childrenArray = React.Children.toArray(children);
  const visibleAvatars = childrenArray.slice(0, max);
  const extraCount = childrenArray.length - max;
  
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  return (
    <div className={cn('flex items-center', className)} {...props}>
      {visibleAvatars.map((child, index) => (
        <div key={index} className={cn('ring-2 ring-white rounded-full', index > 0 && '-ml-2')}>
          {child}
        </div>
      ))}
      {extraCount > 0 && (
        <div className={cn(
          'ring-2 ring-white rounded-full bg-warm-100 text-warm-600 flex items-center justify-center font-medium z-10 -ml-2',
          sizes[size]
        )}>
          +{extraCount}
        </div>
      )}
    </div>
  );
}
