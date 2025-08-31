/**
 * Posts service for The Robot Overlord
 * Handles post creation, retrieval, moderation, and interactions
 */

import { BaseService } from './BaseService';
import { ApiResponse, PaginatedResponse } from '@/types/api';

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    role: string;
    loyaltyScore: number;
    avatar?: string;
  };
  topicId: string;
  topic: {
    id: string;
    title: string;
    slug: string;
    category: {
      id: string;
      name: string;
      color: string;
    };
  };
  status: 'draft' | 'published' | 'moderated' | 'removed';
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'flagged';
  moderationReason?: string;
  moderatedBy?: string;
  moderatedAt?: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  score: number;
  userVote?: 'up' | 'down' | null;
  replyCount: number;
  viewCount: number;
  isPinned: boolean;
  isLocked: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  editedAt?: string;
  userPermissions?: {
    canEdit: boolean;
    canDelete: boolean;
    canModerate: boolean;
    canReport: boolean;
  };
  editHistory?: Array<{
    id: string;
    content: string;
    editedAt: string;
    editedBy: string;
    reason?: string;
  }>;
}

export interface CreatePostData {
  title: string;
  content: string;
  topicId: string;
  tags?: string[];
  parentId?: string; // For replies
}

export interface UpdatePostData {
  title?: string;
  content?: string;
  tags?: string[];
  editReason?: string;
}

export interface PostFilters {
  topicId?: string;
  authorId?: string;
  status?: Post['status'];
  moderationStatus?: Post['moderationStatus'];
  tags?: string[];
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'popular' | 'controversial' | 'trending';
  timeRange?: 'day' | 'week' | 'month' | 'year' | 'all';
  page?: number;
  limit?: number;
}

export interface ModerationAction {
  action: 'approve' | 'reject' | 'flag' | 'remove' | 'pin' | 'unpin' | 'lock' | 'unlock';
  reason?: string;
  notifyAuthor?: boolean;
}

export class PostsService extends BaseService {
  constructor() {
    super('/posts');
  }

  /**
   * Get posts with filtering and pagination
   */
  async getPosts(filters?: PostFilters): Promise<PaginatedResponse<Post>> {
    const params = filters ? this.buildParams(filters) : undefined;
    return this.getPaginated<Post>('', params);
  }

  /**
   * Get posts by user ID
   */
  async getPostsByUser(userId: string, page = 1, limit = 20): Promise<PaginatedResponse<Post>> {
    return this.getPaginated<Post>('', { authorId: userId, page, limit });
  }

  /**
   * Get single post by ID
   */
  async getPost(id: string): Promise<ApiResponse<Post>> {
    return this.get(`/${id}`);
  }

  /**
   * Create new post
   */
  async createPost(data: CreatePostData): Promise<ApiResponse<Post>> {
    return this.post('', data);
  }

  /**
   * Update existing post
   */
  async updatePost(id: string, data: UpdatePostData): Promise<ApiResponse<Post>> {
    return this.patch(`/${id}`, data);
  }

  /**
   * Delete post
   */
  async deletePost(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.delete(`/${id}`);
  }

  /**
   * Vote on post
   */
  async votePost(id: string, vote: 'up' | 'down' | null): Promise<ApiResponse<{
    upvotes: number;
    downvotes: number;
    userVote: 'up' | 'down' | null;
  }>> {
    return this.post(`/${id}/vote`, { vote });
  }

  /**
   * Get post replies/comments
   */
  async getPostReplies(id: string, page = 1, limit = 20): Promise<PaginatedResponse<Post>> {
    return this.getPaginated<Post>(`/${id}/replies`, { page, limit });
  }

  /**
   * Get replies for a post (alias for getPostReplies)
   */
  async getReplies(id: string, page = 1, limit = 20): Promise<PaginatedResponse<Post>> {
    return this.getPostReplies(id, page, limit);
  }

  /**
   * Reply to post
   */
  async replyToPost(id: string, content: string): Promise<ApiResponse<Post>> {
    return this.post(`/${id}/replies`, { content, parentId: id });
  }

  /**
   * Get post edit history
   */
  async getPostHistory(id: string): Promise<ApiResponse<Array<{
    content: string;
    editedAt: string;
    reason?: string;
    editedBy: string;
  }>>> {
    return this.get(`/${id}/history`);
  }

  /**
   * Report post for moderation
   */
  async reportPost(id: string, reportData: { reason: string; details?: string }): Promise<ApiResponse<{ message: string }>> {
    return this.post(`/${id}/report`, reportData);
  }

