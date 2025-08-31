/**
 * Users service for The Robot Overlord
 * Handles user management, profiles, and user-related operations
 */

import { BaseService } from './BaseService';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { User, UserRole, UserStatus, UserBadge, UserStats } from '@/types/user';

export interface UserProfile extends User {
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    publicProfile: boolean;
    showLoyaltyScore: boolean;
    theme: 'dark' | 'light' | 'auto';
    language: string;
  };
}

export interface UserFilters {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'loyalty' | 'activity' | 'username';
  minLoyaltyScore?: number;
  maxLoyaltyScore?: number;
  hasAvatar?: boolean;
  isVerified?: boolean;
  page?: number;
  limit?: number;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  username?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: UserProfile['socialLinks'];
  preferences?: Partial<UserProfile['preferences']>;
}

export class UsersService extends BaseService {
  constructor() {
    super('/users');
  }

  /**
   * Get users with filtering and pagination
   */
  async getUsers(filters?: UserFilters): Promise<PaginatedResponse<User>> {
    const params = filters ? this.buildParams(filters) : undefined;
    return this.getPaginated<User>('', params);
  }

  /**
   * Get user by ID or username
   */
  async getUser(identifier: string): Promise<ApiResponse<UserProfile>> {
    return this.get(`/${identifier}`);
  }

  /**
   * Alias for getUser - Get user by ID
   */
  async getUserById(userId: string): Promise<ApiResponse<UserProfile>> {
    return this.getUser(userId);
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: UpdateProfileData): Promise<ApiResponse<UserProfile>> {
    return this.patch(`/${userId}`, data);
  }

