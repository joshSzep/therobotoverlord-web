/**
 * Topic type definitions for The Robot Overlord
 * Based on backend API schema
 */

export interface Topic {
  id: string;
  title: string;
  description: string;
  slug: string;
  categoryId: string;
  category: TopicCategory;
  createdBy: string;
  creator: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    role: string;
    loyaltyScore: number;
  };
  status: 'active' | 'archived' | 'locked' | 'hidden';
  moderationStatus: 'approved' | 'pending' | 'rejected';
  moderationReason?: string;
  moderatedBy?: string;
  moderatedAt?: string;
  tags: string[];
  postCount: number;
  participantCount: number;
  subscriberCount: number;
  viewCount: number;
  lastPostAt?: string;
  lastPost?: {
    id: string;
    title: string;
    author: {
      id: string;
      username: string;
      avatar?: string;
    };
    createdAt: string;
  };
  isPinned: boolean;
  isLocked: boolean;
  isFeatured: boolean;
  userSubscribed?: boolean;
  userPermissions?: {
    canPost: boolean;
    canModerate: boolean;
    canEdit: boolean;
    canDelete: boolean;
  };
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}

export interface TopicCategory {
  id: string;
  name: string;
  description: string;
  slug: string;
  color: string;
  icon?: string;
  parentId?: string;
  parent?: TopicCategory;
  children?: TopicCategory[];
  topicCount: number;
  postCount: number;
  isVisible: boolean;
  sortOrder: number;
  permissions: {
    canCreateTopics: string[]; // roles
    canViewTopics: string[]; // roles
    requiresApproval: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateTopicRequest {
  title: string;
  description: string;
  categoryId: string;
  tags?: string[];
  initialPost?: {
    title: string;
    content: string;
  };
  status?: 'active' | 'draft';
}

export interface UpdateTopicRequest {
  title?: string;
  description?: string;
  categoryId?: string;
  tags?: string[];
  status?: Topic['status'];
}

export interface TopicFilters {
  categoryId?: string;
  parentCategoryId?: string;
  status?: Topic['status'];
  moderationStatus?: Topic['moderationStatus'];
  tags?: string[];
  search?: string;
  createdBy?: string;
  sortBy?: 'newest' | 'oldest' | 'popular' | 'active' | 'posts' | 'participants' | 'alphabetical' | 'recent';
  sortOrder?: 'asc' | 'desc';
  timeRange?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all' | 'today' | 'quarter';
  featured?: boolean;
  pinned?: boolean;
  hasActivity?: boolean;
  minPosts?: number;
  maxPosts?: number;
  hasSubscription?: boolean;
  creatorId?: string;
  page?: number;
  limit?: number;
}

export interface TopicSubscription {
  id: string;
  topicId: string;
  userId: string;
  notificationLevel: 'all' | 'mentions' | 'digest' | 'none';
  subscribedAt: string;
  lastNotifiedAt?: string;
}

export interface TopicModerationAction {
  id: string;
  topicId: string;
  action: 'approve' | 'reject' | 'lock' | 'unlock' | 'pin' | 'unpin' | 'feature' | 'unfeature' | 'archive' | 'restore';
  reason?: string;
  moderatedBy: string;
  moderator: {
    id: string;
    username: string;
    role: string;
  };
  previousStatus?: string;
  newStatus: string;
  notifyCreator: boolean;
  createdAt: string;
}

export interface TopicStatistics {
  topicId: string;
  postCount: number;
  participantCount: number;
  subscriberCount: number;
  viewCount: number;
  uniqueViewCount: number;
  activityScore: number;
  engagementRate: number;
  averagePostsPerDay: number;
  averageRepliesPerPost: number;
  topContributors: Array<{
    userId: string;
    username: string;
    avatar?: string;
    postCount: number;
    replyCount: number;
    loyaltyScore: number;
    joinedAt: string;
  }>;
  activityPattern: Array<{
    date: string;
    posts: number;
    replies: number;
    views: number;
    participants: number;
  }>;
  tagDistribution: Record<string, number>;
  moderationHistory: TopicModerationAction[];
}

export interface TopicReport {
  id: string;
  topicId: string;
  reportedBy: string;
  reporter: {
    id: string;
    username: string;
  };
  reason: string;
  details?: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
  color: string;
  icon?: string;
  parentId?: string;
  permissions?: TopicCategory['permissions'];
  sortOrder?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: string;
  permissions?: Partial<TopicCategory['permissions']>;
  sortOrder?: number;
  isVisible?: boolean;
}
