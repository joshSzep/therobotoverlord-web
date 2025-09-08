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
    // Cookies are automatically included with withCredentials: true
    // No need to manually add auth headers for cookie-based auth
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If we get a 401 and haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh tokens
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        
        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login or handle as needed
        console.error('Token refresh failed:', refreshError);
        // Don't redirect here as it might be called from server-side
        // Let the auth context handle the redirect
      }
    }
    
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
    const response = await apiClient.post<Topic>('/topics/', data);
    return response.data;
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
    const response = await apiClient.post<Post>('/posts/', data);
    return response.data;
  },
};

// Leaderboard API
export const leaderboardApi = {
  // Get leaderboard stats including total users for percentile calculation
  getStats: async () => {
    const response = await apiClient.get('/leaderboard/stats');
    return response.data;
  },

  // Get users in top percentile (0.1 = top 10%)
  getUsersInPercentile: async (percentile: number, limit: number = 50) => {
    const response = await apiClient.get(`/leaderboard/percentile/${percentile}?limit=${limit}`);
    return response.data;
  },

  // Get user's rank and position
  getUserRank: async (userId: string) => {
    const response = await apiClient.get(`/leaderboard/user/${userId}`);
    return response.data;
  },
};

export default apiClient;
