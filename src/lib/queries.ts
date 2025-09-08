import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { topicsApi, postsApi, leaderboardApi } from './api';
import type { Topic, Post, PostThread, TopicsFilters, PaginatedResponse } from '@/types/api';

// Query keys factory for consistent caching
export const queryKeys = {
  topics: ['topics'] as const,
  topicsFeed: (filters?: TopicsFilters) => [...queryKeys.topics, 'feed', filters] as const,
  topicsTrending: () => [...queryKeys.topics, 'trending'] as const,
  topicsFeatured: () => [...queryKeys.topics, 'featured'] as const,
  topic: (id: string) => [...queryKeys.topics, id] as const,
  posts: ['posts'] as const,
  topicPosts: (topicId: string, filters?: { limit?: number; offset?: number }) => [...queryKeys.posts, 'topic', topicId, filters] as const,
  post: (id: string) => [...queryKeys.posts, id] as const,
  leaderboard: ['leaderboard'] as const,
  leaderboardStats: () => [...queryKeys.leaderboard, 'stats'] as const,
  userRank: (userId: string) => [...queryKeys.leaderboard, 'user', userId] as const,
};

// Custom hooks for topics
export const useTopics = (
  filters: TopicsFilters = {},
  options?: UseQueryOptions<Topic[]>
) => {
  return useQuery({
    queryKey: queryKeys.topicsFeed(filters),
    queryFn: () => topicsApi.getTopics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export const useTrendingTopics = (
  options?: UseQueryOptions<Topic[]>
) => {
  return useQuery({
    queryKey: queryKeys.topicsTrending(),
    queryFn: () => topicsApi.getTrendingTopics(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

export const useFeaturedTopics = (
  options?: UseQueryOptions<Topic[]>
) => {
  return useQuery({
    queryKey: queryKeys.topicsFeatured(),
    queryFn: () => topicsApi.getFeaturedTopics(),
    staleTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  });
};

export const useTopic = (
  id: string,
  options?: UseQueryOptions<Topic>
) => {
  return useQuery({
    queryKey: queryKeys.topic(id),
    queryFn: () => topicsApi.getTopic(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Custom hooks for posts
export const useTopicPosts = (
  topicId: string, 
  filters: { limit?: number; offset?: number } = {},
  options?: Omit<UseQueryOptions<PostThread[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.topicPosts(topicId, filters),
    queryFn: () => postsApi.getTopicPosts(topicId, filters),
    staleTime: 30000, // 30 seconds
    enabled: !!topicId,
    ...options,
  });
};

export const usePost = (
  id: string,
  options?: UseQueryOptions<Post>
) => {
  return useQuery({
    queryKey: queryKeys.post(id),
    queryFn: () => postsApi.getPost(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Custom hooks for leaderboard
export const useLeaderboardStats = (
  options?: UseQueryOptions<any>
) => {
  return useQuery({
    queryKey: queryKeys.leaderboardStats(),
    queryFn: () => leaderboardApi.getStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes - stats don't change frequently
    ...options,
  });
};

export const useUserRank = (
  userId: string,
  options?: UseQueryOptions<any>
) => {
  return useQuery({
    queryKey: queryKeys.userRank(userId),
    queryFn: () => leaderboardApi.getUserRank(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};
