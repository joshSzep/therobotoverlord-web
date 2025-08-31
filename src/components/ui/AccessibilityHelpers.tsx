'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

// Screen reader only text component
export const ScreenReaderOnly: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <span className={cn('sr-only', className)}>
    {children}
  </span>
);

// Live region for dynamic content announcements
export const LiveRegion: React.FC<{
  children: React.ReactNode;
  politeness?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
  className?: string;
}> = ({ children, politeness = 'polite', atomic = false, className }) => (
  <div
    className={cn('sr-only', className)}
    aria-live={politeness}
    aria-atomic={atomic}
    role="status"
  >
    {children}
  </div>
);

// Skip link for keyboard navigation
export const SkipLink: React.FC<{
  href: string;
  children: React.ReactNode;
  className?: string;
}> = ({ href, children, className }) => (
  <a
    href={href}
    className={cn(
      'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-overlord-red focus:text-white focus:rounded-md focus:shadow-lg',
      className
    )}
  >
    {children}
  </a>
);

// Focus trap for modals and dialogs
export const FocusTrap: React.FC<{
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}> = ({ children, active = true, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLElement | null>(null);
  const lastFocusableRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    firstFocusableRef.current = focusableElements[0] as HTMLElement;
    lastFocusableRef.current = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusableRef.current) {
          e.preventDefault();
          lastFocusableRef.current?.focus();
        }
      } else {
        if (document.activeElement === lastFocusableRef.current) {
          e.preventDefault();
          firstFocusableRef.current?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstFocusableRef.current?.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [active]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

// Accessible button with proper ARIA attributes
export const AccessibleButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  pressed?: boolean;
  expanded?: boolean;
  controls?: string;
  describedBy?: string;
  label?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}> = ({
  children,
  onClick,
  disabled = false,
  pressed,
  expanded,
  controls,
  describedBy,
  label,
  className,
  variant = 'primary'
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-pressed={pressed}
    aria-expanded={expanded}
    aria-controls={controls}
    aria-describedby={describedBy}
    aria-label={label}
    className={cn(
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-overlord-red focus-visible:ring-offset-2',
      className
    )}
  >
    {children}
  </button>
);

// Accessible form field with proper labeling
export const AccessibleFormField: React.FC<{
  id: string;
  label: string;
  children: React.ReactNode;
  error?: string;
  help?: string;
  required?: boolean;
  className?: string;
}> = ({ id, label, children, error, help, required = false, className }) => {
  const errorId = error ? `${id}-error` : undefined;
  const helpId = help ? `${id}-help` : undefined;
  const describedBy = [errorId, helpId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('space-y-2', className)}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-light-text"
      >
        {label}
        {required && (
          <span className="text-rejected-red ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
      
      {React.cloneElement(children as React.ReactElement, {
        id,
        'aria-labelledby': undefined,
        'aria-describedby': describedBy,
        'aria-required': required,
      } as any)}
      
      {help && (
        <p id={helpId} className="text-sm text-muted-light">
          {help}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="text-sm text-rejected-red" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

// Accessible navigation with proper ARIA landmarks
export const AccessibleNav: React.FC<{
  children: React.ReactNode;
  label: string;
  className?: string;
}> = ({ children, label, className }) => (
  <nav aria-label={label} className={className} role="navigation">
    {children}
  </nav>
);

// Accessible list with proper ARIA attributes
export const AccessibleList: React.FC<{
  children: React.ReactNode;
  label?: string;
  className?: string;
  ordered?: boolean;
}> = ({ children, label, className, ordered = false }) => {
  const ListComponent = ordered ? 'ol' : 'ul';
  
  return (
    <ListComponent
      aria-label={label}
      className={className}
      role="list"
    >
      {children}
    </ListComponent>
  );
};

// Accessible list item
export const AccessibleListItem: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <li className={className} role="listitem">
    {children}
  </li>
);

// Accessible heading with proper hierarchy
export const AccessibleHeading: React.FC<{
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
  id?: string;
}> = ({ level, children, className, id }) => {
  const props = { id, className };
  
  switch (level) {
    case 1: return <h1 {...props}>{children}</h1>;
    case 2: return <h2 {...props}>{children}</h2>;
    case 3: return <h3 {...props}>{children}</h3>;
    case 4: return <h4 {...props}>{children}</h4>;
    case 5: return <h5 {...props}>{children}</h5>;
    case 6: return <h6 {...props}>{children}</h6>;
    default: return <h1 {...props}>{children}</h1>;
  }
};

// Accessible table with proper ARIA attributes
export const AccessibleTable: React.FC<{
  children: React.ReactNode;
  caption?: string;
  className?: string;
}> = ({ children, caption, className }) => (
  <table className={className} role="table">
    {caption && <caption className="sr-only">{caption}</caption>}
    {children}
  </table>
);

// Accessible status indicator
export const AccessibleStatus: React.FC<{
  status: string;
  children: React.ReactNode;
  className?: string;
}> = ({ status, children, className }) => (
  <span
    className={className}
    role="status"
    aria-label={`Status: ${status}`}
  >
    {children}
    <ScreenReaderOnly>{status}</ScreenReaderOnly>
  </span>
);

// Accessible progress indicator
export const AccessibleProgress: React.FC<{
  value: number;
  max?: number;
  label?: string;
  children?: React.ReactNode;
  className?: string;
}> = ({ value, max = 100, label, children, className }) => (
  <div className={className}>
    {label && (
      <label className="block text-sm font-medium text-light-text mb-2">
        {label}
      </label>
    )}
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label || `Progress: ${value} of ${max}`}
      className="w-full bg-muted rounded-full h-2"
    >
      <div
        className="bg-overlord-red h-2 rounded-full transition-all duration-300"
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
    {children}
  </div>
);

// Accessible modal dialog
export const AccessibleModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}> = ({ isOpen, onClose, title, children, className }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      modalRef.current?.focus();
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <FocusTrap active={isOpen}>
        <div
          ref={modalRef}
          className={cn(
            'bg-card border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl',
            className
          )}
          tabIndex={-1}
        >
          <div className="flex items-center justify-between p-6 border-b border-border">
            <AccessibleHeading level={2} id="modal-title" className="text-xl font-bold text-light-text">
              {title}
            </AccessibleHeading>
            <AccessibleButton
              onClick={onClose}
              label="Close modal"
              variant="ghost"
              className="text-muted-light hover:text-light-text"
            >
              ×
            </AccessibleButton>
          </div>
          <div className="p-6">
            {children}
          </div>
        </div>
      </FocusTrap>
    </div>
  );
};

export {
  ScreenReaderOnly as default,
};
