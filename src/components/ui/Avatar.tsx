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

  // Generate a consistent pseudo-random hue based on name for colorful avatars
  const getAvatarColorClass = (name: string) => {
    const charCode = name.charCodeAt(0) || 0;
    const colors = [
      'bg-accent-100 text-accent-700',
      'bg-yellow-100 text-yellow-700',
      'bg-sky-100 text-sky-700',
      'bg-lavender-100 text-lavender-700',
      'bg-success-100 text-success-700'
    ];
    return colors[charCode % colors.length];
  };

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full overflow-hidden shrink-0 transition-transform duration-200 hover:scale-105',
        sizes[size],
        !src && getAvatarColorClass(name),
        className
      )}
      {...props}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span className="font-semibold tracking-wide">{getInitials(name)}</span>
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
        <div key={index} className={cn('ring-2 ring-white rounded-full transition-all duration-200 hover:z-20 hover:-translate-y-1', index > 0 && '-ml-3')}>
          {child}
        </div>
      ))}
      {extraCount > 0 && (
        <div className={cn(
          'ring-2 ring-white rounded-full bg-warm-100 text-warm-600 flex items-center justify-center font-medium z-10 -ml-3 transition-all duration-200 hover:z-20 hover:-translate-y-1',
          sizes[size]
        )}>
          +{extraCount}
        </div>
      )}
    </div>
  );
}