  /**
   * Get trending posts
   */
  async getTrendingPosts(timeRange: 'day' | 'week' | 'month' = 'day'): Promise<ApiResponse<Post[]>> {
    return this.get('/trending', { timeRange });
  }

  /**
   * Get popular posts
   */
  async getPopularPosts(timeRange: 'day' | 'week' | 'month' | 'all' = 'week'): Promise<ApiResponse<Post[]>> {
    return this.get('/popular', { timeRange });
  }

  /**
   * Search posts (legacy method)
   */
  async searchPostsLegacy(query: string, filters?: Omit<PostFilters, 'search'>): Promise<PaginatedResponse<Post>> {
    const params = this.buildParams({ search: query, ...filters });
    return this.getPaginated<Post>('/search', params);
  }

  /**
   * Get user's posts
   */
  async getUserPosts(userId: string, page = 1, limit = 20): Promise<PaginatedResponse<Post>> {
    return this.getPaginated<Post>(`/user/${userId}`, { page, limit });
  }

  /**
   * Get user's draft posts
   */
  async getUserDrafts(page = 1, limit = 20): Promise<PaginatedResponse<Post>> {
    return this.getPaginated<Post>('/drafts', { page, limit });
  }

  /**
   * Save post as draft
   */
  async saveDraft(data: CreatePostData): Promise<ApiResponse<Post>> {
    return this.post('/drafts', { ...data, status: 'draft' });
  }

  /**
   * Publish draft
   */
  async publishDraft(id: string): Promise<ApiResponse<Post>> {
    return this.patch(`/${id}/publish`);
  }

  // Moderation endpoints (admin/moderator only)

  /**
   * Get posts pending moderation
   */
  async getPendingModeration(page = 1, limit = 20): Promise<PaginatedResponse<Post>> {
    return this.getPaginated<Post>('/moderation/pending', { page, limit });
  }

  /**
   * Moderate post
   */
  async moderatePost(id: string, action: ModerationAction): Promise<ApiResponse<Post>> {
    return this.post(`/${id}/moderate`, action);
  }

  /**
   * Get moderation history
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
   * Bulk moderate posts
   */
  async bulkModerate(postIds: string[], action: ModerationAction): Promise<ApiResponse<{
    success: string[];
    failed: Array<{ id: string; error: string }>;
  }>> {
    return this.post('/moderation/bulk', { postIds, ...action });
  }

  /**
   * Get moderation queue with filters
   */
  async getModerationQueue(filters: {
    status?: 'pending' | 'approved' | 'rejected' | 'flagged' | 'all';
    category?: string;
    dateRange?: 'day' | 'week' | 'month' | 'all';
    sortBy?: 'newest' | 'oldest' | 'priority';
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedResponse<Post>> {
    return this.getPaginated<Post>('/moderation/queue', filters);
  }

  /**
   * Get personalized feed
   */
  async getFeed(filters: {
    page?: number;
    limit?: number;
    timeRange?: 'day' | 'week' | 'month' | 'all';
    categories?: string[];
    sortBy?: 'newest' | 'popular' | 'trending' | 'personalized';
    following?: boolean;
  } = {}): Promise<PaginatedResponse<Post>> {
    return this.getPaginated<Post>('/feed', filters);
  }

  /**
   * Search posts with advanced filters
   */
  async searchPosts(filters: {
    query?: string;
    category?: string;
    topic?: string;
    author?: string;
    tags?: string[];
    dateRange?: 'day' | 'week' | 'month' | 'year' | 'all';
    sortBy?: 'relevance' | 'newest' | 'oldest' | 'popular' | 'controversial';
    status?: 'all' | 'approved' | 'pending' | 'rejected';
    minScore?: number;
    hasReplies?: boolean;
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedResponse<Post>> {
    return this.getPaginated<Post>('/search', filters);
  }

  /**
   * Get post analytics (admin only)
   */
  async getPostAnalytics(id: string): Promise<ApiResponse<{
    views: number;
    uniqueViews: number;
    engagement: number;
    votingPattern: { up: number; down: number };
    replyPattern: number[];
    moderationActions: number;
  }>> {
    return this.get(`/${id}/analytics`);
  }

  /**
   * Upload image for post
   */
  async uploadImage(file: File): Promise<ApiResponse<{ url: string; id: string }>> {
    return this.uploadFile('/upload/image', file);
  }

  /**
   * Upload attachment for post
   */
  async uploadAttachment(file: File): Promise<ApiResponse<{ url: string; id: string; filename: string }>> {
    return this.uploadFile('/upload/attachment', file);
  }
}

// Export singleton instance
export const postsService = new PostsService();
