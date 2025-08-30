/**
 * Service layer exports for The Robot Overlord
 * Centralized export of all API services
 */

// Base service
export { BaseService } from './BaseService';

// Service instances
export { authService } from './AuthService';
export { postsService } from './PostsService';
export { topicsService } from './TopicsService';
export { usersService } from './UsersService';
export { leaderboardService } from './LeaderboardService';
export { badgesService } from './BadgesService';

// Service classes (for custom instantiation if needed)
export { AuthService } from './AuthService';
export { PostsService } from './PostsService';
export { TopicsService } from './TopicsService';
export { UsersService } from './UsersService';
export { LeaderboardService } from './LeaderboardService';
export { BadgesService } from './BadgesService';

// Type exports
export type {
  LoginCredentials,
  RegisterData,
  ResetPasswordData,
  ChangePasswordData,
  GoogleAuthData,
} from './AuthService';

export type {
  Post,
  CreatePostData,
  UpdatePostData,
  PostFilters,
  ModerationAction,
} from './PostsService';

export type {
  Topic,
  TopicCategory,
  CreateTopicData,
  UpdateTopicData,
  TopicFilters,
} from './TopicsService';

export type {
  UserProfile,
  UserFilters,
  UpdateProfileData,
} from './UsersService';

export type {
  LeaderboardEntry,
  LeaderboardFilters,
  Competition,
  Achievement,
} from './LeaderboardService';

export type {
  Badge,
  BadgeFilters,
  CreateBadgeData,
} from './BadgesService';
