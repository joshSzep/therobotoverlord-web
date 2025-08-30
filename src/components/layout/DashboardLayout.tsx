/**
 * Shared Dashboard Layout Component
 * Provides consistent layout for dashboard-related pages
 */

import React from 'react';
import { AppLayoutWithSidebar } from '@/components/layout/AppLayoutWithSidebar';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';

interface DashboardLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showBreadcrumbs?: boolean;
}

export function DashboardLayout({ 
  children, 
  showSidebar = true, 
  showBreadcrumbs = true 
}: DashboardLayoutProps) {
  return (
    <AppLayoutWithSidebar showSidebar={showSidebar}>
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          {showBreadcrumbs && <Breadcrumbs className="mb-4" />}
          {children}
        </div>
      </div>
    </AppLayoutWithSidebar>
  );
}
