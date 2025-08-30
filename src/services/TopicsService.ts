/**
 * Topics service for The Robot Overlord
 * Handles topic management, categories, and topic-related operations
 */

import { BaseService } from './BaseService';
import { ApiResponse, PaginatedResponse } from '@/types/api';

export interface Topic {
  id: string;
  title: string;
  description: string;
  slug: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
    slug: string;
    color: string;
    icon?: string;
  };
  createdBy: string;
  creator: {
    id: string;
    username: string;
    role: string;
    loyaltyScore: number;
  };
  status: 'active' | 'archived' | 'locked' | 'hidden';
  moderationStatus: 'approved' | 'pending' | 'rejected';
  tags: string[];
  postCount: number;
  participantCount: number;
  lastPostAt?: string;
  lastPost?: {
    id: string;
    title: string;
    author: string;
    createdAt: string;
  };
  isPinned: boolean;
  isLocked: boolean;
  isFeatured: boolean;
  viewCount: number;
  subscriberCount: number;
  userSubscribed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TopicCategory {
  id: string;
  name: string;
  description: string;
  slug: string;
  color: string;
  icon?: string;
  parentId?: string;
  children?: TopicCategory[];
  topicCount: number;
  isVisible: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTopicData {
  title: string;
  description: string;
  categoryId: string;
  tags?: string[];
  initialPost?: {
    title: string;
    content: string;
  };
}

export interface UpdateTopicData {
  title?: string;
  description?: string;
  categoryId?: string;
  tags?: string[];
}

export interface TopicFilters {
  categoryId?: string;
  status?: Topic['status'];
  moderationStatus?: Topic['moderationStatus'];
  tags?: string[];
  search?: string;
  createdBy?: string;
  sortBy?: 'newest' | 'oldest' | 'popular' | 'active' | 'posts' | 'participants';
  timeRange?: 'day' | 'week' | 'month' | 'year' | 'all';
  featured?: boolean;
  pinned?: boolean;
  page?: number;
  limit?: number;
}

export class TopicsService extends BaseService {
  constructor() {
    super('/topics');
  }

  /**
   * Get topics with filtering and pagination
   */
  async getTopics(filters?: TopicFilters): Promise<PaginatedResponse<Topic>> {
    const params = filters ? this.buildParams(filters) : undefined;
    return this.getPaginated<Topic>('', params);
  }

  /**
   * Get single topic by ID or slug
   */
  async getTopic(identifier: string): Promise<ApiResponse<Topic>> {
    return this.get(`/${identifier}`);
  }

  /**
   * Create new topic
   */
  async createTopic(data: CreateTopicData): Promise<ApiResponse<Topic>> {
    return this.post('', data);
  }

  /**
   * Update existing topic
   */
  async updateTopic(id: string, data: UpdateTopicData): Promise<ApiResponse<Topic>> {
    return this.patch(`/${id}`, data);
  }

  /**
   * Delete topic
   */
  async deleteTopic(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.delete(`/${id}`);
  }

  /**
   * Subscribe to topic
   */
  async subscribeTopic(id: string): Promise<ApiResponse<{ subscribed: boolean }>> {
    return this.post(`/${id}/subscribe`);
  }

  /**
   * Unsubscribe from topic
   */
  async unsubscribeTopic(id: string): Promise<ApiResponse<{ subscribed: boolean }>> {
    return this.post(`/${id}/unsubscribe`);
  }

  /**
   * Get user's subscribed topics
   */
  async getSubscribedTopics(page = 1, limit = 20): Promise<PaginatedResponse<Topic>> {
    return this.getPaginated<Topic>('/subscriptions', { page, limit });
  }

  /**
   * Get topic statistics
   */
  async getTopicStats(id: string): Promise<ApiResponse<{
    postCount: number;
    participantCount: number;
    viewCount: number;
    subscriberCount: number;
    activityScore: number;
    engagementRate: number;
    averagePostsPerDay: number;
    topContributors: Array<{
      userId: string;
      username: string;
      postCount: number;
      loyaltyScore: number;
    }>;
  }>> {
    return this.get(`/${id}/stats`);
  }

  /**
   * Get trending topics
   */
  async getTrendingTopics(timeRange: 'day' | 'week' | 'month' = 'week'): Promise<ApiResponse<Topic[]>> {
    return this.get('/trending', { timeRange });
  }

  /**
   * Get popular topics
   */
  async getPopularTopics(timeRange: 'day' | 'week' | 'month' | 'all' = 'month'): Promise<ApiResponse<Topic[]>> {
    return this.get('/popular', { timeRange });
  }

  /**
   * Get featured topics
   */
  async getFeaturedTopics(): Promise<ApiResponse<Topic[]>> {
    return this.get('/featured');
  }

  /**
   * Search topics
   */
  async searchTopics(query: string, filters?: Omit<TopicFilters, 'search'>): Promise<PaginatedResponse<Topic>> {
    const params = this.buildParams({ search: query, ...filters });
    return this.getPaginated<Topic>('/search', params);
  }

  /**
   * Get user's created topics
   */
  async getUserTopics(userId: string, page = 1, limit = 20): Promise<PaginatedResponse<Topic>> {
    return this.getPaginated<Topic>(`/user/${userId}`, { page, limit });
  }

  /**
   * Get topic participants
   */
  async getTopicParticipants(id: string, page = 1, limit = 20): Promise<PaginatedResponse<{
    userId: string;
    username: string;
    role: string;
    loyaltyScore: number;
    postCount: number;
    lastActiveAt: string;
  }>> {
    return this.getPaginated(`/${id}/participants`, { page, limit });
  }

  // Category management

  /**
   * Get all topic categories
   */
  async getCategories(): Promise<ApiResponse<TopicCategory[]>> {
    return this.get('/categories');
  }

  /**
   * Get category by ID or slug
   */
  async getCategory(identifier: string): Promise<ApiResponse<TopicCategory>> {
    return this.get(`/categories/${identifier}`);
  }

  /**
   * Get topics in category
   */
  async getCategoryTopics(categoryId: string, filters?: Omit<TopicFilters, 'categoryId'>): Promise<PaginatedResponse<Topic>> {
    const params = filters ? this.buildParams(filters) : undefined;
    return this.getPaginated<Topic>(`/categories/${categoryId}/topics`, params);
  }

  /**
   * Create new category (admin only)
   */
  async createCategory(data: {
    name: string;
    description: string;
    color: string;
    icon?: string;
    parentId?: string;
  }): Promise<ApiResponse<TopicCategory>> {
    return this.post('/categories', data);
  }

  /**
   * Update category (admin only)
   */
  async updateCategory(id: string, data: Partial<TopicCategory>): Promise<ApiResponse<TopicCategory>> {
    return this.patch(`/categories/${id}`, data);
  }

  /**
   * Delete category (admin only)
   */
  async deleteCategory(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.delete(`/categories/${id}`);
  }

  // Moderation endpoints (admin/moderator only)

  /**
   * Get topics pending moderation
   */
  async getPendingModeration(page = 1, limit = 20): Promise<PaginatedResponse<Topic>> {
    return this.getPaginated<Topic>('/moderation/pending', { page, limit });
  }

  /**
   * Moderate topic
   */
  async moderateTopic(id: string, action: {
    action: 'approve' | 'reject' | 'lock' | 'unlock' | 'pin' | 'unpin' | 'feature' | 'unfeature' | 'archive';
    reason?: string;
    notifyCreator?: boolean;
  }): Promise<ApiResponse<Topic>> {
    return this.post(`/${id}/moderate`, action);
  }

  /**
   * Get topic moderation history
   */
  async getModerationHistory(id: string): Promise<ApiResponse<Array<{
    action: string;
    reason?: string;
    moderatedBy: string;
    moderatedAt: string;
  }>>> {
    return this.get(`/${id}/moderation/history`);
  }

  /**
   * Bulk moderate topics
   */
  async bulkModerate(topicIds: string[], action: {
    action: 'approve' | 'reject' | 'lock' | 'unlock' | 'archive';
    reason?: string;
  }): Promise<ApiResponse<{
    success: string[];
    failed: Array<{ id: string; error: string }>;
  }>> {
    return this.post('/moderation/bulk', { topicIds, action });
  }

  /**
   * Report topic for moderation
   */
  async reportTopic(id: string, reason: string, details?: string): Promise<ApiResponse<{ message: string }>> {
    return this.post(`/${id}/report`, { reason, details });
  }

  /**
   * Get topic analytics (admin only)
   */
  async getTopicAnalytics(id: string): Promise<ApiResponse<{
    views: number;
    uniqueViews: number;
    engagement: number;
    growthRate: number;
    retentionRate: number;
    activityPattern: Array<{ date: string; posts: number; views: number }>;
    demographicBreakdown: Record<string, number>;
  }>> {
    return this.get(`/${id}/analytics`);
  }

  /**
   * Get topic suggestions based on user activity
   */
  async getTopicSuggestions(limit = 10): Promise<ApiResponse<Topic[]>> {
    return this.get('/suggestions', { limit });
  }

  /**
   * Get related topics
   */
  async getRelatedTopics(id: string, limit = 5): Promise<ApiResponse<Topic[]>> {
    return this.get(`/${id}/related`, { limit });
  }
}

// Export singleton instance
export const topicsService = new TopicsService();
