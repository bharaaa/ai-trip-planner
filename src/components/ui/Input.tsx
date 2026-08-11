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
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-warm-900">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'bg-white border border-warm-200 rounded-lg px-4 py-2.5 text-warm-900 placeholder:text-warm-400',
            'focus:outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-100 transition-all',
            'disabled:opacity-50 disabled:bg-warm-50',
            error && 'border-error focus:border-error focus:ring-error/20',
            className
          )}
          {...props}
        />
        {(error || hint) && (
          <p className={cn('text-xs', error ? 'text-red-500' : 'text-warm-500')}>
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
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-warm-900">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'bg-white border border-warm-200 rounded-lg px-4 py-2.5 text-warm-900 placeholder:text-warm-400',
            'focus:outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-100 transition-all min-h-[100px] resize-y',
            'disabled:opacity-50 disabled:bg-warm-50',
            error && 'border-error focus:border-error focus:ring-error/20',
            className
          )}
          {...props}
        />
        {(error || hint) && (
          <p className={cn('text-xs', error ? 'text-red-500' : 'text-warm-500')}>
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
