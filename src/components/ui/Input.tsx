import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  theme?: 'light' | 'dark';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, theme = 'light', ...props }, ref) => {
    const isDark = theme === 'dark';
    
    return (
      <div className="w-full flex flex-col mb-1.5">
        {label && (
          <label className={cn("text-sm font-medium mb-1.5", isDark ? "text-warm-300" : "text-warm-700")}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full border rounded-[var(--radius-md)] px-4 py-2.5 text-sm transition-all duration-200 shadow-xs',
            isDark 
              ? 'bg-white/5 border-white/10 text-white placeholder:text-warm-500 focus:bg-white/10 focus:border-accent-400 focus:ring-2 focus:ring-accent-400/20 disabled:opacity-50 disabled:bg-black/20'
              : 'bg-white border-warm-200/80 text-warm-900 placeholder:text-warm-400 focus:bg-white focus:border-accent-400 focus:ring-2 focus:ring-accent-400/20 disabled:opacity-50 disabled:bg-warm-50',
            'focus:outline-none',
            error && (isDark ? 'border-error-500 focus:border-error-500 focus:ring-error-500/20' : 'border-error-500 focus:border-error-500 focus:ring-error-500/20'),
            className
          )}
          {...props}
        />
        {(error || hint) && (
          <p className={cn('text-xs mt-1.5', error ? 'text-error-500' : (isDark ? 'text-warm-400' : 'text-warm-500'))}>
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  theme?: 'light' | 'dark';
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, theme = 'light', ...props }, ref) => {
    const isDark = theme === 'dark';
    
    return (
      <div className="w-full flex flex-col mb-1.5">
        {label && (
          <label className={cn("text-sm font-medium mb-1.5", isDark ? "text-warm-300" : "text-warm-700")}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'w-full border rounded-[var(--radius-md)] px-4 py-2.5 text-sm transition-all duration-200 min-h-[100px] resize-y shadow-xs',
            isDark 
              ? 'bg-white/5 border-white/10 text-white placeholder:text-warm-500 focus:bg-white/10 focus:border-accent-400 focus:ring-2 focus:ring-accent-400/20 disabled:opacity-50 disabled:bg-black/20'
              : 'bg-white border-warm-200/80 text-warm-900 placeholder:text-warm-400 focus:bg-white focus:border-accent-400 focus:ring-2 focus:ring-accent-400/20 disabled:opacity-50 disabled:bg-warm-50',
            'focus:outline-none',
            error && (isDark ? 'border-error-500 focus:border-error-500 focus:ring-error-500/20' : 'border-error-500 focus:border-error-500 focus:ring-error-500/20'),
            className
          )}
          {...props}
        />
        {(error || hint) && (
          <p className={cn('text-xs mt-1.5', error ? 'text-error-500' : (isDark ? 'text-warm-400' : 'text-warm-500'))}>
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
