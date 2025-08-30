/**
 * Error Boundary Components for The Robot Overlord
 * Catches JavaScript errors in component trees and displays fallback UI
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './Button';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { ErrorState, ConnectionErrorState } from './EmptyState';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report error to monitoring service (if available)
    if (typeof window !== 'undefined' && (window as any).reportError) {
      (window as any).reportError(error);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    // Reset error boundary when resetKeys change
    if (hasError && resetKeys && prevProps.resetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (resetKey, idx) => prevProps.resetKeys![idx] !== resetKey
      );
      
      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }

    // Reset error boundary when any props change (if enabled)
    if (hasError && resetOnPropsChange && prevProps !== this.props) {
      this.resetErrorBoundary();
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleRetry = () => {
    this.resetErrorBoundary();
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, showDetails = false } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-rejected-red">
                <span className="text-2xl">⚠️</span>
                <span>Something went wrong</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-light">
                An unexpected error occurred. This has been reported to our team.
              </p>
              
              {showDetails && error && (
                <div className="bg-muted/20 p-3 rounded-md">
                  <details>
                    <summary className="cursor-pointer text-sm font-medium text-light-text mb-2">
                      Error Details
                    </summary>
                    <div className="text-xs text-muted-light font-mono space-y-2">
                      <div>
                        <strong>Error:</strong> {error.message}
                      </div>
                      {error.stack && (
                        <div>
                          <strong>Stack:</strong>
                          <pre className="whitespace-pre-wrap mt-1">{error.stack}</pre>
                        </div>
                      )}
                      {errorInfo && errorInfo.componentStack && (
                        <div>
                          <strong>Component Stack:</strong>
                          <pre className="whitespace-pre-wrap mt-1">{errorInfo.componentStack}</pre>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              )}
              
              <div className="flex space-x-3">
                <Button variant="primary" onClick={this.handleRetry}>
                  Try Again
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => window.location.reload()}
                >
                  Reload Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return children;
  }
}

// Hook-based error boundary for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo);
    
    // Report to monitoring service
    if (typeof window !== 'undefined' && (window as any).reportError) {
      (window as any).reportError(error);
    }
  };
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Specific error boundaries for different contexts
export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      showDetails={process.env.NODE_ENV === 'development'}
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <ErrorState
            title="Page Error"
            description="This page encountered an error and couldn't be displayed properly."
            onRetry={() => window.location.reload()}
          />
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

export function ComponentErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 border border-rejected-red/20 rounded-lg bg-rejected-red/5">
          <div className="flex items-center space-x-2 text-rejected-red mb-2">
            <span>⚠️</span>
            <span className="font-medium">Component Error</span>
          </div>
          <p className="text-sm text-muted-light">
            This component failed to load properly.
          </p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

export function AsyncErrorBoundary({ 
  children, 
  onRetry 
}: { 
  children: ReactNode; 
  onRetry?: () => void; 
}) {
  return (
    <ErrorBoundary
      fallback={
        <ConnectionErrorState onRetry={onRetry} />
      }
      resetOnPropsChange={true}
    >
      {children}
    </ErrorBoundary>
  );
}

export function FormErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 border border-rejected-red/20 rounded-lg bg-rejected-red/5">
          <div className="flex items-center space-x-2 text-rejected-red mb-2">
            <span>⚠️</span>
            <span className="font-medium">Form Error</span>
          </div>
          <p className="text-sm text-muted-light mb-3">
            The form encountered an error. Please refresh the page and try again.
          </p>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

export function ChatErrorBoundary({ 
  children, 
  onReset 
}: { 
  children: ReactNode; 
  onReset?: () => void; 
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 text-center">
          <div className="text-4xl mb-2">🤖</div>
          <h3 className="font-bold text-light-text mb-2">Chat Error</h3>
          <p className="text-sm text-muted-light mb-4">
            The chat system encountered an error. Try reconnecting.
          </p>
          <Button variant="primary" size="sm" onClick={onReset}>
            Reconnect Chat
          </Button>
        </div>
      }
      resetOnPropsChange={true}
    >
      {children}
    </ErrorBoundary>
  );
}

// Global error handler for unhandled promise rejections
export function setupGlobalErrorHandlers() {
  if (typeof window !== 'undefined') {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // Report to monitoring service
      if ((window as any).reportError) {
        (window as any).reportError(new Error(`Unhandled Promise Rejection: ${event.reason}`));
      }
      
      // Prevent the default browser behavior
      event.preventDefault();
    });

    // Handle global errors
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      
      // Report to monitoring service
      if ((window as any).reportError) {
        (window as any).reportError(event.error);
      }
    });
  }
}

// Error reporting utility
export function reportError(error: Error, context?: string) {
  console.error(`Error in ${context || 'unknown context'}:`, error);
  
  // Report to monitoring service
  if (typeof window !== 'undefined' && (window as any).reportError) {
    (window as any).reportError(error);
  }
  
  // In development, you might want to show more details
  if (process.env.NODE_ENV === 'development') {
    console.trace('Error trace:', error);
  }
}
