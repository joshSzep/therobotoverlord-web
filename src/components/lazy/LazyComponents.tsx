'use client';

import dynamic from 'next/dynamic';
import * as React from 'react';

// Simple loading component
const LoadingSpinner = () => React.createElement('div', { className: 'flex items-center justify-center p-4' },
  React.createElement('div', { className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900' })
);

// Simple skeleton components
const FeedPostSkeleton = () => React.createElement('div', { className: 'animate-pulse space-y-4 p-4' },
  React.createElement('div', { className: 'h-4 bg-gray-300 rounded w-3/4' }),
  React.createElement('div', { className: 'h-4 bg-gray-300 rounded w-1/2' })
);

const StatsCardSkeleton = () => React.createElement('div', { className: 'animate-pulse p-4' },
  React.createElement('div', { className: 'h-6 bg-gray-300 rounded w-1/3 mb-2' }),
  React.createElement('div', { className: 'h-8 bg-gray-300 rounded w-1/2' })
);

const ListItemSkeleton = () => React.createElement('div', { className: 'animate-pulse p-2' },
  React.createElement('div', { className: 'h-4 bg-gray-300 rounded w-full' })
);

// Loading component for lazy-loaded components
const LoadingComponent = ({ skeleton }: { skeleton?: React.ComponentType }) => {
  const SkeletonComponent = skeleton;
  return React.createElement('div', { className: 'flex items-center justify-center p-8' },
    SkeletonComponent ? React.createElement(SkeletonComponent) : React.createElement(LoadingSpinner)
  );
};

// Admin components - Heavy components that should be code split
export const LazyAdminDashboard = dynamic(
  () => Promise.resolve({ default: () => React.createElement('div', null, 'Admin Dashboard') }),
  {
    loading: () => React.createElement(LoadingComponent, { skeleton: StatsCardSkeleton }),
    ssr: false
  }
);

export const LazyAdminAuditLogs = dynamic(
  () => Promise.resolve({ default: () => React.createElement('div', null, 'Audit Logs') }),
  {
    loading: () => React.createElement(LoadingComponent, { skeleton: ListItemSkeleton }),
    ssr: false
  }
);

export const LazyAdminAppeals = dynamic(
  () => Promise.resolve({ default: () => React.createElement('div', null, 'Appeals') }),
  {
    loading: () => React.createElement(LoadingComponent, { skeleton: ListItemSkeleton }),
    ssr: false
  }
);

export const LazyAdminFlags = dynamic(
  () => Promise.resolve({ default: () => React.createElement('div', null, 'Flags') }),
  {
    loading: () => React.createElement(LoadingComponent, { skeleton: ListItemSkeleton }),
    ssr: false
  }
);

export const LazyAdminReports = dynamic(
  () => Promise.resolve({ default: () => React.createElement('div', null, 'Reports') }),
  {
    loading: () => React.createElement(LoadingComponent, { skeleton: StatsCardSkeleton }),
    ssr: false
  }
);

// Feed components
export const LazyContentFeed = dynamic(
  () => Promise.resolve({ default: () => React.createElement('div', null, 'Content Feed') }),
  {
    loading: () => React.createElement(FeedPostSkeleton),
    ssr: false
  }
);

export const LazyPersonalizedRecommendations = dynamic(
  () => Promise.resolve({ default: () => React.createElement('div', null, 'Recommendations') }),
  {
    loading: () => React.createElement(StatsCardSkeleton),
    ssr: false
  }
);

// Chat components - Heavy real-time components
export const LazyOverlordChat = dynamic(
  () => Promise.resolve({ default: () => React.createElement('div', null, 'Overlord Chat') }),
  {
    loading: () => React.createElement(LoadingComponent),
    ssr: false
  }
);

// Moderation components
export const LazyModerationQueue = dynamic(
  () => Promise.resolve({ default: () => React.createElement('div', null, 'Moderation Queue') }),
  {
    loading: () => React.createElement(LoadingComponent, { skeleton: ListItemSkeleton }),
    ssr: false
  }
);

export const LazyModerationTools = dynamic(
  () => Promise.resolve({ default: () => React.createElement('div', null, 'Moderation Tools') }),
  {
    loading: () => React.createElement(LoadingComponent),
    ssr: false
  }
);

// Analytics components - Heavy data visualization
export const LazyAnalyticsDashboard = dynamic(
  () => Promise.resolve({ default: () => React.createElement('div', null, 'Analytics Dashboard') }),
  {
    loading: () => React.createElement(LoadingComponent, { skeleton: StatsCardSkeleton }),
    ssr: false
  }
);

export const LazyChartComponents = dynamic(
  () => Promise.resolve({ default: () => React.createElement('div', null, 'Chart Components') }),
  {
    loading: () => React.createElement(LoadingComponent),
    ssr: false
  }
);

// Settings components
export const LazyUserSettings = dynamic(
  () => Promise.resolve({ default: () => React.createElement('div', null, 'User Settings') }),
  {
    loading: () => React.createElement(LoadingComponent),
    ssr: false
  }
);

export const LazyNotificationSettings = dynamic(
  () => Promise.resolve({ default: () => React.createElement('div', null, 'Notification Settings') }),
  {
    loading: () => React.createElement(LoadingComponent),
    ssr: false
  }
);

// Profile components
export const LazyUserProfile = dynamic(
  () => Promise.resolve({ default: () => React.createElement('div', null, 'User Profile') }),
  {
    loading: () => React.createElement(LoadingComponent),
    ssr: true
  }
);

export const LazyProfileEditor = dynamic(
  () => Promise.resolve({ default: () => React.createElement('div', null, 'Profile Editor') }),
  {
    loading: () => React.createElement(LoadingComponent),
    ssr: false
  }
);

// Search components
export const LazyAdvancedSearch = dynamic(
  () => Promise.resolve({ default: () => React.createElement('div', null, 'Advanced Search') }),
  {
    loading: () => React.createElement(LoadingComponent),
    ssr: false
  }
);

export const LazySearchResults = dynamic(
  () => Promise.resolve({ default: () => React.createElement('div', null, 'Search Results') }),
  {
    loading: () => React.createElement(LoadingSpinner),
    ssr: false
  }
);

// Notification components
export const LazyNotificationCenter = dynamic(
  () => Promise.resolve({ default: () => React.createElement('div', null, 'Notification Center') }),
  {
    loading: () => React.createElement(LoadingComponent),
    ssr: false
  }
);

// Media components - Heavy for file uploads/previews
export const LazyMediaUploader = dynamic(
  () => Promise.resolve({ default: () => React.createElement('div', null, 'Media Uploader') }),
  {
    loading: () => React.createElement(LoadingComponent),
    ssr: false
  }
);

export const LazyMediaGallery = dynamic(
  () => Promise.resolve({ default: () => React.createElement('div', null, 'Media Gallery') }),
  {
    loading: () => React.createElement(LoadingComponent),
    ssr: false
  }
);

// Editor components - Heavy rich text editors
export const LazyRichTextEditor = dynamic(
  () => Promise.resolve({ default: () => React.createElement('div', null, 'Rich Text Editor') }),
  {
    loading: () => React.createElement(LoadingComponent),
    ssr: false
  }
);

export const LazyMarkdownEditor = dynamic(
  () => Promise.resolve({ default: () => React.createElement('div', null, 'Markdown Editor') }),
  {
    loading: () => React.createElement(LoadingComponent),
    ssr: false
  }
);

// Utility function for creating lazy components with custom loading
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: {
    loading?: React.ComponentType;
    ssr?: boolean;
    skeleton?: React.ComponentType;
  } = {}
) => {
  const { loading, ssr = false, skeleton } = options;
  
  return dynamic(importFn, {
    loading: () => LoadingComponent ? React.createElement(LoadingComponent) : React.createElement('div', null, 'Loading...'),
    ssr
  });
};

// Hook for preloading components
export const usePreloadComponent = () => {
  const preload = (importFn: () => Promise<any>) => {
    // Preload the component when user hovers or when we anticipate they'll need it
    importFn();
  };

  return { preload };
};

export default {
  LazyAdminDashboard,
  LazyAdminAuditLogs,
  LazyAdminAppeals,
  LazyAdminFlags,
  LazyAdminReports,
  LazyContentFeed,
  LazyPersonalizedRecommendations,
  LazyOverlordChat,
  LazyModerationQueue,
  LazyModerationTools,
  LazyAnalyticsDashboard,
  LazyChartComponents,
  LazyUserSettings,
  LazyNotificationSettings,
  LazyUserProfile,
  LazyProfileEditor,
  LazyAdvancedSearch,
  LazySearchResults,
  LazyNotificationCenter,
  LazyMediaUploader,
  LazyMediaGallery,
  LazyRichTextEditor,
  LazyMarkdownEditor,
  createLazyComponent,
  usePreloadComponent
};
