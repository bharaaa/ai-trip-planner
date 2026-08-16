import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, disabled, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/40 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97] select-none';
    
    const variants = {
      primary: 'bg-accent-500 hover:bg-accent-400 text-white shadow-sm shadow-accent-500/20 border border-accent-600/20',
      secondary: 'bg-white border border-warm-200/80 text-warm-900 shadow-xs hover:bg-warm-50 hover:border-warm-300',
      ghost: 'bg-transparent text-warm-600 hover:text-warm-900 hover:bg-warm-100/50',
      danger: 'bg-error-50 text-error-600 hover:bg-error-100',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs rounded-[var(--radius-md)]',
      md: 'h-10 px-4 text-sm rounded-[var(--radius-md)]',
      lg: 'h-12 px-6 text-base rounded-[var(--radius-lg)]',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
