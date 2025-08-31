/**
 * Badges service for The Robot Overlord
 * Handles badge management, awarding, and badge-related operations
 */

import { BaseService } from './BaseService';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { UserBadge } from '@/types/user';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'achievement' | 'participation' | 'moderation' | 'loyalty' | 'special' | 'seasonal';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  requirements: Array<{
    type: 'posts_created' | 'upvotes_received' | 'topics_created' | 'days_active' | 'loyalty_score' | 'moderation_actions' | 'special_event';
    target: number;
    timeframe?: 'day' | 'week' | 'month' | 'year' | 'all';
    description: string;
  }>;
  rewards: {
    loyaltyPoints: number;
    title?: string;
    privileges?: string[];
  };
  isActive: boolean;
  isSecret: boolean;
  sortOrder: number;
  totalAwarded: number;
  createdAt: string;
  updatedAt: string;
}

export interface BadgeFilters {
  category?: Badge['category'];
  rarity?: Badge['rarity'];
  isActive?: boolean;
  isSecret?: boolean;
  search?: string;
  sortBy?: 'name' | 'rarity' | 'awarded' | 'created' | 'category';
  page?: number;
  limit?: number;
}

export interface CreateBadgeData {
  name: string;
  description: string;
  icon: string;
  category: Badge['category'];
  rarity: Badge['rarity'];
  requirements: Badge['requirements'];
  rewards: Badge['rewards'];
  isSecret?: boolean;
  sortOrder?: number;
}

export class BadgesService extends BaseService {
  constructor() {
    super('/badges');
  }

  /**
   * Get all badges with filtering
   */
  async getBadges(filters?: BadgeFilters): Promise<PaginatedResponse<Badge>> {
    const params = filters ? this.buildParams(filters) : undefined;
    return this.getPaginated<Badge>('', params);
  }

  /**
   * Get badge by ID
   */
  async getBadge(id: string): Promise<ApiResponse<Badge & {
    holders: Array<{
      user: {
        id: string;
        username: string;
        avatar?: string;
      };
      awardedAt: string;
      awardedBy?: string;
      reason?: string;
    }>;
    userProgress?: {
      current: number;
      target: number;
      percentage: number;
    };
  }>> {
    return this.get(`/${id}`);
  }

  /**
   * Get badges by category
   */
  async getBadgesByCategory(category: Badge['category']): Promise<ApiResponse<Badge[]>> {
    return this.get(`/category/${category}`);
  }

  /**
   * Get badges by rarity
   */
  async getBadgesByRarity(rarity: Badge['rarity']): Promise<ApiResponse<Badge[]>> {
    return this.get(`/rarity/${rarity}`);
  }

  /**
   * Get user's badges
   */
  async getUserBadges(userId: string): Promise<ApiResponse<Array<UserBadge & {
    badge: Badge;
  }>>> {
    return this.get(`/user/${userId}`);
  }

  /**
   * Get current user's badges
   */
  async getMyBadges(): Promise<ApiResponse<Array<UserBadge & {
    badge: Badge;
  }>>> {
    return this.get('/my-badges');
  }

  /**
   * Get badge progress for current user
   */
  async getBadgeProgress(): Promise<ApiResponse<Array<{
    badge: Badge;
    progress: Array<{
      requirement: Badge['requirements'][0];
      current: number;
      target: number;
      percentage: number;
      completed: boolean;
    }>;
    isEligible: boolean;
    isAwarded: boolean;
    awardedAt?: string;
  }>>> {
    return this.get('/progress');
  }

  /**
   * Get badge progress for specific badge
   */
  async getBadgeProgressById(badgeId: string): Promise<ApiResponse<{
    badge: Badge;
    progress: Array<{
      requirement: Badge['requirements'][0];
      current: number;
      target: number;
      percentage: number;
      completed: boolean;
    }>;
    isEligible: boolean;
    isAwarded: boolean;
    awardedAt?: string;
  }>> {
    return this.get(`/${badgeId}/progress`);
  }

  /**
   * Get recently awarded badges
   */
  async getRecentlyAwarded(limit = 20): Promise<ApiResponse<Array<{
    user: {
      id: string;
      username: string;
      avatar?: string;
    };
    badge: Badge;
    awardedAt: string;
    awardedBy?: string;
    reason?: string;
  }>>> {
    return this.get('/recent', { limit });
  }

  /**
   * Get popular badges (most awarded)
   */
  async getPopularBadges(limit = 10): Promise<ApiResponse<Array<Badge & {
    awardedCount: number;
    recentAwards: number;
  }>>> {
    return this.get('/popular', { limit });
  }

  /**
   * Get rare badges (least awarded)
   */
  async getRareBadges(limit = 10): Promise<ApiResponse<Array<Badge & {
    awardedCount: number;
  }>>> {
    return this.get('/rare', { limit });
  }

  /**
   * Search badges
   */
  async searchBadges(query: string, filters?: Omit<BadgeFilters, 'search'>): Promise<PaginatedResponse<Badge>> {
    const params = this.buildParams({ search: query, ...filters });
    return this.getPaginated<Badge>('/search', params);
  }

