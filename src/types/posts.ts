/**
 * Post type definitions for The Robot Overlord
 * Based on backend API schema
 */

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    role: string;
    loyaltyScore: number;
    badges?: Array<{
      id: string;
      name: string;
      icon: string;
      rarity: string;
    }>;
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
  parentId?: string; // For replies
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
  publishedAt?: string;
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
  attachments?: Array<{
    id: string;
    filename: string;
    url: string;
    type: string;
    size: number;
  }>;
  metadata?: {
    readTime?: number;
    wordCount?: number;
    contentWarnings?: string[];
  };
}

export interface CreatePostRequest {
  title: string;
  content: string;
  topicId: string;
  parentId?: string;
  tags?: string[];
  status?: 'draft' | 'published';
  attachments?: string[];
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  tags?: string[];
  editReason?: string;
  attachments?: string[];
}

export interface PostFilters {
  topicId?: string;
  authorId?: string;
  parentId?: string;
  status?: Post['status'];
  moderationStatus?: Post['moderationStatus'];
  tags?: string[];
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'popular' | 'controversial' | 'trending' | 'replies';
  timeRange?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
  hasAttachments?: boolean;
  isPinned?: boolean;
  isLocked?: boolean;
  page?: number;
  limit?: number;
}

export interface PostVote {
  postId: string;
  userId: string;
  vote: 'up' | 'down';
  createdAt: string;
}

export interface PostReport {
  id: string;
  postId: string;
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

export interface PostModerationAction {
  id: string;
  postId: string;
  action: 'approve' | 'reject' | 'flag' | 'remove' | 'pin' | 'unpin' | 'lock' | 'unlock' | 'edit';
  reason?: string;
  moderatedBy: string;
  moderator: {
    id: string;
    username: string;
    role: string;
  };
  previousStatus?: string;
  newStatus: string;
  notifyAuthor: boolean;
  createdAt: string;
}

export interface PostAnalytics {
  postId: string;
  views: number;
  uniqueViews: number;
  engagement: number;
  engagementRate: number;
  votingPattern: {
    upvotes: number;
    downvotes: number;
    netScore: number;
  };
  replyPattern: Array<{
    date: string;
    count: number;
  }>;
  viewPattern: Array<{
    date: string;
    views: number;
    uniqueViews: number;
  }>;
  moderationActions: number;
  reportCount: number;
  shareCount: number;
  bookmarkCount: number;
}
