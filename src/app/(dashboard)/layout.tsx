/**
 * Dashboard route group layout
 * Provides consistent layout for dashboard-related pages
 */

import React from 'react';
import { AppLayoutWithSidebar } from '@/components/layout/AppLayoutWithSidebar';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppLayoutWithSidebar showSidebar={true}>
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs className="mb-4" />
          {children}
        </div>
      </div>
    </AppLayoutWithSidebar>
  );
}
