"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginButton } from './LoginButton';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

export function AuthGuard({ children, fallback, requireAuth = true }: AuthGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-overlord-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-overlord-muted">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="max-w-md mx-auto text-center p-8 bg-overlord-card rounded-lg border border-overlord-border">
            <h2 className="text-2xl font-bold text-overlord-light-text mb-4">
              Authentication Required
            </h2>
            <p className="text-overlord-muted mb-6">
              You must be logged in to access this content. Please authenticate with your Google account.
            </p>
            <LoginButton className="w-full" />
          </div>
        </div>
      )
    );
  }

  if (!requireAuth && isAuthenticated && user) {
    // If auth is not required but user is authenticated, still render children
    return <>{children}</>;
  }

  if (!requireAuth && !isAuthenticated) {
    // If auth is not required and user is not authenticated, still render children
    return <>{children}</>;
  }

  return <>{children}</>;
}
