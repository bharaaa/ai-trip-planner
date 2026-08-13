import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col mb-1.5">
        {label && (
          <label className="text-sm font-medium text-warm-700 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full bg-white border border-warm-200 rounded-xl px-4 py-2.5 text-warm-900 text-sm placeholder:text-warm-400',
            'focus:outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-400/10 transition-all',
            'disabled:opacity-50 disabled:bg-warm-50',
            error && 'border-error-500 focus:border-error-500 focus:ring-error-500/20',
            className
          )}
          {...props}
        />
        {(error || hint) && (
          <p className={cn('text-xs mt-1.5', error ? 'text-error-500' : 'text-warm-500')}>
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
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col mb-1.5">
        {label && (
          <label className="text-sm font-medium text-warm-700 mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'w-full bg-white border border-warm-200 rounded-xl px-4 py-2.5 text-warm-900 text-sm placeholder:text-warm-400',
            'focus:outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-400/10 transition-all min-h-[100px] resize-y',
            'disabled:opacity-50 disabled:bg-warm-50',
            error && 'border-error-500 focus:border-error-500 focus:ring-error-500/20',
            className
          )}
          {...props}
        />
        {(error || hint) && (
          <p className={cn('text-xs mt-1.5', error ? 'text-error-500' : 'text-warm-500')}>
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
