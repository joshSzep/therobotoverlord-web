/**
 * Badge type definitions for The Robot Overlord
 * Based on backend API schema
 */

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'achievement' | 'participation' | 'moderation' | 'loyalty' | 'special' | 'seasonal' | 'milestone';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  requirements: Array<{
    type: 'posts_created' | 'upvotes_received' | 'topics_created' | 'days_active' | 'loyalty_score' | 'moderation_actions' | 'special_event' | 'streak_days';
    target: number;
    timeframe?: 'day' | 'week' | 'month' | 'year' | 'all';
    description: string;
    metadata?: Record<string, unknown>;
  }>;
  rewards: {
    loyaltyPoints: number;
    reputationPoints?: number;
    title?: string;
    privileges?: string[];
    unlocks?: string[];
  };
  isActive: boolean;
  isSecret: boolean;
  sortOrder: number;
  totalAwarded: number;
  conditions?: {
    excludeRoles?: string[];
    requireRoles?: string[];
    minAccountAge?: number;
    maxPerUser?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  badge: Badge;
  awardedAt: string;
  awardedBy?: string;
  awardedByUser?: {
    id: string;
    username: string;
    role: string;
  };
  reason?: string;
  isVisible: boolean;
  metadata?: Record<string, unknown>;
}

export interface BadgeProgress {
  badgeId: string;
  badge: Badge;
  progress: Array<{
    requirement: Badge['requirements'][0];
    current: number;
    target: number;
    percentage: number;
    completed: boolean;
    estimatedCompletion?: string;
  }>;
  overallProgress: number;
  isEligible: boolean;
  isAwarded: boolean;
  awardedAt?: string;
  nextMilestone?: {
    requirement: string;
    needed: number;
    estimatedTime?: string;
  };
}

export interface BadgeFilters {
  category?: Badge['category'];
  rarity?: Badge['rarity'];
  isActive?: boolean;
  isSecret?: boolean;
  search?: string;
  sortBy?: 'name' | 'rarity' | 'awarded' | 'created' | 'category' | 'difficulty';
  awardedToUser?: string;
  notAwardedToUser?: string;
  minAwarded?: number;
  maxAwarded?: number;
  page?: number;
  limit?: number;
}

export interface CreateBadgeRequest {
  name: string;
  description: string;
  icon: string;
  category: Badge['category'];
  rarity: Badge['rarity'];
  requirements: Badge['requirements'];
  rewards: Badge['rewards'];
  isSecret?: boolean;
  sortOrder?: number;
  conditions?: Badge['conditions'];
}

export interface UpdateBadgeRequest {
  name?: string;
  description?: string;
  icon?: string;
  category?: Badge['category'];
  rarity?: Badge['rarity'];
  requirements?: Badge['requirements'];
  rewards?: Badge['rewards'];
  isActive?: boolean;
  isSecret?: boolean;
  sortOrder?: number;
  conditions?: Badge['conditions'];
}

export interface BadgeAward {
  id: string;
  badgeId: string;
  badge: Badge;
  userId: string;
  user: {
    id: string;
    username: string;
    avatar?: string;
    role: string;
  };
  awardedBy: string;
  awardedByUser: {
    id: string;
    username: string;
    role: string;
  };
  reason?: string;
  isManual: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface BadgeStatistics {
  totalBadges: number;
  totalAwarded: number;
  totalUsers: number;
  averageAwardsPerBadge: number;
  averageBadgesPerUser: number;
  categoryBreakdown: Record<string, {
    count: number;
    awarded: number;
    percentage: number;
  }>;
  rarityBreakdown: Record<string, {
    count: number;
    awarded: number;
    percentage: number;
  }>;
  mostAwardedBadge: {
    badge: Badge;
    count: number;
  };
  rarest: {
    badge: Badge;
    count: number;
  };
  recentActivity: Array<{
    date: string;
    awarded: number;
    newBadges: number;
  }>;
  topCollectors: Array<{
    user: {
      id: string;
      username: string;
      avatar?: string;
    };
    badgeCount: number;
    rarityScore: number;
    latestBadge?: {
      badge: Badge;
      awardedAt: string;
    };
  }>;
}

export interface BadgeLeaderboard {
  entries: Array<{
    rank: number;
    user: {
      id: string;
      username: string;
      avatar?: string;
      loyaltyScore: number;
      role: string;
    };
    badgeCount: number;
    rarityScore: number;
    categories: Record<string, number>;
    latestBadge?: {
      badge: Badge;
      awardedAt: string;
    };
    streak?: {
      current: number;
      longest: number;
    };
  }>;
  category?: string;
  lastUpdated: string;
}

export interface BadgeAuditLog {
  id: string;
  action: 'awarded' | 'revoked' | 'created' | 'updated' | 'deleted' | 'activated' | 'deactivated';
  badgeId: string;
  badge: Badge;
  userId?: string;
  user?: {
    id: string;
    username: string;
  };
  performedBy: string;
  performer: {
    id: string;
    username: string;
    role: string;
  };
  reason?: string;
  previousData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface BadgeAnalytics {
  badgeId?: string;
  badge?: Badge;
  totalBadges: number;
  totalAwarded: number;
  awardingTrends: Array<{
    date: string;
    awarded: number;
    revoked?: number;
  }>;
  categoryDistribution: Record<string, number>;
  rarityDistribution: Record<string, number>;
  topPerformers: Array<{
    user: {
      id: string;
      username: string;
      avatar?: string;
    };
    badgeCount: number;
    categories: Record<string, number>;
  }>;
  engagementMetrics: {
    averageTimeToEarn: number;
    completionRates: Record<string, number>;
    abandonmentRate: number;
  };
  badgeSpecific?: {
    awardedCount: number;
    averageTimeToEarn: number;
    completionRate: number;
    requirementProgress: Array<{
      requirement: string;
      averageProgress: number;
      completionRate: number;
    }>;
    userFeedback?: Array<{
      rating: number;
      comment?: string;
      userId: string;
    }>;
  };
}
