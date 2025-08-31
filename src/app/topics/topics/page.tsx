/**
 * Topics listing page for The Robot Overlord
 * Displays available discussion topics
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TopicList } from '@/components/topics/TopicList';
import { TopicFilters } from '@/components/topics/TopicFilters';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/stores/appStore';
import { topicsService } from '@/services';
import { Topic, TopicFilters as TopicFiltersType, TopicCategory } from '@/types/topics';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function TopicsPage() {
  const router = useRouter();
  const { addNotification } = useAppStore();
  
  const [topics, setTopics] = useState<Topic[]>([]);
  const [categories, setCategories] = useState<TopicCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const [filters, setFilters] = useState<TopicFiltersType>({
    search: '',
    categoryId: undefined,
    sortBy: 'recent',
    sortOrder: 'desc',
    status: undefined,
    timeRange: undefined,
    tags: [],
    minPosts: undefined,
    maxPosts: undefined,
    hasSubscription: undefined,
    creatorId: undefined,
  });

  // Load topics
  const loadTopics = async (page: number = 1, currentFilters: TopicFiltersType = filters) => {
    try {
      setIsLoading(true);
      setError(null);

      const categoriesResponse = await topicsService.getCategories() as any;
      const response = await topicsService.getTopics({
        page,
        limit: 20,
        search: currentFilters.search,
        categoryId: currentFilters.categoryId,
        status: currentFilters.status,
        sortBy: currentFilters.sortBy === 'recent' ? 'newest' : (currentFilters.sortBy === 'alphabetical' ? 'newest' : currentFilters.sortBy),
        timeRange: currentFilters.timeRange === 'hour' || currentFilters.timeRange === 'today' || currentFilters.timeRange === 'quarter' ? 'day' : currentFilters.timeRange,
        tags: currentFilters.tags,
      });

      if (response.success && response.data) {
        setTopics(response.data.data || []);
        setCurrentPage(response.data.pagination?.page || 1);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else {
        throw new Error('Failed to load topics');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load topics';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Error Loading Topics',
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load categories
  const loadCategories = async () => {
    try {
      const response: ApiResponse<TopicCategory[]> = await topicsService.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  // Initial load
  useEffect(() => {
    loadTopics();
    loadCategories();
  }, []);

  // Handle filter changes
  const handleFiltersChange = (newFilters: TopicFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1);
    loadTopics(1, newFilters);
  };

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadTopics(page, filters);
  };

  // Handle topic click
  const handleTopicClick = (topic: Topic) => {
    router.push(`/topics/${topic.slug}`);
  };

  // Handle topic subscription
  const handleSubscribe = async (topicId: string) => {
    try {
      const topic = topics.find(t => t.id === topicId);
      if (!topic) return;

      if (topic.userSubscribed) {
        await topicsService.unsubscribeTopic(topicId);
        addNotification({
          type: 'success',
          title: 'Unsubscribed',
          message: `You have unsubscribed from "${topic.title}"`,
        });
      } else {
        await topicsService.subscribeTopic(topicId);
        addNotification({
          type: 'success',
          title: 'Subscribed',
          message: `You are now subscribed to "${topic.title}"`,
        });
      }

      // Update local state
      setTopics(topics.map(t => 
        t.id === topicId 
          ? { 
              ...t, 
              userSubscribed: !t.userSubscribed,
              subscriberCount: t.userSubscribed ? t.subscriberCount - 1 : t.subscriberCount + 1
            }
          : t
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update subscription';
      addNotification({
        type: 'error',
        title: 'Subscription Error',
        message: errorMessage,
      });
    }
  };

  // Handle create topic
  const handleCreateTopic = () => {
    router.push('/topics/new');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-light-text">Topics</h1>
          <p className="text-muted-light mt-1">
            Explore discussions and join the conversation
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={handleCreateTopic}
          className="flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Create Topic</span>
        </Button>
      </div>

      {/* Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <TopicFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            categories={categories}
            showAdvanced={showAdvancedFilters}
            onToggleAdvanced={() => setShowAdvancedFilters(!showAdvancedFilters)}
          />
        </div>

        {/* Topics List */}
        <div className="lg:col-span-3">
          <TopicList
            topics={topics}
            onTopicClick={handleTopicClick}
            onSubscribe={handleSubscribe}
            showPagination={true}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            isLoading={isLoading}
            error={error}
            isEmpty={topics.length === 0 && !isLoading}
            emptyText={
              Object.values(filters).some(v => v !== undefined && v !== '' && (!Array.isArray(v) || v.length > 0))
                ? "No topics match your current filters. Try adjusting your search criteria."
                : "No topics have been created yet. Be the first to start a discussion!"
            }
          />
        </div>
      </div>
    </div>
  );
}
