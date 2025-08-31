'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  useScreenReader, 
  useFormAnnouncements, 
  useNavigationAnnouncements,
  useLoadingAnnouncements,
  useActionAnnouncements,
  useStatusAnnouncements,
  useSearchAnnouncements
} from '@/hooks/useScreenReader';

// Enhanced form with screen reader announcements
export const AccessibleForm: React.FC<{
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => Promise<boolean>;
  className?: string;
  formName?: string;
}> = ({ children, onSubmit, className, formName = 'form' }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { announceFormSubmission } = useFormAnnouncements();
  const { announceLoadingStart, announceLoadingComplete, announceLoadingError } = useLoadingAnnouncements();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    announceLoadingStart(`${formName} submission`);

    try {
      const success = await onSubmit(e);
      if (success) {
        announceFormSubmission(true, `${formName} submitted successfully`);
        announceLoadingComplete(`${formName} submission`);
      } else {
        announceFormSubmission(false, `${formName} submission failed`);
        announceLoadingError(`${formName} submission`);
      }
    } catch (error) {
      announceFormSubmission(false, `${formName} submission failed with error`);
      announceLoadingError(`${formName} submission`, error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className} noValidate>
      <fieldset disabled={isSubmitting} className="space-y-4">
        {isSubmitting && (
          <div className="sr-only" aria-live="polite">
            Submitting {formName}...
          </div>
        )}
        {children}
      </fieldset>
    </form>
  );
};

// Enhanced button with action announcements
export const AccessibleActionButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => Promise<void> | void;
  actionName?: string;
  successMessage?: string;
  errorMessage?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
}> = ({ 
  children, 
  onClick, 
  actionName = 'action',
  successMessage,
  errorMessage,
  className,
  variant = 'primary',
  disabled = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { announceActionSuccess, announceActionError } = useActionAnnouncements();

  const handleClick = async () => {
    if (!onClick || isLoading) return;

    setIsLoading(true);
    try {
      await onClick();
      announceActionSuccess(actionName, successMessage);
    } catch (error) {
      announceActionError(actionName, errorMessage || (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isLoading}
      variant={variant}
      className={className}
      aria-describedby={isLoading ? 'loading-description' : undefined}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          <span className="sr-only" id="loading-description">
            Performing {actionName}...
          </span>
        </>
      ) : null}
      {children}
    </Button>
  );
};

// Enhanced modal with navigation announcements
export const AccessibleModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}> = ({ isOpen, onClose, title, children, className }) => {
  const { announceModalOpen, announceModalClose } = useNavigationAnnouncements();
  const previousFocusRef = React.useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      announceModalOpen(title);
      document.body.style.overflow = 'hidden';
    } else {
      announceModalClose();
      document.body.style.overflow = 'unset';
      previousFocusRef.current?.focus();
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, title, announceModalOpen, announceModalClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <Card className={cn('max-w-4xl w-full max-h-[90vh] overflow-y-auto', className)}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 id="modal-title" className="text-xl font-bold text-light-text">
            {title}
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            aria-label="Close modal"
            className="text-muted-light hover:text-light-text"
          >
            ×
          </Button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </Card>
    </div>
  );
};

// Enhanced status indicator with announcements
export const AccessibleStatusIndicator: React.FC<{
  status: string;
  previousStatus?: string;
  label?: string;
  className?: string;
}> = ({ status, previousStatus, label, className }) => {
  const { announceStatusChange } = useStatusAnnouncements();

  useEffect(() => {
    if (previousStatus && previousStatus !== status && label) {
      announceStatusChange(label, previousStatus, status);
    }
  }, [status, previousStatus, label, announceStatusChange]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'approved': case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected': case 'dismissed': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'under review': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
        getStatusColor(status),
        className
      )}
      role="status"
      aria-label={`Status: ${status}`}
    >
      {status}
      <span className="sr-only">
        {label ? `${label} status is ${status}` : `Status: ${status}`}
      </span>
    </span>
  );
};

// Enhanced loading state with announcements
export const AccessibleLoadingState: React.FC<{
  isLoading: boolean;
  error?: string | null;
  children: React.ReactNode;
  loadingMessage?: string;
  resourceName?: string;
  skeleton?: React.ReactNode;
}> = ({ 
  isLoading, 
  error, 
  children, 
  loadingMessage = 'Loading content',
  resourceName = 'content',
  skeleton 
}) => {
  const { announceLoadingStart, announceLoadingComplete, announceLoadingError } = useLoadingAnnouncements();

  useEffect(() => {
    if (isLoading) {
      announceLoadingStart(resourceName);
    } else if (error) {
      announceLoadingError(resourceName, error);
    } else {
      announceLoadingComplete(resourceName);
    }
  }, [isLoading, error, resourceName, announceLoadingStart, announceLoadingComplete, announceLoadingError]);

  if (isLoading) {
    return (
      <div role="status" aria-label={loadingMessage}>
        {skeleton || <LoadingSpinner />}
        <span className="sr-only">{loadingMessage}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="text-rejected-red p-4 border border-rejected-red rounded-md">
        <h3 className="font-semibold">Error loading {resourceName}</h3>
        <p className="mt-1">{error}</p>
      </div>
    );
  }

  return <>{children}</>;
};

// Enhanced search with announcements
export const AccessibleSearch: React.FC<{
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  results?: any[];
  isSearching?: boolean;
  placeholder?: string;
  className?: string;
}> = ({ 
  value, 
  onChange, 
  onSearch, 
  results = [], 
  isSearching = false,
  placeholder = 'Search...',
  className 
}) => {
  const { announceSearchStart, announceSearchResults } = useSearchAnnouncements();
  const [hasSearched, setHasSearched] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      announceSearchStart(value);
      onSearch(value);
      setHasSearched(true);
    }
  };

  useEffect(() => {
    if (hasSearched && !isSearching) {
      announceSearchResults(value, results.length);
      setHasSearched(false);
    }
  }, [hasSearched, isSearching, value, results.length, announceSearchResults]);

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="relative">
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2 pl-10 border border-border rounded-md bg-card text-light-text focus:outline-none focus:ring-2 focus:ring-overlord-red focus:ring-offset-2"
          aria-label="Search"
          aria-describedby="search-status"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-muted-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {isSearching && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>
      
      <div id="search-status" className="sr-only" aria-live="polite">
        {isSearching ? `Searching for ${value}...` : 
         hasSearched ? `Found ${results.length} results for ${value}` : ''}
      </div>
    </form>
  );
};

// Enhanced notification with announcements
export const AccessibleNotification: React.FC<{
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}> = ({ type, title, message, onClose, autoClose = true, duration = 5000 }) => {
  const { announceNotification } = useStatusAnnouncements();

  useEffect(() => {
    announceNotification(type, `${title}: ${message}`);
    
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [type, title, message, announceNotification, autoClose, onClose, duration]);

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'error': return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-400';
      case 'success': return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400';
      default: return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400';
    }
  };

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={cn(
        'p-4 border rounded-md',
        getTypeStyles(type)
      )}
    >
      <div className="flex items-start">
        <div className="flex-1">
          <h4 className="font-semibold">{title}</h4>
          <p className="mt-1 text-sm">{message}</p>
        </div>
        {onClose && (
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            aria-label="Close notification"
            className="ml-4 -mt-1"
          >
            ×
          </Button>
        )}
      </div>
    </div>
  );
};

export {
  AccessibleForm as default,
};
