/**
 * Empty State Components for The Robot Overlord
 * Provides various empty state displays for better UX when no data is available
 */

import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'ghost';
  };
  className?: string;
}

export function EmptyState({ 
  icon = '📭', 
  title, 
  description, 
  action, 
  className = '' 
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-light-text mb-2">{title}</h3>
      <p className="text-muted-light mb-6 max-w-md mx-auto">{description}</p>
      {action && (
        <Button
          variant={action.variant || 'primary'}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Specific empty states for different contexts
export function EmptyFeedState({ onRefresh }: { onRefresh?: () => void }) {
  return (
    <EmptyState
      icon="🤖"
      title="No Content Yet"
      description="Your feed is empty. Start following topics or users to see content here, or check back later for new posts."
      action={onRefresh ? {
        label: "Refresh Feed",
        onClick: onRefresh,
        variant: "primary"
      } : undefined}
    />
  );
}

export function EmptyNotificationsState() {
  return (
    <EmptyState
      icon="🔔"
      title="No Notifications"
      description="You're all caught up! No new notifications at this time."
    />
  );
}

export function EmptySearchState({ query, onClear }: { query?: string; onClear?: () => void }) {
  return (
    <EmptyState
      icon="🔍"
      title="No Results Found"
      description={query ? `No results found for "${query}". Try adjusting your search terms.` : "No results found. Try a different search query."}
      action={onClear ? {
        label: "Clear Search",
        onClick: onClear,
        variant: "secondary"
      } : undefined}
    />
  );
}

export function EmptyModerationQueueState() {
  return (
    <EmptyState
      icon="✅"
      title="Queue is Clear"
      description="Great work! There are no items pending moderation at this time."
    />
  );
}

export function EmptyAuditLogsState({ onRefresh }: { onRefresh?: () => void }) {
  return (
    <EmptyState
      icon="📋"
      title="No Audit Logs"
      description="No audit logs match your current filters. Try adjusting your search criteria."
      action={onRefresh ? {
        label: "Refresh",
        onClick: onRefresh,
        variant: "secondary"
      } : undefined}
    />
  );
}

export function EmptyAppealsState() {
  return (
    <EmptyState
      icon="⚖️"
      title="No Appeals"
      description="No appeals match your current filters. All appeals may have been processed."
    />
  );
}

export function EmptySanctionsState() {
  return (
    <EmptyState
      icon="🚨"
      title="No Sanctions"
      description="No sanctions match your current filters. This could indicate good community behavior!"
    />
  );
}

export function EmptyFlagsState() {
  return (
    <EmptyState
      icon="🚩"
      title="No Flags"
      description="No content flags match your current filters. The community is behaving well!"
    />
  );
}

export function EmptyUsersState({ onInvite }: { onInvite?: () => void }) {
  return (
    <EmptyState
      icon="👥"
      title="No Users Found"
      description="No users match your current search criteria. Try adjusting your filters."
      action={onInvite ? {
        label: "Invite Users",
        onClick: onInvite,
        variant: "primary"
      } : undefined}
    />
  );
}

export function EmptyContentState({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      icon="📝"
      title="No Content"
      description="No content matches your current filters. Be the first to create something!"
      action={onCreate ? {
        label: "Create Content",
        onClick: onCreate,
        variant: "primary"
      } : undefined}
    />
  );
}

export function EmptyTopicsState({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      icon="💬"
      title="No Topics"
      description="No topics found. Start a new discussion to get the conversation going!"
      action={onCreate ? {
        label: "Create Topic",
        onClick: onCreate,
        variant: "primary"
      } : undefined}
    />
  );
}

export function EmptyCommentsState({ onComment }: { onComment?: () => void }) {
  return (
    <EmptyState
      icon="💭"
      title="No Comments Yet"
      description="Be the first to share your thoughts on this topic!"
      action={onComment ? {
        label: "Add Comment",
        onClick: onComment,
        variant: "primary"
      } : undefined}
    />
  );
}

export function EmptyFollowingState({ onExplore }: { onExplore?: () => void }) {
  return (
    <EmptyState
      icon="👤"
      title="Not Following Anyone"
      description="Start following users and topics to personalize your experience."
      action={onExplore ? {
        label: "Explore Users",
        onClick: onExplore,
        variant: "primary"
      } : undefined}
    />
  );
}

export function EmptyBookmarksState({ onExplore }: { onExplore?: () => void }) {
  return (
    <EmptyState
      icon="🔖"
      title="No Bookmarks"
      description="Save interesting posts and topics to your bookmarks for easy access later."
      action={onExplore ? {
        label: "Explore Content",
        onClick: onExplore,
        variant: "primary"
      } : undefined}
    />
  );
}

export function EmptyHistoryState() {
  return (
    <EmptyState
      icon="📚"
      title="No History"
      description="Your activity history will appear here as you interact with the platform."
    />
  );
}

export function EmptyReportsState({ onRefresh }: { onRefresh?: () => void }) {
  return (
    <EmptyState
      icon="📊"
      title="No Report Data"
      description="No data available for the selected time period. Try adjusting your filters."
      action={onRefresh ? {
        label: "Refresh Data",
        onClick: onRefresh,
        variant: "secondary"
      } : undefined}
    />
  );
}

export function EmptyLeaderboardState() {
  return (
    <EmptyState
      icon="🏆"
      title="No Rankings Available"
      description="Leaderboard data is not available at this time. Check back later!"
    />
  );
}

export function EmptySettingsState() {
  return (
    <EmptyState
      icon="⚙️"
      title="No Settings Available"
      description="No settings are available for this section."
    />
  );
}

// Generic error state for when something goes wrong
export function ErrorState({ 
  title = "Something went wrong", 
  description = "An unexpected error occurred. Please try again.", 
  onRetry 
}: { 
  title?: string; 
  description?: string; 
  onRetry?: () => void; 
}) {
  return (
    <EmptyState
      icon="⚠️"
      title={title}
      description={description}
      action={onRetry ? {
        label: "Try Again",
        onClick: onRetry,
        variant: "primary"
      } : undefined}
      className="text-rejected-red"
    />
  );
}

// Connection error state
export function ConnectionErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="Connection Error"
      description="Unable to connect to the server. Please check your internet connection and try again."
      onRetry={onRetry}
    />
  );
}

// Permission denied state
export function PermissionDeniedState() {
  return (
    <EmptyState
      icon="🚫"
      title="Access Denied"
      description="You don't have permission to view this content. Contact an administrator if you believe this is an error."
      className="text-rejected-red"
    />
  );
}

// Maintenance mode state
export function MaintenanceState() {
  return (
    <EmptyState
      icon="🔧"
      title="Under Maintenance"
      description="This feature is temporarily unavailable while we perform maintenance. Please check back later."
      className="text-yellow-600"
    />
  );
}
