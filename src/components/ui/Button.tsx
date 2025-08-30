import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', glow = false, ...props }, ref) => {
    const baseClasses = 'font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-overlord-red focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed rounded-md transform active:scale-95 hover:scale-105';
    
    const variants = {
      primary: 'bg-overlord-red hover:bg-authority-red text-light-text',
      secondary: 'border border-muted-light hover:bg-surface-dark text-muted-light hover:text-light-text',
      danger: 'bg-rejected-red hover:bg-red-600 text-light-text',
      ghost: 'hover:bg-surface-dark text-muted-light hover:text-light-text'
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg'
    };

    const glowClass = glow ? 'glow-red' : '';

    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          glowClass,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
