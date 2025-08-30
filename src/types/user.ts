/**
 * User type definitions for The Robot Overlord
 * Based on backend API schema
 */

// User role enum
export enum UserRole {
  CITIZEN = 'citizen',
  MODERATOR = 'moderator', 
  ADMIN = 'admin'
}

// User status enum
export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BANNED = 'banned'
}

// Badge type
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned_at: string;
}

// User statistics
export interface UserStats {
  total_posts: number;
  approved_posts: number;
  rejected_posts: number;
  pending_posts: number;
  loyalty_score: number;
  reputation_score: number;
  badges_count: number;
  rank_position?: number;
}

// Main User interface
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: UserRole;
  status: UserStatus;
  loyalty_score: number;
  reputation_score: number;
  created_at: string;
  updated_at: string;
  last_login?: string;
  is_verified: boolean;
  
  // Optional expanded data
  stats?: UserStats;
  badges?: Badge[];
}

// User profile update payload
export interface UserProfileUpdate {
  name?: string;
  avatar_url?: string;
}

// Authentication token data
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

// Authentication response
export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// OAuth provider data
export interface OAuthProvider {
  provider: 'google';
  code: string;
  redirect_uri?: string;
}

// Current user context data
export interface CurrentUser extends User {
  permissions: string[];
  preferences: UserPreferences;
}

// User preferences
export interface UserPreferences {
  theme: 'dark' | 'light' | 'auto';
  notifications_enabled: boolean;
  email_notifications: boolean;
  show_loyalty_score: boolean;
}

// Leaderboard entry
export interface LeaderboardEntry {
  user: User;
  rank: number;
  loyalty_score: number;
  reputation_score: number;
  badges_count: number;
  recent_activity: string;
}

// User activity log entry
export interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  description: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// User search filters
export interface UserSearchFilters {
  query?: string;
  role?: UserRole;
  status?: UserStatus;
  min_loyalty_score?: number;
  max_loyalty_score?: number;
  has_badges?: boolean;
  sort_by?: 'loyalty_score' | 'reputation_score' | 'created_at' | 'name';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// User search response
export interface UserSearchResponse {
  users: User[];
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
}