  /**
   * Alias for updateProfile - Update user
   */
  async updateUser(userId: string, data: UpdateProfileData): Promise<ApiResponse<UserProfile>> {
    return this.updateProfile(userId, data);
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(file: File): Promise<ApiResponse<{ avatarUrl: string }>> {
    return this.uploadFile('/avatar', file);
  }

  /**
   * Delete user avatar
   */
  async deleteAvatar(): Promise<ApiResponse<{ message: string }>> {
    return this.delete('/avatar');
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<ApiResponse<UserStats>> {
    return this.get(`/${userId}/stats`);
  }

  /**
   * Get user badges
   */
  async getUserBadges(userId: string): Promise<ApiResponse<UserBadge[]>> {
    return this.get(`/${userId}/badges`);
  }

  /**
   * Get user activity feed
   */
  async getUserActivity(userId: string, page = 1, limit = 20): Promise<PaginatedResponse<{
    id: string;
    type: 'post_created' | 'post_voted' | 'topic_created' | 'badge_earned' | 'level_up';
    description: string;
    metadata: Record<string, unknown>;
    createdAt: string;
  }>> {
    return this.getPaginated(`/${userId}/activity`, { page, limit });
  }

  /**
   * Follow user
   */
  async followUser(userId: string): Promise<ApiResponse<{ following: boolean }>> {
    return this.post(`/${userId}/follow`);
  }

  /**
   * Unfollow user
   */
  async unfollowUser(userId: string): Promise<ApiResponse<{ following: boolean }>> {
    return this.post(`/${userId}/unfollow`);
  }

  /**
   * Get user followers
   */
  async getUserFollowers(userId: string, page = 1, limit = 20): Promise<PaginatedResponse<User>> {
    return this.getPaginated(`/${userId}/followers`, { page, limit });
  }

  /**
   * Get users that user is following
   */
  async getUserFollowing(userId: string, page = 1, limit = 20): Promise<PaginatedResponse<User>> {
    return this.getPaginated(`/${userId}/following`, { page, limit });
  }

  /**
   * Block user
   */
  async blockUser(userId: string): Promise<ApiResponse<{ blocked: boolean }>> {
    return this.post(`/${userId}/block`);
  }

  /**
   * Unblock user
   */
  async unblockUser(userId: string): Promise<ApiResponse<{ blocked: boolean }>> {
    return this.post(`/${userId}/unblock`);
  }

  /**
   * Get blocked users
   */
  async getBlockedUsers(page = 1, limit = 20): Promise<PaginatedResponse<User>> {
    return this.getPaginated('/blocked', { page, limit });
  }

  /**
   * Search users
   */
  async searchUsers(query: string, filters?: Omit<UserFilters, 'search'>): Promise<PaginatedResponse<User>> {
    const params = this.buildParams({ search: query, ...filters });
    return this.getPaginated('/search', params);
  }

  /**
   * Get user notifications
   */
  async getNotifications(page = 1, limit = 20): Promise<PaginatedResponse<{
    id: string;
    type: 'mention' | 'reply' | 'follow' | 'badge' | 'moderation' | 'system';
    title: string;
    message: string;
    isRead: boolean;
    metadata: Record<string, unknown>;
    createdAt: string;
  }>> {
    return this.getPaginated('/notifications', { page, limit });
  }

  /**
   * Mark notification as read
   */
  async markNotificationRead(notificationId: string): Promise<ApiResponse<{ message: string }>> {
    return this.patch(`/notifications/${notificationId}/read`);
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsRead(): Promise<ApiResponse<{ message: string }>> {
    return this.patch('/notifications/read-all');
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<ApiResponse<{ message: string }>> {
    return this.delete(`/notifications/${notificationId}`);
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return this.get('/notifications/unread-count');
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    mentionNotifications: boolean;
    replyNotifications: boolean;
    followNotifications: boolean;
    badgeNotifications: boolean;
    moderationNotifications: boolean;
    systemNotifications: boolean;
  }): Promise<ApiResponse<{ message: string }>> {
    return this.patch('/preferences/notifications', preferences);
  }

  /**
   * Get top users by loyalty score
   */
  async getTopUsers(timeRange: 'day' | 'week' | 'month' | 'all' = 'all', limit = 10): Promise<ApiResponse<User[]>> {
    return this.get('/top', { timeRange, limit });
  }

  /**
   * Get user leaderboard position
   */
  async getUserRanking(userId: string): Promise<ApiResponse<{
    rank: number;
    totalUsers: number;
    percentile: number;
    loyaltyScore: number;
  }>> {
    return this.get(`/${userId}/ranking`);
  }

  /**
   * Report user for violations
   */
  async reportUser(userId: string, reason: string, details?: string): Promise<ApiResponse<{ message: string }>> {
    return this.post(`/${userId}/report`, { reason, details });
  }

  // Admin/Moderator endpoints

  /**
   * Update user role (admin only)
   */
  async updateUserRole(userId: string, role: UserRole): Promise<ApiResponse<User>> {
    return this.patch(`/${userId}/role`, { role });
  }

  /**
   * Update user status (admin/moderator only)
   */
  async updateUserStatus(userId: string, status: UserStatus, reason?: string): Promise<ApiResponse<User>> {
    return this.patch(`/${userId}/status`, { status, reason });
  }

  /**
   * Adjust user loyalty score (admin only)
   */
  async adjustLoyaltyScore(userId: string, adjustment: number, reason: string): Promise<ApiResponse<{
    newScore: number;
    adjustment: number;
    reason: string;
  }>> {
    return this.post(`/${userId}/loyalty-adjustment`, { adjustment, reason });
  }

  /**
   * Award badge to user (admin/moderator only)
   */
  async awardBadge(userId: string, badgeId: string, reason?: string): Promise<ApiResponse<UserBadge>> {
    return this.post(`/${userId}/badges`, { badgeId, reason });
  }

  /**
   * Remove badge from user (admin only)
   */
  async removeBadge(userId: string, badgeId: string, reason?: string): Promise<ApiResponse<{ message: string }>> {
    return this.delete(`/${userId}/badges/${badgeId}`, { data: { reason } });
  }

  /**
   * Get user moderation history (admin/moderator only)
   */
  async getModerationHistory(userId: string): Promise<ApiResponse<Array<{
    action: string;
    reason?: string;
    moderatedBy: string;
    moderatedAt: string;
    details?: Record<string, unknown>;
  }>>> {
    return this.get(`/${userId}/moderation/history`);
  }

  /**
   * Get users pending moderation (admin/moderator only)
   */
  async getPendingModeration(page = 1, limit = 20): Promise<PaginatedResponse<User>> {
    return this.getPaginated('/moderation/pending', { page, limit });
  }

  /**
   * Bulk moderate users (admin only)
   */
  async bulkModerate(userIds: string[], action: {
    action: 'approve' | 'suspend' | 'ban' | 'activate';
    reason?: string;
  }): Promise<ApiResponse<{
    success: string[];
    failed: Array<{ id: string; error: string }>;
  }>> {
    return this.post('/moderation/bulk', { userIds, action });
  }

  /**
   * Get user analytics (admin only)
   */
  async getUserAnalytics(userId: string): Promise<ApiResponse<{
    registrationDate: string;
    lastActiveDate: string;
    totalLogins: number;
    averageSessionDuration: number;
    postsCreated: number;
    topicsCreated: number;
    votesGiven: number;
    loyaltyScoreHistory: Array<{ date: string; score: number }>;
    engagementMetrics: {
      dailyActive: boolean;
      weeklyActive: boolean;
      monthlyActive: boolean;
    };
  }>> {
    return this.get(`/${userId}/analytics`);
  }

  /**
   * Export user data (GDPR compliance)
   */
  async exportUserData(userId: string): Promise<ApiResponse<{ downloadUrl: string; expiresAt: string }>> {
    return this.post(`/${userId}/export`);
  }

  /**
   * Delete user account (admin only or self)
   */
  async deleteUser(userId: string, reason?: string): Promise<ApiResponse<{ message: string }>> {
    return this.delete(`/${userId}`, { data: { reason } });
  }
}

// Export singleton instance
export const usersService = new UsersService();
