'use client';

import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FeedPostSkeleton, StatsCardSkeleton, ListItemSkeleton } from '@/components/ui/Skeleton';

// Loading component for lazy-loaded components
const LoadingComponent = ({ skeleton }: { skeleton?: React.ComponentType }) => {
  const SkeletonComponent = skeleton;
  return (
    <div className="flex items-center justify-center p-8">
      {SkeletonComponent ? <SkeletonComponent /> : <LoadingSpinner />}
    </div>
  );
};

// Admin components - Heavy components that should be code split
export const LazyAdminDashboard = dynamic(
  () => import('@/app/admin/page').then(mod => ({ default: mod.default })),
  {
    loading: () => <LoadingComponent skeleton={StatsCardSkeleton} />,
    ssr: false
  }
);

export const LazyAdminAuditLogs = dynamic(
  () => import('@/app/admin/audit/page').then(mod => ({ default: mod.default })),
  {
    loading: () => <LoadingComponent skeleton={ListItemSkeleton} />,
    ssr: false
  }
);

export const LazyAdminAppeals = dynamic(
  () => import('@/app/admin/appeals/page').then(mod => ({ default: mod.default })),
  {
    loading: () => <LoadingComponent skeleton={ListItemSkeleton} />,
    ssr: false
  }
);

export const LazyAdminFlags = dynamic(
  () => import('@/app/admin/flags/page').then(mod => ({ default: mod.default })),
  {
    loading: () => <LoadingComponent skeleton={ListItemSkeleton} />,
    ssr: false
  }
);

export const LazyAdminReports = dynamic(
  () => import('@/app/admin/reports/page').then(mod => ({ default: mod.default })),
  {
    loading: () => <LoadingComponent skeleton={StatsCardSkeleton} />,
    ssr: false
  }
);

// Feed components
export const LazyContentFeed = dynamic(
  () => import('@/components/feed/ContentFeed').then(mod => ({ default: mod.ContentFeed })),
  {
    loading: () => <FeedPostSkeleton />,
    ssr: false
  }
);

export const LazyPersonalizedRecommendations = dynamic(
  () => import('@/components/feed/PersonalizedRecommendations').then(mod => ({ default: mod.PersonalizedRecommendations })),
  {
    loading: () => <StatsCardSkeleton />,
    ssr: false
  }
);

// Chat components - Heavy real-time components
export const LazyOverlordChat = dynamic(
  () => import('@/components/OverlordChat').then(mod => ({ default: mod.OverlordChat })),
  {
    loading: () => <LoadingComponent />,
    ssr: false
  }
);

// Moderation components
export const LazyModerationQueue = dynamic(
  () => import('@/components/moderation/ModerationQueue'),
  {
    loading: () => <LoadingComponent skeleton={ListItemSkeleton} />,
    ssr: false
  }
);

export const LazyModerationTools = dynamic(
  () => import('@/components/moderation/ModerationTools'),
  {
    loading: () => <LoadingComponent />,
    ssr: false
  }
);

// Analytics components - Heavy data visualization
export const LazyAnalyticsDashboard = dynamic(
  () => import('@/components/analytics/AnalyticsDashboard'),
  {
    loading: () => <LoadingComponent skeleton={StatsCardSkeleton} />,
    ssr: false
  }
);

export const LazyChartComponents = dynamic(
  () => import('@/components/analytics/Charts'),
  {
    loading: () => <LoadingComponent />,
    ssr: false
  }
);

// Settings components
export const LazyUserSettings = dynamic(
  () => import('@/components/settings/UserSettings'),
  {
    loading: () => <LoadingComponent />,
    ssr: false
  }
);

export const LazyNotificationSettings = dynamic(
  () => import('@/components/settings/NotificationSettings'),
  {
    loading: () => <LoadingComponent />,
    ssr: false
  }
);

// Profile components
export const LazyUserProfile = dynamic(
  () => import('@/components/profile/UserProfile'),
  {
    loading: () => <LoadingComponent />,
    ssr: true
  }
);

export const LazyProfileEditor = dynamic(
  () => import('@/components/profile/ProfileEditor'),
  {
    loading: () => <LoadingComponent />,
    ssr: false
  }
);

// Search components
export const LazyAdvancedSearch = dynamic(
  () => import('@/components/search/AdvancedSearch'),
  {
    loading: () => <LoadingComponent />,
    ssr: false
  }
);

export const LazySearchResults = dynamic(
  () => import('@/components/search/SearchResults').then(mod => ({ default: mod.SearchResults })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
);

// Notification components
export const LazyNotificationCenter = dynamic(
  () => import('@/components/notifications/NotificationCenter'),
  {
    loading: () => <LoadingComponent />,
    ssr: false
  }
);

// Media components - Heavy for file uploads/previews
export const LazyMediaUploader = dynamic(
  () => import('@/components/media/MediaUploader'),
  {
    loading: () => <LoadingComponent />,
    ssr: false
  }
);

export const LazyMediaGallery = dynamic(
  () => import('@/components/media/MediaGallery'),
  {
    loading: () => <LoadingComponent />,
    ssr: false
  }
);

// Editor components - Heavy rich text editors
export const LazyRichTextEditor = dynamic(
  () => import('@/components/editor/RichTextEditor'),
  {
    loading: () => <LoadingComponent />,
    ssr: false
  }
);

export const LazyMarkdownEditor = dynamic(
  () => import('@/components/editor/MarkdownEditor'),
  {
    loading: () => <LoadingComponent />,
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
    loading: () => LoadingComponent ? <LoadingComponent /> : <div>Loading...</div>,
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
