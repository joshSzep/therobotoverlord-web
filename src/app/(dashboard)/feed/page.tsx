/**
 * Main content feed page for The Robot Overlord
 * Displays personalized feed of posts and topics
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ContentFeed } from '@/components/feed/ContentFeed';
import { FeedFilters } from '@/components/feed/FeedFilters';
import { PersonalizedRecommendations } from '@/components/feed/PersonalizedRecommendations';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner, LoadingState } from '@/components/ui/LoadingSpinner';
import { useAppStore } from '@/stores/appStore';
import { postsService, topicsService } from '@/services';
import { Post } from '@/types/posts';
import { Topic } from '@/types/topics';

interface FeedItem {
  id: string;
  type: 'post' | 'topic';
  data: Post | Topic;
  timestamp: string;
  relevanceScore?: number;
}

interface FeedFilters {
  contentType: 'all' | 'posts' | 'topics';
  timeRange: 'day' | 'week' | 'month' | 'all';
  categories: string[];
  sortBy: 'newest' | 'popular' | 'trending' | 'personalized';
  showFollowing: boolean;
}

export default function FeedPage() {
  const { addNotification } = useAppStore();
  
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [filters, setFilters] = useState<FeedFilters>({
    contentType: 'all',
    timeRange: 'week',
    categories: [],
    sortBy: 'personalized',
    showFollowing: false,
  });

  // Load feed content
  const loadFeed = async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }

      const feedData: FeedItem[] = [];

      // Load posts if needed
      if (filters.contentType === 'all' || filters.contentType === 'posts') {
        const postsResponse = await postsService.getFeed({
          page,
          limit: 10,
          timeRange: filters.timeRange,
          categories: filters.categories,
          sortBy: filters.sortBy,
          following: filters.showFollowing,
        });

        if (postsResponse.data) {
          const postItems: FeedItem[] = postsResponse.data.map((post: Post) => ({
            id: `post-${post.id}`,
            type: 'post' as const,
            data: post,
            timestamp: post.createdAt,
            relevanceScore: post.score,
          }));
          feedData.push(...postItems);
        }
      }

      // Load topics if needed
      if (filters.contentType === 'all' || filters.contentType === 'topics') {
        const topicsResponse = await topicsService.getFeed({
          page,
          limit: 5,
          timeRange: filters.timeRange,
          categories: filters.categories,
          sortBy: filters.sortBy,
        });

        if (topicsResponse.data) {
          const topicItems: FeedItem[] = topicsResponse.data.map((topic: any) => ({
            id: `topic-${topic.id}`,
            type: 'topic' as const,
            data: topic as Topic,
            timestamp: topic.createdAt,
            relevanceScore: topic.postCount,
          }));
          feedData.push(...topicItems);
        }
      }

      // Sort combined feed by timestamp or relevance
      const sortedFeed = feedData.sort((a, b) => {
        if (filters.sortBy === 'newest') {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        } else if (filters.sortBy === 'popular' || filters.sortBy === 'trending') {
          return (b.relevanceScore || 0) - (a.relevanceScore || 0);
        } else {
          // Personalized - mix of recency and relevance
          const aScore = (a.relevanceScore || 0) * 0.7 + (Date.now() - new Date(a.timestamp).getTime()) * 0.3;
          const bScore = (b.relevanceScore || 0) * 0.7 + (Date.now() - new Date(b.timestamp).getTime()) * 0.3;
          return bScore - aScore;
        }
      });

      if (append) {
        setFeedItems(prev => [...prev, ...sortedFeed]);
      } else {
        setFeedItems(sortedFeed);
      }

      setHasMore(sortedFeed.length >= 15); // Assume more if we got a full page
      setCurrentPage(page);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load feed';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Feed Error',
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadFeed(1);
  }, [filters]);

  // Handle filter changes
  const handleFiltersChange = (newFilters: Partial<FeedFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  // Load more content
  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      loadFeed(currentPage + 1, true);
    }
  };

  // Refresh feed
  const handleRefresh = () => {
    setCurrentPage(1);
    loadFeed(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-light-text">Content Feed</h1>
          <p className="text-muted-light mt-1">
            Discover the latest posts and topics tailored for you
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            🔄 Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="bordered">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-overlord-red mb-1">
              {feedItems.filter(item => item.type === 'post').length}
            </div>
            <div className="text-sm text-muted-light">Posts</div>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-overlord-red mb-1">
              {feedItems.filter(item => item.type === 'topic').length}
            </div>
            <div className="text-sm text-muted-light">Topics</div>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-overlord-red mb-1">
              {filters.categories.length || 'All'}
            </div>
            <div className="text-sm text-muted-light">Categories</div>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-overlord-red mb-1">
              {filters.timeRange === 'day' ? '24h' : 
               filters.timeRange === 'week' ? '7d' : 
               filters.timeRange === 'month' ? '30d' : 'All'}
            </div>
            <div className="text-sm text-muted-light">Time Range</div>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <FeedFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            totalItems={feedItems.length}
          />
        </div>

        {/* Feed Content */}
        <div className="lg:col-span-2">
          <LoadingState
            isLoading={isLoading}
            error={error}
            loadingComponent={
              <div className="space-y-6">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} variant="bordered" className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-muted/20 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-6 bg-muted/20 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-muted/20 rounded w-full mb-2"></div>
                          <div className="h-4 bg-muted/20 rounded w-2/3 mb-4"></div>
                          <div className="flex justify-between">
                            <div className="flex space-x-4">
                              <div className="h-4 bg-muted/20 rounded w-16"></div>
                              <div className="h-4 bg-muted/20 rounded w-20"></div>
                            </div>
                            <div className="h-4 bg-muted/20 rounded w-24"></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            }
          >
            {feedItems.length > 0 ? (
              <ContentFeed
                items={feedItems}
                onLoadMore={handleLoadMore}
                hasMore={hasMore}
                isLoadingMore={isLoadingMore}
              />
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📰</div>
                <h3 className="text-xl font-bold text-light-text mb-2">
                  No Content Found
                </h3>
                <p className="text-muted-light mb-6">
                  Try adjusting your filters or check back later for new content
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-muted-light">Suggestions:</p>
                  <ul className="text-sm text-muted-light space-y-1">
                    <li>• Expand your time range</li>
                    <li>• Include more categories</li>
                    <li>• Switch to "All Content" view</li>
                    <li>• Follow more users or topics</li>
                  </ul>
                </div>
                <div className="mt-6 space-x-3">
                  <Button
                    variant="primary"
                    onClick={() => handleFiltersChange({ 
                      contentType: 'all', 
                      timeRange: 'all', 
                      categories: [] 
                    })}
                  >
                    Show All Content
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleRefresh}
                  >
                    Refresh Feed
                  </Button>
                </div>
              </div>
            )}
          </LoadingState>
        </div>

        {/* Recommendations Sidebar */}
        <div className="lg:col-span-1">
          <PersonalizedRecommendations
            limit={6}
            categories={filters.categories}
            className="sticky top-6"
          />
        </div>
      </div>
    </div>
  );
}
