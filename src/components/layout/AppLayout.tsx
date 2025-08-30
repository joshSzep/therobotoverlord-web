/**
 * Main application layout wrapper
 * Provides consistent layout structure for authenticated pages
 */

'use client';

import React from 'react';
import { Header } from '@/components/navigation/Header';

interface AppLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
}

export function AppLayout({ children, showHeader = true }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {showHeader && <Header />}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
