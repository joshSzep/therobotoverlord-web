/**
 * Centralized type exports for The Robot Overlord
 * Re-exports all type definitions for easy importing
 */

// Core API types
export * from './api';

// User types (base exports)
export type { User, UserRole, UserStatus, UserStats, AuthTokens, CurrentUser, UserPreferences, UserActivity, UserSearchFilters, UserSearchResponse } from './user';

// Domain-specific types
export * from './posts';
export * from './topics';

// Leaderboard types (avoiding conflicts)
export type { 
  LeaderboardEntry as LeaderboardRanking,
  LeaderboardFilters,
  Competition,
  Achievement,
  UserAchievement,
  Streak,
  LeaderboardStatistics,
  RankingHistory,
  CompetitionLeaderboard
} from './leaderboard';

// Badge types (avoiding conflicts)
export type {
  Badge as BadgeDefinition,
  UserBadge as AwardedBadge,
  BadgeProgress,
  BadgeFilters,
  CreateBadgeRequest,
  UpdateBadgeRequest,
  BadgeAward,
  BadgeStatistics,
  BadgeLeaderboard,
  BadgeAuditLog,
  BadgeAnalytics
} from './badges';

export * from './moderation';

// Component and form types
export * from './components';

// Validation schemas and form data types
export * from '../lib/validations';
