/**
 * Loading spinner component for The Robot Overlord
 * Displays loading states with Robot Overlord theming
 */

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'muted';
  className?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'primary', 
  className = '' 
}: LoadingSpinnerProps) {
  const getSizeClasses = (size: LoadingSpinnerProps['size']) => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'md':
        return 'w-6 h-6';
      case 'lg':
        return 'w-8 h-8';
      case 'xl':
        return 'w-12 h-12';
      default:
        return 'w-6 h-6';
    }
  };

  const getVariantClasses = (variant: LoadingSpinnerProps['variant']) => {
    switch (variant) {
      case 'primary':
        return 'text-overlord-red';
      case 'secondary':
        return 'text-muted-light';
      case 'muted':
        return 'text-muted';
      default:
        return 'text-overlord-red';
    }
  };

  return (
    <div
      className={`
        animate-spin inline-block
        ${getSizeClasses(size)}
        ${getVariantClasses(variant)}
        ${className}
      `}
      role="status"
      aria-label="Loading"
    >
      <svg
        className="w-full h-full"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  spinnerSize?: LoadingSpinnerProps['size'];
  message?: string;
}

export function LoadingOverlay({
  isLoading,
  children,
  className = '',
  spinnerSize = 'lg',
  message = 'Loading...'
}: LoadingOverlayProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="text-center">
            <LoadingSpinner size={spinnerSize} />
            {message && (
              <div className="mt-2 text-sm text-muted-light font-mono">
                {message}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface LoadingStateProps {
  isLoading: boolean;
  error?: string | null;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  skeleton?: React.ReactNode;
  useSkeleton?: boolean;
}

export function LoadingState({
  isLoading,
  error,
  children,
  loadingComponent,
  errorComponent,
  skeleton,
  useSkeleton = false
}: LoadingStateProps) {
  if (error) {
    return (
      <div>
        {errorComponent || (
          <div className="text-center py-8">
            <div className="text-rejected-red text-lg mb-2">⚠️</div>
            <div className="text-rejected-red font-bold">Error</div>
            <div className="text-muted-light text-sm mt-1">{error}</div>
          </div>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        {useSkeleton && skeleton ? skeleton : (loadingComponent || (
          <div className="text-center py-8">
            <LoadingSpinner size="lg" />
            <div className="mt-2 text-muted-light font-mono text-sm">
              Processing request...
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <div>{children}</div>;
}
