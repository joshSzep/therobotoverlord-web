import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'error' | 'success';
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = 'default', label, error, ...props }, ref) => {
    const baseClasses = 'w-full px-4 py-3 bg-surface-dark border text-light-text placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-overlord-red focus:ring-offset-2 focus:ring-offset-background transition-colors';
    
    const variants = {
      default: 'border-muted-light focus:border-overlord-red',
      error: 'border-rejected-red focus:border-rejected-red focus:ring-rejected-red',
      success: 'border-approved-green focus:border-approved-green focus:ring-approved-green'
    };

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-light-text">
            {label}
          </label>
        )}
        <input
          className={cn(
            baseClasses,
            variants[variant],
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-rejected-red">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
