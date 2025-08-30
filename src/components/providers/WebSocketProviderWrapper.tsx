/**
 * WebSocket Provider Wrapper
 * Conditionally provides WebSocket connection based on authentication state
 */

'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { WebSocketProvider } from '@/components/WebSocketProvider';

interface WebSocketProviderWrapperProps {
  children: React.ReactNode;
}

export function WebSocketProviderWrapper({ children }: WebSocketProviderWrapperProps) {
  const { isAuthenticated, user } = useAuth();

  // Only provide WebSocket connection if user is authenticated
  if (isAuthenticated && user) {
    // Get token from localStorage (same as what API client uses)
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : '';
    
    return (
      <WebSocketProvider token={token}>
        {children}
      </WebSocketProvider>
    );
  }

  // Return children without WebSocket provider if not authenticated
  return <>{children}</>;
}
