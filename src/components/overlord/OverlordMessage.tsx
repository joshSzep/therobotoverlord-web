import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface OverlordMessageProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'warning' | 'error' | 'success';
  showBorder?: boolean;
}

const OverlordMessage = forwardRef<HTMLDivElement, OverlordMessageProps>(
  ({ className, variant = 'default', showBorder = true, children, ...props }, ref) => {
    const baseClasses = 'overlord-message p-6 font-mono';
    
    const variants = {
      default: 'bg-surface-dark text-light-text',
      warning: 'bg-warning-amber/10 border-warning-amber text-warning-amber',
      error: 'bg-rejected-red/10 border-rejected-red text-rejected-red',
      success: 'bg-approved-green/10 border-approved-green text-approved-green'
    };

    const borderClass = showBorder ? 'border-2' : '';

    return (
      <div
        className={cn(
          baseClasses,
          variants[variant],
          borderClass,
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

OverlordMessage.displayName = 'OverlordMessage';

const OverlordHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('text-center mb-4', className)}
      {...props}
    >
      <div className="text-2xl md:text-4xl font-bold text-overlord-red mb-2">
        🤖 THE OVERLORD SPEAKS 🤖
      </div>
      {children}
    </div>
  )
);
OverlordHeader.displayName = 'OverlordHeader';

const OverlordContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('space-y-4', className)}
      {...props}
    />
  )
);
OverlordContent.displayName = 'OverlordContent';

const OverlordFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mt-6 pt-4 border-t border-muted-light text-center text-sm text-muted-light', className)}
      {...props}
    />
  )
);
OverlordFooter.displayName = 'OverlordFooter';

export { OverlordMessage, OverlordHeader, OverlordContent, OverlordFooter };