  /**
   * Get badge statistics
   */
  async getBadgeStats(): Promise<ApiResponse<{
    totalBadges: number;
    totalAwarded: number;
    categoryBreakdown: Record<string, number>;
    rarityBreakdown: Record<string, number>;
    averageAwardsPerBadge: number;
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
    }>;
  }>> {
    return this.get('/stats');
  }

  /**
   * Get badge leaderboard (users with most badges)
   */
  async getBadgeLeaderboard(category?: Badge['category'], limit = 50): Promise<ApiResponse<Array<{
    user: {
      id: string;
      username: string;
      avatar?: string;
      loyaltyScore: number;
    };
    badgeCount: number;
    rarityScore: number;
    categories: Record<string, number>;
    latestBadge?: {
      badge: Badge;
      awardedAt: string;
    };
  }>>> {
    const params = category ? { category, limit } : { limit };
    return this.get('/leaderboard', params);
  }

  /**
   * Check badge eligibility for current user
   */
  async checkEligibility(): Promise<ApiResponse<Array<{
    badge: Badge;
    isEligible: boolean;
    missingRequirements: Array<{
      requirement: Badge['requirements'][0];
      current: number;
      needed: number;
    }>;
  }>>> {
    return this.get('/eligibility');
  }

  /**
   * Claim eligible badge
   */
  async claimBadge(badgeId: string): Promise<ApiResponse<{
    success: boolean;
    badge?: Badge;
    userBadge?: UserBadge;
    message: string;
  }>> {
    return this.post(`/${badgeId}/claim`);
  }

  // Admin/Moderator endpoints

  /**
   * Create new badge (admin only)
   */
  async createBadge(data: CreateBadgeData): Promise<ApiResponse<Badge>> {
    return this.post('', data);
  }

  /**
   * Update badge (admin only)
   */
  async updateBadge(id: string, data: Partial<CreateBadgeData>): Promise<ApiResponse<Badge>> {
    return this.patch(`/${id}`, data);
  }

  /**
   * Delete badge (admin only)
   */
  async deleteBadge(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.delete(`/${id}`);
  }

  /**
   * Award badge manually (admin/moderator only)
   */
  async awardBadge(badgeId: string, userId: string, reason?: string): Promise<ApiResponse<UserBadge>> {
    return this.post(`/${badgeId}/award`, { userId, reason });
  }

  /**
   * Revoke badge (admin only)
   */
  async revokeBadge(badgeId: string, userId: string, reason?: string): Promise<ApiResponse<{ message: string }>> {
    return this.post(`/${badgeId}/revoke`, { userId, reason });
  }

  /**
   * Bulk award badges (admin only)
   */
  async bulkAwardBadge(badgeId: string, userIds: string[], reason?: string): Promise<ApiResponse<{
    success: string[];
    failed: Array<{ userId: string; error: string }>;
  }>> {
    return this.post(`/${badgeId}/bulk-award`, { userIds, reason });
  }

  /**
   * Get badge audit log (admin only)
   */
  async getBadgeAuditLog(badgeId?: string, page = 1, limit = 50): Promise<PaginatedResponse<{
    id: string;
    action: 'awarded' | 'revoked' | 'created' | 'updated' | 'deleted';
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
    };
    reason?: string;
    metadata?: Record<string, unknown>;
    createdAt: string;
  }>> {
    const params = badgeId ? { badgeId, page, limit } : { page, limit };
    return this.getPaginated('/audit-log', params);
  }

  /**
   * Recalculate badge eligibility (admin only)
   */
  async recalculateBadges(userId?: string): Promise<ApiResponse<{
    message: string;
    processed: number;
    awarded: number;
  }>> {
    const params = userId ? { userId } : undefined;
    return this.post('/recalculate', params);
  }

  /**
   * Get badge analytics (admin only)
   */
  async getBadgeAnalytics(badgeId?: string): Promise<ApiResponse<{
    totalBadges: number;
    totalAwarded: number;
    awardingTrends: Array<{ date: string; awarded: number }>;
    categoryDistribution: Record<string, number>;
    rarityDistribution: Record<string, number>;
    topPerformers: Array<{
      user: { id: string; username: string };
      badgeCount: number;
    }>;
    engagementMetrics: {
      averageTimeToEarn: number;
      completionRates: Record<string, number>;
    };
    badgeSpecific?: {
      badge: Badge;
      awardedCount: number;
      averageTimeToEarn: number;
      completionRate: number;
      requirementProgress: Array<{
        requirement: string;
        averageProgress: number;
      }>;
    };
  }>> {
    const params = badgeId ? { badgeId } : undefined;
    return this.get('/analytics', params);
  }

  /**
   * Upload badge icon (admin only)
   */
  async uploadBadgeIcon(file: File): Promise<ApiResponse<{ iconUrl: string; iconId: string }>> {
    return this.uploadFile('/upload/icon', file);
  }

  /**
   * Import badges from file (admin only)
   */
  async importBadges(file: File): Promise<ApiResponse<{
    imported: number;
    failed: Array<{ row: number; error: string }>;
    badges: Badge[];
  }>> {
    return this.uploadFile('/import', file);
  }

  /**
   * Export badges data (admin only)
   */
  async exportBadges(format: 'json' | 'csv' = 'json'): Promise<ApiResponse<{ downloadUrl: string; expiresAt: string }>> {
    return this.get('/export', { format });
  }
}

// Export singleton instance
export const badgesService = new BadgesService();
