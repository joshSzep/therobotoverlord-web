// API Response Types for The Robot Overlord

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'anonymous' | 'citizen' | 'moderator' | 'admin' | 'superadmin';
  loyalty_score: number;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  pk: string;
  title: string;
  description: string;
  author_username?: string;
  created_by_overlord: boolean;
  status: 'approved' | 'rejected' | 'pending' | 'in_review';
  created_at: string;
  post_count: number;
  tags: string[];
}

export interface Post {
  id: string;
  topic_id: string;
  parent_post_id?: string;
  author?: User;
  content: string;
  status: 'approved' | 'rejected' | 'pending' | 'in_transit';
  overlord_feedback?: string;
  submitted_at: string;
  approved_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface PostThread {
  pk: string;
  topic_pk: string;
  parent_post_pk?: string;
  author_pk: string;
  author_username: string;
  content: string;
  status: 'approved' | 'rejected' | 'pending' | 'in_transit';
  overlord_feedback?: string;
  submitted_at: string;
  approved_at?: string;
  created_at: string;
  reply_count: number;
  depth_level: number;
}

export interface QueueItem {
  id: string;
  content_type: 'topic' | 'post' | 'message';
  content_id: string;
  position: number;
  estimated_wait_minutes: number;
  status: 'pending' | 'in_review' | 'processing';
  overlord_commentary?: string;
  created_at: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface TopicsFilters {
  status?: 'pending' | 'approved' | 'rejected';
  category?: string;
  featured?: boolean;
  search?: string;
  tags?: string[];
  page?: number;
  per_page?: number;
}
