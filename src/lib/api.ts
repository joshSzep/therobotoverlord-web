import axios from 'axios';
import type { Topic, Post, PostThread, User, TopicsFilters, PaginatedResponse, ApiResponse } from '@/types/api';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth headers
apiClient.interceptors.request.use(
  (config) => {
    // Add any auth tokens here when implemented
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors here
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Topics API
export const topicsApi = {
  // Get topics feed
  getTopics: async (filters: TopicsFilters = {}): Promise<Topic[]> => {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);
    if (filters.featured !== undefined) params.append('featured', filters.featured.toString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.per_page) params.append('per_page', filters.per_page.toString());

    const response = await apiClient.get<Topic[]>(`/topics/feed?${params}`);
    return response.data;
  },

  // Get trending topics
  getTrendingTopics: async (): Promise<Topic[]> => {
    const response = await apiClient.get<Topic[]>('/topics/trending');
    return response.data;
  },

  // Get featured topics
  getFeaturedTopics: async (): Promise<Topic[]> => {
    const response = await apiClient.get<Topic[]>('/topics/featured');
    return response.data;
  },

  // Get single topic
  getTopic: async (id: string): Promise<Topic> => {
    const response = await apiClient.get<Topic>(`/topics/${id}`);
    return response.data;
  },

  // Create new topic
  createTopic: async (data: { title: string; description: string; category?: string }): Promise<Topic> => {
    const response = await apiClient.post<ApiResponse<Topic>>('/topics/', data);
    return response.data.data;
  },
};

// Posts API
export const postsApi = {
  // Get posts for a topic thread
  getTopicPosts: async (topicId: string, filters: { limit?: number; offset?: number } = {}): Promise<PostThread[]> => {
    const params = new URLSearchParams();
    
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());

    const response = await apiClient.get<PostThread[]>(`/posts/topic/${topicId}/thread?${params}`);
    return response.data;
  },

  // Get single post
  getPost: async (postId: string): Promise<Post> => {
    const response = await apiClient.get<Post>(`/posts/${postId}`);
    return response.data;
  },

  // Create new post
  createPost: async (data: { content: string; topic_id: string; parent_post_id?: string }): Promise<Post> => {
    const response = await apiClient.post<ApiResponse<Post>>('/posts/', data);
    return response.data.data;
  },
};

export default apiClient;
