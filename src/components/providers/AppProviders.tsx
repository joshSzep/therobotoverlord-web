/**
 * Application providers wrapper
 * Manages the proper order of context providers
 */

'use client';

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { WebSocketProviderWrapper } from '@/components/providers/WebSocketProviderWrapper';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      <WebSocketProviderWrapper>
        {children}
      </WebSocketProviderWrapper>
    </AuthProvider>
  );
}
