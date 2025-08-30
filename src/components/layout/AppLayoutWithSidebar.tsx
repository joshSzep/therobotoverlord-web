/**
 * Application layout with optional sidebar
 * Provides layout structure with toggleable sidebar navigation
 */

'use client';

import React, { useState } from 'react';
import { Header } from '@/components/navigation/Header';
import { Sidebar } from '@/components/navigation/Sidebar';

interface AppLayoutWithSidebarProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showSidebar?: boolean;
  sidebarOpen?: boolean;
}

export function AppLayoutWithSidebar({ 
  children, 
  showHeader = true, 
  showSidebar = false,
  sidebarOpen = false 
}: AppLayoutWithSidebarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(sidebarOpen);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      {showSidebar && (
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        {showHeader && (
          <Header 
            className={showSidebar ? 'lg:pl-0' : ''}
          />
        )}

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Sidebar Toggle Button (Mobile) */}
        {showSidebar && (
          <button
            onClick={toggleSidebar}
            className="fixed bottom-4 left-4 lg:hidden z-30 p-3 bg-overlord-red text-light-text rounded-full shadow-lg hover:bg-authority-red transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
