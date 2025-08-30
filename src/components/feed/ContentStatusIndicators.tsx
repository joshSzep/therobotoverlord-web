/**
 * Content status indicators component for The Robot Overlord
 * Displays visual status indicators for posts and topics
 */

'use client';

import React from 'react';

interface ContentStatus {
  type: 'moderation' | 'engagement' | 'trending' | 'quality' | 'activity';
  status: string;
  value?: number;
  threshold?: number;
  description?: string;
}

interface ContentStatusIndicatorsProps {
  contentType: 'post' | 'topic';
  contentId: string;
  moderationStatus?: 'pending' | 'approved' | 'rejected' | 'flagged';
  engagementScore?: number;
  qualityScore?: number;
  trendingScore?: number;
  activityLevel?: 'low' | 'medium' | 'high';
  isPinned?: boolean;
  isLocked?: boolean;
  isFeatured?: boolean;
  isHot?: boolean;
  isNew?: boolean;
  hasViolations?: boolean;
  className?: string;
}

export function ContentStatusIndicators({
  contentType,
  contentId,
  moderationStatus,
  engagementScore,
  qualityScore,
  trendingScore,
  activityLevel,
  isPinned,
  isLocked,
  isFeatured,
  isHot,
  isNew,
  hasViolations,
  className = '',
}: ContentStatusIndicatorsProps) {
  const indicators = [];

  // Moderation Status Indicators
  if (moderationStatus && moderationStatus !== 'approved') {
    const moderationConfig = {
      pending: { icon: '⏳', color: 'text-warning-amber', bg: 'bg-warning-amber/20', label: 'Pending Review' },
      rejected: { icon: '❌', color: 'text-rejected-red', bg: 'bg-rejected-red/20', label: 'Rejected' },
      flagged: { icon: '🚩', color: 'text-overlord-red', bg: 'bg-overlord-red/20', label: 'Flagged' },
    };

    const config = moderationConfig[moderationStatus];
    if (config) {
      indicators.push({
        id: 'moderation',
        icon: config.icon,
        label: config.label,
        color: config.color,
        bg: config.bg,
        priority: 1,
        description: `This ${contentType} is ${moderationStatus} and requires moderator attention`,
      });
    }
  }

  // Violations Indicator
  if (hasViolations) {
    indicators.push({
      id: 'violations',
      icon: '⚠️',
      label: 'ToS Violation',
      color: 'text-rejected-red',
      bg: 'bg-rejected-red/20',
      priority: 1,
      description: `This ${contentType} has been flagged for Terms of Service violations`,
    });
  }

  // Special Status Indicators
  if (isPinned) {
    indicators.push({
      id: 'pinned',
      icon: '📌',
      label: 'Pinned',
      color: 'text-overlord-red',
      bg: 'bg-overlord-red/20',
      priority: 2,
      description: `This ${contentType} is pinned by moderators`,
    });
  }

  if (isFeatured) {
    indicators.push({
      id: 'featured',
      icon: '⭐',
      label: 'Featured',
      color: 'text-warning-amber',
      bg: 'bg-warning-amber/20',
      priority: 2,
      description: `This ${contentType} is featured content`,
    });
  }

  if (isLocked) {
    indicators.push({
      id: 'locked',
      icon: '🔒',
      label: 'Locked',
      color: 'text-muted-light',
      bg: 'bg-muted/20',
      priority: 2,
      description: `This ${contentType} is locked and cannot be modified`,
    });
  }

  // Activity Indicators
  if (isHot) {
    indicators.push({
      id: 'hot',
      icon: '🔥',
      label: 'Hot',
      color: 'text-overlord-red',
      bg: 'bg-overlord-red/20',
      priority: 3,
      description: `This ${contentType} is trending with high engagement`,
    });
  }

  if (isNew) {
    indicators.push({
      id: 'new',
      icon: '✨',
      label: 'New',
      color: 'text-approved-green',
      bg: 'bg-approved-green/20',
      priority: 3,
      description: `This ${contentType} was recently created`,
    });
  }

  // Engagement Level Indicators
  if (engagementScore !== undefined) {
    if (engagementScore >= 80) {
      indicators.push({
        id: 'high-engagement',
        icon: '💬',
        label: 'High Engagement',
        color: 'text-approved-green',
        bg: 'bg-approved-green/20',
        priority: 4,
        description: `This ${contentType} has high user engagement (${engagementScore}%)`,
      });
    } else if (engagementScore <= 20) {
      indicators.push({
        id: 'low-engagement',
        icon: '💤',
        label: 'Low Engagement',
        color: 'text-muted-light',
        bg: 'bg-muted/20',
        priority: 5,
        description: `This ${contentType} has low user engagement (${engagementScore}%)`,
      });
    }
  }

  // Quality Score Indicators
  if (qualityScore !== undefined) {
    if (qualityScore >= 90) {
      indicators.push({
        id: 'high-quality',
        icon: '💎',
        label: 'High Quality',
        color: 'text-overlord-red',
        bg: 'bg-overlord-red/20',
        priority: 4,
        description: `This ${contentType} has exceptional quality (${qualityScore}%)`,
      });
    } else if (qualityScore <= 30) {
      indicators.push({
        id: 'low-quality',
        icon: '⚡',
        label: 'Needs Improvement',
        color: 'text-warning-amber',
        bg: 'bg-warning-amber/20',
        priority: 5,
        description: `This ${contentType} could be improved (${qualityScore}% quality)`,
      });
    }
  }

  // Trending Indicators
  if (trendingScore !== undefined && trendingScore >= 70) {
    indicators.push({
      id: 'trending',
      icon: '📈',
      label: 'Trending',
      color: 'text-overlord-red',
      bg: 'bg-overlord-red/20',
      priority: 3,
      description: `This ${contentType} is trending (${trendingScore}% trend score)`,
    });
  }

  // Activity Level Indicators
  if (activityLevel) {
    const activityConfig = {
      high: { icon: '🚀', color: 'text-approved-green', bg: 'bg-approved-green/20', label: 'Very Active' },
      medium: { icon: '📊', color: 'text-warning-amber', bg: 'bg-warning-amber/20', label: 'Active' },
      low: { icon: '📉', color: 'text-muted-light', bg: 'bg-muted/20', label: 'Quiet' },
    };

    const config = activityConfig[activityLevel];
    if (config && activityLevel !== 'medium') { // Only show for high/low activity
      indicators.push({
        id: 'activity',
        icon: config.icon,
        label: config.label,
        color: config.color,
        bg: config.bg,
        priority: 5,
        description: `This ${contentType} has ${activityLevel} activity level`,
      });
    }
  }

  // Sort indicators by priority (lower number = higher priority)
  const sortedIndicators = indicators.sort((a, b) => a.priority - b.priority);

  // Limit to top 3 indicators to avoid clutter
  const displayIndicators = sortedIndicators.slice(0, 3);

  if (displayIndicators.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {displayIndicators.map((indicator) => (
        <div
          key={indicator.id}
          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${indicator.color} ${indicator.bg} transition-colors`}
          title={indicator.description}
        >
          <span className="mr-1">{indicator.icon}</span>
          <span>{indicator.label}</span>
        </div>
      ))}
      
      {sortedIndicators.length > 3 && (
        <div
          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-muted-light bg-muted/20"
          title={`${sortedIndicators.length - 3} more status indicator${sortedIndicators.length - 3 !== 1 ? 's' : ''}`}
        >
          +{sortedIndicators.length - 3}
        </div>
      )}
    </div>
  );
}

// Utility component for simple status badges
interface StatusBadgeProps {
  icon: string;
  label: string;
  color?: 'red' | 'amber' | 'green' | 'blue' | 'gray';
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusBadge({
  icon,
  label,
  color = 'gray',
  size = 'sm',
  className = '',
}: StatusBadgeProps) {
  const colorClasses = {
    red: 'text-rejected-red bg-rejected-red/20',
    amber: 'text-warning-amber bg-warning-amber/20',
    green: 'text-approved-green bg-approved-green/20',
    blue: 'text-overlord-red bg-overlord-red/20',
    gray: 'text-muted-light bg-muted/20',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  return (
    <div
      className={`inline-flex items-center rounded font-medium ${colorClasses[color]} ${sizeClasses[size]} ${className}`}
    >
      <span className="mr-1">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

// Utility component for engagement metrics
interface EngagementMetricsProps {
  views?: number;
  likes?: number;
  replies?: number;
  shares?: number;
  score?: number;
  className?: string;
}

export function EngagementMetrics({
  views,
  likes,
  replies,
  shares,
  score,
  className = '',
}: EngagementMetricsProps) {
  const metrics = [];

  if (views !== undefined) {
    metrics.push({ icon: '👁️', value: views, label: 'views' });
  }
  if (likes !== undefined) {
    metrics.push({ icon: '👍', value: likes, label: 'likes' });
  }
  if (replies !== undefined) {
    metrics.push({ icon: '💬', value: replies, label: 'replies' });
  }
  if (shares !== undefined) {
    metrics.push({ icon: '🔄', value: shares, label: 'shares' });
  }
  if (score !== undefined) {
    metrics.push({ icon: '⭐', value: score, label: 'score' });
  }

  if (metrics.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-3 text-xs text-muted-light ${className}`}>
      {metrics.map((metric, index) => (
        <div key={index} className="flex items-center space-x-1">
          <span>{metric.icon}</span>
          <span>{metric.value.toLocaleString()}</span>
          <span>{metric.label}</span>
        </div>
      ))}
    </div>
  );
}
